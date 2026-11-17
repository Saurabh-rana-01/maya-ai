import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api.js';
import { Header } from './components/Header.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { StatCard } from './components/StatCard.jsx';
import { EmailList } from './components/EmailList.jsx';
import { ConversationView } from './components/ConversationView.jsx';
import { ClientPortal } from './components/ClientPortal.jsx';
import { AICopilotDrawer } from './components/AICopilotDrawer.jsx';
import { InboundSimulatorModal } from './components/InboundSimulatorModal.jsx';
import { OnboardingModal } from './components/OnboardingModal.jsx';

export default function App() {
  const [accounts, setAccounts] = useState([
    {
      id: 'acc-1',
      provider: 'google',
      email: 'sarah.jenkins@horizon-ventures.com',
      name: 'Sarah Jenkins (Horizon Primary)',
      clientName: 'Sarah Jenkins',
      clientTitle: 'Managing Partner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      syncStatus: 'active',
      lastSynced: 'Just now',
      totalThreads: 8,
      isDefault: true
    },
    {
      id: 'acc-2',
      provider: 'microsoft',
      email: 'sarah@apex-technologies.io',
      name: 'Sarah Jenkins (Apex Board)',
      clientName: 'Sarah Jenkins',
      clientTitle: 'Board Member',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      syncStatus: 'active',
      lastSynced: '14m ago',
      totalThreads: 4,
      isDefault: false
    }
  ]);
  const [activeAccount, setActiveAccount] = useState(accounts[0]);
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [activeView, setActiveView] = useState('assistant'); // 'assistant' | 'client'
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    important: 0,
    assistantToReply: 0,
    clientToReply: 0,
    noReplyNeeded: 0,
    waitingForResponse: 0,
    actionRequired: 0,
    meetingsCount: 0
  });

  // Modal dialog states
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Load emails & stats
  const refreshData = async () => {
    try {
      const emailRes = await api.getEmails({
        clientAccount: activeAccount?.email
      });
      if (emailRes && emailRes.emails) {
        setEmails(emailRes.emails);
        if (!selectedEmail && emailRes.emails.length > 0) {
          setSelectedEmail(emailRes.emails[0]);
        } else if (selectedEmail) {
          const updatedSelected = emailRes.emails.find(e => e.threadId === selectedEmail.threadId);
          if (updatedSelected) setSelectedEmail(updatedSelected);
        }
      }

      const statsRes = await api.getStats(activeAccount?.email);
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }

      const accRes = await api.getAccounts();
      if (accRes && accRes.accounts && accRes.accounts.length > 0) {
        setAccounts(accRes.accounts);
      }
    } catch (e) {
      console.warn('API sync warning:', e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeAccount?.id]);

  // Filtered emails based on activeTab & searchQuery
  const filteredEmails = useMemo(() => {
    return emails.filter(email => {
      // Tab filter
      if (activeTab === 'client_to_reply' && email.classification !== 'Client to Reply') return false;
      if (activeTab === 'assistant_to_reply' && email.classification !== 'Assistant to Reply') return false;
      if (activeTab === 'action_required' && !email.actionRequired) return false;
      if (activeTab === 'waiting' && !email.waitingForResponse) return false;
      if (activeTab === 'meetings' && (!email.detectedMeeting || !email.detectedMeeting.hasMeeting)) return false;
      if (activeTab === 'archived' && !email.isArchived) return false;
      if (activeTab !== 'archived' && email.isArchived) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesSubject = (email.subject || '').toLowerCase().includes(q);
        const matchesSender = (email.sender?.name || '').toLowerCase().includes(q);
        const matchesSummary = (email.summary || '').toLowerCase().includes(q);
        if (!matchesSubject && !matchesSender && !matchesSummary) return false;
      }

      return true;
    });
  }, [emails, activeTab, searchQuery]);

  // Actions
  const handleSelectEmail = async (email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      await api.updateEmailStatus(email.threadId, { isRead: true });
      setEmails(prev => prev.map(e => e.threadId === email.threadId ? { ...e, isRead: true } : e));
    }
  };

  const handleToggleImportant = async (threadId) => {
    const target = emails.find(e => e.threadId === threadId);
    if (!target) return;
    const newImportant = !target.isImportant;
    await api.updateEmailStatus(threadId, { isImportant: newImportant });
    setEmails(prev => prev.map(e => e.threadId === threadId ? { ...e, isImportant: newImportant } : e));
  };

  const handleOverrideClassification = async (threadId, newClass) => {
    await api.updateClassification(threadId, newClass, `Re-assigned to ${newClass} by Assistant`);
    await refreshData();
  };

  const handleUpdateStatus = async (threadId, updates) => {
    await api.updateEmailStatus(threadId, updates);
    await refreshData();
  };

  const handleGenerateDraft = async (threadId, tone, customInstructions) => {
    const res = await api.generateDraftReply(threadId, tone, customInstructions);
    if (res && res.draft) {
      setEmails(prev => prev.map(e => e.threadId === threadId ? { ...e, draftReply: res.draft } : e));
      if (selectedEmail?.threadId === threadId) {
        setSelectedEmail(prev => ({ ...prev, draftReply: res.draft }));
      }
      return res.draft;
    }
    return null;
  };

  const handleSendReply = async (threadId, text) => {
    await api.sendReply(threadId, text);
    await refreshData();
  };

  const handleClientAction = async (threadId, action, notes) => {
    await api.clientAction(threadId, action, notes);
    await refreshData();
  };

  const handleSimulateInbound = async (scenarioId) => {
    const res = await api.simulateInbound(scenarioId);
    await refreshData();
    if (res && res.email) {
      setSelectedEmail(res.email);
    }
    return res;
  };

  const handleConnectAccount = async (newAccData) => {
    await api.connectAccount(newAccData);
    await refreshData();
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all emails and classifications back to factory demo state?')) {
      await api.resetDemo();
      await refreshData();
    }
  };

  const handleAskCopilot = async (query) => {
    const res = await api.askCopilot(query, activeAccount?.email);
    return res.response;
  };

  const handleToggleActionItem = async (threadId, itemIndex) => {
    const target = emails.find(e => e.threadId === threadId);
    if (!target || !target.actionItems) return;
    const updatedItems = [...target.actionItems];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      completed: !updatedItems[itemIndex].completed
    };
    setEmails(prev => prev.map(e => e.threadId === threadId ? { ...e, actionItems: updatedItems } : e));
    if (selectedEmail?.threadId === threadId) {
      setSelectedEmail(prev => ({ ...prev, actionItems: updatedItems }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* Top Navbar */}
      <Header
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={(acc) => setActiveAccount(acc)}
        activeView={activeView}
        onViewChange={(view) => setActiveView(view)}
        clientToReplyCount={stats.clientToReply}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Workspace Body */}
      {activeView === 'client' ? (
        <ClientPortal
          emails={emails}
          activeAccount={activeAccount}
          onClientAction={handleClientAction}
          onSwitchToAssistantView={() => setActiveView('assistant')}
        />
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Executive KPI Stat Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard
                title="Total Active"
                count={stats.total}
                subtitle="all connected"
                icon="mail"
                colorScheme="slate"
                isActive={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
              />
              <StatCard
                title="Client to Reply"
                count={stats.clientToReply}
                subtitle="needs Sarah's input"
                icon="user"
                colorScheme="amber"
                isActive={activeTab === 'client_to_reply'}
                onClick={() => setActiveTab('client_to_reply')}
              />
              <StatCard
                title="Assistant to Reply"
                count={stats.assistantToReply}
                subtitle="scheduling & admin"
                icon="user-check"
                colorScheme="purple"
                isActive={activeTab === 'assistant_to_reply'}
                onClick={() => setActiveTab('assistant_to_reply')}
              />
              <StatCard
                title="Action Required"
                count={stats.actionRequired}
                subtitle="pending tasks"
                icon="alert-circle"
                colorScheme="rose"
                isActive={activeTab === 'action_required'}
                onClick={() => setActiveTab('action_required')}
              />
              <StatCard
                title="Waiting for Response"
                count={stats.waitingForResponse}
                subtitle="awaiting reply"
                icon="clock"
                colorScheme="blue"
                isActive={activeTab === 'waiting'}
                onClick={() => setActiveTab('waiting')}
              />
              <StatCard
                title="Meetings"
                count={stats.meetingsCount}
                subtitle="appointments"
                icon="calendar"
                colorScheme="emerald"
                isActive={activeTab === 'meetings'}
                onClick={() => setActiveTab('meetings')}
              />
            </div>
          </div>

          {/* 3-Pane Layout: Sidebar, Email List, Conversation Detail */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              activeTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab)}
              stats={stats}
              activeAccount={activeAccount}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />

            <EmailList
              emails={filteredEmails}
              selectedEmail={selectedEmail}
              onSelectEmail={handleSelectEmail}
              onToggleImportant={handleToggleImportant}
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              activeFilter={activeTab}
              onFilterChange={(tab) => setActiveTab(tab)}
            />

            <ConversationView
              email={selectedEmail}
              onOverrideClassification={handleOverrideClassification}
              onUpdateStatus={handleUpdateStatus}
              onGenerateDraft={handleGenerateDraft}
              onSendReply={handleSendReply}
              onToggleActionItem={handleToggleActionItem}
            />
          </div>
        </div>
      )}

      {/* Slide-over & Modals */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onAskCopilot={handleAskCopilot}
        onSelectThread={(tId) => {
          const target = emails.find(e => e.threadId === tId);
          if (target) {
            setSelectedEmail(target);
            setActiveView('assistant');
          }
        }}
      />

      <InboundSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSimulate={handleSimulateInbound}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        accounts={accounts}
        onConnectAccount={handleConnectAccount}
        onSyncAccount={(accId) => api.syncAccount(accId)}
      />
    </div>
  );
}
