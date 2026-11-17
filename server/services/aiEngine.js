// Maya AI Engine - Intelligence Layer for Email Management
// Supports rule-based heuristics & NLP classification + optional live Gemini LLM API

export class MayaAIEngine {
  constructor(apiKey = process.env.GEMINI_API_KEY) {
    this.apiKey = apiKey;
  }

  /**
   * Classifies an email thread to determine who is responsible for replying
   * Returns: { classification, confidence, reasoning, category, priority, waitingForResponse, actionRequired, isImportant }
   */
  classifyThread(thread) {
    const subject = (thread.subject || '').toLowerCase();
    const latestMessage = thread.messages && thread.messages.length > 0 
      ? thread.messages[thread.messages.length - 1] 
      : { body: '', sender: '' };
    const fullBody = (thread.messages || []).map(m => m.body).join(' ').toLowerCase();
    const latestBody = (latestMessage.body || '').toLowerCase();
    const sender = (latestMessage.sender || '').toLowerCase();
    const senderEmail = (latestMessage.senderEmail || '').toLowerCase();

    // Check if the latest message was sent by the client or assistant (i.e. we sent it)
    const isOutboundLatest = latestMessage.isFromClient || latestMessage.isFromAssistant;

    // 1. Check for "No Reply Needed"
    // Automated notifications, newsletters, receipts, unsubscribe links
    const isAutomated = 
      senderEmail.includes('no-reply') || 
      senderEmail.includes('noreply') || 
      senderEmail.includes('notifications@') || 
      senderEmail.includes('newsletter@') ||
      senderEmail.includes('updates@') ||
      senderEmail.includes('marketing@') ||
      latestBody.includes('unsubscribe') ||
      latestBody.includes('do not reply to this email') ||
      subject.includes('newsletter') ||
      subject.includes('weekly digest') ||
      subject.includes('receipt for') ||
      subject.includes('invoice #') ||
      subject.includes('security alert') ||
      subject.includes('order confirmation');

    // Resolved conversations
    const isResolved = 
      latestBody.match(/^(thanks|thank you|sounds good|noted|perfect|got it|all set|received with thanks)[\.\!\s]*$/i) ||
      (latestBody.length < 50 && (latestBody.includes('thank you') || latestBody.includes('sounds good') || latestBody.includes('will do')));

    if (isAutomated) {
      return {
        classification: 'No Reply Needed',
        confidence: 96,
        reasoning: 'Automated newsletter, transactional notification, or broadcast email that requires no response.',
        category: 'Newsletter',
        priority: 'low',
        waitingForResponse: false,
        actionRequired: false,
        isImportant: false
      };
    }

    if (isResolved && isOutboundLatest) {
      return {
        classification: 'No Reply Needed',
        confidence: 92,
        reasoning: 'The conversation reached a natural conclusion with a confirmation/acknowledgment.',
        category: 'General',
        priority: 'low',
        waitingForResponse: false,
        actionRequired: false,
        isImportant: false
      };
    }

    // If our team sent the last message and asked a question, we are "Waiting for Response"
    if (isOutboundLatest) {
      const weAskedQuestion = latestBody.includes('?') || latestBody.includes('let me know') || latestBody.includes('looking forward');
      return {
        classification: 'No Reply Needed',
        confidence: 88,
        reasoning: weAskedQuestion 
          ? 'You sent the last message; currently awaiting response from the counterparty.' 
          : 'Last message sent by our team. No immediate reply required from us.',
        category: 'Follow-up',
        priority: 'medium',
        waitingForResponse: weAskedQuestion,
        actionRequired: false,
        isImportant: false
      };
    }

    // 2. Check for "Client to Reply"
    // Decisions, approvals, personal opinions, legal/equity sign-off, high-level founder/exec discussions
    const clientReplyPatterns = [
      { pattern: /approval|approve|sign off|sign-off|permission/i, reason: 'Requires executive decision or sign-off.' },
      { pattern: /term sheet|valuation|equity|cap table|wire transfer|contract agreement|legal counsel/i, reason: 'Contains sensitive financial, legal, or equity discussion requiring client review.' },
      { pattern: /what do you think|your thoughts|your perspective|would you prefer|are you open to/i, reason: 'Sender is specifically seeking the client’s personal input and opinion.' },
      { pattern: /board meeting|investor update|shareholder/i, reason: 'High-stakes board or investor matter requiring client personal attention.' },
      { pattern: /confidential|strictly private|personal note|between us/i, reason: 'Marked confidential or personal directly to client.' },
      { pattern: /offer letter|compensation|performance review|promotion/i, reason: 'Executive HR / compensation decision.' },
      { pattern: /partnership agreement|m&a|acquisition/i, reason: 'Strategic partnership or corporate development decision.' }
    ];

    let clientScore = 0;
    let matchedClientReason = '';

    for (const item of clientReplyPatterns) {
      if (item.pattern.test(latestBody) || item.pattern.test(subject)) {
        clientScore += 30;
        if (!matchedClientReason) matchedClientReason = item.reason;
      }
    }

    // 3. Check for "Assistant to Reply"
    // Scheduling, rescheduling, calendar, availability, general logistics, venue, reminders, routine docs
    const assistantReplyPatterns = [
      { pattern: /schedule|reschedule|calendar|availability|available to meet|find a time|set up a call|30 minutes|30 mins|coffee chat|zoom link|google meet/i, reason: 'Meeting scheduling or calendar coordination that can be managed by the assistant.', category: 'Scheduling' },
      { pattern: /can you send|please forward|where can i find|deck|brochure|one-pager|presentation slides/i, reason: 'Routine inquiry or document request suitable for assistant fulfillment.', category: 'Administrative' },
      { pattern: /travel itinerary|flight|hotel booking|reservation|car rental/i, reason: 'Travel and logistics coordination for the client.', category: 'Administrative' },
      { pattern: /following up on|checking in regarding|any update on/i, reason: 'Routine follow-up inquiry that assistant can track or respond to.', category: 'Follow-up' },
      { pattern: /w-9|vendor form|invoice payment status|billing address/i, reason: 'Administrative paperwork or billing inquiry.', category: 'Administrative' },
      { pattern: /rsvp|attending|guest list/i, reason: 'Event RSVP or guest list confirmation.', category: 'Administrative' }
    ];

    let assistantScore = 0;
    let matchedAssistantReason = '';
    let detectedCategory = 'General';

    for (const item of assistantReplyPatterns) {
      if (item.pattern.test(latestBody) || item.pattern.test(subject)) {
        assistantScore += 30;
        if (!matchedAssistantReason) {
          matchedAssistantReason = item.reason;
          detectedCategory = item.category || 'Administrative';
        }
      }
    }

    // Weighting & Resolution:
    // If the email explicitly asks to "have your assistant coordinate", heavy weight for assistant
    if (latestBody.includes('assistant') || latestBody.includes('ea') || latestBody.includes('cc-ing your')) {
      assistantScore += 40;
      matchedAssistantReason = 'Counterparty explicitly mentions coordinating with the assistant.';
    }

    // If client input is explicitly required, client score wins unless it is purely calendar scheduling
    if (clientScore > assistantScore) {
      const confidence = Math.min(98, 70 + clientScore);
      return {
        classification: 'Client to Reply',
        confidence,
        reasoning: matchedClientReason || 'Identified as requiring client’s personal decision or authoritative input.',
        category: 'Approval',
        priority: 'high',
        waitingForResponse: false,
        actionRequired: true,
        isImportant: true
      };
    } else if (assistantScore > 0) {
      const confidence = Math.min(95, 65 + assistantScore);
      return {
        classification: 'Assistant to Reply',
        confidence,
        reasoning: matchedAssistantReason || 'Routine administrative request or scheduling coordination assigned to assistant.',
        category: detectedCategory,
        priority: detectedCategory === 'Scheduling' ? 'high' : 'medium',
        waitingForResponse: false,
        actionRequired: true,
        isImportant: false
      };
    } else {
      // Ambiguous / routine email - check if it looks like a general inquiry
      const hasQuestion = latestBody.includes('?');
      if (hasQuestion) {
        return {
          classification: 'Assistant to Reply',
          confidence: 68,
          reasoning: 'Inquiry detected without clear executive escalation; flagged for assistant triage and review.',
          category: 'General',
          priority: 'medium',
          waitingForResponse: false,
          actionRequired: true,
          isImportant: false
        };
      }

      return {
        classification: 'No Reply Needed',
        confidence: 72,
        reasoning: 'Informational message with no explicit question or required follow-up.',
        category: 'Informational',
        priority: 'low',
        waitingForResponse: false,
        actionRequired: false,
        isImportant: false
      };
    }
  }

