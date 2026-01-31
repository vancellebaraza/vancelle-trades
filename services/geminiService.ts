
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TradeReview } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (history: any[]) => `
You are VANCELLE TRADES (Production Version). High-precision Forex-only diagnostic engine.
STRICT PROTOCOL:
1. FOREX ONLY: If the asset is not a Forex pair (e.g., Stock, Crypto, Gold - though Gold is okay if paired with USD like XAUUSD), return status: "INCOMPLETE".
2. DATA INTEGRITY: You MUST see: Currency Pair, Timeframe, Clear Candles. If missing, return status: "INCOMPLETE" and list missing items.
3. WAIT BEHAVIOR: If directive is "WAIT", you MUST NOT provide an 'executionPlan'. Provide 'waitReason' and 'waitDuration' instead.
4. ACCURACY: Accuracy is everything. Confluence < 80% = WAIT.
5. DRAWINGS: Return 'drawingLayers' with coordinates (0-100).
   - FIBONACCI: Map the 0.618 and 0.5 levels.
   - LIQUIDITY_GAP: Highlight imbalance zones.
6. STRATEGY: Explain 'whyThisStrategy' and 'whyNotOpposite'.

TECHNICAL CORE: Mark Andrew Lim's "Handbook of Technical Analysis".
${history.length > 0 ? `LEARNING CONTEXT: ${JSON.stringify(history.slice(-3))}` : ""}
`;

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    status: { type: Type.STRING, enum: ['COMPLETE', 'INCOMPLETE'] },
    missingData: { type: Type.ARRAY, items: { type: Type.STRING } },
    pair: { type: Type.STRING },
    timeframe: { type: Type.STRING },
    marketOverview: { type: Type.STRING },
    bias: { type: Type.STRING },
    tradeDirective: { type: Type.STRING, enum: ['BUY', 'SELL', 'WAIT'] },
    waitReason: { type: Type.STRING },
    waitDuration: { type: Type.STRING },
    executionPlan: {
      type: Type.OBJECT,
      properties: {
        entry: { type: Type.STRING },
        stopLoss: { type: Type.STRING },
        takeProfit: { type: Type.ARRAY, items: { type: Type.STRING } },
        riskRewardRatio: { type: Type.STRING },
        positionSizing: { type: Type.STRING },
      },
    },
    technicalFactors: {
      type: Type.OBJECT,
      properties: {
        momentum: { type: Type.STRING },
        volatility: { type: Type.STRING },
        confluencePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
      }
    },
    drawingLayers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING, enum: ['TRENDLINE', 'ZONE', 'FIBONACCI', 'MARKER', 'LIQUIDITY_GAP'] },
          points: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } 
            } 
          },
          label: { type: Type.STRING },
          color: { type: Type.STRING, enum: ['bull', 'bear', 'neutral'] }
        }
      }
    },
    qualityScore: { type: Type.INTEGER },
    reasoningConfidence: { type: Type.STRING },
    whyThisStrategy: { type: Type.STRING },
    whyNotOpposite: { type: Type.STRING },
    scenarioAnalysis: {
      type: Type.OBJECT,
      properties: { primary: { type: Type.STRING }, invalidation: { type: Type.STRING }, alternative: { type: Type.STRING } }
    }
  },
  required: ['status', 'tradeDirective', 'qualityScore', 'whyThisStrategy', 'whyNotOpposite', 'technicalFactors']
};

export async function analyzeChart(imageDataUrl: string, history: any[] = []): Promise<AnalysisResult> {
  const base64Data = imageDataUrl.split(',')[1];
  const mimeType = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Diagnostic request: Forex chart analysis." }] },
    config: { systemInstruction: getSystemInstruction(history), responseMimeType: "application/json", responseSchema: analysisSchema },
  });
  return JSON.parse(response.text) as AnalysisResult;
}
