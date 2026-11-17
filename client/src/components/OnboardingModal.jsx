import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export const OnboardingModal = ({
  isOpen,
  onClose,
  accounts,
  onConnectAccount,
  onConnectImap,
  onSyncAccount
}) => {
  const [provider, setProvider] = useState('imap'); // default to IMAP as user requested
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [imapHostInput, setImapHostInput] = useState('');
  const [imapPortInput, setImapPortInput] = useState('993');
  const [smtpHostInput, setSmtpHostInput] = useState('');
  const [smtpPortInput, setSmtpPortInput] = useState('465');
  const [clientNameInput, setClientNameInput] = useState('Saurabh Kumar Rana');
  const [clientTitleInput, setClientTitleInput] = useState('Executive');
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Auto-detect common IMAP/SMTP settings based on email domain
  const handleEmailChange = (val) => {
    setEmailInput(val);
    const domain = val.split('@')[1]?.toLowerCase();
    if (domain) {
      if (domain === 'gmail.com' || domain === 'googlemail.com') {
        setImapHostInput('imap.gmail.com');
        setImapPortInput('993');
        setSmtpHostInput('smtp.gmail.com');
        setSmtpPortInput('465');
      } else if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com' || domain === 'office365.com') {
        setImapHostInput('outlook.office365.com');
        setImapPortInput('993');
        setSmtpHostInput('smtp.office365.com');
        setSmtpPortInput('587');
      } else if (domain === 'yahoo.com') {
        setImapHostInput('imap.mail.yahoo.com');
        setImapPortInput('993');
        setSmtpHostInput('smtp.mail.yahoo.com');
        setSmtpPortInput('465');
      } else if (domain === 'icloud.com' || domain === 'me.com') {
        setImapHostInput('imap.mail.me.com');
        setImapPortInput('993');
        setSmtpHostInput('smtp.mail.me.com');
        setSmtpPortInput('587');
      } else if (!imapHostInput || imapHostInput.startsWith('mail.')) {
        setImapHostInput(`mail.${domain}`);
        setImapPortInput('993');
        setSmtpHostInput(`mail.${domain}`);
        setSmtpPortInput('465');
      }
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setIsConnecting(true);
    setStatusMessage('Connecting to mail server...');
    setSyncStep(1);

    try {
      if (provider === 'imap') {
        setSyncStep(2); // TLS Handshake & Authentication
        setStatusMessage('Authenticating with IMAP server & fetching inbox...');

        const result = await onConnectImap({
          email: emailInput,
          password: passwordInput,
          imapHost: imapHostInput || `mail.${emailInput.split('@')[1] || 'domain.com'}`,
          imapPort: parseInt(imapPortInput || '993', 10),
          smtpHost: smtpHostInput || imapHostInput || `mail.${emailInput.split('@')[1] || 'domain.com'}`,
          smtpPort: parseInt(smtpPortInput || '465', 10),
          clientName: clientNameInput,
          clientTitle: clientTitleInput
        });

        setSyncStep(3); // Maya AI triage
        setStatusMessage(result?.message || 'Emails synced and classified with Maya AI!');

        setTimeout(() => {
          setIsConnecting(false);
          setSyncStep(0);
          setEmailInput('');
          setPasswordInput('');
          onClose();
        }, 800);
      } else {
        // Simulated OAuth for Google or Microsoft
        setTimeout(async () => {
          setSyncStep(2);
          setTimeout(async () => {
            setSyncStep(3);
            await onConnectAccount({
              provider,
              email: emailInput,
              clientName: clientNameInput,
              clientTitle: clientTitleInput
            });
            setIsConnecting(false);
            setSyncStep(0);
            setEmailInput('');
            onClose();
          }, 600);
        }, 600);
      }
    } catch (err) {
      setStatusMessage('Notice: ' + err.message);
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <Icon name="mail" className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Connect Your Email Account
              </h3>
              <p className="text-xs text-slate-500">
                Sync live emails with Maya AI or connect your domain
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

        {/* Currently Connected Inboxes */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Connected Inboxes ({accounts.length})
          </label>
          <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
            {accounts.map(acc => (
              <div
                key={acc.id}
                className="flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <img src={acc.avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                  <div className="truncate">
                    <span className="font-semibold text-slate-900 truncate">{acc.name}</span>
                    <span className="text-[11px] text-slate-400 ml-1.5">({acc.email})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full font-medium">
                    Active
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
            Choose Connection Method:
          </label>

          {/* Provider toggle pills */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setProvider('imap')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                provider === 'imap'
                  ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Custom IMAP/SMTP</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('google')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                provider === 'google'
                  ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('microsoft')}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${
                provider === 'microsoft'
                  ? 'border-brand-500 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>Microsoft 365</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="e.g. saurabh@yourdomain.com"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">
                Your Name / Executive Title
              </label>
              <input
                type="text"
                value={clientNameInput}
                onChange={(e) => setClientNameInput(e.target.value)}
                placeholder="Saurabh Kumar Rana"
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Additional Fields for IMAP / SMTP */}
          {provider === 'imap' && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 animate-in fade-in">
              <div>
                <label className="text-[11px] font-medium text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Password / App Password</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional for demo registration</span>
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                    IMAP Host (Incoming)
                  </label>
                  <input
                    type="text"
                    value={imapHostInput}
                    onChange={(e) => setImapHostInput(e.target.value)}
                    placeholder="mail.yourdomain.com"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                    IMAP Port
                  </label>
                  <input
                    type="text"
                    value={imapPortInput}
                    onChange={(e) => setImapPortInput(e.target.value)}
                    placeholder="993"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                    SMTP Host (Outgoing)
                  </label>
                  <input
                    type="text"
                    value={smtpHostInput}
                    onChange={(e) => setSmtpHostInput(e.target.value)}
                    placeholder="mail.yourdomain.com"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-slate-600 block mb-0.5">
                    SMTP Port
                  </label>
                  <input
                    type="text"
                    value={smtpPortInput}
                    onChange={(e) => setSmtpPortInput(e.target.value)}
                    placeholder="465"
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sync Progress Bar */}
          {isConnecting && (
            <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-xs text-brand-900 space-y-1.5 animate-in fade-in">
              <div className="flex items-center justify-between font-semibold">
                <span>{statusMessage || 'Synchronizing with Maya AI...'}</span>
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
              {isConnecting ? 'Connecting...' : `Connect & Sync ${emailInput ? emailInput.split('@')[0] : 'Inbox'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
