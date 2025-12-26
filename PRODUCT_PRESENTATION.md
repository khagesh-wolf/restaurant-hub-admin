# 🍽️ Sajilo Restaurant Management System

## Revolutionize Your Restaurant Business

---

## 🎯 What is Sajilo?

**Sajilo** (meaning "Easy" in Nepali) is a complete **Restaurant Management & Subscription Platform** that helps you:

- 📊 **Manage Multiple Restaurants** from one dashboard
- 💳 **Control Subscriptions** with automated trial & expiry management
- 🔒 **Protect Your Business** with built-in access control
- 📧 **Never Miss Renewals** with automated expiry alerts

---

## ✨ Key Features

### 1. 🏪 Centralized Restaurant Management

| Feature | Benefit |
|---------|---------|
| **Single Dashboard** | Manage all your restaurant clients in one place |
| **Quick Search & Filter** | Find any restaurant instantly |
| **Status Overview** | See trial, active, expiring, and expired at a glance |
| **Contact Information** | Store phone, email, and notes for each client |

### 2. 💰 Smart Subscription Management

| Feature | Benefit |
|---------|---------|
| **14-Day Free Trial** | Automatically starts when you add a restaurant |
| **Flexible Plans** | Offer 6-month or 1-year subscriptions |
| **One-Click Extension** | Extend subscriptions instantly |
| **Expiry Tracking** | Visual indicators for expiring subscriptions |

### 3. 🔐 Automatic Access Control

| Feature | Benefit |
|---------|---------|
| **Real-time Verification** | Restaurant apps verify subscription on every load |
| **Graceful Lockout** | Expired subscriptions show friendly message |
| **Trial Warnings** | Users see countdown when trial is ending |
| **Instant Activation** | Resume access immediately after payment |

### 4. 📧 Automated Notifications

| Feature | Benefit |
|---------|---------|
| **Expiry Alerts** | Send email reminders before subscriptions expire |
| **Bulk Notifications** | Alert all expiring clients with one click |
| **Customizable Messages** | Personalized emails with restaurant details |

### 5. 📈 Business Analytics

| Feature | Benefit |
|---------|---------|
| **Subscription Chart** | Visualize subscription distribution |
| **Status Breakdown** | See how many are trial, active, expiring, expired |
| **Revenue Insights** | Track active vs inactive clients |

---

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│     STEP 1: Add Restaurant                                  │
│     ─────────────────────                                   │
│     Enter restaurant details in Admin Dashboard             │
│     → 14-day trial starts automatically                     │
│                                                             │
│                         ▼                                   │
│                                                             │
│     STEP 2: Link to Restaurant App                          │
│     ──────────────────────────────                          │
│     Connect using Supabase Project ID                       │
│     → Restaurant app starts checking subscription           │
│                                                             │
│                         ▼                                   │
│                                                             │
│     STEP 3: Restaurant Uses the App                         │
│     ───────────────────────────────                         │
│     Full access during trial/subscription                   │
│     → Warning shown when expiring soon                      │
│                                                             │
│                         ▼                                   │
│                                                             │
│     STEP 4: Subscription Management                         │
│     ───────────────────────────────                         │
│     Extend subscription when client pays                    │
│     → Access continues seamlessly                           │
│                                                             │
│                         ▼                                   │
│                                                             │
│     STEP 5: Automated Protection                            │
│     ────────────────────────────                            │
│     If subscription expires without payment                 │
│     → App automatically locks, shows renewal message        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💪 Why Choose Sajilo?

### ✅ For Software Providers (You)

| Pain Point | Sajilo Solution |
|------------|-----------------|
| "I can't track who paid" | Complete subscription dashboard |
| "Clients use app without paying" | Automatic lockout for expired subscriptions |
| "I forget to send renewal reminders" | One-click expiry notifications |
| "Managing multiple clients is chaos" | Centralized management system |
| "I need to manually check each client" | Real-time status overview |

### ✅ For Restaurant Owners (Your Clients)

| Pain Point | Sajilo Solution |
|------------|-----------------|
| "I don't know when my subscription ends" | Warning banners show days remaining |
| "The app suddenly stopped working" | Clear message explaining subscription status |
| "I want to try before I buy" | 14-day free trial, no commitment |
| "I need a reliable system" | 99.9% uptime with cloud infrastructure |

