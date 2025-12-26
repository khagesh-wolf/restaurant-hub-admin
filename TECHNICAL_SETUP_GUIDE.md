# Restaurant Subscription System - Technical Setup Guide

> **Complete step-by-step guide for onboarding new restaurants**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Step 1: Register Restaurant in Admin Dashboard](#step-1-register-restaurant-in-admin-dashboard)
4. [Step 2: Get Restaurant's Supabase Project ID](#step-2-get-restaurants-supabase-project-id)
5. [Step 3: Link Restaurant to Admin Dashboard](#step-3-link-restaurant-to-admin-dashboard)
6. [Step 4: Implement Subscription Check in Restaurant App](#step-4-implement-subscription-check-in-restaurant-app)
7. [Step 5: Testing the Integration](#step-5-testing-the-integration)
8. [API Reference](#api-reference)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Access to the **Admin Dashboard** (this project)
- [ ] Admin credentials for the Admin Dashboard
- [ ] Access to the **Restaurant App's Supabase Project** (cloud-supabase-stack or similar)
- [ ] The Restaurant App's Supabase Project ID

### Required Information

| Item | Where to Find | Example |
|------|---------------|---------|
| Admin Dashboard URL | Your deployment | `https://your-admin.lovable.app` |
| Admin Dashboard Supabase URL | Supabase Dashboard → Settings → API | `https://bttirwdxislcsdpshgdj.supabase.co` |
| Restaurant Supabase Project ID | Restaurant's Supabase Dashboard → Settings → General | `abcdefghijklmnop` |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN DASHBOARD                               │
│                  (This Project - bttirwdxislcsdpshgdj)              │
│                                                                      │
│  ┌──────────────┐    ┌─────────────────────┐    ┌────────────────┐  │
│  │  Dashboard   │───▶│  restaurants table  │◀───│ check-subscription│
│  │     UI       │    │  (stores all data)  │    │  Edge Function  │  │
│  └──────────────┘    └─────────────────────┘    └────────────────┘  │
│                                                          ▲           │
└──────────────────────────────────────────────────────────│───────────┘
                                                           │
                                                    HTTPS API Call
                                                           │
┌──────────────────────────────────────────────────────────│───────────┐
│                      RESTAURANT APP                      │           │
│               (Separate Supabase Project)                │           │
│                                                          │           │
│  ┌──────────────┐    ┌─────────────────────┐    ┌───────┴────────┐  │
│  │  Restaurant  │───▶│  SubscriptionGuard  │───▶│ Calls Admin's  │  │
│  │     App      │    │    Component        │    │ Edge Function  │  │
│  └──────────────┘    └─────────────────────┘    └────────────────┘  │
│                                                                      │
│  ┌──────────────┐    ┌─────────────────────┐                        │
│  │   Menus,     │───▶│  Restaurant's Own   │                        │
│  │   Orders     │    │  Supabase Database  │                        │
│  └──────────────┘    └─────────────────────┘                        │
└──────────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Each restaurant has its **own separate Supabase project**
- The Admin Dashboard manages subscription data centrally
- Restaurant apps call the Admin's `check-subscription` edge function to verify their subscription
- The `supabase_project_id` links the restaurant record to its Supabase project

---

## Step 1: Register Restaurant in Admin Dashboard

### 1.1 Login to Admin Dashboard

1. Navigate to your Admin Dashboard URL
2. Login with your admin credentials (admin email configured in the system)

### 1.2 Add New Restaurant

1. Click **"Add Restaurant"** button in the dashboard
2. Fill in the restaurant details:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Restaurant Name | ✅ Yes | Business name | `Pizza Palace` |
| Domain | No | Restaurant's website | `pizzapalace.com` |
| Contact Email | No | Owner/manager email | `owner@pizzapalace.com` |
| Contact Phone | No | Contact number | `+977-9800000000` |
| Supabase Project ID | ✅ Yes | See Step 2 | `abcdefghijklmnop` |
| Notes | No | Internal notes | `Premium client, priority support` |

3. Click **"Add Restaurant"** to save

> **Note:** The restaurant starts with a **14-day free trial** automatically.

---

## Step 2: Get Restaurant's Supabase Project ID

### 2.1 Access Restaurant's Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Login with the credentials for the **Restaurant's Supabase project**
3. Select the restaurant's project

### 2.2 Find the Project ID

1. Navigate to **Settings** (gear icon in sidebar)
2. Click **General**
3. Find **Reference ID** under "General settings"
4. Copy this ID (it looks like: `abcdefghijklmnop`)

```
┌─────────────────────────────────────────────┐
│ General settings                            │
├─────────────────────────────────────────────┤
│ Reference ID: abcdefghijklmnop    [Copy]    │
│                                             │
│ This is your project's unique identifier    │
└─────────────────────────────────────────────┘
```

---

## Step 3: Link Restaurant to Admin Dashboard

### 3.1 Update Restaurant Record

1. In Admin Dashboard, find the restaurant in the table
2. Click **"Edit"** button
3. Enter the **Supabase Project ID** from Step 2
4. Click **"Save Changes"**

### 3.2 Verify the Link

After saving, the restaurant record should show:
- ✅ Supabase Project ID populated
- ✅ Status shows as "Trial" or "Active"
- ✅ Trial end date calculated (14 days from creation)

---

## Step 4: Implement Subscription Check in Restaurant App

### 4.1 Create the Subscription Guard Component

In the **Restaurant App project**, create this file:

**File: `src/components/SubscriptionGuard.tsx`**

```tsx
import { useEffect, useState, ReactNode } from "react";

interface SubscriptionGuardProps {
  children: ReactNode;
}

interface SubscriptionStatus {
  valid: boolean;
  status: "active" | "trial" | "expired" | "trial_expired" | "deactivated";
  days_remaining?: number;
  message?: string;
  plan?: string;
}

// ⚠️ REPLACE THIS WITH YOUR ADMIN DASHBOARD'S SUPABASE PROJECT ID
const ADMIN_PROJECT_ID = "bttirwdxislcsdpshgdj";

// ⚠️ REPLACE THIS WITH YOUR RESTAURANT'S SUPABASE PROJECT ID
const RESTAURANT_PROJECT_ID = "your-restaurant-project-id";

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch(
          `https://${ADMIN_PROJECT_ID}.supabase.co/functions/v1/check-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              project_id: RESTAURANT_PROJECT_ID,
            }),
          }
        );

        const data = await response.json();
        setStatus(data);
      } catch (err) {
        console.error("Subscription check failed:", err);
        setError("Unable to verify subscription. Please try again later.");
        // Allow access on network error to prevent lockout
        setStatus({ valid: true, status: "active" });
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
    
    // Re-check every 5 minutes
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verifying subscription...</p>
        </div>
      </div>
    );
  }

  if (!status?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-md p-8 text-center bg-card rounded-lg shadow-lg border">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Subscription Required
          </h1>
          <p className="text-muted-foreground mb-4">
            {status?.message || "Your subscription has expired or is inactive."}
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact support to renew your subscription.
          </p>
        </div>
      </div>
    );
  }

  // Show warning banner if expiring soon (less than 7 days)
  const showWarning = status.status === "trial" || 
    (status.days_remaining && status.days_remaining <= 7);

  return (
    <>
      {showWarning && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center text-sm">
          <span className="text-amber-600 dark:text-amber-400">
            {status.status === "trial" 
              ? `⏰ Trial ends in ${status.days_remaining} days`
              : `⚠️ Subscription expires in ${status.days_remaining} days`
            }
            {" - "}
            <a href="mailto:support@example.com" className="underline font-medium">
              Contact us to renew
            </a>
          </span>
        </div>
      )}
      {children}
    </>
  );
}
```

### 4.2 Wrap Your App with SubscriptionGuard

**File: `src/App.tsx`** (in Restaurant App)

```tsx
import { SubscriptionGuard } from "@/components/SubscriptionGuard";

