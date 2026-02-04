# STOD Demo — User Acceptance Testing (UAT) Pack

This UAT pack is written for **business experts** (non-technical testers) to validate the STOD Demo product experience end-to-end on the **Vercel deployment**.

---

## 1) What you are testing (one line)
**A collaborative principle-authoring and review workspace**: search/read/save principles, propose new principles via Draft → Collaborate → Submit, manage collaboration via Inbox + Timeline, and review via Moderator/Admin.

---

## 2) Scope and how to use this document

### 2.1 In scope (what to test)
The app is organized into top-level tabs (navigation). This UAT validates:

- **Home**: landing page, “Continue as …”, sign in, sign up (demo)
- **Search**: search/sort/filter, open reader, favourites, “Not interested” hide flow
- **Favourites**: favourites list parity with Search and opening the reader
- **Tools**: Dissonance Matrix; Principle Map
- **Videos**: list, search/filter, view a video detail
- **Sessions**: calendar/list, book/cancel, “My bookings”
- **Propose**: draft creation and editing; workflow stages; collaboration settings; danger zone actions
- **Collaborate**: browse open drafts, request access, accept invites, open a draft
- **Inbox**: view notifications, unread/read, open the relevant draft
- **Review (Moderator/Admin)**: principle workflow stage transitions; annotation approvals; drafts oversight view
- **Users (Admin)**: user management CRUD
- **Credits**: credit balance UI + demo buttons
- **Forums**: create forum, register/unregister

### 2.2 Out of scope (what not to expect)
This is a **demo** and intentionally does **not** include:

- Real authentication / backend database
- True multi-user collaboration across different devices/browsers
- Email notifications, real-time push notifications
- Real payments

### 2.3 Critical demo constraint (must read)
This app uses browser **localStorage** for persistence. That means:

- **Data is stored in your browser** only (not server-side).
- To test collaboration between users (invite/accept/suggest), use **the same browser profile** and **switch users** by logging out and logging in as another demo user.
- If you open another browser (or Incognito), you will not see the same localStorage data unless you recreate it.

---

## 3) Test environment

### 3.1 Environment
Run UAT on the **Vercel deployment URL** provided by the product owner.

### 3.2 Recommended browser
- Primary: **Chrome** or **Microsoft Edge**

### 3.3 Evidence to capture for each test
For each test case:
- Screenshot on **PASS** only for key milestones
- Screenshot or screen recording on **FAIL**
- Copy/paste any **alert messages** (the demo uses alerts in some places)

---

## 4) Demo users (roles) and credentials

### 4.1 Current role model (important)
Earlier versions used **6 roles**. The app has been simplified to **4 role types**:
- **Non-subscriber**
- **Subscriber**
- **Moderator**
- **Admin**

### 4.2 Demo credentials
Use these credentials on the **Sign In** screen:

| Role | User | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Moderator | `moderator` | `moderator123` |
| Subscriber | `subscriber1` (Sam Subscriber 1) | `subscriber123` |
| Subscriber | `subscriber2` (Sid Subscriber 2) | `subscriber123` |
| Subscriber | `subscriber3` (Sana Subscriber 3) | `subscriber123` |
| Non-subscriber | `non` (Nina Non-subscriber) | `non123` |

---

## 5) How to produce the PDF deliverable (from the HTML)
This repository includes an HTML version intended for printing:

1. Open `uat/UAT.html` in a browser (Chrome/Edge)
2. Press **Ctrl+P** (Print)
3. Destination: **Save as PDF**
4. Paper size: A4 or Letter (either is fine)
5. Enable **Background graphics** (recommended)
6. Save as: `STOD-UAT-<date>.pdf`

---

## 6) Defect reporting template (copy/paste)

### Defect title
`[Area/Tab] Short description`

### Environment
- Vercel URL:
- Browser + version:
- Tester name:
- Date/time:

### Steps to reproduce
1.
2.
3.

### Expected result

### Actual result

### Evidence
- Screenshot/video:
- Console errors (if any):

### Severity (choose one)
- Blocker / High / Medium / Low

### Notes

---

## 7) Resetting the demo (when tests get “messy”)

### 7.1 Soft reset (recommended first)
- Log out
- Refresh the page
- Log back in

### 7.2 Hard reset (clears demo data in this browser)
You can clear local demo data using DevTools:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Left side: **Storage → Local Storage →** select the site origin
4. Delete these keys (if present):
   - `stod_user`
   - `stod_users`
   - `stod_principles`
   - `stod_principles_seed_version`
   - `stod_hidden_principles_by_user`
   - `stod_principle_drafts`
   - `stod_notifications_by_user`
   - `stod_principle_annotations`
   - `stod_videos`
   - `stod_sessions`
   - `stod_bookings`
   - `stod_forums`
