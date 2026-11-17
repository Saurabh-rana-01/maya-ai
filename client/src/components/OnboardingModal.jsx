import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const OnboardingModal = ({
  isOpen,
  onClose,
  accounts,
  onConnectAccount,
  onSyncAccount
}) => {
  const [provider, setProvider] = useState('google');
  const [emailInput, setEmailInput] = useState('');
  const [clientNameInput, setClientNameInput] = useState('Sarah Jenkins');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStep, setSyncStep] = useState(0);

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsConnecting(true);
    setSyncStep(1); // Authorizing OAuth token

    setTimeout(async () => {
      setSyncStep(2); // Fetching inbox folders & threads
      setTimeout(async () => {
        setSyncStep(3); // Running Maya AI baseline routing
        await onConnectAccount({
          provider,
          email: emailInput,
          clientName: clientNameInput
        });
        setIsConnecting(false);
        setSyncStep(0);
        setEmailInput('');
        onClose();
      }, 700);
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <Icon name="mail" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Multi-Account Email Onboarding
              </h3>
              <p className="text-xs text-slate-500">
                Connect client Google Workspace or Microsoft 365 accounts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Currently Connected Accounts */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Connected Client Inboxes ({accounts.length})
          </label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {accounts.map(acc => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <img src={acc.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                  <div className="truncate">
                    <div className="font-semibold text-slate-900 truncate">{acc.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{acc.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Sync Active
                  </span>
                  <button
                    onClick={() => onSyncAccount(acc.id)}
                    className="p-1 text-slate-400 hover:text-brand-600 transition-colors"
                    title="Force refresh sync"
                  >
                    <Icon name="refresh" className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Connect New Account Form */}
        <form onSubmit={handleConnect} className="space-y-3 pt-2 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700 block">
            Add New Client Inbox:
          </label>

          {/* Provider toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setProvider('google')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                provider === 'google'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Google Workspace</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('microsoft')}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                provider === 'microsoft'
                  ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Microsoft 365</span>
            </button>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Client Email Address
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. sarah.board@acme.com"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-600 block mb-1">
              Client Name / Title
            </label>
            <input
              type="text"
              value={clientNameInput}
              onChange={(e) => setClientNameInput(e.target.value)}
              placeholder="Sarah Jenkins (Executive)"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          {/* Sync Progress animation */}
          {isConnecting && (
            <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between font-semibold">
                <span>
                  {syncStep === 1 && 'Authorizing OAuth token...'}
                  {syncStep === 2 && 'Importing client message threads...'}
                  {syncStep === 3 && 'Running Maya AI classification engine...'}
                </span>
                <span>{syncStep * 33}%</span>
              </div>
              <div className="w-full bg-brand-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full transition-all duration-500"
                  style={{ width: `${syncStep * 33}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isConnecting || !emailInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 disabled:opacity-50 transition-colors"
            >
              {isConnecting ? 'Connecting...' : `Authorize & Sync ${provider === 'google' ? 'Google' : 'Microsoft'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