function App() {
  return (
    <SubscriptionGuard>
      {/* Your existing app content */}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* ... your routes */}
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </SubscriptionGuard>
  );
}
```

### 4.3 Configure the Project IDs

Edit `SubscriptionGuard.tsx` and replace:

```tsx
// ⚠️ REPLACE THESE VALUES

// Admin Dashboard's Supabase Project ID (where subscription data is stored)
const ADMIN_PROJECT_ID = "bttirwdxislcsdpshgdj";  // ← Keep this as-is

// This Restaurant's Supabase Project ID (from Step 2)
const RESTAURANT_PROJECT_ID = "your-restaurant-project-id";  // ← Replace with actual ID
```

---

## Step 5: Testing the Integration

### 5.1 Test Subscription Check API

Use this cURL command to test directly:

```bash
curl -X POST \
  'https://bttirwdxislcsdpshgdj.supabase.co/functions/v1/check-subscription' \
  -H 'Content-Type: application/json' \
  -d '{"project_id": "your-restaurant-project-id"}'
```

### 5.2 Expected Responses

**Active Subscription:**
```json
{
  "valid": true,
  "status": "active",
  "plan": "6_months",
  "days_remaining": 120
}
```

**Trial Period:**
```json
{
  "valid": true,
  "status": "trial",
  "days_remaining": 10
}
```

**Expired:**
```json
{
  "valid": false,
  "status": "expired",
  "message": "Subscription has expired."
}
```

**Not Found:**
```json
{
  "valid": false,
  "error": "Restaurant not found",
  "message": "This restaurant is not registered."
}
```

### 5.3 End-to-End Test

1. Open the Restaurant App in browser
2. Check browser DevTools → Network tab
3. Look for `check-subscription` request
4. Verify it returns `valid: true`
5. The app should load normally

### 5.4 Test Lock Screen

1. In Admin Dashboard, toggle restaurant to **inactive**
2. Refresh the Restaurant App
3. Should show "Subscription Required" lock screen
4. Toggle back to **active**
5. Refresh - app should work again

---

## API Reference

### Edge Function: `check-subscription`

**Endpoint:**
```
POST https://bttirwdxislcsdpshgdj.supabase.co/functions/v1/check-subscription
```

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "project_id": "restaurant-supabase-project-id"
}
```