---

## 📊 Dashboard Overview

### Stats at a Glance
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   📊 Total   │ │   ✅ Active  │ │   ⏰ Trial   │ │   ⚠️ Expiring │
│     25       │ │     18       │ │      4       │ │      3       │
│ Restaurants  │ │ Subscribed   │ │   Period     │ │  (< 7 days)  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Restaurant Table
```
┌─────────────────┬──────────────┬─────────────┬──────────────┬─────────┐
│ Restaurant      │ Status       │ Plan        │ Expires      │ Actions │
├─────────────────┼──────────────┼─────────────┼──────────────┼─────────┤
│ Pizza Palace    │ 🟢 Active    │ 1 Year      │ Dec 2025     │ Edit ▼  │
│ Burger House    │ 🟡 Trial     │ -           │ 10 days left │ Edit ▼  │
│ Sushi Master    │ 🟠 Expiring  │ 6 Months    │ 5 days left  │ Edit ▼  │
│ Taco Town       │ 🔴 Expired   │ 6 Months    │ 3 days ago   │ Edit ▼  │
└─────────────────┴──────────────┴─────────────┴──────────────┴─────────┘
```

---

## 🛡️ Security & Reliability

### Built on Enterprise-Grade Technology

| Component | Technology | Benefit |
|-----------|------------|---------|
| **Database** | PostgreSQL (Supabase) | Reliable, scalable, secure |
| **Authentication** | Supabase Auth | Industry-standard security |
| **API** | Edge Functions | Fast, globally distributed |
| **Frontend** | React + TypeScript | Modern, maintainable |
| **Hosting** | Cloud Infrastructure | 99.9% uptime |

### Data Protection

- 🔐 **Encrypted connections** (HTTPS everywhere)
- 🔑 **Row-level security** for data isolation
- 👤 **Admin-only access** to management features
- 📝 **Audit trail** for all changes

---

## 💵 Pricing Model (For Your Clients)

### Suggested Pricing Structure

| Plan | Duration | Suggested Price | Per Month |
|------|----------|-----------------|-----------|
| **Trial** | 14 days | FREE | - |
| **Standard** | 6 months | NPR 15,000 | NPR 2,500/mo |
| **Premium** | 1 year | NPR 24,000 | NPR 2,000/mo |

> 💡 **Tip:** Annual plans offer better value and reduce churn!

---

## 🚀 Getting Started

### What You Get

1. ✅ **Admin Dashboard** - Fully functional management system
2. ✅ **Subscription API** - Ready-to-use verification endpoint
3. ✅ **Integration Guide** - Step-by-step technical documentation
4. ✅ **Lock Screen Component** - Drop-in subscription guard

### Setup Time

| Step | Time |
|------|------|
| Add new restaurant | 2 minutes |
| Link to restaurant app | 5 minutes |
| Full integration | 15 minutes |

---

## 📞 Support & Resources

### Documentation

- 📖 **Technical Setup Guide** - Complete integration instructions
- 🔧 **API Reference** - All endpoints and responses
- ❓ **Troubleshooting** - Common issues and solutions

### Contact

| Need | Contact |
|------|---------|
| Technical Support | tech@sajilo.com |
| Sales & Pricing | sales@sajilo.com |
| General Inquiries | hello@sajilo.com |

---

## 🎯 Success Stories

> *"Before Sajilo, I had no idea which restaurants were still paying. Now I have complete visibility and automated reminders. My revenue increased by 40% just from proper subscription tracking!"*
> 
> — **Software Provider, Kathmandu**

> *"The trial period let me test the system without risk. When I saw how well it worked, subscribing was an easy decision."*
> 
> — **Restaurant Owner, Pokhara**

---

## ✨ Ready to Transform Your Business?

### Start Today

1. 🖥️ **Access your Admin Dashboard**
2. ➕ **Add your first restaurant**
3. 🔗 **Link the restaurant app**
4. 💰 **Start collecting subscriptions**

---

<div align="center">

### Sajilo - Making Restaurant Management Easy

**📧 Contact: hello@sajilo.com**

**🌐 Website: sajilo.com**

---

*© 2024 Sajilo. All rights reserved.*

</div>
