
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeChart } from './services/geminiService';
import { AnalysisResult, Tab, TradeLog, TradeReview } from './types';
import BottomNav from './components/BottomNav';
import AnalyzeView from './views/AnalyzeView';
import DecisionView from './views/DecisionView';
import PlaceholderView from './views/PlaceholderView';
import Spinner from './components/Spinner';
import SettingsView from './views/SettingsView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ANALYZE);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<TradeLog[]>(() => {
    const saved = localStorage.getItem('vancelle_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('vancelle_settings');
    return saved ? JSON.parse(saved) : { accountBalance: 10000, riskPerTrade: 1 };
  });

  useEffect(() => {
    localStorage.setItem('vancelle_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('vancelle_settings', JSON.stringify(settings));
  }, [settings]);

  const handleAnalysis = useCallback(async (data: { image: string; pair: string; timeframe: string; notes: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeChart(data, logs);
      setAnalysisResult(result);
      if (result.status === 'COMPLETE') {
        const newLog: TradeLog = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          image: data.image,
          result
        };
        setLogs(prev => [newLog, ...prev]);
      }
      setActiveTab(Tab.DECISION);
    } catch (err) {
      console.error("Analysis failed:", err);
      let message = 'An unknown error occurred during analysis.';
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === 'string') {
        message = err;
      } else if (err && typeof (err as any).message === 'string') {
        message = (err as any).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [logs]);

  const handleReviewSubmit = (review: TradeReview) => {
    setLogs(prev => prev.map(log => 
      log.image === chartImage ? { ...log, review } : log
    ));
    resetApp();
  };

  const resetApp = () => {
    setChartImage(null);
    setAnalysisResult(null);
    setError(null);
    setActiveTab(Tab.ANALYZE);
  }

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    
    switch (activeTab) {
      case Tab.ANALYZE:
        return <AnalyzeView onImageUpload={setChartImage} onAnalyze={handleAnalysis} chartImage={chartImage} error={error} />;
      case Tab.DECISION:
        if (analysisResult && chartImage) {
          return <DecisionView result={analysisResult} chartImage={chartImage} onNewAnalysis={resetApp} onReviewSubmit={handleReviewSubmit} settings={settings} />;
        }
        return <PlaceholderView title="NO ACTIVE SESSION" message="Upload a chart to begin technical extraction." />;
      case Tab.SETTINGS:
        return <SettingsView settings={settings} onSettingsChange={setSettings} />;
      case Tab.LEARN:
        const total = logs.filter(l => l.review).length;
        const wins = logs.filter(l => l.review?.outcome === 'WIN').length;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        return (
          <div className="p-6 space-y-6 font-light">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface border border-bull/20 rounded-2xl flex flex-col items-center">
                <span className="text-3xl font-black text-bull leading-none mb-1">{winRate}%</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Edge Accuracy</span>
              </div>
              <div className="p-4 bg-surface border border-border rounded-2xl flex flex-col items-center">
                <span className="text-3xl font-black text-white leading-none mb-1">{total}</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Trades Logged</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Live Edge Data</h3>
              <p className="text-[11px] text-gray-400 tracking-tight leading-snug">The engine calibrates future Buy/Sell risk thresholds based on historical outcomes stored in your local vault.</p>
            </div>
          </div>
        );
      case Tab.JOURNAL:
        return (
          <div className="p-6 space-y-4 font-light">
            <h2 className="text-xl font-bold text-white uppercase tracking-widest">DIAGNOSTIC ARCHIVE</h2>
            {logs.length === 0 ? <p className="text-gray-500 text-[10px] uppercase italic tracking-widest">Vault empty.</p> : 
              logs.map(log => (
                <div key={log.id} onClick={() => { setChartImage(log.image); setAnalysisResult(log.result); setActiveTab(Tab.DECISION); }} className="flex gap-4 p-3 bg-surface border border-border rounded-xl cursor-pointer hover:border-gray-500 transition-colors group">
                  <img src={log.image} className="w-16 h-12 rounded object-cover border border-border grayscale group-hover:grayscale-0 transition-all" alt="log" />
                  <div className="flex flex-col justify-center leading-tight">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{log.result.pair || 'DIAGNOSTIC'}</span>
                    <span className={`text-[9px] font-bold uppercase ${log.result.tradeDirective === 'BUY' ? 'text-bull' : log.result.tradeDirective === 'SELL' ? 'text-bear' : 'text-yellow-400'}`}>
                      {log.result.tradeDirective} • {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        );
      default:
        return <AnalyzeView onImageUpload={setChartImage} onAnalyze={handleAnalysis} chartImage={chartImage} error={error} />;
    }
  };

  return (
    <div className="h-screen w-screen bg-midnight text-gray-100 flex flex-col font-sans antialiased overflow-hidden">
       <div className="w-full max-w-lg mx-auto h-full flex flex-col relative">
          <header className="px-6 py-4 flex items-center justify-between border-b border-border bg-midnight z-10 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-bull rounded-full shadow-[0_0_8px_#00f59b] animate-pulse"></div>
              <h1 className="text-[11px] font-black tracking-[0.3em] text-white uppercase leading-none">VANCELLE TRADES</h1>
            </div>
            <div className="text-[9px] font-mono text-gray-600 flex items-center gap-1.5 uppercase font-bold">
               <span className="text-bull/80 tracking-tighter">Diagnostic Engine active</span>
            </div>
          </header>
          <main className="flex-grow overflow-y-auto pb-32 scroll-smooth">
            {renderContent()}
          </main>
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
