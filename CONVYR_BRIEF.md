# Convyr — Project Brief

> ⚠️ **AI-ASSISTED DOCUMENTATION**
> This project brief was written with the assistance of an AI agent (Claude by Anthropic).
> For questions or assistance contact the developer:
> - 📧 **Email:** wycliffkimani9@gmail.com
> - 🏢 **Company:** devcraftechnologies.tech
> - 💬 **WhatsApp:** +254 793 790 005
> - 💼 **LinkedIn:** https://www.linkedin.com/in/wycliff-kimani/

---

## What is Convyr?

Convyr is a WhatsApp Business Automation SaaS built for small and medium businesses across Africa. It lets businesses automate their WhatsApp — auto-replies, order management, customer follow-ups, and appointment booking — all managed through a simple web dashboard.

---

## The Problem

90% of Kenyan businesses use WhatsApp manually. They lose time and customers daily because they can't respond fast enough, follow up consistently, or manage orders through chat efficiently.

---

## The Solution

A simple dashboard where any business — no tech skills needed — can connect their WhatsApp and automate customer interactions in under 5 minutes.

---

## Differentiation

- M-Pesa ready out of the box
- No tech skills required
- 5-minute setup
- Cheaper than WATI, Zoko, and Twilio
- Built specifically for African business workflows

---

## Target Market

| Stage | Market |
|-------|--------|
| Phase 1 | Kenya SMEs |
| Phase 2 | All of Africa |
| Phase 3 | Global |

**Customer types:** Shops, restaurants, salons, SACCOs, schools, clinics — anyone using WhatsApp to serve customers.

---

## Business Model

| Plan | Price |
|------|-------|
| Basic | KES 2,000/month |
| Pro | KES 5,000/month |
| Enterprise | Custom |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python + FastAPI |
| Database | PostgreSQL (Supabase free tier) |
| Queue | Redis (Upstash free tier) |
| Background Tasks | Celery |
| Frontend | Next.js |
| WhatsApp | Meta Cloud API |
| Payments | PayHero API (M-Pesa STK Push) |
| Hosting (Backend) | Render |
| Hosting (Frontend) | Vercel |

---

## MVP Features (Phase 1 Only)

1. Business signup and WhatsApp number connection
2. Auto-reply to incoming customer messages
3. Simple dashboard to manage replies and conversations
4. PayHero payment integration for subscriptions (M-Pesa STK Push)

---

## Project Structure

```
convyr/
│
├── backend/                        # FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI entry point
│   │   ├── config.py               # Environment variables
│   │   │
│   │   ├── api/                    # Route handlers
│   │   │   ├── __init__.py
│   │   │   ├── webhook.py          # WhatsApp webhook
│   │   │   ├── messages.py         # Send messages
│   │   │   ├── auth.py             # User authentication
│   │   │   ├── businesses.py       # Business management
│   │   │   ├── contacts.py         # Customer contacts
│   │   │   ├── automations.py      # Auto-reply rules
│   │   │   └── payments.py         # PayHero payments
│   │   │
│   │   ├── models/                 # Database models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── business.py
│   │   │   ├── contact.py
│   │   │   ├── message.py
│   │   │   └── automation.py
│   │   │
│   │   ├── schemas/                # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── business.py
│   │   │   ├── message.py
│   │   │   └── automation.py
│   │   │
│   │   ├── services/               # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── whatsapp.py         # WhatsApp API calls
│   │   │   ├── payhero.py          # PayHero API (M-Pesa STK Push)
│   │   │   ├── automation.py       # Auto-reply engine
│   │   │   └── email.py            # Email notifications
│   │   │
│   │   ├── workers/                # Celery background tasks
│   │   │   ├── __init__.py
│   │   │   ├── celery.py           # Celery config
│   │   │   └── tasks.py            # Background tasks
│   │   │
│   │   └── db/                     # Database
│   │       ├── __init__.py
│   │       ├── database.py         # Supabase connection
│   │       └── migrations/         # DB migrations
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_webhook.py
│   │   ├── test_messages.py
│   │   └── test_automations.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                       # Next.js Dashboard
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # Landing page
│   │   ├── sitemap.ts
│   │   │
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── overview/page.tsx
│   │   │   ├── conversations/page.tsx
│   │   │   ├── automations/page.tsx
│   │   │   ├── contacts/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   └── settings/page.tsx
│   │   │
│   │   └── (marketing)/
│   │       ├── about/page.tsx
│   │       ├── pricing/page.tsx
│   │       └── contact/page.tsx
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── ConversationList.tsx
│   │   │
│   │   ├── automations/
│   │   │   ├── AutomationCard.tsx
│   │   │   └── RuleBuilder.tsx
│   │   │
│   │   └── marketing/
│   │       ├── HeroSection.tsx
│   │       ├── PricingCard.tsx
│   │       └── Footer.tsx
│   │
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   │
│   ├── public/images/
│   ├── next.config.ts
│   └── .env.example
│
├── CONVYR_BRIEF.md
├── .gitignore
└── README.md
```

---

## Credentials (Saved Locally in .env)

- `PHONE_NUMBER_ID`: 1089779964214051
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: 1468101211513331
- `ACCESS_TOKEN`: saved in local .env file

---

## Build Milestones

| Month | Goal |
|-------|------|
| Month 1 | Build and deploy MVP |
| Month 2 | Onboard 3 free beta clients |
| Month 3 | Start charging — KES 2,000/month minimum |

---

## Progress Tracker

### Infrastructure
- [x] Meta Developer account created
- [x] Convyr app created on Meta Developer Portal
- [x] WhatsApp Business API connected and tested
- [x] First test message sent and received successfully
- [x] GitHub repository created (convyr)
- [x] Project structure created
- [ ] Render account set up for backend
- [ ] Supabase project created
- [ ] Upstash Redis instance created

### Backend
- [ ] FastAPI project structure set up
- [ ] WhatsApp webhook receiver built
- [ ] Auto-reply logic implemented
- [ ] Database models defined
- [ ] Celery worker configured
- [ ] PayHero API integrated (M-Pesa STK Push + callbacks)
- [ ] Authentication system built

### Frontend
- [ ] Next.js project initialized
- [ ] Business signup flow built
- [ ] WhatsApp connection flow built
- [ ] Dashboard UI built
- [ ] Subscription/billing page built

### Launch
- [ ] Beta clients onboarded (target: 3)
- [ ] Domain registered (convyr.com or alternative)
- [ ] Production deployment live
- [ ] First paying client

---

## Developer

**Wycliff Kimani**
Founder & CEO — DevCraft Technologies
Available: 2-3 hours evenings + weekends
Budget: Zero (time is the investment)
Skills: Python, FastAPI, Next.js, Android, AI/ML
Location: Kenya