  /**
   * Generates a 1-2 sentence executive summary & key takeaways
   */
  generateSummary(thread) {
    const subject = thread.subject || 'No Subject';
    const latestMessage = thread.messages && thread.messages.length > 0 
      ? thread.messages[thread.messages.length - 1] 
      : { body: '', sender: 'Unknown' };
    const sender = latestMessage.sender || 'Sender';
    const body = latestMessage.body || '';

    let summary = '';
    const keyPoints = [];

    if (/schedule|meeting|call|coffee|zoom/i.test(body + subject)) {
      summary = `${sender} is requesting to coordinate a meeting regarding ${subject.replace(/^(re:|fwd:)\s*/i, '')}.`;
      keyPoints.push(`Meeting request from ${sender}`);
      keyPoints.push('Proposes connecting to discuss project milestones');
      keyPoints.push('Assistant can cross-reference client calendar and propose time slots');
    } else if (/approval|contract|terms|sign/i.test(body + subject)) {
      summary = `${sender} is requesting executive review and approval for the finalized agreement terms.`;
      keyPoints.push(`Decision needed from client on ${subject}`);
      keyPoints.push('Impacts contract finalization and timeline');
      keyPoints.push('Client sign-off required before counterparty can proceed');
    } else if (/invoice|receipt|payment/i.test(body + subject)) {
      summary = `Billing notification regarding ${subject}.`;
      keyPoints.push('Invoice/receipt details attached');
      keyPoints.push('No immediate executive action required if auto-billed');
    } else if (/update|newsletter|digest/i.test(body + subject)) {
      summary = `Informational digest or update regarding ${subject}.`;
      keyPoints.push('General status announcement');
      keyPoints.push('Filing for future reference');
    } else {
      const snippet = body.slice(0, 140).trim();
      summary = `${sender} reached out regarding "${subject}": ${snippet}${snippet.length === 140 ? '...' : ''}`;
      keyPoints.push(`Correspondence from ${sender}`);
      keyPoints.push('Review thread content for context and relevant next steps');
    }

    return { summary, keyPoints };
  }

