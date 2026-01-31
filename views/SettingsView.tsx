
import React from 'react';

interface Settings {
  accountBalance: number;
  riskPerTrade: number;
}

interface SettingsViewProps {
  settings: Settings;
  onSettingsChange: (newSettings: Settings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSettingsChange }) => {
  
  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, accountBalance: parseFloat(e.target.value) || 0 });
  };

  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, riskPerTrade: parseFloat(e.target.value) || 0 });
  };

  return (
    <div className="p-6 space-y-8 font-light">
      <h2 className="text-xl font-bold text-white uppercase tracking-widest border-b border-border pb-2">Risk Parameters</h2>
      
      <div className="space-y-6">
        {/* Account Balance */}
        <div className="space-y-2">
          <label htmlFor="accountBalance" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Account Balance (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">$</span>
            <input 
              type="number"
              id="accountBalance"
              value={settings.accountBalance}
              onChange={handleBalanceChange}
              className="w-full bg-surface border border-border rounded-xl h-14 pl-8 pr-4 text-white font-mono text-lg tracking-tighter focus:ring-2 focus:ring-bull/50 focus:border-bull outline-none"
              placeholder="10000"
            />
          </div>
        </div>

        {/* Risk Per Trade */}
        <div className="space-y-2">
          <label htmlFor="riskPerTrade" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Risk Per Trade (%)</label>
          <div className="relative">
             <input 
              type="number"
              id="riskPerTrade"
              value={settings.riskPerTrade}
              onChange={handleRiskChange}
              className="w-full bg-surface border border-border rounded-xl h-14 pl-4 pr-8 text-white font-mono text-lg tracking-tighter focus:ring-2 focus:ring-bull/50 focus:border-bull outline-none"
              placeholder="1"
              step="0.1"
              min="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono">%</span>
          </div>
        </div>
      </div>
      
      <div className="pt-6 border-t border-border/50 text-center">
        <p className="text-gray-600 text-xs italic tracking-tight">
          These parameters are saved locally and used to calculate monetary values in the execution pipeline.
        </p>
      </div>
    </div>
  );
};

export default SettingsView;
