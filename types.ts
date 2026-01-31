
export enum Tab {
  ANALYZE = 'ANALYZE',
  DECISION = 'DECISION',
  SETTINGS = 'SETTINGS',
  LEARN = 'LEARN',
  JOURNAL = 'JOURNAL',
}

export interface DrawingLayer {
  type: 'TRENDLINE' | 'ZONE' | 'FIBONACCI' | 'MARKER' | 'LIQUIDITY_GAP';
  points: { x: number; y: number }[]; // 0-100 scale
  label: string;
  color: 'bull' | 'bear' | 'neutral';
}

export interface ExecutionPlan {
  entry: string;
  stopLoss: string;
  takeProfit: string[];
  riskRewardRatio: string;
  positionSizing: string;
}

export interface ObservationProtocol {
  reason: string;
  indicatorsToWatch: string[];
  reEvaluationCondition: string;
}

export interface AnalysisResult {
  status: 'COMPLETE' | 'INCOMPLETE';
  missingData?: string[];
  marketOverview: string;
  bias: string;
  pair: string;
  timeframe: string;
  tradeDirective: 'BUY' | 'SELL' | 'WAIT';
  observationProtocol?: ObservationProtocol; // ONLY present if WAIT
  executionPlan?: ExecutionPlan; // ONLY present if BUY or SELL
  drawingLayers: DrawingLayer[];
  qualityScore: number;
  reasoningConfidence: string;
  whyThisStrategy: string;
  whyNotOpposite: string;
  technicalFactors: {
    momentum: string;
    volatility: string;
    confluencePoints: string[];
  };
  scenarioAnalysis: {
    primary: string;
    invalidation: string;
    alternative: string;
  };
}

export interface TradeLog {
  id: string;
  timestamp: number;
  image: string;
  result: AnalysisResult;
  review?: TradeReview;
}

export interface TradeReview {
  outcome: 'WIN' | 'LOSS' | 'BREAKEVEN' | 'SKIPPED';
  notes: string;
}