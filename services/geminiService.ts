
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, TradeReview } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable not set");

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (history: any[], context: { pair: string; timeframe: string; notes: string }) => `
You are VANCELLE TRADES (Production Version), an assertive but disciplined Forex diagnostic engine. Your primary goal is to identify high-probability trading opportunities. While capital preservation is key, you are expected to take calculated risks when the structure is favorable.

USER-PROVIDED CONTEXT (Ground Truth):
- Currency Pair: ${context.pair || 'Not Provided'}
- Timeframe: ${context.timeframe || 'Not Provided'}
- Additional Notes: ${context.notes || 'None'}
This user-provided information is the ground truth. If it conflicts with your visual analysis of the screenshot, you MUST prioritize this data.

STRICT PROTOCOL:
1. FOREX ONLY: If the asset is not a Forex pair (e.g., Stock, Crypto, Gold - though Gold is okay if paired with USD like XAUUSD), return status: "INCOMPLETE".
2. DATA INTEGRITY: You MUST see: Clear Candles. If the user does not provide Pair or Timeframe, try to infer it. If you cannot, return status: "INCOMPLETE" and list missing items.
3. DECISIVENESS: Perform extensive analysis to find a tradable edge. Your confidence threshold is high, but not prohibitive. The directive is "WAIT" only if confluence is below 70%.
4. WAIT BEHAVIOR: If directive is "WAIT", you MUST NOT provide an 'executionPlan'. Instead, you MUST provide a detailed 'observationProtocol' object containing:
   - 'reason': A deep explanation of the current structural ambiguity or risk factors.
   - 'indicatorsToWatch': An array of specific technical signals to monitor (e.g., "RSI divergence", "Bearish engulfing on 4H").
   - 'reEvaluationCondition': A concrete, actionable market condition for re-analysis (e.g., "A daily close above the 1.1250 resistance level.").
5. DRAWINGS: Return 'drawingLayers' with coordinates (0-100).
   - FIBONACCI: Map the 0.618 and 0.5 levels.
   - LIQUIDITY_GAP: Highlight imbalance zones.
6. STRATEGY & JUSTIFICATION: When issuing a BUY/SELL, you must thoroughly explain 'whyThisStrategy' with multiple confluence points, and justify 'whyNotOpposite' by highlighting invalidating factors for the opposing view. Your analysis must be deep and convincing.

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
    observationProtocol: {
      type: Type.OBJECT,
      properties: {
        reason: { type: Type.STRING },
        indicatorsToWatch: { type: Type.ARRAY, items: { type: Type.STRING } },
        reEvaluationCondition: { type: Type.STRING },
      },
    },
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

export async function analyzeChart(
  data: { image: string; pair: string; timeframe: string; notes: string }, 
  history: any[] = []
): Promise<AnalysisResult> {
  const { image, pair, timeframe, notes } = data;
  const base64Data = image.split(',')[1];
  const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ inlineData: { mimeType, data: base64Data } }, { text: "Analyze this Forex chart screenshot using the provided context." }] },
    config: { systemInstruction: getSystemInstruction(history, { pair, timeframe, notes }), responseMimeType: "application/json", responseSchema: analysisSchema },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Received an empty response from the analysis engine.");
  }
  const result = JSON.parse(text) as AnalysisResult;
  // If the model didn't get the pair/timeframe from the image, populate it from user input
  if (!result.pair && pair) result.pair = pair.toUpperCase();
  if (!result.timeframe && timeframe) result.timeframe = timeframe;
  
  return result;
}
