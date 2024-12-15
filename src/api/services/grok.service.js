const axios = require("axios");

const GROK_API_URL = "https://api.x.ai/v1/chat/completions"; 
const GROK_API_KEY = process.env.GROK_API_KEY; 

async function queryGrok(prompt, context = {}) {
    try {
      const response = await axios.post(
        GROK_API_URL,
        {
          model: "grok-beta", // Usa el modelo correcto
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt }
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${GROK_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      return response.data.choices[0].message.content || "No reply from Grok.";
    } catch (error) {
      console.error("Error querying Grok API:", error.response?.data || error.message);
      throw new Error("Failed to fetch response from Grok.");
    }
  }
module.exports = { queryGrok};
