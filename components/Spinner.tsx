
import React from 'react';

const Spinner: React.FC = () => {
  const messages = [
    "ISOLATING CHART GEOMETRY",
    "POLLING LIQUIDITY LEVELS",
    "RUNNING MONTE CARLO RISK MODELS",
    "PARSING LIM'S TECHNICAL HANDBOOK",
    "EXTRACTING CANDLESTICK MOMENTUM",
    "MAPPING STRUCTURAL RETESTS",
    "DETERMINING OPTIMAL BIAS"
  ];
  const [message, setMessage] = React.useState(messages[0]);

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setMessage(prevMessage => {
        const currentIndex = messages.indexOf(prevMessage);
        const nextIndex = (currentIndex + 1) % messages.length;
        return messages[nextIndex];
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-midnight">
      <div className="relative flex items-center justify-center w-32 h-32">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-2 border-white/5 rounded-full"></div>
        {/* Spinning Primary Ring */}
        <div className="absolute inset-0 border-t-2 border-bull rounded-full animate-[spin_1.5s_linear_infinite] shadow-[0_0_15px_rgba(0,245,155,0.4)]"></div>
        {/* Counter-Spinning Secondary Ring */}
        <div className="absolute inset-4 border-b-2 border-white/20 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
        {/* Inner Core */}
        <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]"></div>
      </div>
      
      <div className="mt-12 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
           <span className="w-1.5 h-1.5 bg-bull rounded-full animate-ping"></span>
           <span className="text-[10px] font-mono text-bull tracking-[0.2em] uppercase font-bold">Terminal Active</span>
        </div>
        <p className="text-gray-400 text-xs font-mono transition-opacity duration-300 tracking-tight text-center max-w-xs h-8">
          {message}
        </p>
      </div>
    </div>
  );
};

export default Spinner;