5. Refresh the page

**Expected result:** the app returns to a clean demo state with seeded content.

---

## 8) Test execution log (summary table)
Use this table to track overall progress.

| Date | Tester | Build/URL | Total cases planned | Passed | Failed | Blocked | Notes |
|---|---|---|---:|---:|---:|---:|---|
|  |  |  |  |  |  |  |  |

---

## 9) Persona-based UAT scripts (role packs)

### 9.0 Universal rules for testers (applies to all roles)
- **Use one browser profile** for the full UAT run (do not jump between Incognito and normal windows).
- If a step says “switch user”, always use **Logout** then sign in as the next user.
- After creating a draft/suggestion/annotation, do a **page refresh** once if something doesn’t appear immediately.
- If the UI seems “stuck”, do a **soft reset** (logout → refresh → login) before doing a hard reset.

### 9.1 Non-subscriber UAT pack (Nina)
**Goal:** validate what is locked, what is allowed, and upsell messaging.

#### NS-01 — Sign in as Non-subscriber
- Steps:
  1. From Home, click **Sign In**
  2. Sign in as `non` / `non123`
- Expected:
  - You land in the dashboard
  - Role badge shows **Non-subscriber**
  - Navigation shows **Tools** and **Collaborate** in a disabled/locked state

#### NS-02 — Search and open allowed principles
- Steps:
  1. Go to **Search**
  2. Click a **Featured** principle card and open it
- Expected:
  - The principle opens in the **Advanced Reader**

#### NS-03 — Attempt to open a locked principle
- Steps:
  1. In Search, pick a non-featured principle (or one that appears locked)
  2. Click the card to open
- Expected:
  - An **Unlock** / upsell modal appears (you cannot open it as Non-subscriber)

#### NS-04 — Favourites are still visible (basic UX parity)
- Steps:
  1. From Search, click **Add to Favourites** on a featured principle
  2. Go to **Favourites**
  3. Click the saved principle to open it
- Expected:
  - It opens in Advanced Reader (if it’s not locked)
  - The button shows **In Favourites**

#### NS-05 — Collaborate is locked
- Steps:
  1. Click **Collaborate**
- Expected:
  - You see a locked message indicating collaboration requires **Subscriber+**

#### NS-06 — Tools are locked
- Steps:
  1. Click **Tools**
- Expected:
  - You see tools are locked for Non-subscribers (cannot open tools)

#### NS-07 — Propose: “Start collaborating” is disabled
- Steps:
  1. Go to **Propose**
  2. Create/open a draft
  3. Find the action to promote into **Collaborate** stage
- Expected:
  - The collaboration promotion action is **disabled** or clearly indicates collaboration is Subscriber+ only

---

### 9.2 Subscriber UAT pack (Sam/Sid/Sana)
**Goal:** validate collaboration (invites, requests), suggestions/comments, watch + inbox notifications, and stage transitions.

#### SUB-01 — Sign in as Subscriber (Sam)
- Steps:
  1. Sign in as `subscriber1` / `subscriber123`
- Expected:
  - **Collaborate** is enabled
  - **Inbox** shows a bell icon (count may be 0 at first)

#### SUB-02 — Create a draft (owner)
- Steps:
  1. Go to **Propose**
  2. Create a new draft
  3. Fill out fields (title/category/description/take-home/full text/hard questions)
  4. Save/update the draft
- Expected:
  - Draft appears under “My drafts”
  - Owner edits appear in the **Timeline** as Owner edits

#### SUB-03 — Open timeline drawer and close it (UX reliability)
- Steps:
  1. In the draft workspace, click **Timeline**
  2. Close via **X**
  3. Open again, close via clicking the **backdrop**
  4. Open again, close via **Esc**
- Expected:
  - Drawer opens and closes reliably via all three methods

#### SUB-04 — Enable “Open to collaborator requests”
- Steps:
  1. In the draft workspace (as owner), enable **Open this draft to collaborator requests**
- Expected:
  - The draft becomes visible under **Collaborate → Open drafts** for other subscribers (not the owner)

#### SUB-05 — Invite a subscriber (Sam invites Sid)
- Steps:
  1. Still as Sam (owner), go to Collaborate stage inside the draft
  2. In **Invite a subscriber**, select “Sid Subscriber 2”
  3. Click **Invite**
