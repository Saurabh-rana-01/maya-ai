import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { aiEngine } from './services/aiEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

// Helper to parse JSON body from incoming HTTP request
const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
};

// Helper to send JSON responses with CORS headers
const sendJson = (res, statusCode, data) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
};

// Static file MIME types
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.jsx': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

export const handleRequest = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const searchParams = parsedUrl.searchParams;

  console.log(`[Maya API] ${req.method} ${pathname}`);

  // =================== API ROUTES ===================
  if (pathname.startsWith('/api')) {
    // 1. Health check
    if (pathname === '/api/health' && req.method === 'GET') {
      return sendJson(res, 200, {
        status: 'ok',
        service: 'Maya AI Executive Email Management API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Accounts
    if (pathname === '/api/accounts' && req.method === 'GET') {
      return sendJson(res, 200, { accounts: db.accounts });
    }

    if (pathname === '/api/accounts/connect' && req.method === 'POST') {
      const body = await parseBody(req);
      const { provider, email, clientName, clientTitle } = body;
      if (!email) {
        return sendJson(res, 400, { error: 'Email address is required.' });
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
      return sendJson(res, 200, { success: true, account: newAccount, message: `Successfully connected ${email} via ${provider}.` });
    }

    if (pathname === '/api/accounts/sync' && req.method === 'POST') {
      const body = await parseBody(req);
      const targetAcc = db.accounts.find(a => a.id === body.accountId) || db.accounts[0];
      if (targetAcc) {
        targetAcc.lastSynced = new Date().toISOString();
        targetAcc.syncStatus = 'active';
      }
      return sendJson(res, 200, { success: true, message: 'Mailbox synchronized successfully.', lastSynced: targetAcc ? targetAcc.lastSynced : new Date().toISOString() });
    }

    // 3. Stats
    if (pathname === '/api/stats' && req.method === 'GET') {
      const clientAccount = searchParams.get('clientAccount') || undefined;
      const stats = await db.getStats(clientAccount);
      return sendJson(res, 200, { stats });
    }

    // 4. Emails List
    if (pathname === '/api/emails' && req.method === 'GET') {
      const filter = {
        clientAccount: searchParams.get('clientAccount') || undefined,
        classification: searchParams.get('classification') || undefined,
        category: searchParams.get('category') || undefined,
        search: searchParams.get('search') || undefined,
        isArchived: searchParams.get('isArchived') === 'true' ? true : searchParams.get('isArchived') === 'false' ? false : false,
        isImportant: searchParams.get('isImportant') === 'true' ? true : undefined,
        waitingForResponse: searchParams.get('waitingForResponse') === 'true' ? true : undefined,
        hasMeeting: searchParams.get('hasMeeting') === 'true' ? true : undefined
      };

      const emails = await db.getAllEmails(filter);
      return sendJson(res, 200, { emails, count: emails.length });
    }

    // 5. Email Details
    const emailMatch = pathname.match(/^\/api\/emails\/([a-zA-Z0-9_-]+)$/);
    if (emailMatch && req.method === 'GET') {
      const email = await db.getEmailById(emailMatch[1]);
      if (!email) {
        return sendJson(res, 404, { error: 'Thread not found' });
      }
      return sendJson(res, 200, { email });
    }

    // 6. Manual Override of AI Classification
    const classMatch = pathname.match(/^\/api\/emails\/([a-zA-Z0-9_-]+)\/classification$/);
    if (classMatch && req.method === 'PATCH') {
      const body = await parseBody(req);
      const { classification, overrideReason } = body;
      if (!['Assistant to Reply', 'Client to Reply', 'No Reply Needed'].includes(classification)) {
        return sendJson(res, 400, { error: 'Invalid classification provided.' });
      }

      const updated = await db.updateEmail(classMatch[1], {
        classification,
        isOverridden: true,
        overrideReason: overrideReason || `Manually overridden by Assistant to ${classification}`
      });

      if (!updated) {
        return sendJson(res, 404, { error: 'Thread not found' });
      }

      return sendJson(res, 200, {
        success: true,
        email: updated,
        message: `Classification successfully updated to "${classification}"`
      });
    }

    // 7. Update Status (Read, Star, Archive, Completed)
    const statusMatch = pathname.match(/^\/api\/emails\/([a-zA-Z0-9_-]+)\/status$/);
    if (statusMatch && req.method === 'PATCH') {
      const body = await parseBody(req);
      const updates = {};
      if (body.isRead !== undefined) updates.isRead = body.isRead;
      if (body.isImportant !== undefined) updates.isImportant = body.isImportant;
      if (body.isArchived !== undefined) updates.isArchived = body.isArchived;
      if (body.isCompleted !== undefined) updates.isCompleted = body.isCompleted;

      const updated = await db.updateEmail(statusMatch[1], updates);
      if (!updated) {
        return sendJson(res, 404, { error: 'Thread not found' });
      }
      return sendJson(res, 200, { success: true, email: updated });
    }

    // 8. Generate / Update AI Draft Reply
    const draftMatch = pathname.match(/^\/api\/emails\/([a-zA-Z0-9_-]+)\/reply\/draft$/);
    if (draftMatch && req.method === 'POST') {
      const email = await db.getEmailById(draftMatch[1]);
      if (!email) {
        return sendJson(res, 404, { error: 'Thread not found' });
      }

      const body = await parseBody(req);
      const tone = body.tone || 'professional';
      const draft = aiEngine.generateDraftReply(email, tone);

      if (body.customInstructions) {
        draft.text = `[Instructed: "${body.customInstructions}"]\n\n${draft.text}`;
      }

      const updated = await db.updateEmail(draftMatch[1], {
        draftReply: {
          hasDraft: true,
          text: draft.text,
          tone: draft.tone,
          status: 'draft',
          generatedAt: draft.generatedAt
        }
      });

      return sendJson(res, 200, { success: true, email: updated, draft: updated.draftReply });
    }

    // 9. Send / Approve Reply
    const sendMatch = pathname.match(/^\/api\/emails\/([a-zA-Z0-9_-]+)\/reply\/send$/);
    if (sendMatch && req.method === 'POST') {
      const email = await db.getEmailById(sendMatch[1]);
      if (!email) {
        return sendJson(res, 404, { error: 'Thread not found' });
      }

      const body = await parseBody(req);
      const replyText = body.text || (email.draftReply ? email.draftReply.text : 'Response delivered.');

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

      const updated = await db.updateEmail(sendMatch[1], {
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

      return sendJson(res, 200, { success: true, email: updated, message: 'Reply sent successfully and recorded in thread.' });
    }

    // 10. Client Action (from Minimalistic Client View)
    const clientActionMatch = pathname.match(/^\/api\/emails\/([a-zA-Z0-9_-]+)\/client-action$/);
    if (clientActionMatch && req.method === 'POST') {
      const email = await db.getEmailById(clientActionMatch[1]);
      if (!email) {
        return sendJson(res, 404, { error: 'Thread not found' });
      }

      const body = await parseBody(req);
      const { action, notes } = body;
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

      const updated = await db.updateEmail(clientActionMatch[1], updates);
      return sendJson(res, 200, { success: true, email: updated, message: `Action "${action}" processed successfully.` });
    }

    // 11. AI Copilot
    if (pathname === '/api/ai/ask' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.query) {
        return sendJson(res, 400, { error: 'Query is required.' });
      }

      const allEmails = await db.getAllEmails({ clientAccount: body.clientAccount });
      const response = aiEngine.answerQuery(body.query, allEmails);
      return sendJson(res, 200, { success: true, response });
    }

    // 12. Inbound Simulator
    if (pathname === '/api/emails/simulate-inbound' && req.method === 'POST') {
      const body = await parseBody(req);
      const sampleType = body.sampleType || 'random';

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

      return sendJson(res, 200, {
        success: true,
        email: newEmail,
        message: `New simulated email received: "${chosen.subject}" classified as [${newEmail.classification} (${newEmail.confidence}% confidence)]`
      });
    }

    // 13. Reset Demo Data
    if (pathname === '/api/reset-demo' && req.method === 'POST') {
      await db.resetSeedData();
      return sendJson(res, 200, { success: true, message: 'Demo dataset reset to initial pristine state.' });
    }
  }

  // =================== STATIC FILE SERVING ===================
  // Serve the interactive client web app from ../public or ../client
  let filePath = path.join(__dirname, '../public', pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, '../public/index.html');
  }

  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end('Server error loading file.');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(content);
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head><title>Maya AI Server</title></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>Maya AI Server is running!</h2>
          <p>API endpoints ready at <code>/api/emails</code></p>
        </body>
      </html>
    `);
  }
};

const server = http.createServer(handleRequest);

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`✨ Maya AI Backend running at: http://localhost:${PORT}`);
    console.log(`📡 API Endpoints available at: http://localhost:${PORT}/api/emails`);
    console.log(`======================================================\n`);
  });
}

export default handleRequest;
