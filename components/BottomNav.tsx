
import React from 'react';
import { Tab } from '../types';
import { AnalyzeIcon, DecisionIcon, ExplainIcon, LearnIcon, JournalIcon } from './icons/Icons';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  tab: Tab;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  Icon: React.ElementType;
  label: string;
}> = ({ tab, activeTab, setActiveTab, Icon, label }) => {
  const isActive = activeTab === tab;
  return (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative flex flex-col items-center justify-center w-full transition-all duration-300 ${
        isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      {isActive && (
        <span className="absolute -top-3 w-8 h-[2px] bg-bull shadow-[0_0_12px_rgba(0,245,155,0.6)]"></span>
      )}
      <Icon className={`h-5 w-5 mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
      <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-[calc(32rem-2rem)] mx-auto h-16 glass border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex justify-around items-center h-full px-2">
        <NavItem tab={Tab.ANALYZE} activeTab={activeTab} setActiveTab={setActiveTab} Icon={AnalyzeIcon} label="Scan" />
        <NavItem tab={Tab.DECISION} activeTab={activeTab} setActiveTab={setActiveTab} Icon={DecisionIcon} label="Exec" />
        <NavItem tab={Tab.EXPLAIN} activeTab={activeTab} setActiveTab={setActiveTab} Icon={ExplainIcon} label="Logic" />
        <NavItem tab={Tab.LEARN} activeTab={activeTab} setActiveTab={setActiveTab} Icon={LearnIcon} label="Edge" />
        <NavItem tab={Tab.JOURNAL} activeTab={activeTab} setActiveTab={setActiveTab} Icon={JournalIcon} label="Logs" />
      </div>
    </div>
  );
};

export default BottomNav;
