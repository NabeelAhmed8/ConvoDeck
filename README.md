# ConvoDeck — WhatsApp CRM & Visual Sales Pipeline

> **Turn WhatsApp into your #1 Sales Machine.**  
> Built for small businesses, agencies, and high-velocity sales teams to centralize customer communication, automate lead capture, and track deals visually.

---

## 🚀 Key Features

1. **Unified WhatsApp Team Inbox (`/chat`)**
   - Single WhatsApp Business API number handled by multiple team agents simultaneously.
   - Live chat history, read receipts (`sent`, `delivered`, `read`), and customer CRM drawer.
   - Built-in simulation tool to mock incoming customer replies for instant testing.

2. **Visual Sales Pipeline / Kanban (`/kanban`)**
   - Drag-and-drop lead stages:
     - `New Inquiry` $\rightarrow$ `Contacted` $\rightarrow$ `Demo Scheduled` $\rightarrow$ `Proposal Sent` $\rightarrow$ `Closed Won 🎉` $\rightarrow$ `Lost`
   - Total pipeline value calculations & deal value tracking ($ / PKR).
   - Quick one-click transition to WhatsApp chat.

3. **Meta WhatsApp Cloud Webhook (`/api/webhook/whatsapp`)**
   - Verification handshake (`hub.challenge`) for Meta App Dashboard.
   - Auto-captures incoming messages and creates leads with `NEW` status automatically.
   - Updates message delivery statuses (`delivered`, `read`).

4. **Analytics Overview (`/dashboard`)**
   - Real-time KPIs: Total Leads, Pipeline Value, Won Revenue, and Unread Count.
   - Pipeline stage breakdown cards.
   - Recent incoming leads list with direct WhatsApp quick-actions.

5. **Dribbble-Style High-Converting Landing Page (`/`)**
   - Modern dark SaaS aesthetic showcasing the problem-solution fit.

---

## 🛠️ Tech Stack & Architecture

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Lucide Icons
- **Database:** MongoDB & Mongoose
- **State Management:** Zustand
- **Messaging:** Meta WhatsApp Cloud API

---

## 💻 Running ConvoDeck Locally

### 1. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Available Routes
- `http://localhost:3000/` — Dribbble Landing Page
- `http://localhost:3000/dashboard` — Sales Analytics & Overview
- `http://localhost:3000/kanban` — Visual Pipeline Kanban Board
- `http://localhost:3000/chat` — Live Unified WhatsApp Inbox
- `http://localhost:3000/login` — Team Login Page
- `http://localhost:3000/api/webhook/whatsapp` — Meta Webhook Endpoint

---

## ⚙️ Environment Configuration (`.env.local`)

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/convodeck

# Meta WhatsApp Cloud API (Optional - runs in mock/demo mode if blank)
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=convodeck_secure_token

# Workspace
DEFAULT_WORKSPACE_ID=convodeck_default_workspace
```
*(Note: If Meta credentials are left blank, ConvoDeck automatically runs in demo mode with pre-seeded leads and a built-in simulation button to test instant WhatsApp customer replies!)*
