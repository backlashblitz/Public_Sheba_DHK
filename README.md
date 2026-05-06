# 🌊 Public Sheba DHK
### Real-time Utility Monitoring Platform for Dhaka, Bangladesh

[![Live Demo](https://img.shields.io/badge/Live%20Demo-public--sheba--dhk.vercel.app-blue?style=for-the-badge&logo=vercel)](https://public-sheba-dhk.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 🌐 Live Application

**👉 [https://public-sheba-dhk.vercel.app](https://public-sheba-dhk.vercel.app)**

Open the link in any browser on any device — phone, tablet, or computer. No installation needed.

---

## 📖 What is Public Sheba DHK?

**Public Sheba DHK** is a real-time crowdsourced utility monitoring platform built specifically for the residents of **Dhaka, Bangladesh**. It allows citizens to report and track water, electricity, and gas issues across 12 major zones in Dhaka — helping communities stay informed about utility outages and problems in their area.

> "Empowering Dhaka residents with real-time utility information — built by the community, for the community."

---

## ✨ Features

### For Users
- 🗺️ **Live Zone Map** — Interactive map showing real-time utility status across 12 Dhaka zones
- 📋 **Report Issues** — Submit water, electricity, or gas problems in your area with location details
- 🔔 **Zone Subscriptions** — Subscribe to your zone and get notified about new issues
- 👍 **Me Too Button** — Confirm existing reports to increase their visibility
- 📡 **Live Report Feed** — See all active reports updating in real-time every 15 seconds
- 🌐 **Bilingual Support** — Full English and Bangla (বাংলা) language support
- 📊 **Smart Diagnosis** — After submitting a report, get an instant diagnosis of how widespread the issue is
- 🔑 **Forgot Password** — Easy password recovery via email

### For Admins
- ⚙️ **Zone Control Panel** — Manually update water, electricity, and gas status for each zone
- 💬 **Reply to Reports** — Send official replies to user-submitted reports
- ✅ **Mark as Solved** — Close resolved issues
- 📢 **Announcements** — Post scheduled maintenance and outage announcements
- 📊 **Dashboard Stats** — View active reports, affected zones, and solved issues

### Smart Threshold System
The platform automatically upgrades zone status based on report count:
- **10+ reports** in 2 hours → Zone marked as **Issues** ⚠️
- **25+ reports** in 2 hours → Zone marked as **Outage** 🚨

---

## 🏙️ Supported Zones

| Zone | Zone | Zone | Zone |
|------|------|------|------|
| Mirpur-10 | Mirpur-1 | Pallabi | Kafrul |
| Dhanmondi | Gulshan-1 | Gulshan-2 | Banani |
| Uttara | Mohammadpur | Rayer Bazar | Badda |

---

## 🚀 How to Use the Live App

### Step 1 — Open the app
Go to **[https://public-sheba-dhk.vercel.app](https://public-sheba-dhk.vercel.app)** in your browser.

### Step 2 — Create an account
- Click **Sign up**
- Enter your name, email, and password
- Click **Create account**
- You are in!

### Step 3 — Report an issue
- Click **Report Issue** in the navbar
- Select your utility type (Water / Electricity / Gas)
- Select your zone and enter your address
- Choose the issue type
- Choose how long it has been going on
- Click **Submit Report**

### Step 4 — View the live map
- Click **Live Map** in the navbar
- Green dots = Normal ✅
- Yellow dots = Issues ⚠️
- Red dots = Outage 🚨
- Click any dot to see detailed status

### Step 5 — Subscribe to your zone
- Click any zone dot on the map
- Click **Subscribe to alerts**
- You will receive notifications when issues are reported in your zone

### Step 6 — Switch language
- Click **বাং** in the navbar to switch to Bangla
- Click **EN** to switch back to English

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** | Frontend + Backend (App Router) |
| **Supabase** | Database, Authentication, Real-time |
| **Leaflet.js + OpenStreetMap** | Interactive zone map |
| **Tailwind CSS** | Styling |
| **Vercel** | Hosting and deployment |

---

## 🗄️ Database Schema

```sql
-- Zones: tracks utility status per zone
zones (id, name, slug, lat, lng, water_status, electricity_status, gas_status, report_count)

-- Reports: user-submitted utility issues
reports (id, zone_id, zone_name, utility_type, issue_type, started, description, specific_location, address, photo_url, upvotes, user_id, user_email, status, admin_reply, created_at)

-- Upvotes: tracks who confirmed which report
upvotes (id, report_id, user_id, created_at)

-- Subscriptions: zone alert subscriptions
subscriptions (id, user_id, zone_id, created_at)

-- Notifications: user notifications
notifications (id, user_id, zone_id, zone_name, message, is_read, created_at)

-- Announcements: admin announcements
announcements (id, title, message, zone_name, starts_at, ends_at, created_at)

-- Profiles: user profile data
profiles (id, username, email, created_at)
```

---

## 💻 Run Locally

Want to run this project on your own computer? Follow these steps:

### Prerequisites
- Node.js installed ([nodejs.org](https://nodejs.org))
- A Supabase account ([supabase.com](https://supabase.com))

### Step 1 — Clone the repository
```bash
git clone https://github.com/backlashblitz/Public_Sheba_DHK.git
cd Public_Sheba_DHK/Public_Sheba_DHK
```

### Step 2 — Install dependencies
```bash
npm install
```

### Step 3 — Set up environment variables
Create a `.env.local` file in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ADMIN_EMAILS=your_admin_email@gmail.com
```

### Step 4 — Set up Supabase database
Run these SQL commands in your Supabase SQL Editor:
```sql
-- Create zones table
create table zones (
  id text primary key,
  name text,
  lat float,
  lng float,
  water_status text default 'normal',
  electricity_status text default 'normal',
  gas_status text default 'normal',
  report_count int default 0
);

-- Create reports table
create table reports (
  id uuid default gen_random_uuid() primary key,
  zone_id text,
  zone_name text,
  utility_type text default 'water',
  issue_type text,
  started text,
  description text,
  specific_location text,
  address text,
  photo_url text,
  upvotes int default 0,
  user_id uuid,
  user_email text,
  status text default 'active',
  admin_reply text,
  created_at timestamptz default now()
);

-- Create profiles table
create table profiles (
  id uuid references auth.users primary key,
  username text,
  email text,
  created_at timestamptz default now()
);
```

### Step 5 — Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Screenshots

### Login Page
Beautiful split-screen design with animated crisis statistics and smooth transitions.

### Live Zone Map
Interactive Leaflet map showing real-time utility status for all 12 Dhaka zones with color-coded markers.

### Report Issue
Step-by-step report form with smart utility type detection and instant community diagnosis.

### Admin Dashboard
Full control panel for zone management, report handling, and announcement publishing.

---

## 👨‍💻 Developer

**Developed by:** Rahin
**Year:** 2026

---

## 🤝 Contributing

This project is open for contributions! If you want to improve the app:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit (`git commit -m 'Add your feature'`)
5. Push (`git push origin feature/your-feature`)
6. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- **OpenStreetMap** — for the free map tiles
- **Supabase** — for the free backend infrastructure
- **Vercel** — for free hosting
- **Dhaka residents** — for inspiring this project

---

<div align="center">



[🌐 Live App](https://public-sheba-dhk.vercel.app) · [🐛 Report Bug](https://github.com/backlashblitz/Public_Sheba_DHK/issues) · [💡 Request Feature](https://github.com/backlashblitz/Public_Sheba_DHK/issues)

</div>
