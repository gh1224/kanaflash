import { GoogleGenAI } from "@google/genai";

// Vite의 define 설정으로 주입되는 process.env.API_KEY를 TypeScript가 인식할 수 있도록 선언합니다.
declare const process: {
  env: {
    API_KEY: string;
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMnemonic = async (char: string, romaji: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a short, fun, and easy-to-remember mnemonic for the Japanese character "${char}" (pronounced "${romaji}"). Explain it in one simple sentence.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || "No mnemonic found.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep practicing! You'll get this one soon.";
  }
};