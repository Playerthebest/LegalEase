import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from "@google/genai";

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly MODEL_ID = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env['API_KEY'] });
  }

  async analyzeDocument(text: string, country: string, documentType: string = 'Auto-detect', additionalNotes: string = ''): Promise<any> {
    const typeInstruction = documentType !== 'Auto-detect' 
      ? `The user has identified this document as a: ${documentType}.`
      : 'Identify the document type automatically.';

    const notesInstruction = additionalNotes.trim()
      ? `The user has provided the following additional notes or instructions to guide the analysis: "${additionalNotes}"`
      : '';

    const prompt = `
      You are an expert legal AI assistant specializing in contract law for ${country}.
      ${typeInstruction}
      ${notesInstruction}
      Analyze the following legal document text.
      
      Tasks:
      1. Determine an overall risk score (0-100), where 100 is EXTREMELY RISKY and 0 is SAFE.
      2. Identify key clauses.
      3. For each clause, provide a layman's explanation and a risk level (High, Medium, Low).
      4. Sort the clauses strictly from HIGHEST risk to LOWEST risk.
      5. Provide a short summary of the document.

      Document Text:
      "${text}" 
    `;

    // Schema definition for structured JSON output
    const schema = {
      type: Type.OBJECT,
      properties: {
        overallRiskScore: { type: Type.INTEGER, description: "0 to 100 score. 100 is most risky." },
        summary: { type: Type.STRING, description: "A concise summary of the document." },
        clauses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Short title of the clause" },
              originalText: { type: Type.STRING, description: "The original legalese snippet" },
              laymanExplanation: { type: Type.STRING, description: "Simple explanation" },
              riskLevel: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
              riskReason: { type: Type.STRING, description: "Why is this risky?" }
            },
            required: ["title", "originalText", "laymanExplanation", "riskLevel", "riskReason"]
          }
        }
      },
      required: ["overallRiskScore", "summary", "clauses"]
    };

    try {
      const response = await this.ai.models.generateContent({
        model: this.MODEL_ID,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });
      
      const jsonText = response.text || "{}";
      return JSON.parse(jsonText);
    } catch (error) {
      console.error("Analysis failed", error);
      throw error;
    }
  }

  async chat(message: string, history: any[], context: string): Promise<string> {
    const systemInstruction = `
      You are LegalEase Assistant, a helpful legal AI.
      Current Context: ${context || "General legal assistance."}
      Answer questions clearly. If you don't know, state that.
      Do not give binding legal advice, always add a disclaimer if necessary.
      Keep answers concise and helpful.
    `;

    try {
      const chatSession = this.ai.chats.create({
        model: this.MODEL_ID,
        config: {
          systemInstruction: systemInstruction
        },
        history: history
      });

      const result = await chatSession.sendMessage({ message });
      return result.text;
    } catch (error) {
      console.error("Chat failed", error);
      return "I apologize, but I encountered an error connecting to the legal knowledge base.";
    }
  }
}