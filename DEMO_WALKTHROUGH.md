# Maya AI — Video Demo Walkthrough & Evaluator Guide
> **Interactive Script and Click-Path for Assignment Submission**  
> *Target Video Duration: 3 to 4 Minutes*

---

## 🎬 3-Minute Demo Video Script

### Segment 1: The Problem & Product Overview (0:00 - 0:45)
* **Visual**: Show the Maya AI Assistant Workspace (`http://localhost:5000`) with KPI stat cards, multi-account pills, and email threads list.
* **Speaker Script**:
  > "Hi everyone! Today I'm presenting **Maya AI**, an intelligent email management dashboard designed specifically for personal assistants managing client communication.
  >
  > Personal assistants to founders, executives, and high-net-worth individuals face a major challenge: they handle multiple email accounts where critical board sign-offs and legal term sheets get drowned in scheduling requests, newsletters, and receipts.
  >
  > Maya AI solves this by introducing an intelligent AI triage layer that automatically separates executive decisions from routine assistant tasks, paired with a dedicated minimalistic Client Zen View so clients only see what truly requires their input."

---

### Segment 2: Multi-Account Connection & Assistant Workspace (0:45 - 1:30)
* **Visual**:
  1. Click the account dropdown in the top header showing `Sarah Jenkins (Horizon Primary)` and `Apex Board (Microsoft 365)`.
  2. Click **"+ Connect Google / Microsoft 365"** to show the Onboarding modal.
  3. Close modal and review the top KPI cards: Total Active (8), Client to Reply (3), Assistant to Reply (2), Action Required (5), Meetings (3).
* **Speaker Script**:
  > "In the top navigation, you can see our multi-account manager. An assistant can manage both Google Workspace and Microsoft 365 inboxes from one unified interface, with live synchronization indicators.
  >
  > Across the top, our KPI stat bar immediately surfaces the current state of the client's inbox: how many emails need client review, how many the assistant can handle, pending actions, and upcoming detected meetings.
  >
  > On the left, our Smart Inboxes let the assistant slice the view instantly—for example, clicking 'Assistant to Reply' isolates routine operational items."

---

### Segment 3: Automatic AI Reply Classification & Manual Override (1:30 - 2:15)
* **Visual**:
  1. Click the first email thread: **"Series B Lead Terms & Board Governance Agreement ($45M)"** from Marcus Vance.
  2. Point out the **AI Intelligence Box**:
     - Classification badge: `Client to Reply` (97% confidence)
     - Routing Rationale: *"Critical legal & governance approval: Sender explicitly requests Sarah’s personal sign-off on Section 4 protective provisions..."*
     - Executive Summary, Key Takeaways, and Action Checklist.
  3. Click the classification dropdown in the header to show the **Manual Assistant Override**:
     - Change it to `Assistant to Reply` or back to `Client to Reply` to demonstrate instant override capability.
* **Speaker Script**:
  > "Let's inspect the AI routing engine in action. Maya AI analyzes the full conversation history, sender intent, and urgency.
  >
  > Here, Marcus Vance from Sequoia is asking for personal sign-off on a $45M Series B term sheet. Maya AI flags this as **Client to Reply** with a 97% confidence score, and provides a clear, natural-language explanation of why Sarah’s personal approval is needed.
  >
  > But human oversight is crucial. If the assistant knows Sarah already verbally approved this during breakfast, the assistant can click the classification pill and manually override it to 'Assistant to Reply' or 'No Reply Needed' with one click."

---

### Segment 4: AI Reply Assistant & Calendar Integration (2:15 - 2:45)
* **Visual**:
  1. Click on the second email: **"Quarterly Strategy Sync & Coffee Next Week"** (Classified as `Assistant to Reply`).
  2. Show the detected calendar widget: *"Product Roadmap & Portfolio Review"*, Tuesday at 2:00 PM. Click **"Accept to Calendar"**.
  3. In the Draft Reply Assistant at the bottom, click the **"Scheduling"** tone pill, then **"Warm"**, then **"Direct"**.
  4. Click **"Approve & Send Reply"**. Notice the email thread automatically updates, marks resolved, and logs the outbound message.
* **Speaker Script**:
  > "When an email is assigned to the assistant—like this scheduling request from Elena—Maya AI automatically detects the proposed meeting date, time, and location, and offers a one-click button to add it to Sarah's calendar.
  >
  > At the bottom, our AI Reply Assistant drafts context-aware responses. The assistant can toggle tones like 'Scheduling', 'Direct', 'Warm', or 'Decline', add custom guidance, edit the text, and hit 'Approve & Send'. The outbound message is added to the thread and the status updates in real time."

