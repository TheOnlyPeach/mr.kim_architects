import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;

// ✅ Vite 환경에 맞게 수정한 API 키 가져오기 함수
const getApiKey = (): string => {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  if (apiKey && typeof apiKey === 'string') {
    return apiKey;
  }
  
  console.error("API Key not found. (VITE_API_KEY 환경변수를 확인하세요)");
  return "";
};

export const initializeGame = async (): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });
  
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9, 
    },
  });

  try {
    // 게임 시작 메시지 트리거
    const response = await chatSession.sendMessage({ message: "이제 게임을 시작하세요. 첫 번째 의뢰를 던지세요." });
    return response.text || "시스템 오류: 미스터 킴이 침묵하고 있습니다.";
  } catch (error) {
    console.error("Failed to initialize game:", error);
    throw error;
  }
};

export const sendMessageToKim = async (userMessage: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Game session not initialized");
  }

  try {
    const response = await chatSession.sendMessage({ message: userMessage });
    return response.text || "...";
  } catch (error) {
    console.error("Error sending message:", error);
    return "미스터 킴이 전화를 받지 않습니다. (API Error)";
  }
};