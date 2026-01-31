
import React, { useEffect, useState } from 'react';

const Spinner: React.FC = () => {
  const messages = [
    "INITIATING DIAGNOSTIC CORE",
    "DECODING PIXEL DATA",
    "ISOLATING CHART GEOMETRY",
    "MAPPING SUPPORT & RESISTANCE ZONES",
    "EXTRACTING CANDLESTICK MOMENTUM",
    "POLLING INSTITUTIONAL LIQUIDITY",
    "CROSS-REFERENCING LIM'S HANDBOOK",
    "CALCULATING VOLATILITY INDEX",
    "RUNNING CONFLUENCE CHECKS",
    "GENERATING SCENARIO PROBABILITIES",
    "COMPILING FINAL REPORT"
  ];
  const [message, setMessage] = useState(messages[0]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 1500); // Faster message cycling

    // Fake progress bar animation
    const progressTimeout = setTimeout(() => {
      setProgress(90); // Animate to 90% and hold
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(progressTimeout);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-midnight">
      <div className="relative flex items-center justify-center w-28 h-28">
        <div className="absolute inset-0 border border-white/5 rounded-full"></div>
        <div className="absolute inset-0 border-t border-bull rounded-full animate-[spin_1.5s_linear_infinite] shadow-[0_0_20px_rgba(0,245,155,0.5)]"></div>
        <div className="absolute inset-4 border-b border-white/10 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></div>
      </div>
      
      <div className="mt-12 flex flex-col items-center w-full max-w-xs px-4">
        <div className="flex items-center gap-2 mb-4">
           <span className="w-1.5 h-1.5 bg-bull rounded-full animate-ping"></span>
           <span className="text-[9px] font-mono text-bull tracking-[0.3em] uppercase font-bold">Engine Running</span>
        </div>
        <p className="text-gray-500 text-[10px] font-mono transition-opacity duration-300 tracking-tight text-center h-8 font-light">
          {message}
        </p>

        {/* Fake Progress Bar */}
        <div className="w-full bg-border/20 rounded-full h-1 mt-4 overflow-hidden">
          <div 
            className="bg-bull h-1 rounded-full transition-all duration-[8000ms] ease-linear" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Spinner;
