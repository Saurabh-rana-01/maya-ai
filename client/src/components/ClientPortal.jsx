import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const ClientPortal = ({
  emails,
  activeAccount,
  onClientAction,
  onSwitchToAssistantView
}) => {
  const [delegationModalEmail, setDelegationModalEmail] = useState(null);
  const [delegationNotes, setDelegationNotes] = useState('');
  const [presetInstructions] = useState([
    'Please draft a polite decline response.',
    'Please schedule a 30-min Zoom next Wednesday afternoon.',
    'Please ask legal to review Section 4 redlines.',
    'Please confirm receipt and say I will follow up Friday.'
  ]);

  // Client view displays EXCLUSIVELY "Client to Reply" uncompleted emails
  const clientEmails = emails.filter(
    e => e.classification === 'Client to Reply' && !e.isCompleted && !e.isArchived
  );

  const handleHandled = (email) => {
    // Confetti effect if canvas-confetti is loaded in browser
    if (window.confetti) {
      window.confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
    onClientAction(email.threadId, 'handled', 'Resolved personally by client.');
  };

  const handleOpenDelegation = (email) => {
    setDelegationModalEmail(email);
    setDelegationNotes('');
  };

  const handleConfirmDelegation = () => {
    if (!delegationModalEmail) return;
    onClientAction(
      delegationModalEmail.threadId,
      'delegated_to_assistant',
      delegationNotes || 'Assistant to handle on client’s behalf.'
    );
    setDelegationModalEmail(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-amber-50/15 to-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Executive Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                Good afternoon, {activeAccount?.clientName || 'Sarah'}
              </h1>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Here is your filtered executive queue. Maya AI filtered out newsletters, receipts, and scheduling inquiries for your assistant to handle. Only items requiring your personal decision appear below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 shadow-sm flex items-center gap-2">
              <Icon name="user" className="w-4 h-4 text-amber-600" />
              <span>{clientEmails.length} Items Require Input</span>
            </div>
            <button
              onClick={onSwitchToAssistantView}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline underline-offset-4"
            >
              Assistant Workspace &rarr;
            </button>
          </div>
        </div>

        {/* Zero Inbox Celebration State */}
        {clientEmails.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
              <Icon name="check" className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Executive Items Handled</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                You're completely caught up. All other routine emails, scheduling requests, and confirmations are actively managed by Alex Chen.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onSwitchToAssistantView}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                View Full Assistant Workspace
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {clientEmails.map(email => (
              <div
                key={email.threadId}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-300 p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Header: Sender & High Priority Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={email.sender.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{email.sender.name}</h3>
                      <p className="text-[11px] text-slate-500">{email.sender.email}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Executive Input Required</span>
                  </span>
                </div>

                {/* Subject */}
                <h2 className="text-base font-bold text-slate-900">
                  {email.subject}
                </h2>

                {/* Explicit Explanation of WHY Input is Needed */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                    <Icon name="sparkles" className="w-3.5 h-3.5 text-amber-600" />
                    <span>Why Maya AI Flagged This for You:</span>
                  </div>
                  <p className="text-amber-950 font-medium leading-relaxed">
                    {email.reasoning}
                  </p>
                </div>

                {/* AI Executive Summary */}
                <div className="text-xs text-slate-700 bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900">Summary:</span>
                  <p className="text-slate-600 leading-relaxed">
                    {email.summary || (email.messages && email.messages[0]?.body)}
                  </p>
                </div>

                {/* Key Takeaways */}
                {email.keyPoints && email.keyPoints.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wide">Key Points:</span>
                    <ul className="space-y-1">
                      {email.keyPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-2 text-slate-600">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons as requested in Notion task */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* 1-Click "Mark Handled" */}
                    <button
                      onClick={() => handleHandled(email)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      title="Clear from both client and assistant views"
                    >
                      <Icon name="check" className="w-4 h-4" />
                      <span>Mark Handled</span>
                    </button>

                    {/* "I'll Handle This" */}
                    <button
                      onClick={() => handleHandled(email)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                      title="Take full ownership and remove from assistant queue"
                    >
                      I'll Handle This
                    </button>
                  </div>

                  {/* "Hand Over to Assistant" */}
                  <button
                    onClick={() => handleOpenDelegation(email)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Icon name="user-check" className="w-4 h-4 text-brand-600" />
                    <span>Hand Over to Assistant...</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hand Over to Assistant Modal */}
      {delegationModalEmail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
                  <Icon name="user-check" className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hand Over to Assistant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Delegating "{delegationModalEmail.subject.slice(0, 36)}..." to Alex Chen
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDelegationModalEmail(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                Quick Instructions for Alex:
              </label>
              <div className="space-y-1.5 mb-3">
                {presetInstructions.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDelegationNotes(preset)}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors truncate"
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows="3"
                value={delegationNotes}
                onChange={(e) => setDelegationNotes(e.target.value)}
                placeholder="Or type custom instructions for your assistant..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDelegationModalEmail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelegation}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition-colors"
              >
                Delegate to Assistant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
