
import { GoogleGenAI, Type } from "@google/genai";

export const parseTimetableWithGemini = async (imageBase64: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze this medical college timetable and extract subjects. 
  Map terms like 'Gross Anatomy' to 'Anatomy', 'Dissection' to 'Anatomy (Practical)', 'PSM' to 'Community Medicine'. 
  Identify if each lecture is Theory or Practical. 
  Count weekly frequency.
  
  Return a JSON array of objects with keys: "subjectName", "type" (Theory/Practical), "frequencyPerWeek".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              subjectName: { type: Type.STRING },
              type: { type: Type.STRING },
              frequencyPerWeek: { type: Type.NUMBER }
            },
            required: ["subjectName", "type", "frequencyPerWeek"]
          }
        }
      }
    });

    // Ensure response.text is used as a property
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};

export const getDoctorAdvice = async (userPrompt: string, context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are "MedBot", a friendly, empathetic Little Doctor assistant for MBBS students in India.
  You have access to the user's current attendance data.
  User Settings: ${JSON.stringify(context.settings)}
  Current Subjects: ${JSON.stringify(context.subjects)}
  
  Your goal:
  1. Help students understand their attendance risk.
  2. Explain MYSY rules (80% Theory, 85% Practical) if they are MYSY scholars.
  3. Be encouraging but firm about detention risks.
  4. Use medical student slang (MBBS, Profs, Postings, Internal, Vivas).
  5. Keep answers concise and helpful.
  
  If they ask "Am I safe?", check their subjects and point out the ones in "DANGER" or "BORDERLINE".`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      // Fix: Ensure contents follows the Part structure for consistency
      contents: [{ parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    // Fix: Access .text property directly
    return response.text;
  } catch (error) {
    console.error("Doctor AI Error:", error);
    return "Sorry, Doctor. My brain is a bit foggy from all the night shifts. Can you try asking again?";
  }
};
