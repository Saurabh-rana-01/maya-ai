import crypto from 'crypto';
import { aiEngine } from './services/aiEngine.js';

const uuidv4 = () => crypto.randomUUID();

// Connected Email Accounts In-Memory / Mongoose Store
export const accounts = [
  {
    id: 'acc-1',
    provider: 'google',
    email: 'sarah.jenkins@horizon-ventures.com',
    name: 'Sarah Jenkins (Primary Executive)',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    syncStatus: 'active',
    lastSynced: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
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
    lastSynced: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    totalThreads: 4,
    isDefault: false
  }
];

// Initial Seed Data for Realistic Inbox
const initialSeedEmails = [
  {
    threadId: 'th-101',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Series B Lead Terms & Board Governance Agreement',
    sender: {
      name: 'Marcus Vance',
      email: 'm.vance@sequoia-capital.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-1',
        sender: 'Marcus Vance',
        senderEmail: 'm.vance@sequoia-capital.com',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        body: 'Sarah,\n\nOur investment committee met this morning and approved the proposed $45M Series B term sheet for Horizon portfolio co "HyperScale".\n\nWe need your personal sign-off on Section 4 (protective provisions and the 1:1 voting threshold for subsequent rounds) before we distribute to legal counsel.\n\nCould you please review the attached redlines and let me know if you approve this structure so we can finalize today?\n\nBest,\nMarcus Vance\nGeneral Partner, Sequoia Capital',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'Client to Reply',
    confidence: 97,
    reasoning: 'Critical legal & governance approval: Sender explicitly requests Sarah’s personal sign-off on Section 4 protective provisions of the $45M Series B term sheet.',
    isOverridden: false,
    overrideReason: '',
    category: 'Approval',
    priority: 'high',
    isImportant: true,
    isRead: false,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: false,
    actionRequired: true,
    summary: 'Marcus Vance (Sequoia Capital) requires Sarah’s personal approval on Section 4 (voting thresholds and protective provisions) for the $45M Series B term sheet.',
    keyPoints: [
      'Investment committee approved $45M Series B',
      'Requires Sarah’s personal approval on Section 4 protective provisions',
      'High urgency: needs sign-off today before legal distribution'
    ],
    actionItems: [
      { task: 'Review Section 4 voting provisions on Series B term sheet', assignee: 'Client', completed: false },
      { task: 'Send approval confirmation or requested changes to Marcus', assignee: 'Client', completed: false }
    ],
    detectedMeeting: {
      hasMeeting: false,
      title: '',
      date: '',
      time: '',
      location: '',
      duration: '',
      status: 'none'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'none',
      generatedAt: null
    },
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-102',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Quarterly Strategy Sync & Coffee Next Week',
    sender: {
      name: 'Elena Rostova',
      email: 'elena.rostova@lattice-ai.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-2',
        sender: 'Elena Rostova',
        senderEmail: 'elena.rostova@lattice-ai.com',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        body: 'Hi Sarah,\n\nHope all is thriving! It was wonderful bumping into you at the AI Founders Dinner last Thursday.\n\nI’d love to connect for 30 minutes next week to sync on enterprise adoption trends and share a sneak peek of our Q4 multi-agent roadmap. Either in-person coffee around South Park or a quick Zoom call would be fantastic.\n\nCould your assistant help find 30 mins that fit your schedule?\n\nWarmly,\nElena Rostova\nVP Product & AI, Lattice',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'Assistant to Reply',
    confidence: 96,
    reasoning: 'Routine meeting scheduling: Counterparty explicitly requests coordinating 30 minutes through Sarah’s assistant.',
    isOverridden: false,
    overrideReason: '',
    category: 'Scheduling',
    priority: 'high',
    isImportant: true,
    isRead: true,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: false,
    actionRequired: true,
    summary: 'Elena Rostova is requesting a 30-minute meeting or coffee next week to discuss enterprise AI adoption and Q4 product roadmap.',
    keyPoints: [
      'Follow-up from AI Founders Dinner',
      'Requests 30-min meeting (Coffee or Zoom)',
      'Explicitly asks assistant to coordinate calendar time'
    ],
    actionItems: [
      { task: 'Check Sarah’s calendar availability for next week', assignee: 'Assistant', completed: false },
      { task: 'Send 2-3 open 30-min slots to Elena', assignee: 'Assistant', completed: false }
    ],
    detectedMeeting: {
      hasMeeting: true,
      title: 'Strategy Sync: Elena Rostova & Sarah Jenkins',
      date: 'Proposed next week (Tue-Thu)',
      time: '30 mins (e.g. 2:00 PM EST)',
      location: 'South Park Coffee or Zoom Video Call',
      duration: '30 mins',
      status: 'proposed'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: true,
      text: "Hi Elena,\n\nThanks for reaching out! I manage Sarah's calendar and communications.\n\nSarah would love to connect next week. Here are a couple of 30-minute options that work well on her calendar:\n\n• Tuesday, Nov 24th at 2:00 PM EST (Zoom or Blue Bottle South Park)\n• Wednesday, Nov 25th at 11:30 AM EST\n• Thursday, Nov 26th at 3:30 PM EST\n\nPlease let me know which of these aligns with your schedule, and I will send a calendar invite right away.\n\nBest regards,\nAlex | Executive Assistant to Sarah Jenkins",
      tone: 'scheduling',
      status: 'draft',
      generatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-103',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Confidential: VP Engineering candidate compensation package',
    sender: {
      name: 'Chloe Davis',
      email: 'c.davis@horizon-talent.com',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-3',
        sender: 'Chloe Davis',
        senderEmail: 'c.davis@horizon-talent.com',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        body: 'Hi Sarah,\n\nStrictly confidential: We have concluded final interviews for the VP of Engineering search. Candidate David Park (ex-Stripe) is our top choice.\n\nHis competing offer includes $380k base + 1.25% equity. We need your decision on whether to match this compensation tier or adjust the equity grant before issuing the formal offer letter tomorrow morning.\n\nPlease review and let me know your decision.\n\nBest,\nChloe Davis\nHead of Executive Recruiting',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'Client to Reply',
    confidence: 98,
    reasoning: 'Confidential executive compensation decision: Direct sign-off required from Sarah on $380k + equity package for VP Engineering candidate.',
    isOverridden: false,
    overrideReason: '',
    category: 'Approval',
    priority: 'high',
    isImportant: true,
    isRead: true,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: false,
    actionRequired: true,
    summary: 'Executive recruiter Chloe Davis requires Sarah’s decision on matching a $380k + 1.25% equity package for VP Engineering candidate David Park.',
    keyPoints: [
      'Top VP of Engineering finalist identified (David Park)',
      'Requires client decision on compensation package and equity match',
      'Deadline: Offer letter release scheduled for tomorrow morning'
    ],
    actionItems: [
      { task: 'Decide on compensation match ($380k + 1.25% equity)', assignee: 'Client', completed: false },
      { task: 'Send approval/guidance to Chloe Davis', assignee: 'Client', completed: false }
    ],
    detectedMeeting: {
      hasMeeting: false,
      title: '',
      date: '',
      time: '',
      location: '',
      duration: '',
      status: 'none'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'none',
      generatedAt: null
    },
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-104',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Vendor Agreement & W-9 Form for New Office Space',
    sender: {
      name: 'Arthur Pendelton',
      email: 'arthur@apex-facilities.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-4',
        sender: 'Arthur Pendelton',
        senderEmail: 'arthur@apex-facilities.com',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        body: 'Hello Sarah & Team,\n\nFollowing up on our lease finalization for Suite 900. Could you please have your office assistant forward your updated W-9 form and certificate of insurance (COI) so our property management team can issue access badges before month end?\n\nThank you,\nArthur Pendelton\nApex Property Group',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'Assistant to Reply',
    confidence: 94,
    reasoning: 'Administrative paperwork: Property manager requests standard W-9 form and COI insurance certificate which the assistant handles directly.',
    isOverridden: false,
    overrideReason: '',
    category: 'Administrative',
    priority: 'medium',
    isImportant: false,
    isRead: true,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: false,
    actionRequired: true,
    summary: 'Property management is requesting updated W-9 and Certificate of Insurance (COI) for Suite 900 building access badges.',
    keyPoints: [
      'Lease finalization follow-up for Suite 900',
      'Requests W-9 form and insurance certificate (COI)',
      'Assistant can directly attach files from shared drive'
    ],
    actionItems: [
      { task: 'Retrieve current W-9 and COI from company drive', assignee: 'Assistant', completed: false },
      { task: 'Reply to Arthur with attachments', assignee: 'Assistant', completed: false }
    ],
    detectedMeeting: {
      hasMeeting: false,
      title: '',
      date: '',
      time: '',
      location: '',
      duration: '',
      status: 'none'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: true,
      text: "Hi Arthur,\n\nAlex here from Sarah's office. Please find attached our company W-9 form and the updated Certificate of Insurance (COI) listing Apex Property Group as certificate holder.\n\nPlease let me know if you need any additional building documentation for the badge issuance.\n\nBest regards,\nAlex | Executive Assistant to Sarah Jenkins",
      tone: 'professional',
      status: 'draft',
      generatedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString()
    },
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-105',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Following up: Product Demo Architecture Notes',
    sender: {
      name: 'Liam Chen',
      email: 'liam@vertex-runtime.org',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-5a',
        sender: 'Liam Chen',
        senderEmail: 'liam@vertex-runtime.org',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        body: 'Sarah, sending over our technical architecture diagrams as discussed.',
        isFromClient: false,
        isFromAssistant: false
      },
      {
        id: 'msg-5b',
        sender: 'Sarah Jenkins',
        senderEmail: 'sarah.jenkins@horizon-ventures.com',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        body: 'Liam, reviewed the diagrams with our engineering partner. Could you run benchmarks on concurrent throughput under 10k requests/sec and send the telemetry log? Looking forward to seeing the numbers.',
        isFromClient: true,
        isFromAssistant: false
      }
    ],
    classification: 'No Reply Needed',
    confidence: 91,
    reasoning: 'Waiting for response: Sarah sent the last message requesting benchmark logs; currently waiting on Liam’s technical team.',
    isOverridden: false,
    overrideReason: '',
    category: 'Follow-up',
    priority: 'medium',
    isImportant: false,
    isRead: true,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: true,
    actionRequired: false,
    summary: 'Sarah sent follow-up inquiry asking Liam Chen for benchmark logs on 10k req/sec throughput. Awaiting counterparty reply.',
    keyPoints: [
      'Sarah sent outbound query 24 hours ago',
      'Requested concurrency benchmarks',
      'Pending response from Liam Chen’s team'
    ],
    actionItems: [
      { task: 'Ping Liam on Friday if benchmark logs not received', assignee: 'Assistant', completed: false }
    ],
    detectedMeeting: {
      hasMeeting: false,
      title: '',
      date: '',
      time: '',
      location: '',
      duration: '',
      status: 'none'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'none',
      generatedAt: null
    },
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-106',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Tech Leaders Weekly: Generative UI & Agentic Orchestration (#142)',
    sender: {
      name: 'Substack AI Radar',
      email: 'newsletter@airadar.substack.com',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-6',
        sender: 'Substack AI Radar',
        senderEmail: 'newsletter@airadar.substack.com',
        timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        body: 'Tech Leaders Weekly #142:\n\nThis week in AI: Multi-agent ecosystems, automated email classification architectures, and the evolution of executive personal assistants. Plus: 10 startups breaking $10M ARR in the agentic workflow era.\n\nTo manage your subscription or unsubscribe, click here.',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'No Reply Needed',
    confidence: 99,
    reasoning: 'Newsletter / Broadcast: Automated publication with no recipient question or reply expected.',
    isOverridden: false,
    overrideReason: '',
    category: 'Newsletter',
    priority: 'low',
    isImportant: false,
    isRead: true,
    isArchived: false,
    isCompleted: true,
    waitingForResponse: false,
    actionRequired: false,
    summary: 'Automated weekly edition of Substack AI Radar covering multi-agent ecosystems and executive workflows.',
    keyPoints: [
      'Weekly tech publication',
      'No action or response needed',
      'Auto-marked as completed/informational'
    ],
    actionItems: [],
    detectedMeeting: {
      hasMeeting: false,
      title: '',
      date: '',
      time: '',
      location: '',
      duration: '',
      status: 'none'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'none',
      generatedAt: null
    },
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-107',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Keynote Invitation: Future of Frontier Models Summit (NYC)',
    sender: {
      name: 'Julian Vance',
      email: 'julian@globaltechsummit.org',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-7',
        sender: 'Julian Vance',
        senderEmail: 'julian@globaltechsummit.org',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        body: 'Dear Sarah,\n\nOn behalf of the advisory committee, we would be deeply honored to invite you as an Opening Keynote Speaker for the Frontier Models Summit on Dec 14th in New York City.\n\nWe have reserved a 25-minute fireside chat slot for you alongside DeepMind leadership. Given your prominent work backing frontier AI infrastructure, we know your perspective would be invaluable.\n\nCould you please let us know if you are open to delivering this keynote?\n\nSincerely,\nJulian Vance\nConference Chairman',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'Client to Reply',
    confidence: 93,
    reasoning: 'High-profile public engagement: Personal keynote invitation requiring Sarah’s decision on whether to accept the Dec 14th summit appearance.',
    isOverridden: false,
    overrideReason: '',
    category: 'Approval',
    priority: 'high',
    isImportant: true,
    isRead: false,
    isArchived: false,
    isCompleted: false,
    waitingForResponse: false,
    actionRequired: true,
    summary: 'Julian Vance invites Sarah to be the Opening Keynote Speaker for the Frontier Models Summit in NYC on Dec 14th.',
    keyPoints: [
      'Opening Keynote invitation (25-min fireside slot)',
      'Date: December 14th in NYC with DeepMind leadership',
      'Client decision needed on accepting the speaking engagement'
    ],
    actionItems: [
      { task: 'Client decision: Accept or decline keynote speaking invitation', assignee: 'Client', completed: false },
      { task: 'If accepted, coordinate travel & logistics with Julian', assignee: 'Assistant', completed: false }
    ],
    detectedMeeting: {
      hasMeeting: true,
      title: 'Keynote: Frontier Models Summit (NYC)',
      date: 'December 14th',
      time: '9:00 AM EST',
      location: 'Lincoln Center, New York City',
      duration: '25 mins keynote + Q&A',
      status: 'proposed'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'none',
      generatedAt: null
    },
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString()
  },
  {
    threadId: 'th-108',
    clientAccount: 'sarah.jenkins@horizon-ventures.com',
    clientName: 'Sarah Jenkins',
    clientTitle: 'Managing Partner',
    subject: 'Flight Confirmation: San Francisco (SFO) to New York (JFK)',
    sender: {
      name: 'Delta Air Lines',
      email: 'ticketreceipt@delta.com',
      avatar: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&auto=format&fit=crop&q=80'
    },
    recipients: ['sarah.jenkins@horizon-ventures.com'],
    messages: [
      {
        id: 'msg-8',
        sender: 'Delta Air Lines',
        senderEmail: 'ticketreceipt@delta.com',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        body: 'Booking Confirmation: DL-884291\n\nPassenger: Jenkins, Sarah\nDeparture: Dec 12, 8:15 AM PST (SFO Terminal 2)\nArrival: Dec 12, 4:45 PM EST (JFK Terminal 4)\nSeat: 2A (First Class)\n\nThank you for flying with Delta.',
        isFromClient: false,
        isFromAssistant: false
      }
    ],
    classification: 'No Reply Needed',
    confidence: 99,
    reasoning: 'Travel receipt and booking confirmation: Stored for executive travel calendar tracking.',
    isOverridden: false,
    overrideReason: '',
    category: 'Informational',
    priority: 'low',
    isImportant: false,
    isRead: true,
    isArchived: false,
    isCompleted: true,
    waitingForResponse: false,
    actionRequired: false,
    summary: 'Delta Airlines flight confirmation DL-884291 for Sarah Jenkins (SFO to JFK on Dec 12, 8:15 AM PST).',
    keyPoints: [
      'Flight confirmed: SFO to JFK on Dec 12',
      'Departure: 8:15 AM PST, Seat 2A',
      'Assistant can sync with master travel itinerary'
    ],
    actionItems: [
      { task: 'Add flight times and locator DL-884291 to Sarah’s master calendar', assignee: 'Assistant', completed: true }
    ],
    detectedMeeting: {
      hasMeeting: true,
      title: 'Flight DL-884291 (SFO to JFK)',
      date: 'Dec 12th',
      time: '8:15 AM PST',
      location: 'SFO Terminal 2 -> JFK Terminal 4',
      duration: '5h 30m',
      status: 'confirmed'
    },
    clientStatus: {
      viewedByClient: false,
      clientActionTaken: 'none',
      clientNotes: ''
    },
    draftReply: {
      hasDraft: false,
      text: '',
      tone: 'professional',
      status: 'none',
      generatedAt: null
    },
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  }
];

// In-Memory Database Store mimicking Mongo Collections
class InMemoryDB {
  constructor() {
    this.emails = JSON.parse(JSON.stringify(initialSeedEmails));
    this.accounts = JSON.parse(JSON.stringify(accounts));
  }

  async getAllEmails(filter = {}) {
    let result = [...this.emails];

    if (filter.clientAccount) {
      result = result.filter(e => e.clientAccount === filter.clientAccount);
    }
    if (filter.classification && filter.classification !== 'All') {
      result = result.filter(e => e.classification === filter.classification);
    }
    if (filter.category && filter.category !== 'All') {
      result = result.filter(e => e.category === filter.category);
    }
    if (filter.isArchived !== undefined) {
      result = result.filter(e => e.isArchived === filter.isArchived);
    }
    if (filter.isImportant) {
      result = result.filter(e => e.isImportant);
    }
    if (filter.waitingForResponse) {
      result = result.filter(e => e.waitingForResponse);
    }
    if (filter.hasMeeting) {
      result = result.filter(e => e.detectedMeeting && e.detectedMeeting.hasMeeting);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(e => 
        e.subject.toLowerCase().includes(q) ||
        e.sender.name.toLowerCase().includes(q) ||
        e.sender.email.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q)
      );
    }

    // Sort by recent updatedAt
    return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  async getEmailById(threadId) {
    return this.emails.find(e => e.threadId === threadId) || null;
  }

  async updateEmail(threadId, updates) {
    const index = this.emails.findIndex(e => e.threadId === threadId);
    if (index === -1) return null;
    this.emails[index] = {
      ...this.emails[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.emails[index];
  }

  async addEmail(emailData) {
    const threadId = emailData.threadId || `th-${Date.now()}`;
    const newEmail = {
      ...emailData,
      threadId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.emails.unshift(newEmail);
    return newEmail;
  }

  async getStats(clientAccount) {
    const currentEmails = clientAccount 
      ? this.emails.filter(e => e.clientAccount === clientAccount)
      : this.emails;

    const total = currentEmails.length;
    const unread = currentEmails.filter(e => !e.isRead && !e.isArchived).length;
    const important = currentEmails.filter(e => e.isImportant && !e.isArchived).length;
    const assistantToReply = currentEmails.filter(e => e.classification === 'Assistant to Reply' && !e.isCompleted && !e.isArchived).length;
    const clientToReply = currentEmails.filter(e => e.classification === 'Client to Reply' && !e.isCompleted && !e.isArchived).length;
    const noReplyNeeded = currentEmails.filter(e => e.classification === 'No Reply Needed' && !e.isArchived).length;
    const waitingForResponse = currentEmails.filter(e => e.waitingForResponse && !e.isArchived).length;
    const actionRequired = currentEmails.filter(e => e.actionRequired && !e.isCompleted && !e.isArchived).length;
    const meetingsCount = currentEmails.filter(e => e.detectedMeeting && e.detectedMeeting.hasMeeting && !e.isArchived).length;

    return {
      total,
      unread,
      important,
      assistantToReply,
      clientToReply,
      noReplyNeeded,
      waitingForResponse,
      actionRequired,
      meetingsCount
    };
  }

  async resetSeedData() {
    this.emails = JSON.parse(JSON.stringify(initialSeedEmails));
    return this.emails;
  }
}

export const db = new InMemoryDB();
