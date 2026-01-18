
import { GoogleGenAI } from "@google/genai";
import { PinSlot, Operator } from "../types";

export const getHackerHint = async (
  target: number, 
  pins: PinSlot[], 
  operators: Operator[], 
  logs: string[]
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const correctValues = pins.map(p => p.correctValue).join(', ');
  const currentSelections = pins.map(p => p.selectedValue ?? '?').join(', ');
  const opString = operators.join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a rogue hacker terminal assistant. The user is trying to reach a target value of ${target}.
      
      TECHNICAL SPECS:
      - Correct Node Sequence: [${correctValues}]
      - Operators used (in order): [${opString}]
      - User's Current Selections: [${currentSelections}]
      - Previous Log Entries: ${logs.slice(-3).join(' | ')}

      TASK:
      Provide a cryptic but helpful hint in hacker slang. 
      CRITICAL: Do NOT reveal the whole sequence. Only reveal ONE or TWO correct nodes if the user seems stuck.
      Use jargon like 'mainframes', 'uplink', 'packet corruption', 'node injection', 'bit-flip'.
      Maximum 15 words.`,
    });
    return response.text?.trim() || "SYSTEM: Signal interference detected. Decryption failed.";
  } catch (error) {
    return "SYSTEM: Data leak detected. Access restricted.";
  }
};
