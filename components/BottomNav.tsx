
import React from 'react';
import { Tab } from '../types';
import { AnalyzeIcon, DecisionIcon, SettingsIcon, LearnIcon, JournalIcon } from './icons/Icons';

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
      className={`relative flex flex-col items-center justify-center w-full h-full transition-colors duration-300 p-2 rounded-lg ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
      aria-label={label}
    >
      {/* Glow effect for active tab */}
      {isActive && (
        <div className="absolute inset-0 bg-bull/10 rounded-lg blur-md"></div>
      )}
      <Icon className={`relative h-6 w-6 mb-1.5 transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} />
      <span className="relative text-[10px] font-black tracking-[0.2em] uppercase leading-none">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-[calc(32rem-2rem)] mx-auto h-20 glass border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="flex justify-around items-center h-full px-1">
        <NavItem tab={Tab.ANALYZE} activeTab={activeTab} setActiveTab={setActiveTab} Icon={AnalyzeIcon} label="Scan" />
        <NavItem tab={Tab.DECISION} activeTab={activeTab} setActiveTab={setActiveTab} Icon={DecisionIcon} label="Exec" />
        <NavItem tab={Tab.SETTINGS} activeTab={activeTab} setActiveTab={setActiveTab} Icon={SettingsIcon} label="Risk" />
        <NavItem tab={Tab.LEARN} activeTab={activeTab} setActiveTab={setActiveTab} Icon={LearnIcon} label="Edge" />
        <NavItem tab={Tab.JOURNAL} activeTab={activeTab} setActiveTab={setActiveTab} Icon={JournalIcon} label="Logs" />
      </div>
    </div>
  );
};

export default BottomNav;
