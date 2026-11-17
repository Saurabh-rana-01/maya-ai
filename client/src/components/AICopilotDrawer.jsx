import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const AICopilotDrawer = ({
  isOpen,
  onClose,
  onAskCopilot,
  onSelectThread
}) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Hello! I am Maya AI, your executive inbox copilot. How can I help you manage your client's communications today?",
      suggestedActions: [
        { label: 'Emails needing client attention', query: 'Show me emails that need my attention' },
        { label: 'What am I waiting on?', query: 'What am I waiting for a response on?' },
        { label: 'Summarize priority inbox', query: 'Summarize the most important email threads' }
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (customQuery) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    const userMsg = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsLoading(true);

    try {
      const response = await onAskCopilot(q);
      const aiMsg = {
        sender: 'assistant',
        text: response.answer || response.text || 'I analyzed the inbox and updated your workspace.',
        suggestedActions: response.suggestedActions || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: 'I encountered an issue processing that query. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Icon name="sparkles" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Ask Maya AI Copilot</h3>
              <p className="text-[11px] text-brand-100">Natural language inbox intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs leading-relaxed">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60'
                }`}
              >
                <div className="whitespace-pre-line">
                  {msg.text}
                </div>
              </div>

              {/* Suggested action pills if available */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                  {msg.suggestedActions.map((action, aIdx) => (
                    <button
                      key={aIdx}
                      onClick={() => {
                        if (action.threadId) {
                          onSelectThread(action.threadId);
                          onClose();
                        } else if (action.query) {
                          handleSend(action.query);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand-400 text-brand-700 hover:bg-brand-50 text-[11px] font-medium transition-colors shadow-2xs"
                    >
                      {action.label} &rarr;
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs italic">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping"></span>
              Maya AI is inspecting email threads...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about client emails..."
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-50 transition-colors shadow-sm"
            >
              <Icon name="send" className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
