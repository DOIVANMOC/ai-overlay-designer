'use client';

import React from 'react';
import { Layers, Sparkles, Sliders, History, Key, Waves, Droplets } from 'lucide-react';
import { ClientSafeConfig } from '@/lib/types';

interface NavbarProps {
  activeTab: 'studio' | 'memory' | 'history' | 'settings';
  setActiveTab: (tab: 'studio' | 'memory' | 'history' | 'settings') => void;
  config: ClientSafeConfig | null;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, config, historyCount }) => {
  const getProviderLabel = () => {
    if (!config) return 'Connecting...';
    switch (config.activeProvider) {
      case 'gemini':
        return config.hasGeminiKey ? 'Gemini Vision' : 'Gemini (No Key)';
      case 'openai':
        return config.hasOpenaiKey ? 'OpenAI GPT-4o' : 'OpenAI (No Key)';
      case 'replicate':
        return config.hasReplicateKey ? 'Replicate BiRefNet' : 'Replicate (No Key)';
      case 'custom':
        return 'Custom Endpoint';
      case 'local':
      default:
        return 'Local Neural Engine (Rembg)';
    }
  };

  const isConnected = () => {
    if (!config) return false;
    if (config.activeProvider === 'local') return true;
    if (config.activeProvider === 'gemini') return config.hasGeminiKey;
    if (config.activeProvider === 'openai') return config.hasOpenaiKey;
    if (config.activeProvider === 'replicate') return config.hasReplicateKey;
    if (config.activeProvider === 'custom') return config.hasCustomKey;
    return true;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-[#031124]/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,10,30,0.6)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo (Oceanic) */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 text-white shadow-[0_0_15px_rgba(0,180,216,0.5)] border border-cyan-300/30">
            <Waves className="h-5 w-5 text-cyan-100" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-300"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                AI OVERLAY DESIGNER
              </span>
              <span className="rounded-full bg-cyan-950/80 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-widest shadow-[0_0_8px_rgba(0,180,216,0.2)]">
                OCEAN PRO
              </span>
            </div>
            <p className="text-xs text-cyan-300/60 font-medium">Autonomous Frame Extraction & Style Engine</p>
          </div>
        </div>

        {/* Navigation Tabs (Oceanic Pills) */}
        <nav className="flex items-center gap-1 rounded-xl border border-cyan-500/20 bg-[#051a36]/80 p-1 shadow-inner">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'studio'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_14px_rgba(0,180,216,0.5)]'
                : 'text-cyan-200/70 hover:text-white hover:bg-cyan-900/40'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            Studio Workspace
          </button>

          <button
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'memory'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_14px_rgba(0,180,216,0.5)]'
                : 'text-cyan-200/70 hover:text-white hover:bg-cyan-900/40'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Style Memory
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_14px_rgba(0,180,216,0.5)]'
                : 'text-cyan-200/70 hover:text-white hover:bg-cyan-900/40'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            History
            {historyCount > 0 && (
              <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                activeTab === 'history' ? 'bg-cyan-950 text-cyan-200' : 'bg-cyan-900/70 text-cyan-300'
              }`}>
                {historyCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_14px_rgba(0,180,216,0.5)]'
                : 'text-cyan-200/70 hover:text-white hover:bg-cyan-900/40'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            API Settings
          </button>
        </nav>

        {/* Engine Status Pill */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('settings')}
            title="Click to configure AI providers"
            className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-[#061d3c]/80 px-3.5 py-1.5 text-xs text-cyan-100 hover:border-cyan-400 hover:bg-[#0a2b54] transition-all shadow-[0_0_12px_rgba(0,180,216,0.15)]"
          >
            <span className="flex h-2 w-2 relative">
              {isConnected() ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              )}
            </span>
            <span className="font-semibold">{getProviderLabel()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
