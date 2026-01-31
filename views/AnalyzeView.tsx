
import React, { useCallback, useRef, useState } from 'react';

interface AnalyzeViewProps {
  onImageUpload: (imageDataUrl: string) => void;
  onAnalyze: (image: string) => void;
  chartImage: string | null;
  error: string | null;
}

const AnalyzeView: React.FC<AnalyzeViewProps> = ({ onImageUpload, onAnalyze, chartImage, error }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => onImageUpload(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = useCallback(() => fileInputRef.current?.click(), []);

  return (
    <div className="p-6 h-full flex flex-col">
      {!chartImage ? (
        <>
          <div className="mb-10 space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Market <br/>Intake</h2>
            <p className="text-gray-500 text-[10px] font-light tracking-widest uppercase leading-tight max-w-[220px]">
              Vancelle Trades Core Terminal. Submit capture for technical extraction.
            </p>
          </div>

          <div 
            onClick={triggerFileSelect}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileChange(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            className={`relative w-full aspect-square max-h-[360px] border-[1px] border-dashed rounded-3xl flex flex-col justify-center items-center cursor-pointer transition-all duration-500 group ${
              isDragging 
              ? 'border-bull bg-bull/10 shadow-[0_0_60px_rgba(0,245,155,0.3)]' 
              : 'border-bull/20 bg-surface/40 hover:border-bull/60 hover:shadow-[0_0_20px_rgba(0,245,155,0.1)]'
            }`}
          >
            <input type="file" ref={fileInputRef} onChange={(e) => handleFileChange(e.target.files)} className="hidden" accept="image/*" />
            
            <div className={`p-8 rounded-full border border-dashed transition-all duration-700 ${isDragging ? 'scale-110 border-bull bg-bull/20 shadow-[0_0_40px_rgba(0,245,155,0.2)]' : 'border-bull/10 bg-midnight group-hover:border-bull/40'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-bull opacity-80 group-hover:opacity-100">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
              </svg>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-white font-black tracking-[0.5em] text-[10px] uppercase mb-1 leading-none">Buffer Awaiting</p>
              <p className="text-[9px] text-gray-600 font-mono tracking-widest uppercase font-light">Drag capture / Tap to search</p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
             <div className="flex flex-col gap-1 border-l border-border/40 pl-3">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">Constraint</span>
                <span className="text-[9px] font-light text-gray-400 uppercase tracking-tighter">Forex specific only</span>
             </div>
             <div className="flex flex-col gap-1 border-l border-border/40 pl-3">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest leading-none">Logic Core</span>
                <span className="text-[9px] font-light text-gray-400 uppercase tracking-tighter">Lim technical handbook</span>
             </div>
          </div>
        </>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="w-full relative rounded-2xl overflow-hidden border border-bull/30 shadow-2xl bg-surface p-1">
             <img src={chartImage} alt="Chart preview" className="rounded-xl w-full object-contain max-h-[55vh]" />
             <div className="absolute inset-0 bg-gradient-to-t from-midnight/20 to-transparent pointer-events-none"></div>
          </div>
          
          <div className="w-full mt-10 space-y-4">
            <button
              onClick={() => onAnalyze(chartImage)}
              className="w-full py-5 bg-bull text-midnight font-black text-[11px] tracking-[0.5em] rounded-2xl shadow-[0_0_40px_rgba(0,245,155,0.4)] hover:brightness-110 active:scale-[0.98] transition-all uppercase leading-none"
            >
              Begin Analysis
            </button>
            <button onClick={triggerFileSelect} className="w-full py-4 text-gray-600 font-bold text-[9px] hover:text-white transition-colors border border-border rounded-2xl uppercase tracking-[0.3em] leading-none">Flush Buffer</button>
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
