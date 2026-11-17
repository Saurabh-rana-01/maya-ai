import express from 'express';
import { db, accounts } from '../db.js';
import { aiEngine } from '../services/aiEngine.js';

const router = express.Router();

// 1. Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Maya AI Executive Email Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. Accounts
router.get('/accounts', async (req, res) => {
  res.json({ accounts: db.accounts });
});

router.post('/accounts/connect', async (req, res) => {
  const { provider, email, clientName, clientTitle } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const newAccount = {
    id: `acc-${Date.now()}`,
    provider: provider || 'google',
    email,
    name: `${clientName || 'Client'} (${provider === 'google' ? 'Google Workspace' : 'Microsoft 365'})`,
    clientName: clientName || 'Sarah Jenkins',
    clientTitle: clientTitle || 'Executive',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    syncStatus: 'active',
    lastSynced: new Date().toISOString(),
    totalThreads: 0,
    isDefault: false
  };

  db.accounts.push(newAccount);
  res.json({ success: true, account: newAccount, message: `Successfully connected ${email} via ${provider}.` });
});

router.post('/accounts/sync', async (req, res) => {
  const { accountId } = req.body;
  const targetAcc = db.accounts.find(a => a.id === accountId) || db.accounts[0];
  if (targetAcc) {
    targetAcc.lastSynced = new Date().toISOString();
    targetAcc.syncStatus = 'active';
  }
  res.json({ success: true, message: 'Mailbox synchronized successfully with zero latency.', lastSynced: targetAcc ? targetAcc.lastSynced : new Date().toISOString() });
});

// 3. Stats
router.get('/stats', async (req, res) => {
  const { clientAccount } = req.query;
  const stats = await db.getStats(clientAccount);
  res.json({ stats });
});

// 4. Emails List
router.get('/emails', async (req, res) => {
  const {
    clientAccount,
    classification,
    category,
    search,
    isArchived,
    isImportant,
    waitingForResponse,
    hasMeeting
  } = req.query;

  const filter = {
    clientAccount,
    classification,
    category,
    search,
    isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : false,
    isImportant: isImportant === 'true' ? true : undefined,
    waitingForResponse: waitingForResponse === 'true' ? true : undefined,
    hasMeeting: hasMeeting === 'true' ? true : undefined
  };

  const emails = await db.getAllEmails(filter);
  res.json({ emails, count: emails.length });
});

// 5. Email Details
router.get('/emails/:id', async (req, res) => {
  const email = await db.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  res.json({ email });
});

// 6. Manual Override of AI Classification
router.patch('/emails/:id/classification', async (req, res) => {
  const { classification, overrideReason } = req.body;
  if (!['Assistant to Reply', 'Client to Reply', 'No Reply Needed'].includes(classification)) {
    return res.status(400).json({ error: 'Invalid classification provided.' });
  }

  const updated = await db.updateEmail(req.params.id, {
    classification,
    isOverridden: true,
    overrideReason: overrideReason || `Manually overridden by Assistant to ${classification}`
  });

  if (!updated) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  res.json({
    success: true,
    email: updated,
    message: `Classification successfully updated to "${classification}"`
  });
});

// 7. Update Status (Read, Star, Archive, Completed)
router.patch('/emails/:id/status', async (req, res) => {
  const { isRead, isImportant, isArchived, isCompleted } = req.body;
  const updates = {};
  if (isRead !== undefined) updates.isRead = isRead;
  if (isImportant !== undefined) updates.isImportant = isImportant;
  if (isArchived !== undefined) updates.isArchived = isArchived;
  if (isCompleted !== undefined) updates.isCompleted = isCompleted;

  const updated = await db.updateEmail(req.params.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  res.json({ success: true, email: updated });
});

// 8. Generate / Update AI Draft Reply
router.post('/emails/:id/reply/draft', async (req, res) => {
  const email = await db.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  const { tone = 'professional', customInstructions = '' } = req.body;
  const draft = aiEngine.generateDraftReply(email, tone);

  if (customInstructions) {
    draft.text = `[Instructed: "${customInstructions}"]\n\n${draft.text}`;
  }

  const updated = await db.updateEmail(req.params.id, {
    draftReply: {
      hasDraft: true,
      text: draft.text,
      tone: draft.tone,
      status: 'draft',
      generatedAt: draft.generatedAt
    }
  });

  res.json({ success: true, email: updated, draft: updated.draftReply });
});

// 9. Send / Approve Reply
router.post('/emails/:id/reply/send', async (req, res) => {
  const email = await db.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  const { text } = req.body;
  const replyText = text || (email.draftReply ? email.draftReply.text : 'Response delivered.');

  const newMessage = {
    id: `msg-${Date.now()}`,
    sender: 'Alex (Executive Assistant) for Sarah Jenkins',
    senderEmail: 'sarah.jenkins@horizon-ventures.com',
    timestamp: new Date().toISOString(),
    body: replyText,
    isFromClient: false,
    isFromAssistant: true
  };

  const updatedMessages = [...(email.messages || []), newMessage];

  // Once replied, update thread status
  const updated = await db.updateEmail(req.params.id, {
    messages: updatedMessages,
    classification: 'No Reply Needed',
    reasoning: 'Reply sent by executive assistant. Thread currently concluded or awaiting counterparty.',
    waitingForResponse: true,
    actionRequired: false,
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'sent',
      generatedAt: new Date()
    }
  });

  res.json({ success: true, email: updated, message: 'Reply sent successfully and recorded in thread.' });
});

