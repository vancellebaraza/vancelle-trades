
import React, { useCallback, useRef, useState } from 'react';

interface AnalyzeViewProps {
  onImageUpload: (imageDataUrl: string) => void;
  onAnalyze: (data: { image: string; pair: string; timeframe: string; notes: string }) => void;
  chartImage: string | null;
  error: string | null;
}

const timeframes = ['15m', '30m', '1H', '4H', 'Daily'];

const AnalyzeView: React.FC<AnalyzeViewProps> = ({ onImageUpload, onAnalyze, chartImage, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pair, setPair] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('');
  const [notes, setNotes] = useState('');

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => onImageUpload(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = useCallback(() => fileInputRef.current?.click(), []);

  const handleAnalysisClick = () => {
    if (chartImage) {
      onAnalyze({
        image: chartImage,
        pair,
        timeframe: selectedTimeframe,
        notes,
      });
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {!chartImage ? (
        <>
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Market <br/>Intake</h2>
            <p className="text-gray-500 text-[10px] font-light tracking-widest uppercase leading-tight max-w-[240px]">
              Submit a clear chart screenshot for technical extraction and execution planning.
            </p>
          </div>

          <div 
            onClick={triggerFileSelect}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`relative w-full aspect-[4/3] max-h-[280px] border-[1px] border-dashed rounded-3xl flex flex-col justify-center items-center cursor-pointer transition-all duration-500 group ${
              isDragging 
              ? 'border-bull bg-bull/20 shadow-[0_0_60px_rgba(0,245,155,0.4)]' 
              : 'border-bull/20 bg-bull/10 hover:border-bull/60 hover:shadow-[0_0_20px_rgba(0,245,155,0.1)]'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/*" />
            
            <div className={`p-6 rounded-full border border-dashed transition-all duration-700 ${isDragging ? 'scale-110 border-bull bg-bull/20 shadow-[0_0_40px_rgba(0,245,155,0.2)]' : 'border-bull/10 bg-midnight group-hover:border-bull/40'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-bull opacity-80 group-hover:opacity-100">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-white font-black tracking-[0.4em] text-[10px] uppercase mb-1 leading-none">AWAITING CHART SUBMISSION</p>
              <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase font-light">DRAG & DROP OR TAP TO UPLOAD</p>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] border-b border-border/50 pb-2">Submission Guidelines</h3>
            <ul className="space-y-2 text-[11px] text-gray-400 tracking-tight leading-snug list-disc list-inside font-light">
              <li><span className="font-bold text-gray-300">Clear Candlesticks:</span> Ensure candles are sharp and unobscured.</li>
              <li><span className="font-bold text-gray-300">Visible Pair & Timeframe:</span> If not visible, specify them manually after upload.</li>
              <li><span className="font-bold text-gray-300">Minimal Indicators:</span> A clean chart provides the best structural analysis.</li>
              <li><span className="font-bold text-gray-300">Sufficient History:</span> Include enough price data to define market structure.</li>
            </ul>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full relative rounded-2xl overflow-hidden border border-bull/30 shadow-2xl bg-surface p-1">
             <img src={chartImage} alt="Chart preview" className="rounded-xl w-full object-contain max-h-[35vh]" />
             <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent pointer-events-none"></div>
          </div>
          
          <div className="w-full mt-4 space-y-4 animate-in">
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Currency Pair</label>
                <input 
                  type="text"
                  value={pair}
                  onChange={(e) => setPair(e.target.value.toUpperCase())}
                  className="w-full bg-surface border border-border rounded-lg h-11 px-4 mt-1 text-white font-mono text-sm tracking-wider focus:ring-1 focus:ring-bull/50 focus:border-bull outline-none"
                  placeholder="e.g., EURUSD"
                />
             </div>
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Timeframe</label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {timeframes.map(tf => (
                    <button key={tf} onClick={() => setSelectedTimeframe(tf)} className={`py-2 text-xs font-bold rounded-lg border transition-all uppercase tracking-tighter ${selectedTimeframe === tf ? 'bg-bull text-midnight border-bull' : 'border-border text-gray-500'}`}>{tf}</button>
                  ))}
                </div>
             </div>
             <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">Additional Context (Optional)</label>
                 <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg p-3 mt-1 text-white font-mono text-sm tracking-wider focus:ring-1 focus:ring-bull/50 focus:border-bull outline-none resize-none h-16"
                  placeholder="e.g., Post-NFP volatility, high liquidity zone..."
                />
             </div>
          </div>
          
          <div className="w-full mt-6 space-y-3">
            <button
              onClick={handleAnalysisClick}
              disabled={!pair || !selectedTimeframe}
              className="w-full py-4 bg-bull text-midnight font-black text-[10px] tracking-[0.5em] rounded-xl shadow-[0_0_40px_rgba(0,245,155,0.4)] hover:brightness-110 active:scale-[0.98] transition-all uppercase leading-none disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Begin Analysis
            </button>
            <button onClick={triggerFileSelect} className="w-full py-3 text-gray-600 font-bold text-[9px] hover:text-white transition-colors border border-border rounded-xl uppercase tracking-[0.3em] leading-none">REPLACE SCREENSHOT</button>
          </div>
          <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/*" />
        </div>
      )}
      {error && (
          <div className="mt-6 w-full bg-bear/5 border border-bear/20 text-bear p-4 rounded-2xl flex items-center justify-center">
            <div className="text-[10px] font-black uppercase tracking-widest">Diagnostic Error: {error}</div>
          </div>
      )}
    </div>
  );
};

export default AnalyzeView;
