# Convyr — Project Brief

> ⚠️ **AI-ASSISTED DOCUMENTATION**
> This project brief was written with the assistance of an AI agent (Claude by Anthropic).
> For questions or assistance contact the developer:
>
> - 📧 **Email:** wycliffkimani9@gmail.com
> - 🏢 **Company:** devcraftechnologies.tech
> - 💬 **WhatsApp:** +254 793 790 005
> - 💼 **LinkedIn:** https://www.linkedin.com/in/wycliff-kimani/

---

## What is Convyr?

Convyr is a WhatsApp Business Automation SaaS built for small and medium businesses across Africa. It lets businesses automate their WhatsApp — auto-replies, order management, customer follow-ups, and appointment booking — all managed from a simple web dashboard.

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

| Stage   | Market        |
| ------- | ------------- |
| Phase 1 | Kenya SMEs    |
| Phase 2 | All of Africa |
| Phase 3 | Global        |

**Customer types:** Shops, restaurants, salons, SACCOs, schools, clinics — anyone using WhatsApp to serve customers.

---

## Business Model

| Plan       | Price           |
| ---------- | --------------- |
| Basic      | KES 2,000/month |
| Pro        | KES 5,000/month |
| Enterprise | Custom          |

---

## Tech Stack

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5BF?style=for-the-badge&logo=react&logoColor=white)
![WhatsApp](https://img.shields.io/badge/WhatsApp_Cloud_API-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![M-Pesa](https://img.shields.io/badge/M--Pesa_via_PayHero-00A550?style=for-the-badge&logo=mpesa&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

| Layer              | Technology                      |
| ------------------ | ------------------------------- |
| Backend            | Python + FastAPI                |
| Database           | PostgreSQL (Supabase)           |
| Queue              | Redis (Upstash)                 |
| Frontend           | Next.js + TypeScript + Tailwind |
| State              | Zustand                         |
| Charts             | Recharts                        |
| WhatsApp           | Meta Cloud API                  |
| Payments           | PayHero (M-Pesa STK Push)       |
| Hosting — Backend  | Render                          |
| Hosting — Frontend | Vercel                          |

## MVP Features

1. Business signup and WhatsApp number connection via Meta Embedded Signup
2. Auto-reply to incoming customer messages with 4-hour cooldown
3. Dashboard — Overview, Conversations, Automations, Contacts, Analytics, Settings
4. M-Pesa subscription billing via PayHero

---

## Credentials (Saved Locally in .env)

- `PHONE_NUMBER_ID`: 1089779964214051
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: 1468101211513331
- `META_APP_ID`: 1291380596389693
- `ACCESS_TOKEN`, `META_APP_SECRET`: saved in local .env file

---

## Build Milestones

| Month   | Goal                                     |
| ------- | ---------------------------------------- |
| Month 1 | Build and deploy MVP                     |
| Month 2 | Onboard 3 free beta clients              |
| Month 3 | Start charging — KES 2,000/month minimum |

---

## Progress Tracker

### Infrastructure

- [x] Meta Developer account created
- [x] Convyr app created on Meta Developer Portal
- [x] WhatsApp Business API connected and tested
- [x] First test message sent and received successfully
- [x] GitHub repository created
- [x] Render backend deployed at convyr-backend.onrender.com
- [x] Supabase project created and database live
- [x] Upstash Redis instance created
- [x] Vercel frontend deployed at convyr.vercel.app
- [x] Privacy Policy live at convyr.vercel.app/privacy
- [x] Terms of Service live at convyr.vercel.app/terms
- [x] Meta app settings completed — domains, privacy URL, ToS URL, category, data deletion callback
- [x] Meta Business Verification submitted — In Review (April 12, 2026)
- [ ] Meta Business Verification approved
- [ ] Meta App Review submitted and approved
- [ ] Meta app moved to Live mode

### Backend

- [x] FastAPI project structure
- [x] WhatsApp webhook receiver
- [x] Auto-reply engine with 4-hour cooldown per contact
- [x] Fallback reply with cooldown
- [x] Read receipts and typing indicator simulation
- [x] Database schema — users, businesses, contacts, messages, automations, payments
- [x] JWT authentication
- [x] PayHero M-Pesa STK Push + callbacks
- [x] WhatsApp Embedded Signup token exchange
- [x] WhatsApp disconnect endpoint
- [x] Account deletion endpoint
- [x] Meta data deletion callback endpoint
- [ ] Celery background workers

### Frontend

- [x] Next.js + TypeScript + Tailwind setup
- [x] Auth pages — login, register
- [x] Dashboard layout with sidebar
- [x] Overview page — stats, recent messages, WhatsApp connection banner
- [x] Conversations page — 5s polling, smart scroll, oldest-to-newest
- [x] Automations page — create, edit, toggle, delete
- [x] Contacts page
- [x] Analytics page — stat cards, line chart, peak hour heatmap, top contacts, top automations
- [x] Analytics print report — 2-page PDF layout
- [x] Settings page — account info, WhatsApp status, change number, disconnect, subscription, delete account
- [x] Connect WhatsApp page — Meta Embedded Signup flow
- [x] Marketing pages — About, Pricing, Contact, Privacy, Terms
- [x] Footer with Legal links

### Launch

- [ ] Meta app Live mode approved
- [ ] Beta clients onboarded (target: 3)
- [ ] Domain registered
- [ ] First paying client

---

## Developer

**Wycliff Kimani**
Founder & CEO — DevCraft Solutions
Available: 2-3 hours evenings + weekends
Budget: Zero (time is the investment)
Skills: Python, FastAPI, Next.js, Android, AI/ML
Location: Kenya
