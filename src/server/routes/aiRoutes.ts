import express from "express";
import { GoogleGenAI } from "@google/genai";
import { authenticate, requireVerified } from "../middleware/auth";
import { apiLimiter } from "../middleware/rateLimiter";

export const aiRouter = express.Router();

aiRouter.use(authenticate); // Require authentication for AI features
aiRouter.use(requireVerified); // Require email verification for AI features
aiRouter.use(apiLimiter);

aiRouter.post("/generate-message", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
    const data = req.body;
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Enhanced prompt for more creative and emotional messages
    const prompt = `You are a creative greeting card writer. Write a beautiful, heartfelt, and creative message for a greeting card.

IMPORTANT RULES:
- Be genuine, warm, and emotionally touching
- Use creative metaphors, vivid imagery, or poetic language
- Make it feel personal and unique, not generic
- Include emojis that fit the emotion (2-3 emojis total)
- NO quotes around the message
- Length: 2-4 sentences (20-60 words)

CONTEXT:
- Recipient: ${data.to || 'a special person'}
- Sender: ${data.from || 'someone who cares'}
- Occasion: ${data.occasion || 'a special moment'}
- Current message draft: ${data.context || 'none'}

EXAMPLES OF GOOD MESSAGES:
- "Every star in the sky reminds me of a moment we've shared ✨ You light up my world in ways words can't capture. Here's to many more beautiful memories together! 🌟💕"
- "Life is sweeter with you in it 🌸 Thank you for being the kind of person who makes ordinary days feel extraordinary. You're truly one of a kind! 💖"
- "Sending you sunshine on this special day ☀️ May your heart be filled with laughter, your path be lit with love, and your dreams take flight! 🦋✨"

Now write a unique, creative message:`;
    
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    let generatedText = response.text?.trim() || "Wishing you joy, love, and beautiful moments today! ✨💕";
    // Remove any quotes that might have been added
    generatedText = generatedText.replace(/^["']|["']$/g, '');
    
    res.json({ message: generatedText });
  } catch (e: any) {
    console.error("AI Generation Error:", e);
    
    // Fallback: Generate creative message locally when API is unavailable
    if (e.status === 503 || e.message?.includes('high demand') || e.message?.includes('UNAVAILABLE')) {
      const recipientName = req.body.to || 'you';
      const fallbackMessages = [
        `Every moment with ${recipientName} is a treasure I hold close to my heart 💖 Your presence brings sunshine to even the cloudiest days. Here's to many more beautiful memories together! ✨🌟`,
        `${recipientName}, you make the ordinary extraordinary ✨ Thank you for being the kind of soul that lights up the world. Sending you all my love and warmest wishes! 💕🌸`,
        `Life feels brighter knowing ${recipientName} is in it 🌟 Your kindness, your smile, your spirit - everything about you is a gift. Wishing you endless joy! 💖✨`,
        `To ${recipientName}: You're not just special, you're irreplaceable 💕 May your days be filled with laughter, love, and all the magic you bring to others! 🦋🌸`,
        `${recipientName}, you're the kind of person who makes hearts smile 😊💖 Thank you for being authentically, wonderfully you. Sending love your way! ✨🌟`,
        `Every day is better because ${recipientName} exists in this world 🌍💕 Your light shines so bright - never stop being amazing! ✨🌟`,
        `${recipientName}, you sprinkle joy wherever you go ✨ Here's a little reminder that you're loved, appreciated, and absolutely wonderful! 💖🌸`,
        `To my dear ${recipientName}: Life's most beautiful moments are the ones I share with you 💕 Here's to love, laughter, and magical memories! 🌟✨`,
      ];
      
      // Pick a random message
      const randomMessage = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      
      console.log("Using fallback message due to API unavailability");
      return res.json({ 
        message: randomMessage,
        fallback: true // Let frontend know this is a fallback
      });
    }
    
    if (e.status === 429) {
      return res.status(429).json({ 
        error: "Too many requests. Please wait a moment before trying again." 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to generate message. You can write your own beautiful message instead!" 
    });
  }
});

aiRouter.post("/assistant-chat", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }
    const { messages } = req.body;
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const systemInstruction = `You are a helpful, friendly AI assistant for the BubuWish website. 
BubuWish allows users to create 3D interactive, animated greeting cards featuring Bubu & Dudu (cute bears). 
Users can choose themes (Party, Romance, Valentine's, Sleepy, Christmas, New Year), add custom messages (or generate them with AI), 
add voice notes, and lock the cards behind puzzles (math, emoji match, etc.) or countdown timers.
The platform is completely free to use. Users can sign up, create cards, and share them via unguessable short links. 
Keep your answers concise, sweet, and helpful. Use emojis!`;

    // Convert frontend messages (role: 'user' | 'assistant') to Gemini format (role: 'user' | 'model')
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedMessages,
        config: { systemInstruction }
      });
      
      const text = response.text || "I'm having trouble thinking right now. Please try again later!";
      res.json({ message: text.trim() });
    } catch (genError: any) {
      console.error("Gemini generation error:", genError.message);
      
      // Return a friendly fallback response instead of failing
      const fallbackResponses = [
        "I'm currently experiencing high demand, but I'd love to help! Could you try again in a moment? 🤖",
        "My AI brain is a bit overloaded right now! Please give me a moment and try again. ✨",
        "Seems like I'm taking a quick break! Please try your question again shortly. 💭",
      ];
      
      const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      res.json({ message: randomFallback, fallback: true });
    }
  } catch (e: any) {
    console.error("Assistant Chat Error:", e);
    
    // Handle specific Google AI errors
    if (e.status === 503 || e.message?.includes('high demand')) {
      return res.status(503).json({ 
        error: "AI assistant is currently busy. Please try again in a moment! 🤖" 
      });
    }
    
    if (e.status === 429) {
      return res.status(429).json({ 
        error: "Please wait a moment before asking another question." 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to process chat response. Please try again!" 
    });
  }
});
