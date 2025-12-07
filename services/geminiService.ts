import { GoogleGenAI, Type } from "@google/genai";
import { Bet, BetResult } from "../types";

// Initialize Gemini Client
// IMPORTANT: The API key is injected via process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBettingHistory = async (bets: Bet[]): Promise<any> => {
  if (bets.length === 0) {
    return {
      summary: "Sem dados suficientes para análise.",
      strengths: [],
      weaknesses: [],
      tips: ["Comece adicionando suas apostas para receber insights."]
    };
  }

  // Filter finished bets for analysis
  const finishedBets = bets.filter(b => b.result !== BetResult.PENDING);
  
  if (finishedBets.length < 3) {
      return {
      summary: "Continue apostando para gerar um padrão de dados.",
      strengths: [],
      weaknesses: [],
      tips: ["São necessárias pelo menos 3 apostas finalizadas para uma análise precisa."]
    };
  }

  // Prepare data for the model
  const betsSummary = finishedBets.map(b => 
    `Sport: ${b.sport}, Market: ${b.market}, Odds: ${b.odds}, Stake: ${b.stakeUnits}u, Result: ${b.result}`
  ).join('\n');

  const prompt = `
    Aja como um analista profissional de apostas esportivas (Tipster Profissional).
    Analise o seguinte histórico de apostas e forneça insights sobre a performance.
    Foque em gestão de banca, seleção de odds e consistência.
    
    Dados das apostas:
    ${betsSummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um coach de apostas esportivas focado em matemática e valor esperado (+EV). Responda em Português do Brasil.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Um resumo geral da performance." },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos fortes identificados." },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Pontos fracos ou vazamentos de banca." },
            tips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Dicas acionáveis para melhorar." }
          },
          required: ["summary", "strengths", "weaknesses", "tips"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro na análise da IA:", error);
    return {
      summary: "Não foi possível gerar a análise no momento.",
      strengths: [],
      weaknesses: [],
      tips: ["Verifique sua conexão ou tente novamente mais tarde."]
    };
  }
};