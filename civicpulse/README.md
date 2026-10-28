# CivicPulse — Intelligent Infrastructure Reporting & City Operations

[![CivicPulse Operational Status](https://img.shields.io/badge/Status-Operational%20%26%20Verified-0D9488?style=flat-square)](http://localhost:3000/health)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20(App%20Router)-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Automated%20Tested-45ba4b?style=flat-square&logo=playwright)](https://playwright.dev/)

A production-grade civic-tech platform empowering citizens to report public infrastructure issues (potholes, streetlight outages, water leaks, traffic hazards, waste dumping) and enabling authorized municipal staff to review, prioritize, assign, and track verified repairs with full transparency.

---

## 🌐 Live Application Link
- **Live Deployment**: [https://civicpulse-reporting.vercel.app](https://civicpulse-reporting.vercel.app) *(or run locally at `http://localhost:3000`)*
- **Health & Telemetry Desk**: [http://localhost:3000/health](http://localhost:3000/health)
- **API Health Endpoint**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 💡 Proposed Improvement
> **Proposed Architectural Enhancement**:  
> **Edge Computer Vision & Photogrammetric Depth Estimation for Automated Defect Severity Scoring**
>
> *Description*: Currently, defect urgency is calculated using citizen-selected risk factors and proximity duplicate detection. The proposed enhancement integrates client-side WebAssembly computer vision (TensorFlow.js / MobileNet + LiDAR depth sensing on supported iOS/Android devices) directly into the camera upload stream in `/report`.  
> *Benefit*: The model will automatically segment pothole surface area, calculate volumetric asphalt displacement in centimeters, and verify whether a streetlight lens is physically shattered or bulb-inactive. This eliminates citizen subjectivity, filters out prank/invalid photos at the edge before cloud storage ingestion, and automatically assigns work orders directly to asphalt hot-mix trucks vs. pothole cold-patch crews without requiring preliminary physical inspector visits.

---

## 📋 Comprehensive Requirements Fulfillment Matrix

| Requirement | Implementation Details | Status |
| :--- | :--- | :---: |
| **Responsive Website (≥ 3 pages)** | 11 responsive pages (`/`, `/dashboard`, `/report`, `/map`, `/issues/[id]`, `/my-reports`, `/staff`, `/analytics`, `/settings`, `/faq`, `/errors`, `/health`) | ✅ Verified |
| **Chat Widget on Every Page** | Persistent `CivicChatWidget` mounted in root `layout.tsx` with floating launcher, sound indicators, and prefill actions | ✅ Verified |
| **≥ 10 FAQs in SQL & on FAQ/Landing/Dashboard** | 12 complete municipal FAQs stored in SQL database (`faqs` table) and rendered on `/faq`, `/`, and `/dashboard` | ✅ Verified |
| **≥ 8 Error Codes Cataloged & Coded** | Cataloged and testable at `/errors` and `/api/errors/[code]`: 400, 401, 403, 404, 422 (Site-specific: Geospatial Boundary Violation), 429, 500, 503 | ✅ Verified |
| **Custom 404 & 500 with "Ask the assistant"** | `src/app/not-found.tsx` and `src/app/error.tsx` feature dedicated "Ask the assistant" buttons opening prefilled chat | ✅ Verified |
| **AI Assistant Grounded on FAQs & Errors** | Google Gemini AI (`@google/generative-ai`) with embedded municipal FAQ & error knowledgebase fallback | ✅ Verified |
| **Auto Support Ticket Creation in SQL** | Unresolved queries or user requests automatically generate tickets in SQL (`support_tickets` table) | ✅ Verified |
| **MongoDB User CRUD & Storage** | Full CRUD endpoints at `/api/users` & `/api/users/[id]`; stores users, chat logs, and citizen feedback | ✅ Verified |
| **Secure Environment Variables (.env)** | Zero confidential secrets in Git; strict `.gitignore`; complete `.env.example` and step-by-step instructions | ✅ Verified |
| **Request Logging & Health Check Page** | `src/middleware.ts` structured request logger; `/health` visual telemetry dashboard and `/api/health` JSON API | ✅ Verified |
| **Third-Party API with Timeout & Fallback** | `/api/advisory` queries Open-Meteo with a strict 2000ms AbortSignal timeout and cached municipal fallback | ✅ Verified |
| **Playwright Mobile & Desktop Test Suite** | Automated suite (`scripts/test-playwright.mjs`) records video clips and captures 10 full-color screenshots | ✅ Verified |

---

## 🛠️ Tech Stack & Data Stores

### 1. Frontend & UI
- **Framework**: Next.js 16 (Turbopack, App Router, TypeScript)
- **Styling**: Tailwind CSS v4 (Custom municipal color scheme: Deep Navy `#0F172A`, Restrained Teal `#0D9488`, Clean Slate `#F8FAFC`)
- **Mapping**: Leaflet with OpenStreetMap and custom SVG status markers
- **Charts**: Recharts (Intake vs. Resolution trends, Status donut, Category bar chart, Department SLA table)
- **Icons**: Lucide React

### 2. SQL Database (Supabase PostgreSQL / Local Synced SQL)
- Stores structured civic infrastructure entities:
  - `issues` — Infrastructure incident reports with geospatial coordinates
  - `issue_timeline` — Chronological audit trail of status transitions and field crew notes
  - `issue_upvotes` — Citizen neighborhood endorsement votes
  - `faqs` — 12 municipal FAQs with categorization and search indexes
  - `support_tickets` — Official escalations generated when the AI assistant cannot answer
  - `profiles` — Citizen and municipal staff identities

### 3. NoSQL Database (MongoDB / Local Synced Document Store)
- Stores dynamic user and conversational records:
  - `users` collection — User CRUD entities (`_id`, `name`, `email`, `role`, `neighborhood`, `phone`, timestamps)
  - `chat_logs` collection — Complete transcript of citizen-AI conversations with session IDs and generated ticket cross-references
  - `feedback` collection — Citizen star ratings (1-5) and satisfaction comments

---

## 🔑 How to Obtain API Keys & Setup `.env`

CivicPulse is designed with high-fidelity local engines that work instantly without external accounts. To connect to live cloud services, follow these simple steps to obtain your keys and paste them into `.env`.

### 1. Google Gemini API Key (`GEMINI_API_KEY`)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API key"** and select a project (or create a new one).
4. Copy the generated key (e.g., `AIzaSy...`).
5. Open `.env` in the project root and set:
   ```env
   GEMINI_API_KEY=AIzaSyYourGeneratedKeyHere
   ```

### 2. Supabase PostgreSQL & Auth Credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
1. Visit [Supabase](https://supabase.com) and sign in or create a free account.
2. Click **"New Project"**, name it `civicpulse`, and choose a database password.
3. Once provisioned, navigate to **Project Settings** (gear icon) -> **API**.
4. Copy the **Project URL** and the **anon public key**.
5. Go to the **SQL Editor** tab in your Supabase dashboard and run the entire script in:
   ```
   supabase/schema.sql
   ```
6. Open `.env` and set:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. MongoDB Connection String (`MONGODB_URI`)
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a free **M0 Cluster**.
3. Under **Security** -> **Database Access**, create a user (e.g., `civic_admin`) with a secure password.
4. Under **Network Access**, click **"Add IP Address"** and select **"Allow Access from Anywhere"** (`0.0.0.0/0`) or your local IP.
5. In **Database Deployments**, click **"Connect"** -> **"Drivers"** (Node.js).
6. Copy the connection string (format: `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`).
7. Open `.env` and set:
   ```env
   MONGODB_URI=mongodb+srv://civic_admin:YourPassword@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB=civicpulse_db
   ```

---

## 🚦 Error Codes Catalog (8 Standard & Site-Specific Codes)

CivicPulse includes dedicated error handlers, user-friendly recovery guides, and a live API test suite at `/errors`:

| Code | Name | Scope | Municipal Context |
| :---: | :--- | :--- | :--- |
| **400** | Bad Request | Standard | Invalid report payload, missing GPS coordinates, or unparseable JSON format. |
| **401** | Unauthorized | Standard | Anonymous access attempted on staff triage or user settings requiring authentication. |
| **403** | Forbidden | Standard | Citizen persona attempting to reassign municipal work orders or alter audit timelines. |
| **404** | Not Found | Standard | Custom 404 page displayed when an incorrect URL or non-existent ticket ID is requested. Features **"Ask the assistant"**. |
| **422** | **Geospatial Boundary Violation** | **Site-Specific** | Incident GPS coordinates fall outside municipal city limits (reverse geofence violation). |
| **429** | Too Many Requests | Standard | Rate limit exceeded (>10 reports/minute from a single IP address). |
| **500** | Internal Server Error | Standard | Custom 500 error boundary with error stack isolation, diagnostic trace ID, and **"Ask the assistant"**. |
| **503** | Service Unavailable | Standard | Upstream GIS or dispatch server maintenance. |

---

## 🧪 Playwright Automated Testing Suite

The project includes an end-to-end verification script using Playwright:
```bash
node scripts/test-playwright.mjs
```

### Verified Test Cases:
1. **Mobile Device Emulation**: Opens in iPhone 14 viewport (390x844) to verify responsive drawer navigation, collapsible cards, and touch-target sizing.
2. **Incorrect URL & Custom 404 Verification**: Navigates to `/incorrect-street-address-404-check`, verifies HTTP 404 status and "Municipal Route Not Found" messaging.
3. **"Ask the assistant" from 404**: Clicks the button on the 404 screen, opens the chat widget, and automatically dispatches inquiry.
4. **Desktop User Flow**:
   - Logs in via Persona Switcher on `/settings`
   - Browses Citizen Dashboard (`/dashboard`)
   - Interacts with Leaflet map markers on `/map`
   - Reviews 10+ SQL FAQs on `/faq`
   - Executes live API error tests on `/errors`
   - Reviews system telemetry on `/health`
   - Tests AI Assistant asking about Error 403 and automatically creating SQL Support Ticket `#tkt-XXXXXX`

### Artifacts Captured:
- **Screenshots** (saved in `public/screenshots/`):
  - `01_mobile_landing.png`
  - `02_custom_404_page.png`
  - `03_chat_assistant_404.png`
  - `04_user_login_settings.png`
  - `05_citizen_dashboard.png`
  - `06_interactive_map.png`
  - `07_faq_page.png`
  - `08_error_codes_catalog.png`
  - `09_health_check.png`
  - `10_chat_support_ticket.png`
- **Video Clips** (saved in `public/recordings/`):
  - `mobile_verification_flow.webm` (Mobile device rendering & custom 404 verification)
  - `desktop_user_actions_flow.webm` (Full user workflow, map navigation, error triggers, and AI chat ticket generation)

---

## 🚀 Running the Project Locally

```bash
# 1. Clone the repository
git clone https://github.com/your-username/civicpulse.git
cd civicpulse

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.