  /**
   * Detects meetings, appointments, and deadlines from the thread
   */
  detectMeetingAndActions(thread) {
    const fullText = (thread.messages || []).map(m => m.body).join(' ') + ' ' + (thread.subject || '');
    
    // Check for meeting patterns
    const meetingMatch = fullText.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(st|nd|rd|th)?|\b\d{1,2}\/\d{1,2})/i);
    const timeMatch = fullText.match(/(\d{1,2}(:\d{2})?\s*(am|pm|est|pst|gmt|utc))/i);
    const locationMatch = fullText.match(/(zoom|google meet|teams|bluejeans|in-person|office|starbucks|blue bottle)/i);

    const hasMeeting = /schedule|meeting|call|sync|discussion|coffee/i.test(fullText) && (meetingMatch !== null || timeMatch !== null);

    const detectedMeeting = hasMeeting ? {
      hasMeeting: true,
      title: thread.subject ? thread.subject.replace(/^(re:|fwd:)\s*/i, '') : 'Sync Meeting',
      date: meetingMatch ? meetingMatch[0] : 'Proposed for this week',
      time: timeMatch ? timeMatch[0] : 'Time TBD (e.g. 2:00 PM EST)',
      location: locationMatch ? (locationMatch[0].toLowerCase().includes('zoom') ? 'Zoom Video Call' : locationMatch[0]) : 'Google Meet / Zoom',
      duration: '30 mins',
      status: 'proposed'
    } : {
      hasMeeting: false,
      title: '',
      date: '',
      time: '',
      location: '',
      duration: '',
      status: 'none'
    };

    // Action items extraction
    const actionItems = [];
    if (/schedule|find a time|availability/i.test(fullText)) {
      actionItems.push({ task: 'Check executive calendar availability', assignee: 'Assistant', completed: false });
      actionItems.push({ task: 'Send 2-3 available 30-min time options', assignee: 'Assistant', completed: false });
    }
    if (/sign|approve|review agreement/i.test(fullText)) {
      actionItems.push({ task: 'Review contract terms and flag clauses', assignee: 'Client', completed: false });
      actionItems.push({ task: 'Provide formal approval or return redlines', assignee: 'Client', completed: false });
    }
    if (/send.*(deck|files|document|information)/i.test(fullText)) {
      actionItems.push({ task: 'Attach and send requested materials', assignee: 'Assistant', completed: false });
    }
    if (actionItems.length === 0) {
      actionItems.push({ task: 'Review communication and file if no action required', assignee: 'Assistant', completed: false });
    }

    return { detectedMeeting, actionItems };
  }

  /**
   * Generates a professional draft response based on selected tone
   */
  generateDraftReply(thread, tone = 'professional') {
    const latestMessage = thread.messages && thread.messages.length > 0
      ? thread.messages[thread.messages.length - 1]
      : { sender: 'there', body: '' };
    const senderName = latestMessage.sender ? latestMessage.sender.split(' ')[0] : 'there';
    const clientName = thread.clientName || 'Sarah';
    const assistantName = 'Alex (Executive Assistant)';

    let reply = '';

    switch (tone.toLowerCase()) {
      case 'concise':
      case 'direct':
        reply = `Hi ${senderName},\n\nThanks for reaching out. We have reviewed your note regarding ${thread.subject.replace(/^(re:|fwd:)\s*/i, '')}.\n\nWe are on board with the proposed steps and will follow up with the finalized details shortly.\n\nBest regards,\n${clientName}`;
        break;

      case 'scheduling':
      case 'calendar':
        reply = `Hi ${senderName},\n\nThanks for contacting ${clientName}. I help manage ${clientName}'s calendar and communications.\n\n${clientName} would be glad to connect. Here are a couple of open time slots for a 30-minute call next week:\n\n• Tuesday at 2:00 PM EST\n• Wednesday at 11:30 AM EST\n• Thursday at 4:00 PM EST\n\nPlease let me know if any of these work for you, and I will promptly send a calendar invitation with Zoom details.\n\nBest,\n${assistantName} on behalf of ${clientName}`;
        break;

      case 'warm':
      case 'friendly':
        reply = `Hi ${senderName},\n\nHope you're having a great week! Thanks so much for sending this over.\n\nI really appreciate the update on ${thread.subject.replace(/^(re:|fwd:)\s*/i, '')}. Everything looks exciting and well-aligned with our goals. Let's touch base soon to finalize the next steps.\n\nWarmly,\n${clientName}`;
        break;

      case 'decline':
        reply = `Hi ${senderName},\n\nThank you for thinking of ${clientName} and sharing this opportunity.\n\nUnfortunately, due to current commitments and bandwidth constraints, ${clientName} is unable to participate at this time. We truly appreciate you reaching out and wish you continued success with the initiative.\n\nBest regards,\n${assistantName} for ${clientName}`;
        break;

      case 'professional':
      default:
        reply = `Hi ${senderName},\n\nThank you for your email regarding ${thread.subject.replace(/^(re:|fwd:)\s*/i, '')}.\n\nWe have received your message and are currently reviewing the details. We will provide a comprehensive response by end of day tomorrow.\n\nPlease don't hesitate to let us know if there are any urgent points in the interim.\n\nSincerely,\n${clientName}`;
        break;
    }

    return {
      text: reply,
      tone,
      generatedAt: new Date(),
      status: 'draft'
    };
  }

  /**
   * Copilot Query Processor ("Ask AI about inbox")
   */
  answerQuery(query, allThreads = []) {
    const q = query.toLowerCase();

    // 1. "Show me emails that need my attention" / "Emails requiring attention"
    if (q.includes('need my attention') || q.includes('need attention') || q.includes('client attention') || q.includes('client to reply')) {
      const clientEmails = allThreads.filter(t => t.classification === 'Client to Reply' && !t.isCompleted);
      const list = clientEmails.slice(0, 5).map(t => `• **${t.sender.name}**: "${t.subject}" — _${t.reasoning}_`).join('\n');
      return {
        answer: `You have **${clientEmails.length} emails** that require personal executive attention:\n\n${list}\n\nWould you like me to open any of these or draft a preliminary response?`,
        suggestedActions: clientEmails.map(t => ({ label: `Open "${t.subject.slice(0, 24)}..."`, threadId: t.threadId }))
      };
    }

    // 2. "What am I waiting for a response on?" / "Waiting for response"
    if (q.includes('waiting for a response') || q.includes('pending response') || q.includes('waiting')) {
      const waiting = allThreads.filter(t => t.waitingForResponse || t.category === 'Follow-up');
      const list = waiting.slice(0, 5).map(t => `• **${t.sender.name}**: "${t.subject}" — last message sent ${new Date(t.updatedAt || Date.now()).toLocaleDateString()}`).join('\n');
      return {
        answer: `You are currently waiting for replies on **${waiting.length} conversations**:\n\n${list}\n\nI can prepare a gentle follow-up email for any of these if you wish.`,
        suggestedActions: waiting.map(t => ({ label: `Follow up with ${t.sender.name}`, threadId: t.threadId }))
      };
    }

    // 3. "Summarize this conversation" / specific summary request
    if (q.includes('summarize') || q.includes('summary')) {
      const sample = allThreads[0];
      return {
        answer: sample 
          ? `**Executive Summary for "${sample.subject}"**:\n\n${sample.summary}\n\n**Key Takeaways:**\n${(sample.keyPoints || []).map(p => `• ${p}`).join('\n')}\n\n**Current Responsibility:** ${sample.classification} (${sample.confidence}% confidence)`
          : 'Please select a conversation thread from the inbox to generate a live thread summary.',
        suggestedActions: sample ? [{ label: 'View Thread', threadId: sample.threadId }] : []
      };
    }

    // 4. "Why has this email been assigned to the client?"
    if (q.includes('why') && (q.includes('assigned') || q.includes('client'))) {
      const clientEmail = allThreads.find(t => t.classification === 'Client to Reply') || allThreads[0];
      return {
        answer: clientEmail 
          ? `The email **"${clientEmail.subject}"** from **${clientEmail.sender.name}** was routed to **Client to Reply** because:\n\n> "${clientEmail.reasoning}"\n\nAI confidence score is **${clientEmail.confidence}%**. As an assistant, you can manually re-assign it to yourself or another category at any time using the override badge.`
          : 'Emails are assigned to the Client when they contain sensitive business decisions, legal sign-offs, personal approvals, or direct requests for the client’s personal input.',
        suggestedActions: clientEmail ? [{ label: 'Inspect Email', threadId: clientEmail.threadId }] : []
      };
    }

    // 5. "Draft a reply"
    if (q.includes('draft') || q.includes('reply')) {
      const target = allThreads.find(t => t.classification === 'Assistant to Reply') || allThreads[0];
      const draft = this.generateDraftReply(target || { subject: 'Inquiry', messages: [] }, 'scheduling');
      return {
        answer: `I have prepared a draft reply for **"${target ? target.subject : 'Latest Thread'}"**:\n\n\`\`\`text\n${draft.text}\n\`\`\`\n\nYou can review, edit, or approve this draft before it is dispatched.`,
        suggestedActions: target ? [{ label: 'Open in Composer', threadId: target.threadId }] : []
      };
    }

    // 6. Generic conversational intelligence
    const totalCount = allThreads.length;
    const assistantCount = allThreads.filter(t => t.classification === 'Assistant to Reply').length;
    const clientCount = allThreads.filter(t => t.classification === 'Client to Reply').length;
    const meetingCount = allThreads.filter(t => t.detectedMeeting && t.detectedMeeting.hasMeeting).length;

    return {
      answer: `Here is the current state of the executive inbox:\n\n• **Total Active Threads:** ${totalCount}\n• **Assigned to Assistant:** ${assistantCount}\n• **Requiring Client Review:** ${clientCount}\n• **Upcoming Meetings Detected:** ${meetingCount}\n\nYou can ask me to draft responses, show priority items, summarize threads, or list what you are waiting on.`,
      suggestedActions: [
        { label: 'Show Client Priorities', query: 'Show me emails that need my attention' },
        { label: 'Check Waiting List', query: 'What am I waiting for a response on?' },
        { label: 'Upcoming Meetings', query: 'What meetings are scheduled?' }
      ]
    };
  }
}

export const aiEngine = new MayaAIEngine();
