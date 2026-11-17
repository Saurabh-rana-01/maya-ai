import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const EmailList = ({
  emails,
  selectedEmail,
  onSelectEmail,
  onToggleImportant,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange
}) => {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = ['All', 'Approval', 'Scheduling', 'Financial', 'Partnership', 'Legal'];

  const filteredEmails = emails.filter(email => {
    if (categoryFilter !== 'All' && email.category !== categoryFilter) return false;
    return true;
  });

  const getClassificationBadge = (classification, confidence, isOverridden) => {
    switch (classification) {
      case 'Client to Reply':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Client to Reply</span>
            {confidence && <span className="opacity-75">· {confidence}%</span>}
            {isOverridden && <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded">MANUAL</span>}
          </span>
        );
      case 'Assistant to Reply':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600"></span>
            <span>Assistant to Reply</span>
            {confidence && <span className="opacity-75">· {confidence}%</span>}
            {isOverridden && <span className="text-[9px] bg-brand-200 text-brand-900 px-1 rounded">MANUAL</span>}
          </span>
        );
      case 'No Reply Needed':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            <span>No Reply Needed</span>
            {confidence && <span className="opacity-75">· {confidence}%</span>}
          </span>
        );
    }
  };

  return (
    <div className="w-96 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden">
      {/* Search & Header */}
      <div className="p-3.5 border-b border-slate-100 space-y-2.5">
        <div className="relative">
          <Icon name="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subjects, senders, or AI summaries..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Email Threads List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Icon name="mail" className="w-8 h-8 mx-auto mb-2 opacity-50" />
            No emails matching this filter or search query.
          </div>
        ) : (
          filteredEmails.map(email => {
            const isSelected = selectedEmail?.threadId === email.threadId;
            return (
              <div
                key={email.threadId}
                onClick={() => onSelectEmail(email)}
                className={`p-3.5 cursor-pointer transition-all relative ${
                  isSelected
                    ? 'bg-brand-50/70 border-l-4 border-l-brand-600'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Top Row: Sender, Unread Dot, Star */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 truncate">
                    {!email.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" title="Unread"></span>
                    )}
                    <span className={`text-xs truncate ${!email.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {email.sender.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-slate-400">
                      {new Date(email.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleImportant(email.threadId);
                      }}
                      className="text-slate-300 hover:text-amber-400 p-0.5"
                    >
                      <Icon name={email.isImportant ? "star" : "star-outline"} className={`w-3.5 h-3.5 ${email.isImportant ? 'text-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Subject */}
                <h4 className={`text-xs mb-1 line-clamp-1 ${!email.isRead ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>
                  {email.subject}
                </h4>

                {/* Snippet / AI Summary */}
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                  {email.summary || (email.messages && email.messages[0]?.body)}
                </p>

                {/* Badges: Classification, Meeting */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    {getClassificationBadge(email.classification, email.confidence, email.isOverridden)}
                  </div>
                  {email.detectedMeeting && email.detectedMeeting.hasMeeting && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Icon name="calendar" className="w-3 h-3" />
                      <span>Meeting</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
