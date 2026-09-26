# Database Setup — Supabase

## Overview

This project uses **Supabase** (PostgreSQL) as its backend database. The database stores user profiles (managed by Supabase Auth), rug favorites, and order/payment records.

---

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New project"**
3. Name: `woven-gallery` (or your preference)
4. Set a **database password** — save it somewhere safe
5. Choose a region closest to your users
6. Click **"Create new project"** — wait ~2 minutes for provisioning

---

## Step 2: Get API Keys

Navigate to **Project Settings > API**:

| Key | Where to Use |
|-----|-------------|
| **Project URL** | `VITE_SUPABASE_URL` + `SUPABASE_URL` in `.env` |
| **Public anon key** | `VITE_SUPABASE_ANON_KEY` in `.env` (client-side) |
| **Secret/service role key** | `SUPABASE_SERVICE_ROLE_KEY` in `.env` (server-side only) |

---

## Step 3: Enable Authentication

1. Go to **Authentication > Providers**
2. Enable **Email** provider
3. Add `http://localhost:5173` to **Redirect URLs**
4. Optional: Enable Google, GitHub, etc. under **Social providers**

---

## Step 4: Create Database Tables

Open the **SQL Editor** (left sidebar) and run the following:

```sql
-- Favorites table (per-user saved rugs)
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  image text not null,
  price text,
  created_at timestamp with time zone default now(),
  unique(user_id, title)
);

alter table public.favorites enable row security;

create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- Orders table (purchases)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  rug_title text not null,
  rug_image text not null,
  amount integer not null,
  currency text default 'usd',
  stripe_payment_intent_id text,
  status text default 'pending' check (status in ('pending', 'awaiting_payment', 'paid', 'failed', 'refunded')),
  created_at timestamp with time zone default now()
);

alter table public.orders enable row security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);
```

---

## Row Level Security (RLS)

All tables have RLS enabled. This means:

- Users can only **see** their own rows
- Users can only **insert/delete** their own rows
- The **service role key** (used by the backend server) bypasses RLS — never expose it to the client

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Project URL (client) |
| `VITE_SUPABASE_ANON_KEY` | Yes | Anon public key (client) |
| `SUPABASE_URL` | Yes | Project URL (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Service role key (server only) |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe public key (client) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (server only) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Webhook signing secret (server) |

---

## Database Schema Diagram

```
auth.users (Supabase Auth)
  │
  ├── public.favorites
  │     ├── id (uuid, PK)
  │     ├── user_id (uuid, FK → auth.users)
  │     ├── title (text)
  │     ├── image (text)
  │     ├── price (text)
  │     └── created_at (timestamptz)
  │
  └── public.orders
        ├── id (uuid, PK)
        ├── user_id (uuid, FK → auth.users)
        ├── rug_title (text)
        ├── rug_image (text)
        ├── amount (integer, cents)
        ├── currency (text)
        ├── stripe_payment_intent_id (text)
        ├── status (text enum)
        └── created_at (timestamptz)
```

---

## Useful Commands

```bash
# Start backend server locally
cd server && bun install && bun run dev

# Or with npm
cd server && npm install && npm run dev
```
