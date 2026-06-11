# Counselor & Client Platform (Telehealth Link System)

A polished, full-stack Telehealth platform for clients and practitioners. The interface features a modern **Bento Grid** design theme with **Indian Rupee (₹)** currency localization, robust clinical note-taking, appointment scheduling, video consultants simulator, client chat console, and interactive simulated e-mail dispatch dashboards.

---

## 🎨 Design Philosophy & Features

- **Bento Grid Visual Theme**: Generous negative space, rounded container panels (`rounded-3xl`), card transitions, and elegant visual rhythm.
- **₹ (INR) Currency Standard**: All quotes, checkout authorization overlays, copays, state logs, and invoice receipts are localized directly in Indian Rupees (e.g., `₹1250/hr`).
- **Dual-role Authentication Simulator**: Quick switches between the clinical client (Alex Mercer) and any registered counselors (e.g., Sarah Jenkins, Dr. Rodriguez) with persistent session parameters.
- **Appointment Queue & Booking System**: Full validation, time slot lockouts, and live invoice generation.
- **Secured Video Simulator**: In-app secure telemedicine simulation workspace.
- **Clinical Records Vault**: Direct access to PDF downloads, document uploads, and diagnostic records.
- **Inter-service Communications**: Real-time websocket-type messaging panel and simulated clinic `@counselsync.health` email portals.

---

## 🛠️ Tech Stack & Architecture

- **Backend**: **Express (Node.js)** with self-contained relative path resolution and local file system database seeding (`counselor_data.json`).
- **Frontend**: **React 19**, **Vite 6**, and **TypeScript 5**.
- **Animation**: **Motion** for fluid cards, drawers, and modal transitions.
- **Styling**: **Tailwind CSS 4** custom theme configs (Space Grotesk + JetBrains Mono displays).
- **Icons**: Elegantly imported vector badges via **Lucide-React**.

---

## 🚀 Steps to Run Internally

To interact with or deploy the codebase, follow these clear steps:

### 1. Install Dependencies
Initialize node modules and development toolchain:
```bash
npm install
```

### 2. Launch Development Mode
Starts the high-speed local development server. Express acts as the primary proxy to hot-reload state:
```bash
npm run dev
```
Once booted, the client is open at **`http://localhost:3000`** (Express coordinates the Vite middleware pipeline).

### 3. Build & Compile for Production
Creates highly optimized client assets and bundles the backend TypeScript server into a single portable CommonJS module:
```bash
npm run build
```
The compilation process outputs:
* Static compiled SPA files: `dist/index.html`, assets, styles.
* Compressed Node API Server bundle: `dist/server.cjs` (built via `esbuild`).

### 4. Start Production Server
Launch compiled production bundles at zero resource footprint:
```bash
npm start
```

---

## 📂 Project Structure

```text
├── counselor_data.json      # Simulates the persistent full-stack filesystem database
├── server.ts                # Full-stack API Express router and static client server
├── src/
│   ├── App.tsx              # Main system hub, handles route synchronization
│   ├── types.ts             # Shared strict TypeScript database schemas
│   ├── index.css            # Custom CSS core & Bento Grotesk design typography
│   └── components/
│       ├── ClientDashboard.tsx       # Client dashboard workspace
│       ├── CounselorDashboard.tsx    # Clinic manager console & records
│       ├── CounselorCard.tsx         # Bento Grid practice listings
│       ├── BookingModal.tsx          # Session secure intake & billing
│       ├── ChatInterface.tsx         # Real-time message logs
│       ├── EmailSimulationView.tsx   # Desk mailing logs
│       └── VideoCallContainer.tsx    # Telehealth encrypted video simulator
```

---

## 🧹 Maintenance Commands

* **To reset state simulator**: Click **"Reset Demo Records"** in the footer of the dashboard or run the database sync.
* **To clean previous compile caches**:
  ```bash
  npm run clean
  ```
* **To run the TypeScript compiler check**:
  ```bash
  npm run lint
  ```
