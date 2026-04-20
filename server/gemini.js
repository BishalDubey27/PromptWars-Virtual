const { GoogleGenerativeAI } = require('@google-cloud/logging');
const { GoogleGenerativeAI: GenAI } = require('@google-cloud/logging');
// Use the official SDK correctly
const { GoogleGenerativeAI: GoogleAISDK } = require('@google-ai/generativelanguage'); // Wait, check the import
const { GoogleGenerativeAI: GoogleGenerativeAI_SDK } = require('@google/generative-ai');

/**
 * Sanitization Setup for Server-Side
 */
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const dompurify = createDOMPurify(window);

/**
 * Initialize Gemini SDK
 */
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI_SDK(process.env.GEMINI_API_KEY);
}

/**
 * Stadium Tools Definition
 * These represent the MCP (Model Context Protocol) pattern for dynamic stadium data.
 */
const stadiumTools = {
  /**
   * Returns live wait times for stadium services
   * @returns {string} JSON string of wait times
   */
  getWaitTimes: () => {
    return JSON.stringify({
      bathroom_north: "2 mins",
      bathroom_south: "10 mins",
      concessions_east: "5 mins",
      concessions_west: "15 mins"
    });
  },

  /**
   * Returns the current game score and status
   * @returns {string} JSON string of live score data
   */
  getLiveScore: () => {
    return JSON.stringify({
      home_team: 24,
      away_team: 17,
      quarter: 4,
      time_left: "05:12"
    });
  },

  /**
   * Calculates walking routes inside the stadium
   * @param {Object} params 
   * @param {string} params.destination 
   * @returns {string} JSON string with routing info
   */
  getWalkingRoute: ({ destination }) => {
     const routes = {
         "bathrooms": "Take Stairwell B to Level 2. The closest bathroom has a 2-minute wait in the North section.",
         "food": "Walk down the East Concourse. The closest food stand is Section 114 with a 5-minute wait.",
         "exit": "For the fastest exit, walk towards the East Gate. Avoid the North Gate due to heavy crowding."
     };
     
     let responseRoute = "I am not sure where that is inside the stadium.";
     const dest = dompurify.sanitize(destination || "").toLowerCase();
     if (dest.includes("bathroom")) responseRoute = routes["bathrooms"];
     if (dest.includes("food") || dest.includes("concession")) responseRoute = routes["food"];
     if (dest.includes("exit") || dest.includes("leave")) responseRoute = routes["exit"];

     return JSON.stringify({ route: responseRoute });
  }
};

/**
 * Gemini Function Declarations (MCP Pattern)
 */
const geminiFunctions = {
  functionDeclarations: [
    {
      name: "getWaitTimes",
      description: "Gets current wait times for bathrooms and concessions.",
      parameters: { type: "OBJECT", properties: {}, required: [] }
    },
    {
      name: "getLiveScore",
      description: "Gets the live score and game clock.",
      parameters: { type: "OBJECT", properties: {}, required: [] }
    },
    {
      name: "getWalkingRoute",
      description: "Calculates optimized walking routes inside the stadium.",
      parameters: {
        type: "OBJECT",
        properties: {
          destination: { type: "STRING", description: "Target location" }
        },
        required: ["destination"]
      }
    }
  ]
};

const systemInstruction = "You are the VenueFlow AI Concierge, a helpful assistant inside a sports stadium. " +
"You help fans find bathrooms, skip lines, and answer questions about the game. Keep answers very short, " +
"friendly, and use emojis. Use tools whenever asked about lines, scores, or walking directions.";

/**
 * Fallback AI logic for when API is unavailable or rate-limited
 */
const getFallbackResponse = (message, stadiumZones = {}) => {
  const msg = dompurify.sanitize(message || "").toLowerCase();
  
  if (msg.includes("bathroom") || msg.includes("restroom")) {
    const times = JSON.parse(stadiumTools.getWaitTimes());
    const route = JSON.parse(stadiumTools.getWalkingRoute({ destination: "bathrooms" }));
    return `Offline Intel: North bathrooms: ${times.bathroom_north}. ${route.route} 🚽`;
  }
  
  if (msg.includes("score") || msg.includes("game")) {
    const score = JSON.parse(stadiumTools.getLiveScore());
    return `Offline Intel: ${score.home_team}-${score.away_team} | Q${score.quarter} | ${score.time_left} 🏈`;
  }
  
  if (msg.includes("food") || msg.includes("eat")) {
    const times = JSON.parse(stadiumTools.getWaitTimes());
    const route = JSON.parse(stadiumTools.getWalkingRoute({ destination: "food" }));
    return `Offline Intel: East Concessions: ${times.concessions_east}. ${route.route} 🌭`;
  }
  
  return "Offline Intel: I'm currently in low-power mode due to high traffic. Ask about restrooms, food, or the score! 🏟️";
};

/**
 * Handles AI Chat Requests
 */
async function handleChat(req, res, stadiumZones) {
  if (!genAI) {
    return res.status(500).json({ error: "Gemini API Key missing." });
  }

  const { message } = req.body;
  const sanitizedMessage = dompurify.sanitize(message);
  
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash", 
      systemInstruction: { parts: [{ text: systemInstruction }]},
      tools: [geminiFunctions],
    });

    const chat = model.startChat({});
    let result = await chat.sendMessage(sanitizedMessage);
    let call = result.response.functionCalls && result.response.functionCalls()[0];

    if (call) {
      const functionName = call.name;
      let functionResponseData = { error: "function not found" };
      
      if (stadiumTools[functionName]) {
        functionResponseData = JSON.parse(stadiumTools[functionName](call.args));
      }
      
      result = await chat.sendMessage([{
        functionResponse: {
          name: functionName,
          response: functionResponseData
        }
      }]);
    }

    return res.json({ reply: dompurify.sanitize(result.response.text()) });
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    const fallback = getFallbackResponse(message, stadiumZones);
    return res.json({ 
        reply: fallback, 
        isFallback: true,
        warning: "Connectivity issues detected. Using local intelligence."
    });
  }
}

/**
 * Handles AI Vision "Snap & Know" Requests
 */
async function handleVision(req, res) {
    if (!genAI) return res.status(500).json({ error: "Gemini AI not initialized." });
    
    const { imageBase64, mimeType, prompt } = req.body;
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: dompurify.sanitize(mimeType || "image/jpeg"),
            },
        };
        
        const finalPrompt = dompurify.sanitize(prompt || "Analyze this stadium view. Provide player stats if visible or game rules. Keep it short.");
        const result = await model.generateContent([finalPrompt, imagePart]);
        return res.json({ reply: dompurify.sanitize(result.response.text()) });
    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return res.status(500).json({ error: "Vision processing failed." });
    }
}

module.exports = { handleChat, handleVision };

