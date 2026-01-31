
import React from 'react';

interface PlaceholderViewProps {
  title: string;
  message: string;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-12">
      <div className="relative mb-10">
        <div className="w-24 h-24 bg-surface border border-border rounded-3xl flex items-center justify-center rotate-45 transform">
           <div className="-rotate-45">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M12 16.5V9.5" /><path d="M12 7.5h.01" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
           </div>
        </div>
        <div className="absolute -inset-2 bg-bull/5 blur-2xl rounded-full -z-10"></div>
      </div>
      <h1 className="text-xl font-bold text-white mb-2 tracking-tight uppercase">{title}</h1>
      <p className="text-gray-500 text-sm max-w-xs leading-relaxed font-medium">{message}</p>
      
      <div className="mt-8 flex gap-1">
         {[...Array(3)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-border"></div>
         ))}
      </div>
    </div>
  );
};

export default PlaceholderView;
