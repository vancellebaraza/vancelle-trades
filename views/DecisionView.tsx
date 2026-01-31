
import React, { useState } from 'react';
import { AnalysisResult, TradeReview, DrawingLayer } from '../types';

interface Settings {
  accountBalance: number;
  riskPerTrade: number;
}

interface DecisionViewProps {
  result: AnalysisResult;
  chartImage: string;
  onNewAnalysis: () => void;
  onReviewSubmit: (review: TradeReview) => void;
  settings: Settings;
}

type DecisionTab = 'EXECUTION' | 'STRATEGY' | 'SCENARIOS';

const AnnotationOverlay: React.FC<{ layers: DrawingLayer[] }> = ({ layers }) => {
  // Annotation Overlay remains the same
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {layers.map((layer, idx) => {
        const color = layer.color === 'bull' ? '#00f59b' : layer.color === 'bear' ? '#ff3b3b' : '#94a3b8';
        if (layer.type === 'TRENDLINE' && layer.points.length >= 2) {
          return (
            <g key={idx}>
              <line x1={layer.points[0].x} y1={layer.points[0].y} x2={layer.points[1].x} y2={layer.points[1].y} stroke={color} strokeWidth="0.4" strokeDasharray="1,0.5" />
              <text x={layer.points[1].x} y={layer.points[1].y - 1} fill={color} fontSize="1.8" fontWeight="bold" textAnchor="middle" style={{ textShadow: '0 0 2px black' }}>{layer.label}</text>
            </g>
          );
        }
        if (layer.type === 'ZONE' || layer.type === 'LIQUIDITY_GAP') {
          const width = Math.abs(layer.points[1].x - layer.points[0].x);
          const height = Math.abs(layer.points[1].y - layer.points[0].y);
          return (
            <g key={idx}>
              <rect x={Math.min(layer.points[0].x, layer.points[1].x)} y={Math.min(layer.points[0].y, layer.points[1].y)} width={width} height={height} fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.15" />
              <text x={Math.min(layer.points[0].x, layer.points[1].x)} y={Math.min(layer.points[0].y, layer.points[1].y) - 1} fill={color} fontSize="1.5" fontWeight="bold" style={{ textShadow: '0 0 2px black' }}>{layer.label}</text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
};

const DecisionView: React.FC<DecisionViewProps> = ({ result, chartImage, onNewAnalysis, onReviewSubmit, settings }) => {
  const [activeTab, setActiveTab] = useState<DecisionTab>('EXECUTION');
  const [showReview, setShowReview] = useState(false);
  const [outcome, setOutcome] = useState<'WIN' | 'LOSS' | 'BREAKEVEN' | 'SKIPPED' | null>(null);

  if (result.status === 'INCOMPLETE') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-14 h-14 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white uppercase tracking-tighter leading-none">Engine Halted</h2>
          <p className="text-gray-500 text-xs uppercase font-bold tracking-widest leading-tight">Insufficient Data Context</p>
          <div className="flex flex-wrap gap-1.5 justify-center pt-4">
            {result.missingData?.map(m => (
              <span key={m} className="px-3 py-1 bg-midnight border border-border text-sm font-light text-yellow-400 uppercase tracking-tighter">{m}</span>
            ))}
          </div>
        </div>
        <button onClick={onNewAnalysis} className="w-full mt-10 py-4 bg-white text-midnight font-bold rounded-xl text-sm tracking-widest uppercase leading-none shadow-xl">Flush Diagnostic</button>
      </div>
    );
  }

  const isWait = result.tradeDirective === 'WAIT';
  const color = result.tradeDirective === 'BUY' ? 'text-bull' : result.tradeDirective === 'SELL' ? 'text-bear' : 'text-yellow-400';
  const borderCol = result.tradeDirective === 'BUY' ? 'border-bull/20' : result.tradeDirective === 'SELL' ? 'border-bear/20' : 'border-yellow-400/20';
  const bgCol = result.tradeDirective === 'BUY' ? 'bg-bull/5' : result.tradeDirective === 'SELL' ? 'bg-bear/5' : 'bg-yellow-400/5';

  const riskAmount = settings.accountBalance * (settings.riskPerTrade / 100);
  const ratioString = result.executionPlan?.riskRewardRatio.split(':')[0] || "0";
  const ratio = parseFloat(ratioString);
  const potentialProfit = riskAmount * ratio;
  const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

  const renderTabs = () => (
    <div className="bg-surface/50 border border-border rounded-xl p-1 flex gap-1">
      {(['EXECUTION', 'STRATEGY', 'SCENARIOS'] as DecisionTab[]).map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all uppercase tracking-wider ${activeTab === tab ? 'bg-border text-white shadow-md' : 'text-gray-500 hover:bg-border/50'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderContent = () => (
    <div className="bg-surface/80 border border-border rounded-xl p-4 shadow-sm space-y-4 animate-in">
      {activeTab === 'EXECUTION' && result.executionPlan && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Entry Price</p>
              <p className="text-lg font-bold text-white">{result.executionPlan.entry}</p>
            </div>
            <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Stop Loss</p>
              <p className="text-lg font-bold text-bear">{result.executionPlan.stopLoss}</p>
            </div>
          </div>
          <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
            <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Take Profit Target(s)</p>
            <div className="flex flex-col gap-1 mt-1">
              {result.executionPlan.takeProfit.map((tp, i) => (
                <p key={i} className="text-lg font-bold text-bull">{tp}</p>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Risk/Reward</p>
                <p className="text-lg font-bold text-white">{result.executionPlan.riskRewardRatio}</p>
              </div>
              <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
                <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Position Sizing</p>
                <p className="text-sm font-light text-white italic">{result.executionPlan.positionSizing}</p>
              </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Capital at Risk</p>
              <p className="text-lg font-bold text-bear">{currencyFormatter.format(riskAmount)}</p>
            </div>
            <div className="bg-midnight/50 p-3 rounded-lg border border-border/50">
              <p className="text-xs text-gray-500 font-semibold tracking-wider uppercase">Potential Profit</p>
              <p className="text-lg font-bold text-bull">{currencyFormatter.format(potentialProfit)}</p>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'STRATEGY' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-border/50 pb-1 mb-2">Market Overview</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{result.marketOverview}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-border/50 pb-1 mb-2">Confluence Matrix</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.technicalFactors.confluencePoints.map(p => (
                <span key={p} className="px-2 py-1 bg-midnight/80 border border-border/40 text-xs font-light text-gray-300 rounded">{p}</span>
              ))}
           </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-border/50 pb-1 mb-2">Strategic Rationale</h4>
            <p className="text-sm text-gray-300 leading-relaxed italic">{result.whyThisStrategy}</p>
          </div>
        </div>
      )}
      {activeTab === 'SCENARIOS' && (
         <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-border/50 pb-1 mb-2">Primary Scenario</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{result.scenarioAnalysis.primary}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-bear uppercase tracking-widest border-b border-bear/20 pb-1 mb-2">Invalidation Condition</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{result.scenarioAnalysis.invalidation}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-widest border-b border-yellow-400/20 pb-1 mb-2">Alternative Scenario</h4>
            <p className="text-sm text-gray-300 leading-relaxed">{result.scenarioAnalysis.alternative}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-5 space-y-4 leading-tight">
      <div className="relative w-full rounded-xl overflow-hidden border border-border bg-surface shadow-lg">
        <img src={chartImage} className="w-full rounded-lg object-contain" alt="Diagnostic" />
        <AnnotationOverlay layers={result.drawingLayers || []} />
        <div className="absolute top-3 left-3 flex gap-1">
           <span className="px-2 py-0.5 bg-midnight/90 backdrop-blur rounded text-sm font-light border border-white/5 uppercase tracking-tighter">{result.pair}</span>
           <span className="px-2 py-0.5 bg-midnight/90 backdrop-blur rounded text-sm font-light border border-white/5 uppercase tracking-tighter">{result.timeframe}</span>
        </div>
      </div>

      <div className={`p-4 rounded-xl border ${borderCol} ${bgCol} flex justify-between items-center shadow-md`}>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Strategic Verdict</p>
          <h2 className={`text-5xl font-bold tracking-tighter uppercase leading-none ${color}`}>{result.tradeDirective}</h2>
        </div>
        <div className="text-right">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Diagnostic Edge</p>
            <p className="text-4xl font-bold text-white leading-none">{result.qualityScore}<span className="text-lg opacity-40">%</span></p>
        </div>
      </div>

      {!isWait ? (
        <>
          {renderTabs()}
          {renderContent()}
        </>
      ) : (
        result.observationProtocol && (
          <div className="bg-surface/80 border border-yellow-400/20 rounded-xl p-4 shadow-sm space-y-4 animate-in">
            <h3 className="text-sm font-bold text-yellow-400/80 uppercase tracking-widest border-b border-yellow-400/10 pb-2">Observation Protocol</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Structural Ambiguity</h4>
                <p className="text-sm text-gray-300 leading-relaxed">{result.observationProtocol.reason}</p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirmation Signals to Monitor</h4>
                <div className="flex flex-wrap gap-2">
                  {result.observationProtocol.indicatorsToWatch.map((indicator, i) => (
                    <span key={i} className="px-2 py-1 bg-midnight/80 border border-border/40 text-xs font-light text-gray-300 rounded">{indicator}</span>
                  ))}
                </div>
              </div>
              <div className="bg-midnight/50 p-3 rounded-lg border border-yellow-400/30">
                <h4 className="text-xs font-bold text-yellow-400/80 uppercase tracking-widest mb-1">Re-Evaluation Trigger</h4>
                <p className="text-sm font-bold text-white leading-relaxed">{result.observationProtocol.reEvaluationCondition}</p>
              </div>
            </div>
          </div>
        )
      )}

      <div className="pt-6 space-y-3">
        {!showReview ? (
          <button onClick={() => setShowReview(true)} className="w-full py-4 bg-white text-midnight font-bold rounded-xl text-sm tracking-widest uppercase shadow-lg leading-none transition-transform active:scale-[0.98]">Log Execution</button>
        ) : (
          <div className="bg-surface border border-bull/20 rounded-xl p-4 space-y-3 animate-in">
            <h3 className="text-sm font-bold text-bull uppercase tracking-widest">Engine Calibration</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {['WIN', 'LOSS', 'B/E', 'SKIP'].map(o => (
                <button key={o} onClick={() => setOutcome(o === 'B/E' ? 'BREAKEVEN' : o === 'SKIP' ? 'SKIPPED' : o as any)} className={`py-2 text-xs font-bold rounded border transition-all uppercase tracking-tighter ${outcome === (o === 'B/E' ? 'BREAKEVEN' : o === 'SKIP' ? 'SKIPPED' : o) ? 'bg-bull text-midnight border-bull' : 'border-border text-gray-600'}`}>{o}</button>
              ))}
            </div>
            <button onClick={() => outcome && onReviewSubmit({ outcome, notes: '' })} disabled={!outcome} className="w-full py-3 bg-bull text-midnight font-bold rounded-lg text-sm tracking-widest uppercase disabled:opacity-30 leading-none">Update Learning Path</button>
          </div>
        )}
        <button onClick={onNewAnalysis} className="w-full py-3 border border-border/60 text-gray-600 font-bold rounded-xl text-sm tracking-widest uppercase hover:text-white transition-colors leading-none">Abort diagnostic</button>
      </div>
    </div>
  );
};

export default DecisionView;