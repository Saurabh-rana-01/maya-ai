# Maya AI — Executive Email Management Dashboard
> **AI Full-Stack Engineer Intern Assignment Prototype**  
> Built for Personal Assistants & Executives managing high-volume, multi-account communications.

[![Node.js Version](https://img.shields.io/badge/Node.js-v18%2B%20%7C%20v20%2B%20%7C%20v22-brightgreen)](https://nodejs.org/)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20Tailwind%20CSS%20%7C%20Node.js%20%7C%20Express-blue)]()
[![AI Engine](https://img.shields.io/badge/AI%20Engine-NLP%20Heuristics%20%2B%20LLM%20Classification-purple)]()
[![Zero-Dependency Launch](https://img.shields.io/badge/Instant%20Run-1--Click%20start.bat-orange)]()

---

## 🌟 Executive Summary & Product Vision

Personal assistants to executives and high-net-worth individuals face a critical bottleneck: **drowning in hundreds of inbound emails daily across multiple client accounts**. 

Critical board approvals and term sheets get buried under routine scheduling requests, newsletters, and receipts. Missing an urgent client decision can cost millions, yet personal assistants spend 70% of their day manually sorting messages, coordinating calendars, and drafting routine replies.

**Maya AI** introduces an intelligent triage and collaboration system that unites the **Personal Assistant** and the **Client**:
1. **Intelligent Inbound Triage**: Categorizes every incoming thread into **Assistant to Reply**, **Client to Reply**, or **No Reply Needed** with explicit reasoning and confidence scores.
2. **Minimalistic Executive Portal ("Client Zen View")**: Executives see only the high-stakes decisions requiring their personal judgment, free from routine noise.
3. **One-Click Delegation & Closure**: Clients can mark an item handled, take personal ownership, or hand it over to their assistant with a single click and custom instructions.
4. **AI-Powered Draft Assistant**: Prepares tone-aware replies (`Scheduling`, `Direct`, `Warm`, `Decline`, `Professional`) ready for assistant review and approval.
5. **Interactive Copilot ("Ask Maya AI")**: Natural language conversational drawer that answers complex inbox questions and surfaces action items instantly.

---

## 🎯 Feature Matrix vs. Assignment Requirements

| Requirement | Description | Status in Maya AI |
|---|---|:---:|
| **1. Multi-Account Onboarding** | Connect Google Workspace & Microsoft 365, track active sync status | ✅ **Implemented** (Interactive modal, OAuth simulation, sync states) |
| **2. Assistant Dashboard** | Central workspace with KPI cards, quick search, smart inbox filters | ✅ **Implemented** (6 KPI cards, 7 smart inboxes, category filters) |
| **3. AI Reply Classification** | `Assistant to Reply`, `Client to Reply`, `No Reply Needed` | ✅ **Implemented** (Heuristic NLP + confidence % + rationale) |
| **4. Manual Assistant Override** | Allow assistant to correct AI classification with audit reason | ✅ **Implemented** (1-click dropdown reclassification) |
| **5. Minimalistic Client Portal** | Dedicated distraction-free view showing only "Client to Reply" | ✅ **Implemented** (Zen View with "Why input needed" rationale) |
| **6. Client Delegation & Actions** | "I'll Handle This", "Hand over to Assistant", "Mark Handled" | ✅ **Implemented** (Instant sync + confetti completion) |
| **7. Conversation Thread View** | Back-and-forth message history, AI summary, key takeaways | ✅ **Implemented** (Clean timeline, executive summaries, takeaways) |
| **8. Action Items Checklist** | Detects follow-ups and tasks with assignees (Client vs Assistant) | ✅ **Implemented** (Interactive checklist with completion toggles) |
| **9. Calendar / Meeting Detection** | Recognizes proposed dates, times, and creates calendar events | ✅ **Implemented** (Meeting widget with 1-click calendar accept) |
| **10. AI Draft Reply Assistant** | Generates tone-specific drafts (`Scheduling`, `Direct`, `Warm`, etc.) | ✅ **Implemented** (5 tone presets + custom instruction prompt) |
| **11. AI Copilot ("Ask Maya AI")** | Chat drawer answering natural language inbox questions | ✅ **Implemented** (Contextual AI assistant with clickable shortcuts) |
| **12. Live Inbound Simulator** | Evaluator tool to trigger incoming emails and watch live routing | ✅ **Implemented** (3 built-in realistic executive scenarios) |

---

## 🚀 Quick Start Guide

### Option 1: 1-Click Launch (Recommended for Windows)
Simply double-click the included batch script in the root directory:
```bash
start.bat
```
*This starts the local Node.js server on port 5000 and automatically opens your default browser at `http://localhost:5000`.*

### Option 2: Command Line (Cross-Platform)
Make sure you have **Node.js** (v18 or higher) installed, then run:
```bash
# In the project root:
node server/server.js
```
Then open [http://localhost:5000](http://localhost:5000) in your browser.

> **💡 Zero-Dependency Resilience**: The backend was purposefully architected using Node.js built-in modules (`node:http`, `node:crypto`, `node:fs`, `node:path`), meaning **no external npm install is required** to evaluate the complete interactive application!

---

## 🏗️ System Architecture & Codebase Structure

```
Maya/
├── client/                     # Modular React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx             # Top bar, client switcher, dual-view toggle
│   │   │   ├── Sidebar.jsx            # Smart inboxes & executive status
│   │   │   ├── StatCard.jsx           # Metric KPI cards
│   │   │   ├── EmailList.jsx          # Email thread cards with AI badges
│   │   │   ├── ConversationView.jsx   # Message history, AI insights, draft composer
│   │   │   ├── ClientPortal.jsx       # Zen Minimalist Executive Portal
│   │   │   ├── AICopilotDrawer.jsx    # "Ask Maya AI" natural language copilot
│   │   │   ├── InboundSimulatorModal.jsx # Real-time evaluator inbound test tool
│   │   │   ├── OnboardingModal.jsx    # OAuth multi-account connection modal
│   │   │   └── Icons.jsx              # Vector SVG icon library
│   │   ├── services/
│   │   │   └── api.js                 # Unified REST client with fallback
│   │   ├── App.jsx                    # Primary React application controller
│   │   ├── main.jsx                   # React root entry
│   │   └── index.css                  # Tailwind styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── public/
│   └── index.html              # Standalone production build (Zero-dependency ready)
│
├── server/                     # Backend API & AI Intelligence Engine
│   ├── services/
│   │   └── aiEngine.js         # NLP classification, summary generation, Q&A copilot
│   ├── routes/
│   │   └── api.js              # REST endpoints for emails, accounts, and AI
│   ├── db.js                   # High-performance in-memory database with pre-seeded data
│   ├── server.js               # Zero-dependency HTTP server & static file host
│   └── package.json
│
├── start.bat                   # 1-Click Windows launch script
├── start.sh                    # 1-Click macOS / Linux launch script
├── DEMO_WALKTHROUGH.md         # Evaluator walkthrough guide & video presentation script
└── README.md                   # This documentation
```

---

## 🧠 AI Classification Engine Details

The classification engine (`server/services/aiEngine.js`) inspects thread subjects, full message chronology, sender headers, and inbound intent:

### 1. `Client to Reply` (Amber Badge)
- **Criteria**: High-stakes approvals, executive signatures, term sheets, legal agreements, board governance, strategy decisions, personnel compensation, and sensitive communications.
- **Example**: *"Marcus Vance (Sequoia Capital) requires Sarah’s personal approval on Section 4 protective provisions of the $45M Series B term sheet before today’s close."*
- **Action**: Routes directly to the executive's Zen Portal with an explicit explanation of why input is required.

### 2. `Assistant to Reply` (Purple Badge)
- **Criteria**: Meeting scheduling, calendar rescheduling, logistics, travel itineraries, document forwarding (pitch decks, one-pagers), vendor follow-ups, and routine administrative requests.
- **Example**: *"Meeting scheduling or calendar coordination that can be handled by the assistant."*
- **Action**: Pre-populates the AI Reply Composer with scheduling availability and highlights detected calendar items.

### 3. `No Reply Needed` (Slate Badge)
- **Criteria**: Automated system notifications, cloud billing receipts, weekly digest newsletters, order confirmations, and already resolved threads ("Thanks!", "Noted").
- **Example**: *"Monthly AWS cloud billing digest receipt with auto-payment confirmation."*

---

## 📱 Dual-View User Experience

### 1. Assistant Workspace
- **Complete Visibility**: View all connected inboxes (Google Workspace, Microsoft 365).
- **Executive Metrics**: Instant counts of Unread, Assistant-assigned, Client-assigned, Pending Actions, and Meetings.
- **Manual AI Override**: Assistants can override any AI decision via a 1-click dropdown if business context requires.
- **AI Draft Reply Assistant**: Generates contextual draft replies with tone controls (`Scheduling`, `Direct`, `Warm`, `Decline`, `Professional`) and editable previews.

### 2. Client Zen View (Executive Mode)
- **Zero Distraction**: Shows **strictly** threads classified as `Client to Reply`.
- **Context-First**: Highlights an explicit **"Why Maya AI Flagged This for You"** callout box for every email.
- **Three Core Executive Actions**:
  1. **Mark Handled**: 1-click completion with celebration animation that syncs back to the assistant dashboard.
  2. **I'll Handle This**: Takes immediate ownership, clearing it from the assistant's queue.
  3. **Hand Over to Assistant**: Allows the client to delegate back to the assistant with preset instructions (*"Please draft a polite decline"*, *"Please schedule a 30-min Zoom next Wednesday"*) or custom notes.

---

## 🧪 Real-Time Evaluator Inbound Simulator

To test the AI live without waiting for real incoming emails:
1. Click the green **"Simulate Inbound"** button in the top navigation.
2. Choose one of three realistic executive scenarios:
   - **Executive Legal Sign-Off**: Tests `$45M Series B term sheet addendum` &rarr; Routes to **Client to Reply** (97% confidence).
   - **Meeting Reschedule Request**: Tests `Design review sync` &rarr; Routes to **Assistant to Reply** (95% confidence) + flags Calendar Meeting.
   - **Automated Cloud Invoice**: Tests `AWS billing digest` &rarr; Routes to **No Reply Needed** (99% confidence).
3. Click **"Inject Incoming Email"** to watch the inbox dynamically update, play notification sound/visual cues, and select the newly classified thread.

---

## 💬 Natural Language AI Copilot ("Ask Maya AI")

Click **"Ask Maya AI"** in the top navigation to open the slide-over assistant. Try asking:
- *"Show me emails that need my attention"* &rarr; Lists executive items with clickable links.
- *"What am I waiting for a response on?"* &rarr; Identifies pending follow-ups and unreplied outbound emails.
- *"Why is the Sequoia email assigned to the client?"* &rarr; Explains the underlying governance and signature rationale.
- *"Summarize the priority inbox"* &rarr; Provides an executive breakdown of active threads and scheduled meetings.

---

## 📋 Evaluation & Submission Information

- **Role**: AI Full-Stack Engineer Intern
- **Project**: Maya AI (Personal Assistant – AI-Powered Email Management Dashboard)
- **Demo Script**: See [DEMO_WALKTHROUGH.md](file:///c:/Users/saurabh%20kumar%20rana/Maya/DEMO_WALKTHROUGH.md) for the complete 3-minute video presentation transcript and evaluation checklist.
- **Telegram Group Submission**: Share demo video and repo link to `https://t.me/+B7cJKfuWp7E5MjA1`.