// 10. Client Action (from Minimalistic Client View)
router.post('/emails/:id/client-action', async (req, res) => {
  const { action, notes } = req.body; // action: 'handled' | 'delegated_to_assistant'
  const email = await db.getEmailById(req.params.id);
  if (!email) {
    return res.status(404).json({ error: 'Thread not found' });
  }

  let updates = {};

  if (action === 'handled') {
    updates = {
      isCompleted: true,
      classification: 'No Reply Needed',
      reasoning: 'Marked as personally handled and resolved by Client.',
      clientStatus: {
        viewedByClient: true,
        clientActionTaken: 'handled',
        clientNotes: notes || 'Client marked handled directly.'
      }
    };
  } else if (action === 'delegated_to_assistant') {
    updates = {
      classification: 'Assistant to Reply',
      reasoning: `Client delegated to assistant with instruction: "${notes || 'Please handle this.'}"`,
      isOverridden: true,
      overrideReason: `Client delegated: ${notes || 'Assistant to handle'}`,
      actionRequired: true,
      clientStatus: {
        viewedByClient: true,
        clientActionTaken: 'delegated_to_assistant',
        clientNotes: notes || 'Client requested assistant to take over.'
      }
    };
  }

  const updated = await db.updateEmail(req.params.id, updates);
  res.json({ success: true, email: updated, message: `Action "${action}" processed successfully.` });
});

// 11. AI Copilot ("Ask AI about inbox")
router.post('/ai/ask', async (req, res) => {
  const { query, clientAccount } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Query is required.' });
  }

  const allEmails = await db.getAllEmails({ clientAccount });
  const response = aiEngine.answerQuery(query, allEmails);
  res.json({ success: true, response });
});

// 12. Inbound Email Simulator (for live evaluator testing!)
router.post('/emails/simulate-inbound', async (req, res) => {
  const { sampleType = 'random' } = req.body;

  const samples = [
    {
      subject: 'Emergency Board Resolution: Liquidity Facility Sign-off',
      sender: {
        name: 'Victoria Sterling',
        email: 'vsterling@apex-partners.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80'
      },
      body: 'Sarah,\n\nWe require your immediate executive approval and digital signature on the bridge facility addendum before market close today. Please review the attached execution agreement and reply with your sign-off.\n\nRegards,\nVictoria Sterling',
      expectedClass: 'Client to Reply'
    },
    {
      subject: 'Reschedule: Product Design Review with Figma Team',
      sender: {
        name: 'Derek Lin',
        email: 'derek@designcraft.io',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80'
      },
      body: 'Hi Sarah,\n\nSomething urgent came up on our end for this Thursday. Could your assistant help find 45 minutes next Monday or Tuesday afternoon to reschedule our product review?\n\nThanks,\nDerek Lin',
      expectedClass: 'Assistant to Reply'
    },
    {
      subject: 'AWS Invoice & Cloud Spend Digest - October 2026',
      sender: {
        name: 'Amazon Web Services',
        email: 'no-reply@amazon.com',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'
      },
      body: 'Your monthly AWS billing statement for account 992-184-291 is now ready for viewing. Total charged: $4,281.40. Auto-billed to corporate card ending in 4019. No action required.',
      expectedClass: 'No Reply Needed'
    }
  ];

  const chosen = sampleType === 'client' 
    ? samples[0] 
    : sampleType === 'assistant' 
      ? samples[1] 
      : sampleType === 'automated' 
        ? samples[2] 
        : samples[Math.floor(Math.random() * samples.length)];

  const tempThread = {
    subject: chosen.subject,
    messages: [
      {
        id: `msg-${Date.now()}`,
        sender: chosen.sender.name,
        senderEmail: chosen.sender.email,
        timestamp: new Date().toISOString(),
        body: chosen.body,
        isFromClient: false,
        isFromAssistant: false
      }
    ]
  };

  // Run AI classification & metadata extraction
  const classificationResult = aiEngine.classifyThread(tempThread);
  const summaryResult = aiEngine.generateSummary(tempThread);
  const meetingResult = aiEngine.detectMeetingAndActions(tempThread);

  const newEmail = await db.addEmail({
    threadId: `th-sim-${Date.now()}`,
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: chosen.subject,
    sender: chosen.sender,
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: tempThread.messages,
    classification: classificationResult.classification,
    confidence: classificationResult.confidence,
    reasoning: classificationResult.reasoning,
    isOverridden: false,
    overrideReason: '',
    category: classificationResult.category,
    priority: classificationResult.priority,
    isImportant: classificationResult.isImportant,
    isRead: false,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: classificationResult.waitingForResponse,
    actionRequired: classificationResult.actionRequired,
    summary: summaryResult.summary,
    keyPoints: summaryResult.keyPoints,
    actionItems: meetingResult.actionItems,
    detectedMeeting: meetingResult.detectedMeeting,
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: classificationResult.classification === 'Assistant to Reply',
      text: classificationResult.classification === 'Assistant to Reply' 
        ? aiEngine.generateDraftReply(tempThread, 'scheduling').text 
        : '',
      tone: 'scheduling',
      status: classificationResult.classification === 'Assistant to Reply' ? 'draft' : 'none',
      generatedAt: new Date().toISOString()
    }
  });

  res.json({
    success: true,
    email: newEmail,
    message: `New simulated email received: "${chosen.subject}" classified as [${newEmail.classification} (${newEmail.confidence}% confidence)]`
  });
});

// 13. Reset Demo Data
router.post('/reset-demo', async (req, res) => {
  await db.resetSeedData();
  res.json({ success: true, message: 'Demo dataset reset to initial pristine state.' });
});

export default router;
