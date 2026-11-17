// Client API Service for Maya AI Executive Email Management

const BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')
  ? '/api'
  : 'http://localhost:5000/api';

export const api = {
  async getHealth() {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      return await res.json();
    } catch (e) {
      return { status: 'offline' };
    }
  },

  async getAccounts() {
    try {
      const res = await fetch(`${BASE_URL}/accounts`);
      return await res.json();
    } catch (e) {
      console.warn('Backend unavailable, using local accounts fallback');
      return { accounts: [] };
    }
  },

  async connectAccount(data) {
    const res = await fetch(`${BASE_URL}/accounts/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async connectImap(data) {
    const res = await fetch(`${BASE_URL}/accounts/connect-imap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async syncAccount(accountId) {
    const res = await fetch(`${BASE_URL}/accounts/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId })
    });
    return await res.json();
  },

  async getStats(clientAccount) {
    const query = clientAccount ? `?clientAccount=${encodeURIComponent(clientAccount)}` : '';
    const res = await fetch(`${BASE_URL}/stats${query}`);
    return await res.json();
  },

  async getEmails(filters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== 'All') {
        params.append(k, v);
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/emails${query}`);
    return await res.json();
  },

  async getEmailById(threadId) {
    const res = await fetch(`${BASE_URL}/emails/${threadId}`);
    return await res.json();
  },

  async updateClassification(threadId, classification, overrideReason) {
    const res = await fetch(`${BASE_URL}/emails/${threadId}/classification`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classification, overrideReason })
    });
    return await res.json();
  },

  async updateEmailStatus(threadId, updates) {
    const res = await fetch(`${BASE_URL}/emails/${threadId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return await res.json();
  },

  async generateDraftReply(threadId, tone, customInstructions) {
    const res = await fetch(`${BASE_URL}/emails/${threadId}/reply/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tone, customInstructions })
    });
    return await res.json();
  },

  async sendReply(threadId, text) {
    const res = await fetch(`${BASE_URL}/emails/${threadId}/reply/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return await res.json();
  },

  async clientAction(threadId, action, notes) {
    const res = await fetch(`${BASE_URL}/emails/${threadId}/client-action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, notes })
    });
    return await res.json();
  },

  async askCopilot(query, clientAccount) {
    const res = await fetch(`${BASE_URL}/ai/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, clientAccount })
    });
    return await res.json();
  },

  async simulateInbound(sampleType) {
    const res = await fetch(`${BASE_URL}/emails/simulate-inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleType })
    });
    return await res.json();
  },

  async resetDemo() {
    const res = await fetch(`${BASE_URL}/reset-demo`, {
      method: 'POST'
    });
    return await res.json();
  }
};
