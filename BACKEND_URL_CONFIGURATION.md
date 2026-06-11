# Backend Web Service URL Configuration Guide

## Overview
Your application uses **relative URLs** for all API calls, which means the frontend and backend must run on the **same server** or you need to configure a proper API base URL.

---

## Current API Implementation

### Frontend API Calls
Currently, all API calls in your application use **relative paths** like:
- `/api/counselors`
- `/api/appointments`
- `/api/notes`
- `/api/transactions`
- `/api/messages`
- `/api/emails`
- `/api/reset`
- `/api/upload-file`

**Examples from code:**

1. **App.jsx** (lines 23-26):
```javascript
const [cRes, aRes, nRes, tRes] = await Promise.all([
  fetch("/api/counselors"),
  fetch("/api/appointments"),
  fetch("/api/notes"),
  fetch("/api/transactions")
]);
```

2. **BookingModal.jsx** (line 48):
```javascript
const response = await fetch("/api/appointments", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({...})
});
```

---

## Where You Need to Configure Backend URL

### Option 1: Using Environment Variables (Recommended)

#### Step 1: Create a `.env.local` file (Development)
In the root directory, create `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

#### Step 2: Create a `.env.production` file (Production)
Already exists! Currently set to:
```env
VITE_API_BASE_URL=https://counselor-telehealth-api.onrender.com/
```

#### Step 3: Create an API Config File
Create `src/config/api.js`:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_ENDPOINTS = {
  COUNSELORS: `${API_BASE_URL}/api/counselors`,
  APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
  NOTES: `${API_BASE_URL}/api/notes`,
  MESSAGES: `${API_BASE_URL}/api/messages`,
  EMAILS: `${API_BASE_URL}/api/emails`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  RESET: `${API_BASE_URL}/api/reset`,
  UPLOAD_FILE: `${API_BASE_URL}/api/upload-file`,
};

export default API_BASE_URL;
```

#### Step 4: Update API Calls in Components
Replace all `fetch("/api/...")` calls with:

**Before:**
```javascript
fetch("/api/counselors")
```

**After:**
```javascript
import { API_ENDPOINTS } from '@/config/api';
fetch(API_ENDPOINTS.COUNSELORS)
```

---

### Option 2: Direct URL Configuration (Quick Fix)

If you don't want to use environment variables, you can hardcode the backend URL in a config file:

**Create `src/config/api.js`:**
```javascript
// For local development
const API_BASE_URL = 'http://localhost:3000';

// For production, change to:
// const API_BASE_URL = 'https://your-backend-domain.com';

export const API_ENDPOINTS = {
  COUNSELORS: `${API_BASE_URL}/api/counselors`,
  APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
  NOTES: `${API_BASE_URL}/api/notes`,
  MESSAGES: `${API_BASE_URL}/api/messages`,
  EMAILS: `${API_BASE_URL}/api/emails`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions`,
  RESET: `${API_BASE_URL}/api/reset`,
  UPLOAD_FILE: `${API_BASE_URL}/api/upload-file`,
};

export default API_BASE_URL;
```

Then update all components to use this config.

---

## Files That Need Updates

### 1. **src/App.jsx**
- Lines 23-26: Fetch calls for initial data loading
- Line 67: Reset API call

### 2. **src/components/BookingModal.jsx**
- Line 48: POST request to create appointments

### 3. **src/components/CounselorDashboard.jsx**
- Any fetch calls to update appointments/notes

### 4. **src/components/ChatInterface.jsx**
- Fetch calls for messages/emails

### 5. **src/components/ClientDashboard.jsx**
- Any fetch calls for client data

### 6. **src/components/VideoCallContainer.jsx** (if applicable)
- Any fetch calls for session data

---

## Environment Variable Locations

### Development (.env.local)
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production (.env.production) - Already Configured
```env
VITE_API_BASE_URL=https://counselor-telehealth-api.onrender.com/
```

---

## How It Works

1. **Development**: When you run `npm run dev`, your app runs on `http://localhost:5173` (Vite default) and the backend is on `http://localhost:3000`. Requests go to `http://localhost:3000/api/*`

2. **Production**: When built with Vite, the frontend is deployed to Cloudflare Pages and the backend stays on Render at `https://counselor-telehealth-api.onrender.com/`. Requests are sent to this URL.

3. **CORS Consideration**: Your backend (`server.js`) needs to have CORS enabled if frontend and backend are on different domains.

---

## CORS Setup for Backend (if needed)

In your `server.js`, add CORS support:

```javascript
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:5173', 'https://your-cloudflare-domain.com'],
  credentials: true
}));

app.use(express.json());
```

Install the cors package:
```bash
npm install cors
```

---

## Testing Your Configuration

1. **Development**: 
   - Run `npm run dev`
   - Open browser DevTools (F12)
   - Check Network tab when making API calls
   - Verify URLs show `http://localhost:3000/api/...`

2. **Production**:
   - Check Network tab in browser
   - Verify URLs show `https://counselor-telehealth-api.onrender.com/api/...`

---

## Current Deployment Status

- **Frontend**: Cloudflare Pages (to be deployed)
- **Backend**: Render (to be deployed)
- **Backend URL** (Production): `https://counselor-telehealth-api.onrender.com/`

Update your `.env.production` to match your actual Render deployment URL.

---

## Summary

✅ **Environment variables already configured** in `.env.production`

🔧 **Still needed**:
1. Create `src/config/api.js` with API endpoints
2. Update all components to import and use `API_ENDPOINTS` from the config
3. Ensure backend has CORS enabled
4. Test API calls in browser DevTools