- Expected:
  - Sid receives an **Inbox notification** (Invite received)
  - The draft appears for Sid in **Collaborate → Invited**

#### SUB-06 — Switch user and accept invite (Sid)
- Steps:
  1. Log out
  2. Sign in as `subscriber2` / `subscriber123`
  3. Open **Collaborate**
  4. In **Invited**, click **Accept invite**
- Expected:
  - The draft moves to **Collaborating**
  - Sam receives a notification that the invite was accepted

#### SUB-07 — Create a suggestion (Sid)
- Steps:
  1. Open the invited draft
  2. In Suggestions, create a suggestion for a field (e.g., description)
  3. Add an optional note
  4. Submit
- Expected:
  - Suggestion appears as **Open**
  - Timeline logs **Suggestion created**
  - Watchers (owner at minimum) receive Inbox notifications

#### SUB-08 — Comment on a suggestion (Sid)
- Steps:
  1. Open the suggestion detail
  2. Add a comment
- Expected:
  - Comment appears in thread
  - Timeline logs **New comment**
  - Owner gets Inbox update

#### SUB-09 — Owner applies the suggestion (Sam)
- Steps:
  1. Log out, sign in as `subscriber1`
  2. Open the draft
  3. Select Sid’s suggestion
  4. Add optional review note
  5. Click **Apply**
- Expected:
  - Draft field updates to proposed value
  - Suggestion status becomes **Applied**
  - Timeline logs apply event
  - Sid receives notification “Suggestion applied”

#### SUB-10 — Decline requires a note (negative)
- Steps:
  1. As Sam, pick an open suggestion
  2. Try to click **Decline** without a note
- Expected:
  - Decline action is disabled or blocked until a note is provided

#### SUB-11 — “Watch / Watching”
- Steps:
  1. As Sid, click **Watch** on the draft
  2. Confirm the button toggles to **Watching**
  3. As Sam, make an owner edit
- Expected:
  - Sid receives an **Owner edit** notification in Inbox

#### SUB-12 — Promote stages and submit
- Steps:
  1. As Sam (owner), promote draft to **Ready to Submit**
  2. Go to **Submit** step
  3. Click **Submit to Moderator review**
- Expected:
  - Draft status becomes **SubmittedForReview**
  - Timeline logs stage transition
  - Draft becomes locked for dangerous actions

#### SUB-13 — Danger zone consistency (Draft / Collaborate / Submit)
- Steps:
  1. As Sam, open a draft
  2. Check the **Danger zone** block location in:
     - Draft stage
     - Collaborate stage
     - Submit stage
- Expected:
  - Danger zone appears at the **bottom** of the page content wherever it is shown

#### SUB-14 — “Open draft” from Inbox deep-links correctly
- Steps:
  1. Generate a notification (e.g., Sid makes a suggestion)
  2. Open **Inbox**
  3. Click **Open draft** on that notification
- Expected:
  - App navigates to **Propose** and opens the correct draft

#### SUB-15 — Version history (owner)
- Steps:
  1. As Sam (owner), open an active draft
  2. Click **History**
  3. Select a version; compare; restore a previous version (if restore is present)
- Expected:
  - Restore updates the draft fields
  - Timeline logs restore as an owner edit (or restore event)
  - Watchers get an “Owner edit” notification (if watching)

---

### 9.3 Moderator UAT pack (Sarah)
**Goal:** validate Review tab (principles workflow + annotations + drafts oversight).

#### MOD-01 — Sign in as Moderator
- Steps:
  1. Sign in as `moderator` / `moderator123`
- Expected:
  - **Review** tab is visible and accessible

#### MOD-02 — Draft oversight list + detail view
- Steps:
  1. Go to **Review**
  2. Switch to **Drafts** mode
  3. Select the draft created earlier
  4. Open the **Timeline** from the detail view
- Expected:
  - Draft list shows all drafts, sorted by updated time
  - Detail shows fields, suggestion counts, collaborator counts
  - Timeline drawer opens and closes

#### MOD-03 — Review principle workflow stage transitions
- Steps:
  1. In Review, open **Principles** mode
  2. Select an “In Process” principle
  3. Click the “Advance” action to move stage forward
- Expected:
  - Workflow stage advances (e.g., Proposed → Under Review, etc.)
  - Status changes to **Core Principles** once published

#### MOD-04 — Annotation approval (end-to-end)
- Setup:
  - As any user, open Advanced Reader and submit an annotation
- Steps:
  1. As Moderator, open **Review → Annotations**
  2. Select a pending annotation
  3. Approve it
