import React from 'react';
import { Icon } from './Icons.jsx';

export const Sidebar = ({
  activeTab,
  onTabChange,
  stats,
  activeAccount,
  onOpenOnboarding
}) => {
  const navItems = [
    { id: 'all', label: 'All Inboxes', icon: 'mail', count: stats?.total || 0, color: 'text-slate-600' },
    { id: 'client_to_reply', label: 'Client to Reply', icon: 'user', count: stats?.clientToReply || 0, badgeColor: 'bg-amber-100 text-amber-800 font-bold', color: 'text-amber-600' },
    { id: 'assistant_to_reply', label: 'Assistant to Reply', icon: 'user-check', count: stats?.assistantToReply || 0, badgeColor: 'bg-brand-100 text-brand-800 font-bold', color: 'text-brand-600' },
    { id: 'action_required', label: 'Action Required', icon: 'alert-circle', count: stats?.actionRequired || 0, badgeColor: 'bg-rose-100 text-rose-800', color: 'text-rose-600' },
    { id: 'waiting', label: 'Waiting for Response', icon: 'clock', count: stats?.waitingForResponse || 0, color: 'text-cyan-600' },
    { id: 'meetings', label: 'Meetings Detected', icon: 'calendar', count: stats?.meetingsCount || 0, badgeColor: 'bg-emerald-100 text-emerald-800 font-semibold', color: 'text-emerald-600' },
    { id: 'archived', label: 'Archived', icon: 'archive', count: 0, color: 'text-slate-400' }
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between p-4 bg-white border-r border-slate-200">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
          Smart Inboxes
        </div>
        <nav className="space-y-1">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-900 font-semibold shadow-sm shadow-brand-500/5'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon name={item.icon} className={`w-4 h-4 ${isActive ? 'text-brand-600' : item.color}`} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Client Executive Card */}
        <div className="mt-8 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Managing For
          </div>
          <div className="flex items-center gap-2.5">
            <img
              src={activeAccount?.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"}
              alt="Client"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {activeAccount?.clientName || 'Sarah Jenkins'}
              </div>
              <div className="text-[11px] text-slate-500 truncate">
                {activeAccount?.clientTitle || 'Managing Partner'}
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live Sync
            </span>
            <button
              onClick={onOpenOnboarding}
              className="text-brand-600 hover:text-brand-800 font-semibold hover:underline"
            >
              + Manage
            </button>
          </div>
        </div>
      </div>

      {/* Assistant Info Pill */}
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-slate-500">
          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center font-bold text-[10px] text-slate-700">
            EA
          </div>
          <div className="truncate">
            <div className="font-medium text-slate-800 truncate">Alex Chen (Assistant)</div>
            <div className="text-[10px] text-slate-400">Full Delegate Access</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
