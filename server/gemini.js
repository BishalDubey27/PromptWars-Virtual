const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini. Throw error if missing key but don't crash app on boot until it's actually called.
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/* 
 * 1. Build out the MCP Pattern Tools 
 * These functions represent dynamic live data that Gemini can request.
 */
const stadiumTools = {
  getWaitTimes: () => {
    return JSON.stringify({
      bathroom_north: "2 mins",
      bathroom_south: "10 mins",
      concessions_east: "5 mins",
      concessions_west: "15 mins"
    });
  },
  getLiveScore: () => {
    return JSON.stringify({
      home_team: 24,
      away_team: 17,
      quarter: 4,
      time_left: "05:12"
    });
  },
  getWalkingRoute: ({ destination }) => {
     // A mock indoor pathfinding algorithm returning the closest routes.
     const routes = {
         "bathrooms": "Take Stairwell B to Level 2. The closest bathroom has a 2-minute wait in the North section.",
         "food": "Walk down the East Concourse. The closest food stand is Section 114 with a 5-minute wait.",
         "exit": "For the fastest exit, walk towards the East Gate. Avoid the North Gate due to heavy crowding."
     };
     
     let responseRoute = "I am not sure where that is inside the stadium.";
     if (destination && destination.toLowerCase().includes("bathroom")) responseRoute = routes["bathrooms"];
     if (destination && destination.toLowerCase().includes("food") || destination && destination.toLowerCase().includes("concession")) responseRoute = routes["food"];
     if (destination && destination.toLowerCase().includes("exit") || destination && destination.toLowerCase().includes("leave")) responseRoute = routes["exit"];

     return JSON.stringify({ route: responseRoute });
  }
};

/* Define the tools explicitly for Gemini Function Calling */
const geminiFunctions = {
  functionDeclarations: [
    {
      name: "getWaitTimes",
      description: "Gets the current wait times for bathrooms and concessions around the stadium.",
      parameters: {
        type: "OBJECT",
        properties: {},
        required: []
      }
    },
    {
      name: "getLiveScore",
      description: "Gets the live score of the current game, including quarter and time left.",
      parameters: {
        type: "OBJECT",
        properties: {},
        required: []
      }
    },
    {
      name: "getWalkingRoute",
      description: "Calculates the best walking route to a specific destination inside the stadium (like bathrooms, food, or an exit).",
      parameters: {
        type: "OBJECT",
        properties: {
            destination: {
                type: "STRING",
                description: "Where the user wants to walk to (e.g., 'bathrooms', 'food', 'exit')"
            }
        },
        required: ["destination"]
      }
    }
  ]
};

// System prompt to set AI persona
const systemInstruction = "You are the VenueFlow AI Concierge, a helpful assistant inside a sports stadium. " +
"You help fans find bathrooms, skip lines, and answer questions about the game. Keep answers very short, " +
"friendly, and use emojis. Use tools whenever asked about lines, scores, or walking directions.";

// --- OFFLINE FALLBACK LOGIC ---
const getFallbackResponse = (message, stadiumZones = {}) => {
  const msg = message.toLowerCase();
  
  if (msg.includes("bathroom") || msg.includes("restroom") || msg.includes("toilet")) {
    const times = JSON.parse(stadiumTools.getWaitTimes());
    const route = JSON.parse(stadiumTools.getWalkingRoute({ destination: "bathrooms" }));
    return `Offline Intel: Bathrooms in the North are ${times.bathroom_north} away. ${route.route} 🚽`;
  }
  
  if (msg.includes("score") || msg.includes("winning") || msg.includes("game")) {
    const score = JSON.parse(stadiumTools.getLiveScore());
    return `Offline Intel: Current score is ${score.home_team} - ${score.away_team} in Q${score.quarter}. Time: ${score.time_left} 🏈`;
  }
  
  if (msg.includes("food") || msg.includes("concession") || msg.includes("eat") || msg.includes("drink")) {
    const times = JSON.parse(stadiumTools.getWaitTimes());
    const route = JSON.parse(stadiumTools.getWalkingRoute({ destination: "food" }));
    return `Offline Intel: Food at East Concessions is ${times.concessions_east} away. ${route.route} 🌭`;
  }
  
  if (msg.includes("exit") || msg.includes("leave")) {
    const route = JSON.parse(stadiumTools.getWalkingRoute({ destination: "exit" }));
    return `Offline Intel: ${route.route} 🚀`;
  }

  if (msg.includes("crowd") || msg.includes("busy") || msg.includes("density") || msg.includes("stand") || msg.includes("section") || msg.includes("stadium")) {
    if (stadiumZones && Object.keys(stadiumZones).length > 0) {
      let maxDensity = -1;
      let busiestZone = "";
      Object.entries(stadiumZones).forEach(([name, data]) => {
          if (data.density > maxDensity) {
              maxDensity = data.density;
              busiestZone = name;
          }
      });
      const levelNames = ["Low", "Moderate", "Heavy"];
      const level = levelNames[maxDensity - 1] || "High";
      return `Offline Intel: The ${busiestZone.toUpperCase()} stands are currently the most crowded with ${level} density. I recommend heading to the North gate for more space! 🏟️`;
    }
  }

  return "Offline Intel: The AI is currently busy with thousands of fans, and I don't have local info for that specific question. Try asking about restrooms, food, or the score! 🏈";
};

// 1. CHAT API
async function handleChat(req, res, stadiumZones) {
  if (!genAI) {
    return res.status(500).json({ error: "Gemini API Key missing. Please set GEMINI_API_KEY in server/.env" });
  }

  const { message } = req.body;
  
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
      systemInstruction: { parts: [{ text: systemInstruction }]},
      tools: [geminiFunctions],
    });

    const chat = model.startChat({});
    let result = await chat.sendMessage(message);
    let call = result.response.functionCalls && result.response.functionCalls()[0];

    // If Gemini decides to call a tool (MCP pattern)
    if (call) {
      const functionName = call.name;
      let functionResponseData = { error: "function not found" };
      
      if (stadiumTools[functionName]) {
        // Pass any parsed parameters dynamically to the tool
        functionResponseData = JSON.parse(stadiumTools[functionName](call.args));
      }
      
      // Send the result back to Gemini so it can generate the final natural response
      result = await chat.sendMessage([{
        functionResponse: {
          name: functionName,
          response: functionResponseData
        }
      }]);
    }

    return res.json({ reply: result.response.text() });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    
    // Check if it's a rate limit or connectivity issue
    if (error.status === 429 || (error.message && (error.message.includes("429") || error.message.includes("fetch")))) {
        const fallback = getFallbackResponse(message, stadiumZones);
        return res.json({ 
            reply: fallback, 
            isFallback: true,
            warning: "Gemini API Rate Limit Exceeded. Using local intelligence."
        });
    }
    
    return res.status(500).json({ error: "Failed to process chat with Gemini." });
  }
}

// 2. VISION "Snap & Know" API
async function handleVision(req, res) {
    if (!genAI) {
        return res.status(500).json({ error: "Gemini API Key missing." });
    }
    
    // Expect base64 image data
    const { imageBase64, mimeType, prompt } = req.body;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType || "image/jpeg",
            },
        };
        
        const finalPrompt = prompt || "Analyze this image from the perspective of a fan at a sports game. Tell me what I'm looking at, player stats if a player is visible, or the rules implication if it's a play on the field. Keep it short and energetic.";
        
        const result = await model.generateContent([finalPrompt, imagePart]);
        return res.json({ reply: result.response.text() });
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return res.status(500).json({ error: "Failed to process image with Gemini." });
    }
}

module.exports = {
  handleChat,
  handleVision
};