- Expected:
  - Annotation moves to Approved
  - In Advanced Reader, the approved annotation appears under “Community annotations”

---

### 9.4 Admin UAT pack
**Goal:** validate User Management access and CRUD, plus everything in Moderator pack.

#### ADM-01 — Sign in as Admin
- Steps:
  1. Sign in as `admin` / `admin123`
- Expected:
  - **Users** tab is visible

#### ADM-02 — Create a user
- Steps:
  1. Go to **Users**
  2. Click **Add User**
  3. Enter username/name/email/status/role
  4. Save
- Expected:
  - User appears in the table
  - Role badge color matches role type

#### ADM-03 — Edit a user
- Steps:
  1. In Users, click edit icon on a user
  2. Change role (e.g., Subscriber → Non-subscriber)
  3. Save
- Expected:
  - Role updates in the table

#### ADM-04 — Delete a user
- Steps:
  1. In Users, click delete icon on a user
  2. Confirm deletion
- Expected:
  - User is removed from the table

---

## 10) Feature-by-feature UAT scripts (tab-by-tab)

### 10.0 Navigation + role gating (smoke)
#### NAV-01 — Tabs visible/enabled by role
- Steps:
  1. Sign in as Non-subscriber
  2. Record which tabs are enabled vs locked/disabled
  3. Sign in as Subscriber; repeat
  4. Sign in as Moderator; repeat
  5. Sign in as Admin; repeat
- Expected:
  - Non-subscriber: **Tools** and **Collaborate** are locked
  - Subscriber: Tools/Collaborate enabled; Review hidden; Users hidden
  - Moderator: Review enabled; Users hidden
  - Admin: Review enabled; Users enabled

### 10.1 Home / Landing
#### HOME-01 — Always lands on Home
- Steps:
  1. Open the Vercel URL in a fresh tab
- Expected:
  - You see the Landing (Home) page

#### HOME-02 — Continue as remembered user
- Steps:
  1. Sign in as any user
  2. Refresh the page
  3. Log out
  4. Return to Home
- Expected:
  - A **Continue as {name}** button appears

#### HOME-03 — “Not you?” clears remembered user
- Steps:
  1. Ensure you see “Continue as …”
  2. Click **Not you?**
- Expected:
  - Continue-as disappears
  - You can sign in as someone else without auto-resume

### 10.2 Search
#### SEARCH-01 — Search keyword
- Steps:
  1. Go to Search
  2. Type a keyword from a title/description
- Expected:
  - Results filter to matching items

#### SEARCH-02 — Sort options
- Steps:
  1. Change Sort to **Recency**
  2. Change Sort to **Popularity**
  3. Change Sort to **Title**
- Expected:
  - List order updates accordingly

#### SEARCH-03 — Filters (Author / Category / Featured)
- Steps:
  1. Pick an Author filter
  2. Pick a Category filter
  3. Enable Featured only
- Expected:
  - Only matching cards show

