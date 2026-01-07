
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getAIRecommendations = async (userBalance: number, completedCount: number) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User has a balance of $${userBalance} and has completed ${completedCount} tasks. Suggest 3 motivational tips and 1 high-priority task type they should focus on for maximum earnings. Respond in a supportive, professional tone.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Motivational tips for the user.'
            },
            recommendation: {
              type: Type.STRING,
              description: 'Personalized focus recommendation.'
            }
          },
          required: ['tips', 'recommendation']
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      tips: ["Consistency is key.", "Try new categories.", "Check daily challenges."],
      recommendation: "Focus on surveys for quick daily gains."
    };
  }
};

export const chatWithAssistant = async (message: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an earning assistant for EarnPulse. A user asks: "${message}". Provide a helpful, concise response about how they can maximize their time on the app.`,
    });
    return response.text;
  } catch (error) {
    return "I'm having trouble connecting to my brain right now! Please try again later.";
  }
};
