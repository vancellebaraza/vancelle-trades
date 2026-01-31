
import React, { useState } from 'react';
import { AnalysisResult, TradeReview, DrawingLayer } from '../types';

interface DecisionViewProps {
  result: AnalysisResult;
  chartImage: string;
  onNewAnalysis: () => void;
  onReviewSubmit: (review: TradeReview) => void;
}

const AnnotationOverlay: React.FC<{ layers: DrawingLayer[] }> = ({ layers }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      {layers.map((layer, idx) => {
        const color = layer.color === 'bull' ? '#00f59b' : layer.color === 'bear' ? '#ff3b3b' : '#94a3b8';
        if (layer.type === 'TRENDLINE' && layer.points.length >= 2) {
          return (
            <g key={idx}>
              <line x1={layer.points[0].x} y1={layer.points[0].y} x2={layer.points[1].x} y2={layer.points[1].y} stroke={color} strokeWidth="0.4" strokeDasharray="1,0.5" />
              <text x={layer.points[1].x} y={layer.points[1].y - 1} fill={color} fontSize="1.8" fontWeight="black" textAnchor="middle" style={{ textShadow: '0 0 2px black' }}>{layer.label}</text>
            </g>
          );
        }
        if (layer.type === 'ZONE' || layer.type === 'LIQUIDITY_GAP') {
          const width = Math.abs(layer.points[1].x - layer.points[0].x);
          const height = Math.abs(layer.points[1].y - layer.points[0].y);
          return (
            <g key={idx}>
              <rect x={Math.min(layer.points[0].x, layer.points[1].x)} y={Math.min(layer.points[0].y, layer.points[1].y)} width={width} height={height} fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.15" />
              <text x={Math.min(layer.points[0].x, layer.points[1].x)} y={Math.min(layer.points[0].y, layer.points[1].y) - 1} fill={color} fontSize="1.5" fontWeight="black" style={{ textShadow: '0 0 2px black' }}>{layer.label}</text>
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
};

const DecisionView: React.FC<DecisionViewProps> = ({ result, chartImage, onNewAnalysis, onReviewSubmit }) => {
  const [activeReasoning, setActiveReasoning] = useState<'NONE' | 'STRATEGY' | 'OPPOSITE'>('NONE');
  const [showReview, setShowReview] = useState(false);
  const [outcome, setOutcome] = useState<'WIN' | 'LOSS' | 'BREAKEVEN' | 'SKIPPED' | null>(null);

  if (result.status === 'INCOMPLETE') {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-14 h-14 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Engine Halted</h2>
          <p className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.2em] leading-tight">Insufficient Data Context</p>
          <div className="flex flex-wrap gap-1.5 justify-center pt-4">
            {result.missingData?.map(m => (
              <span key={m} className="px-3 py-1 bg-midnight border border-border text-[8px] font-mono text-yellow-400 uppercase tracking-tighter">{m}</span>
            ))}
          </div>
        </div>
        <button onClick={onNewAnalysis} className="w-full mt-10 py-4 bg-white text-midnight font-bold rounded-xl text-[10px] tracking-widest uppercase leading-none shadow-xl">Flush Diagnostic</button>
      </div>
    );
  }

  const isWait = result.tradeDirective === 'WAIT';
  const color = result.tradeDirective === 'BUY' ? 'text-bull' : result.tradeDirective === 'SELL' ? 'text-bear' : 'text-yellow-400';
  const borderCol = result.tradeDirective === 'BUY' ? 'border-bull/20' : result.tradeDirective === 'SELL' ? 'border-bear/20' : 'border-yellow-400/20';
  const bgCol = result.tradeDirective === 'BUY' ? 'bg-bull/5' : result.tradeDirective === 'SELL' ? 'bg-bear/5' : 'bg-yellow-400/5';

  return (
    <div className="p-5 space-y-4 font-light leading-tight">
      {/* Visual Diagnostic */}
      <div className="relative w-full rounded-xl overflow-hidden border border-border bg-surface shadow-lg">
        <img src={chartImage} className="w-full rounded-lg object-contain" alt="Diagnostic" />
        <AnnotationOverlay layers={result.drawingLayers || []} />
        <div className="absolute top-3 left-3 flex gap-1">
           <span className="px-2 py-0.5 bg-midnight/90 backdrop-blur rounded text-[8px] font-mono text-white font-bold border border-white/5 uppercase tracking-tighter">{result.pair}</span>
           <span className="px-2 py-0.5 bg-midnight/90 backdrop-blur rounded text-[8px] font-mono text-white font-bold border border-white/5 uppercase tracking-tighter">{result.timeframe}</span>
        </div>
      </div>

      {/* Directive Banner */}
      <div className={`p-4 rounded-xl border ${borderCol} ${bgCol} flex justify-between items-center shadow-md`}>
        <div className="space-y-1">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">Strategic Verdict</span>
          <h2 className={`text-4xl font-black tracking-tighter uppercase leading-none ${color}`}>{result.tradeDirective}</h2>
        </div>
        <div className="text-right space-y-1">
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.3em] leading-none">Diagnostic Edge</span>
            <div className="text-2xl font-mono font-black text-white leading-none">{result.qualityScore}<span className="text-[10px] opacity-40 ml-0.5">%</span></div>
        </div>
      </div>

      {/* Logic Bot Drawer */}
      <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
           <button onClick={() => setActiveReasoning(activeReasoning === 'STRATEGY' ? 'NONE' : 'STRATEGY')} className={`flex-1 py-2 text-[8px] font-bold rounded-lg border transition-all uppercase tracking-widest ${activeReasoning === 'STRATEGY' ? 'bg-bull text-midnight border-bull shadow-[0_0_12px_rgba(0,245,155,0.4)]' : 'border-border text-gray-600 hover:text-gray-400'}`}>Logic Basis</button>
           <button onClick={() => setActiveReasoning(activeReasoning === 'OPPOSITE' ? 'NONE' : 'OPPOSITE')} className={`flex-1 py-2 text-[8px] font-bold rounded-lg border transition-all uppercase tracking-widest ${activeReasoning === 'OPPOSITE' ? 'bg-bull text-midnight border-bull shadow-[0_0_12px_rgba(0,245,155,0.4)]' : 'border-border text-gray-600 hover:text-gray-400'}`}>Risk Inversion</button>
        </div>
        {activeReasoning !== 'NONE' && (
          <div className="p-3 bg-midnight/60 border border-bull/20 rounded-lg animate-in slide-in-from-top-1">
            <p className="text-[10px] text-gray-400 tracking-tight leading-snug italic font-medium">
              {activeReasoning === 'STRATEGY' ? result.whyThisStrategy : result.whyNotOpposite}
            </p>
          </div>
        )}
      </div>

      {/* Execution Pipeline - Silk & Neat Layout */}
      {result.executionPlan && !isWait && (
        <div className="bg-surface/80 border border-border rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] border-b border-border/50 pb-2 leading-none">Execution Pipeline</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-6">
             <div className="space-y-1">
                <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest leading-none block">Entry Protocol</span>
                <span className="text-[12px] font-mono text-white tracking-tighter leading-none">{result.executionPlan.entry}</span>
             </div>
             <div className="space-y-1">
                <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest leading-none block">Invalidation Zone</span>
                <span className="text-[12px] font-mono text-bear font-bold tracking-tighter leading-none">{result.executionPlan.stopLoss}</span>
             </div>
             <div className="space-y-1">
                <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest leading-none block">Primary Target</span>
                <span className="text-[12px] font-mono text-bull font-bold tracking-tighter leading-none">{result.executionPlan.takeProfit[0]}</span>
             </div>
             <div className="space-y-1">
                <span className="text-[7px] text-gray-500 uppercase font-black tracking-widest leading-none block">Reward Ratio</span>
                <span className="text-[12px] font-mono text-white tracking-tighter leading-none">{result.executionPlan.riskRewardRatio}</span>
             </div>
          </div>
          <div className="pt-2 border-t border-border/50 flex justify-between items-center">
             <span className="text-[7px] text-gray-600 uppercase font-bold tracking-widest">Risk Allocation:</span>
             <span className="text-[9px] font-mono text-gray-400 font-bold tracking-tighter">{result.executionPlan.positionSizing}</span>
          </div>
        </div>
      )}

      {/* Observation Protocol for WAIT */}
      {isWait && (
        <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-4 space-y-3 shadow-sm">
           <h3 className="text-[8px] font-black text-yellow-400/80 uppercase tracking-[0.4em] border-b border-yellow-400/10 pb-2 leading-none">Observation Protocol</h3>
           <p className="text-[11px] text-gray-300 font-light tracking-tight leading-snug">{result.waitReason || "Market structure currently ambiguous. Awaiting clearer structural print."}</p>
           <div className="flex items-center justify-between border-t border-yellow-400/10 pt-2">
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Observance Cycle</span>
              <span className="text-[9px] font-mono text-yellow-400/80 font-bold uppercase tracking-tighter">{result.waitDuration || 'Indefinite'}</span>
           </div>
        </div>
      )}

      {/* Diagnostic Context */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-surface/30 border border-border/60 rounded-xl p-4 space-y-2">
           <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] border-b border-border/30 pb-1 leading-none">Confluence Matrix</h3>
           <div className="flex flex-wrap gap-1.5 pt-1">
              {result.technicalFactors.confluencePoints.map(p => (
                <span key={p} className="px-2 py-0.5 bg-midnight/80 border border-border/40 text-[8px] font-bold text-gray-400 uppercase tracking-tight">{p}</span>
              ))}
           </div>
        </div>
        <div className="bg-surface/30 border border-border/60 rounded-xl p-4 space-y-2">
           <h3 className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] border-b border-border/30 pb-1 leading-none">Context Summary</h3>
           <p className="text-[10px] text-gray-500 tracking-tight leading-snug font-light italic">{result.marketOverview}</p>
        </div>
      </div>

      <div className="pt-6 space-y-3">
        {!showReview ? (
          <button onClick={() => setShowReview(true)} className="w-full py-4 bg-white text-midnight font-black rounded-xl text-[10px] tracking-[0.4em] uppercase shadow-lg leading-none transition-transform active:scale-[0.98]">Log Execution</button>
        ) : (
          <div className="bg-surface border border-bull/20 rounded-xl p-4 space-y-3 animate-in fade-in zoom-in-95">
            <h3 className="text-[9px] font-black text-bull uppercase tracking-widest leading-none">Engine Calibration</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {['WIN', 'LOSS', 'B/E', 'SKIP'].map(o => (
                <button key={o} onClick={() => setOutcome(o === 'B/E' ? 'BREAKEVEN' : o === 'SKIP' ? 'SKIPPED' : o as any)} className={`py-2 text-[8px] font-black rounded border transition-all uppercase tracking-tighter ${outcome === (o === 'B/E' ? 'BREAKEVEN' : o === 'SKIP' ? 'SKIPPED' : o) ? 'bg-bull text-midnight border-bull' : 'border-border text-gray-600'}`}>{o}</button>
              ))}
            </div>
            <button onClick={() => outcome && onReviewSubmit({ outcome, notes: '' })} disabled={!outcome} className="w-full py-3 bg-bull text-midnight font-black rounded-lg text-[9px] tracking-widest uppercase disabled:opacity-30 leading-none">Update Learning Path</button>
          </div>
        )}
        <button onClick={onNewAnalysis} className="w-full py-3 border border-border/60 text-gray-600 font-bold rounded-xl text-[9px] tracking-[0.3em] uppercase hover:text-white transition-colors leading-none">Abort diagnostic</button>
      </div>
    </div>
  );
};

export default DecisionView;