#### SEARCH-04 — Not interested (hide) + undo + Hidden list
- Steps:
  1. Open a card’s “…” menu
  2. Click **Not interested**
  3. Click **Undo** on toast (optional)
  4. Hide again, then open **Hidden (#)** and **Unhide**
- Expected:
  - Hidden items disappear from Search
  - Undo restores immediately
  - Hidden modal restores items

#### SEARCH-05 — Add to Favourites from Search
- Steps:
  1. On any Search card, click **Add to Favourites**
- Expected:
  - Button changes to **In Favourites**
  - The principle appears in Favourites tab

#### SEARCH-06 — Locked principle upsell (Non-subscriber only)
- Steps:
  1. Sign in as Non-subscriber
  2. Attempt to open a locked principle
  3. In the unlock modal, click “Become Subscriber” (demo)
- Expected:
  - The user’s role is updated to Subscriber in this browser
  - After role change, locked content becomes accessible

### 10.3 Favourites
#### FAV-01 — Favourites parity with Search
- Steps:
  1. Add any principle to favourites from Search
  2. Open Favourites
  3. Click the card
- Expected:
  - Card opens Advanced Reader (same behavior as Search)

#### FAV-02 — Remove from Favourites
- Steps:
  1. In Favourites, click **In Favourites** to toggle off
  2. Confirm it disappears from Favourites without requiring a page reload
- Expected:
  - Card is removed immediately

### 10.4 Advanced Reader + Annotations
#### READER-01 — Open reader and reveal content
- Steps:
  1. Open any principle in Advanced Reader
  2. Click **Click to reveal**
  3. Switch between Overview/Full/Take-home/Hard questions
- Expected:
  - Content reveals and switches correctly

#### READER-02 — Keyword search within a principle
- Steps:
  1. Type a word into “Keyword Search”
- Expected:
  - Highlighted matches appear, count shows

#### READER-03 — Submit an annotation
- Steps:
  1. With content revealed, click **Add annotation**
  2. Type a comment
  3. Submit for review
- Expected:
  - Confirmation alert appears
  - Annotation becomes pending for Moderator review

#### READER-04 — Approved annotations are visible (after Moderator approval)
- Steps:
  1. After MOD-04, reopen Advanced Reader for that principle
  2. Scroll to “Community annotations”
- Expected:
  - The approved annotation appears with author name and date

### 10.5 Tools
#### TOOLS-01 — Dissonance Matrix smoke
- Steps:
  1. Open Tools
  2. Open Dissonance Matrix
  3. Answer all questions
  4. View results; open sliders and adjust
- Expected:
  - Position shown; recommendations appear; reset works

#### TOOLS-02 — Principle Map smoke
- Steps:
  1. Open Principle Map
  2. Search for a node
  3. Click a node to focus; double click to open reader
  4. Click an edge to see “why these connect”
- Expected:
  - Map is interactive; reader opens from node

### 10.6 Videos
#### VIDEOS-01 — Search + filter + view detail
- Steps:
  1. Open Videos
  2. Search term; filter category
  3. Open a video
- Expected:
  - Detail screen shows placeholder player and metadata

### 10.7 Sessions
#### SESS-01 — Browse calendar and open session
- Steps:
  1. Open Sessions
  2. Click a day with a session
- Expected:
  - Session modal opens

#### SESS-02 — Book and cancel
- Steps:
  1. Book a session
  2. Confirm booking appears under “My bookings”
  3. Cancel booking
- Expected:
  - Booking and cancellation persist on refresh

### 10.8 Credits
#### CRED-01 — Credits wallet display
- Steps:
  1. Open Credits tab
- Expected:
  - Balance renders; purchase/cash out buttons show (demo actions)

### 10.9 Forums
#### FORUM-01 — Create forum and register/unregister
- Steps:
  1. Open Forums
  2. Create a new forum
  3. Register then unregister
- Expected:
  - Forum persists on refresh; registration toggles

---

## 11) End-to-end (golden path) scenarios

### E2E-01 — Full collaboration loop + submit + moderator oversight
- Actors:
  - Sam (Subscriber/Owner)
  - Sid (Subscriber/Collaborator)
  - Moderator (Reviewer)
- Steps:
  1. Sam creates a draft, enables open-to-requests, invites Sid
  2. Sid accepts invite, creates suggestion + comment
  3. Sam applies suggestion, marks ReadyToSubmit, submits to Moderator review
  4. Moderator verifies draft appears in Review → Drafts and opens timeline
- Expected:
  - Notifications appear in Inbox throughout
  - Timeline reflects actions
  - Draft becomes SubmittedForReview and locks dangerous actions

### E2E-02 — Request access flow
- Steps:
  1. Sam opens draft to requests
  2. Sana requests access from Collaborate → Open drafts
  3. Sam approves request
- Expected:
  - Sana can open draft and suggest
  - Owner receives access request notification

### E2E-03 — Annotation review loop
- Steps:
  1. Any user submits annotation in Advanced Reader
  2. Moderator approves it in Review → Annotations
  3. Any user sees it appear under “Community annotations”
- Expected:
  - Approved annotations are visible in Advanced Reader

---

## 12) Negative / edge case checklist
- Non-subscriber: Collaborate locked, Tools locked
- Owner cannot create suggestions (collaborators only)
- Decline suggestion requires note
- SubmittedForReview locks dangerous actions (archive/delete/restore should be blocked)
- Timeline drawer closes via X/backdrop/Esc reliably

---

## 13) Master test case index (for tracking)
Use this index to track coverage quickly (you can mark PASS/FAIL on paper/PDF).

- Home: HOME-01..03
- Navigation gating: NAV-01
- Search: SEARCH-01..06
- Favourites: FAV-01..02
- Reader/Annotations: READER-01..04
- Tools: TOOLS-01..02
- Videos: VIDEOS-01
- Sessions: SESS-01..02
- Credits: CRED-01
- Forums: FORUM-01
- Subscriber collaboration: SUB-01..15
- Moderator: MOD-01..04
- Admin: ADM-01..04
- E2E: E2E-01..03
- Negatives: checklist in §12

