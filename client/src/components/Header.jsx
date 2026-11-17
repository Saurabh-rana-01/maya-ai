import React from 'react';
import { Icon } from './Icons.jsx';

export const Header = ({
  accounts,
  activeAccount,
  onSelectAccount,
  activeView,
  onViewChange,
  clientToReplyCount,
  onOpenSimulator,
  onOpenCopilot,
  onOpenOnboarding,
  onResetDemo
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Client Account Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onViewChange('assistant')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Icon name="sparkles" className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">Maya AI</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  Executive Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">AI Email Routing for Assistants & Executives</p>
            </div>
          </div>

          {/* Account Selector Pill */}
          <div className="relative group hidden md:block">
            <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-colors text-left">
              <img
                src={activeAccount?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
                alt="Client avatar"
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="leading-tight">
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>{activeAccount?.clientName || 'Sarah Jenkins'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
                <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                  {activeAccount?.email || 'sarah.jenkins@horizon-ventures.com'}
                </div>
              </div>
              <Icon name="chevron-down" className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 ml-1" />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1.5">
                Connected Inboxes ({accounts.length})
              </div>
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                    activeAccount?.id === acc.id ? 'bg-brand-50 text-brand-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <img src={acc.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div className="flex-1 truncate">
                    <div className="font-semibold text-slate-900 truncate">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                  </div>
                  {activeAccount?.id === acc.id && (
                    <Icon name="check" className="w-4 h-4 text-brand-600 shrink-0" />
                  )}
                </button>
              ))}

              <div className="border-t border-slate-100 my-1 pt-1">
                <button
                  onClick={onOpenOnboarding}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <Icon name="plus" className="w-4 h-4" />
                  <span>Connect Google / Microsoft 365</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Dual View Mode Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner">
          <button
            onClick={() => onViewChange('assistant')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeView === 'assistant'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Icon name="user-check" className="w-3.5 h-3.5 text-brand-600" />
            <span>Assistant Workspace</span>
          </button>

          <button
            onClick={() => onViewChange('client')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
              activeView === 'client'
                ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Icon name="user" className="w-3.5 h-3.5" />
            <span>Client Zen View</span>
            {clientToReplyCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                activeView === 'client' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {clientToReplyCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Tools: Simulator, Copilot, Reset */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Inbound Email Simulator */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 transition-colors shadow-sm"
            title="Simulate incoming emails to test AI classification in real time"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <Icon name="zap" className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Simulate Inbound</span>
          </button>

          {/* Ask Maya AI Copilot */}
          <button
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-colors"
          >
            <Icon name="sparkles" className="w-3.5 h-3.5 text-brand-200" />
            <span>Ask Maya AI</span>
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={onResetDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Reset demo data to initial state"
          >
            <Icon name="refresh" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
