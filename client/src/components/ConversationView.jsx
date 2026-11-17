import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const ConversationView = ({
  email,
  onOverrideClassification,
  onUpdateStatus,
  onGenerateDraft,
  onSendReply,
  onToggleActionItem
}) => {
  const [selectedTone, setSelectedTone] = useState('scheduling');
  const [replyText, setReplyText] = useState(email?.draftReply?.text || '');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [overrideDropdownOpen, setOverrideDropdownOpen] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Keep replyText in sync if email changes
  React.useEffect(() => {
    setReplyText(email?.draftReply?.text || '');
  }, [email?.threadId, email?.draftReply?.text]);

  if (!email) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50/50 text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-slate-300 mb-4">
          <Icon name="mail" className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">No conversation selected</h3>
        <p className="text-xs text-slate-400 max-w-sm text-center">
          Choose an email thread from the inbox to review messages, AI insights, and approve draft responses.
        </p>
      </div>
    );
  }

  const handleGenerateDraft = async (tone) => {
    setSelectedTone(tone);
    setIsGeneratingDraft(true);
    try {
      const result = await onGenerateDraft(email.threadId, tone, customInstructions);
      if (result && result.text) {
        setReplyText(result.text);
      }
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim()) return;
    setIsSending(true);
    try {
      await onSendReply(email.threadId, replyText);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Top Action Header */}
      <div className="p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-base font-bold text-slate-900 truncate">
              {email.subject}
            </h2>
            {email.isImportant && (
              <span className="shrink-0 text-amber-500">
                <Icon name="star" className="w-4 h-4" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span>From: <strong className="text-slate-700">{email.sender.name}</strong> &lt;{email.sender.email}&gt;</span>
            <span>•</span>
            <span>Client: <span className="font-medium text-slate-700">{email.clientName}</span></span>
          </div>
        </div>

        {/* Right Tools: Manual Classification Override & Quick Status */}
        <div className="flex items-center gap-2">
          {/* Manual AI Override Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOverrideDropdownOpen(!overrideDropdownOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                email.classification === 'Client to Reply'
                  ? 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'
                  : email.classification === 'Assistant to Reply'
                    ? 'bg-brand-50 text-brand-900 border-brand-200 hover:bg-brand-100'
                    : 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <span>{email.classification}</span>
              <Icon name="chevron-down" className="w-3.5 h-3.5 opacity-60" />
            </button>

            {overrideDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Manual Re-route / Override
                </div>
                {['Assistant to Reply', 'Client to Reply', 'No Reply Needed'].map(option => (
                  <button
                    key={option}
                    onClick={() => {
                      onOverrideClassification(email.threadId, option);
                      setOverrideDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                      email.classification === option ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{option}</span>
                    {email.classification === option && <Icon name="check" className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onUpdateStatus(email.threadId, { isCompleted: !email.isCompleted })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              email.isCompleted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {email.isCompleted ? 'Resolved' : 'Mark Done'}
          </button>
        </div>
      </div>

      {/* Main Content Area: AI Insights + Messages + Composer */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* AI Intelligence & Classification Card */}
        <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50/50 via-white to-purple-50/20 p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand-600 text-white shadow-sm">
                <Icon name="sparkles" className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Maya AI Executive Intelligence
                </h4>
                <p className="text-[11px] text-slate-500">
                  Confidence Score: <span className="font-bold text-brand-700">{email.confidence}%</span>
                  {email.isOverridden && <span className="ml-2 text-amber-700 font-semibold">(Manual Assistant Override)</span>}
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              email.classification === 'Client to Reply'
                ? 'bg-amber-100 text-amber-800'
                : email.classification === 'Assistant to Reply'
                  ? 'bg-brand-100 text-brand-800'
                  : 'bg-slate-100 text-slate-700'
            }`}>
              {email.classification}
            </span>
          </div>

          {/* AI Routing Rationale */}
          <div className="bg-white/80 rounded-lg p-3 border border-slate-100 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-slate-900 block">Routing Rationale:</span>
            <p className="italic text-slate-600 leading-relaxed">
              "{email.reasoning}"
            </p>
          </div>

          {/* AI Executive Summary */}
          {email.summary && (
            <div className="text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">Executive Summary:</span>
              <p className="leading-relaxed bg-white/70 p-3 rounded-lg border border-slate-100">
                {email.summary}
              </p>
            </div>
          )}

          {/* Key Takeaways & Action Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {email.keyPoints && email.keyPoints.length > 0 && (
              <div className="bg-white/80 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-xs text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <Icon name="check-circle" className="w-3.5 h-3.5 text-brand-600" />
                  Key Takeaways
                </span>
                <ul className="text-xs text-slate-600 space-y-1">
                  {email.keyPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-brand-500 font-bold">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {email.actionItems && email.actionItems.length > 0 && (
              <div className="bg-white/80 p-3 rounded-lg border border-slate-100">
                <span className="font-bold text-xs text-slate-900 block mb-1.5 flex items-center gap-1.5">
                  <Icon name="alert-circle" className="w-3.5 h-3.5 text-rose-500" />
                  Action Checklist
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5">
                  {email.actionItems.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleActionItem && onToggleActionItem(email.threadId, idx)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className={`flex-1 ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.task}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {item.assignee}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Calendar Widget if meeting is detected */}
          {email.detectedMeeting && email.detectedMeeting.hasMeeting && (
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-600 text-white">
                  <Icon name="calendar" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-950">
                    {email.detectedMeeting.title || 'Detected Meeting Proposal'}
                  </div>
                  <div className="text-[11px] text-emerald-700">
                    {email.detectedMeeting.date} at {email.detectedMeeting.time} ({email.detectedMeeting.location})
                  </div>
                </div>
              </div>
              <button
                onClick={() => alert(`Added "${email.detectedMeeting.title}" on ${email.detectedMeeting.date} to Sarah's calendar!`)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
              >
                Accept to Calendar
              </button>
            </div>
          )}
        </div>

        {/* Message Thread History */}
        <div className="space-y-4 pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Conversation History ({email.messages?.length || 1} messages)
          </div>

          {(email.messages || []).map((msg, idx) => {
            const isMe = msg.isFromClient || msg.isFromAssistant;
            return (
              <div
                key={msg.id || idx}
                className={`p-4 rounded-xl border text-xs leading-relaxed transition-all ${
                  isMe
                    ? 'bg-brand-50/40 border-brand-200/80 ml-8'
                    : 'bg-white border-slate-200 mr-8 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{msg.sender}</span>
                    {msg.senderEmail && (
                      <span className="text-[11px] text-slate-400">&lt;{msg.senderEmail}&gt;</span>
                    )}
                    {msg.isFromAssistant && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-100 text-brand-800">
                        ASSISTANT
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
                <div className="whitespace-pre-line text-slate-700">
                  {msg.body}
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Draft Reply Composer */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="sparkles" className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-900">
                AI Draft Reply Assistant
              </span>
            </div>

            {/* Tone selector pills */}
            <div className="flex items-center gap-1">
              {[
                { id: 'scheduling', label: 'Scheduling' },
                { id: 'direct', label: 'Direct' },
                { id: 'warm', label: 'Warm' },
                { id: 'decline', label: 'Decline' },
                { id: 'professional', label: 'Professional' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => handleGenerateDraft(t.id)}
                  disabled={isGeneratingDraft}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedTone === t.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Optional: give AI specific reply notes (e.g. 'Offer 3pm Thursday instead')..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <button
              onClick={() => handleGenerateDraft(selectedTone)}
              disabled={isGeneratingDraft}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
            >
              {isGeneratingDraft ? 'Generating...' : 'Re-Draft'}
            </button>
          </div>

          {/* Editable Textarea */}
          <textarea
            rows="5"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type your response or select an AI draft tone above..."
            className="w-full p-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-sans leading-relaxed bg-white"
          ></textarea>

          {/* Review & Send Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              Draft ready for review. Assistant approval required before dispatch.
            </span>
            <button
              onClick={handleSend}
              disabled={isSending || !replyText.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 disabled:opacity-50 transition-colors"
            >
              <Icon name="send" className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Approve & Send Reply'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
