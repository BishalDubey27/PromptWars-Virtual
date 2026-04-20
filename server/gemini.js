const { GoogleGenerativeAI } = require('@google/generative-ai');
const { getSecret } = require('./secrets');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');

const window = new JSDOM('').window;
const dompurify = createDOMPurify(window);

let genAI = null;

/**
 * Initialize Gemini with Secret Manager key
 */
async function initAI() {
  const apiKey = await getSecret('GEMINI_API_KEY');
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    console.log('Gemini AI initialized with Secret Manager key.');
  } else {
    console.warn('GEMINI_API_KEY not found in Secret Manager or environment.');
  }
}

initAI();

// Stadium Tools (Same as before but with better sanitization)
const stadiumTools = {
  getWaitTimes: () => JSON.stringify({
    bathroom_north: "2 mins",
    bathroom_south: "10 mins",
    concessions_east: "5 mins",
    concessions_west: "15 mins"
  }),
  getLiveScore: () => JSON.stringify({
    home_team: 24, away_team: 17, quarter: 4, time_left: "05:12"
  }),
  getWalkingRoute: ({ destination }) => {
    const dest = dompurify.sanitize(destination || "").toLowerCase();
    if (dest.includes("bathroom")) return JSON.stringify({ route: "Take Stairwell B to Level 2. North section is fastest." });
    if (dest.includes("food")) return JSON.stringify({ route: "East Concourse Section 114 is quiet right now." });
    return JSON.stringify({ route: "Follow signs to the nearest exit gate." });
  }
};

const systemInstruction = "You are VenueFlow AI. Assist stadium fans briefly and helpfully with tools.";

async function handleChat(req, res) {
  if (!genAI) await initAI();
  if (!genAI) return res.status(500).json({ error: "AI not initialized." });

  const { message } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(dompurify.sanitize(message));
    return res.json({ reply: dompurify.sanitize(result.response.text()) });
  } catch (err) {
    console.error("Gemini Error:", err);
    return res.json({ reply: "I'm temporarily in offline mode. Ask about bathrooms or scores!", isFallback: true });
  }
}

async function handleVision(req, res) {
  if (!genAI) await initAI();
  const { imageBase64, mimeType } = req.body;
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([
      "Analyze this stadium view.",
      { inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } }
    ]);
    return res.json({ reply: dompurify.sanitize(result.response.text()) });
  } catch (err) {
    return res.status(500).json({ error: "Vision analysis failed." });
  }
}

module.exports = { handleChat, handleVision };