---

### Segment 5: The Client Zen View (Executive Portal) (2:45 - 3:30)
* **Visual**:
  1. In the top view switcher, click **"Client Zen View"**.
  2. Point out the calm, distraction-free interface showing ONLY the items classified as `Client to Reply`.
  3. Highlight the amber callout: *"Why Maya AI Flagged This for You"*.
  4. Click **"Hand Over to Assistant..."** on one item:
     - Select preset instruction: *"Please schedule a 30-min Zoom next Wednesday afternoon"*.
     - Click **"Delegate to Assistant"**.
  5. On another item, click **"Mark Handled"** &rarr; Trigger the confetti animation and show the item resolved.
* **Speaker Script**:
  > "Now let's switch to the executive's perspective: the **Client Zen View**.
  >
  > Executives are busy and get easily overwhelmed. When Sarah opens Maya AI, she doesn't see newsletters or scheduling back-and-forths. She sees only what needs her personal decision.
  >
  > Each card prominently explains *why* her input is needed. From here, she has three simple actions:
  > - She can click 'I'll Handle This' to take personal ownership.
  > - She can click 'Hand Over to Assistant', choose a quick preset instruction like 'Please schedule a call', and delegate it right back to Alex.
  > - Or, once she finishes a review, she clicks 'Mark Handled'—triggering a satisfying completion animation—which instantly syncs back to the assistant's dashboard."

---

### Segment 6: Real-Time Inbound Simulator & AI Copilot (3:30 - 4:00)
* **Visual**:
  1. Click **"Simulate Inbound"** in the top bar. Select "Executive Legal Sign-Off" and click **"Inject Incoming Email"**. Watch the new email arrive and classify live.
  2. Click **"Ask Maya AI"** in the top bar. Click the prompt pill: *"Show me emails that need my attention"* and click on the suggested thread link.
* **Speaker Script**:
  > "Finally, we built a live **Inbound Simulator** so evaluators can inject realistic incoming emails—like emergency board resolutions or billing receipts—and watch Maya AI categorize them in real time.
  >
  > We also include an interactive **AI Copilot** drawer where assistants and clients can ask questions in plain English—like 'What am I waiting on?' or 'Show me urgent approvals'—with instant clickable shortcuts.
  >
  > That is Maya AI: empowering personal assistants to manage executive communications with speed, confidence, and precision. Thank you!"

---

## 🧭 Evaluator Click-Path Checklist

Use this 6-step checklist to test all requirements in under 3 minutes:

1. **Launch the Prototype**:
   - Double-click `start.bat` (Windows) or run `node server/server.js` in terminal.
   - Open `http://localhost:5000`.

2. **Verify Assistant Workspace & KPIs**:
   - Notice the 6 stat cards at the top reflecting counts for Client, Assistant, Actions, and Meetings.
   - Click each Smart Inbox tab in the left sidebar (`Client to Reply`, `Assistant to Reply`, `Meetings Detected`) to verify filtering.

3. **Inspect AI Routing & Manual Override**:
   - Click the top email thread (*"Series B Lead Terms"*).
   - Check the **AI Intelligence Box**: observe the 97% confidence score and rationale.
   - In the top right, click the classification pill and change it to `Assistant to Reply`. Notice the `(Manual Assistant Override)` badge appear.

4. **Test AI Draft Replies**:
   - Select thread #2 (*"Quarterly Strategy Sync"*).
   - Scroll to the bottom AI Draft Reply Assistant.
   - Click `Direct`, `Scheduling`, or `Warm` to observe instant tone switching.
   - Click `Approve & Send Reply` and verify that the new message is appended to the conversation history.

5. **Test Client Zen View**:
   - In the top header switcher, click **Client Zen View**.
   - Confirm only "Client to Reply" items appear.
   - Click **"Hand Over to Assistant..."** on an item and delegate with instructions.
   - Click **"Mark Handled"** on an item and watch the celebration confetti trigger.

6. **Test Live Simulator & Copilot**:
   - Click **"Simulate Inbound"** &rarr; select an incoming scenario &rarr; click **"Inject Incoming Email"**.
   - Click **"Ask Maya AI"** &rarr; test natural language questions.