**Response Codes:**

| Code | Meaning |
|------|---------|
| 200 | Success (check `valid` field for actual status) |
| 400 | Missing `project_id` in request |
| 404 | Restaurant not found |
| 500 | Server error |

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether access should be granted |
| `status` | string | `active`, `trial`, `expired`, `trial_expired`, `deactivated` |
| `days_remaining` | number | Days until expiration |
| `plan` | string | `6_months` or `1_year` (if subscribed) |
| `message` | string | Human-readable message (on error) |

---

## Troubleshooting

### Issue: CORS Error

**Symptom:** Browser console shows `Access-Control-Allow-Origin` error

**Cause:** Edge function not returning CORS headers

**Solution:** 
The `check-subscription` function already includes CORS headers. If you're still seeing errors:
1. Clear browser cache
2. Verify the function is deployed
3. Check Supabase Edge Function logs

### Issue: 404 Not Found

**Symptom:** API returns `Restaurant not found`

**Cause:** `supabase_project_id` mismatch

**Solution:**
1. Verify the Project ID in Admin Dashboard matches exactly
2. Check for extra spaces or characters
3. Ensure the restaurant record exists

### Issue: Network Error / Failed to Fetch

**Symptom:** App can't connect to subscription API

**Cause:** Network issue or incorrect URL

**Solution:**
1. Verify `ADMIN_PROJECT_ID` is correct
2. Check internet connection
3. The SubscriptionGuard allows access on network error to prevent lockout

### Issue: Always Shows Lock Screen

**Symptom:** App stuck on subscription lock even though valid

**Cause:** Restaurant marked as inactive or subscription expired

**Solution:**
1. Check Admin Dashboard - is restaurant active?
2. Check subscription end date
3. Extend subscription if needed

### Issue: Trial Expired Immediately

**Symptom:** New restaurant shows trial expired

**Cause:** `trial_start` date is incorrect

**Solution:**
1. Check `trial_start` in database
2. Should be the creation date
3. Trial is 14 days from `trial_start`

---

## Quick Reference Card

### Adding a New Restaurant - Checklist

```
□ Step 1: Login to Admin Dashboard
□ Step 2: Get Restaurant's Supabase Project ID from their Supabase Dashboard
□ Step 3: Click "Add Restaurant" in Admin Dashboard
□ Step 4: Fill in all details including Supabase Project ID
□ Step 5: In Restaurant App, update SubscriptionGuard with correct Project ID
□ Step 6: Test the integration
□ Step 7: Verify subscription check works
```

### Important URLs

| Resource | URL |
|----------|-----|
| Admin Dashboard | `https://your-admin-app.lovable.app` |
| Subscription API | `https://bttirwdxislcsdpshgdj.supabase.co/functions/v1/check-subscription` |
| Supabase Dashboard | `https://supabase.com/dashboard` |

### Support Contacts

| Issue | Contact |
|-------|---------|
| Technical Issues | `tech@yourcompany.com` |
| Subscription/Billing | `billing@yourcompany.com` |
| General Support | `support@yourcompany.com` |

---

*Last Updated: December 2024*
*Version: 1.0*
