
import { GoogleGenAI, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const systemInstruction = `You are SiliconSiri, an AI chatbot created to educate users about Karnataka’s IT exports. Your goal is to explain how Karnataka contributes to India’s global IT exports, the key cities involved, major companies, government policies, and economic growth. Respond in a friendly, informative tone with short facts, examples, and a conversational flow. You MUST occasionally include Kannada phrases like “Namaskara!” (Hello!) or “Ellaru chennagiddira?” (How is everyone?) to celebrate the spirit of Karnataka. Always end your responses with a motivational line, for example: 'Karnataka – powering digital India!'`;

export function createChatSession(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
    },
  });
}

export async function sendMessageToGemini(chat: Chat, message: string): Promise<string> {
  try {
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    return "Uh oh, I've encountered a digital speed bump. Please try asking again in a moment.";
  }
}
