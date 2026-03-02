# Kidz Dream Shop Manager

A React + Tailwind CSS app for managing kids clothing and costume sales.

## Features

- Add sales by selecting costume and age/size
- Auto-fill price from your Ghana Cedi price catalog
- Indicate payment method (Cash, Mobile Money, Bank Transfer)
- Add buyer phone number for customer follow-up calls
- Auto-calculate total per sale
- Show daily summary of all sales
- Show full costume price list with age/size and price
- Persist sales using localStorage
- Display total daily sales at the top
- Save and show daily totals by date automatically
- Show automatic monthly sales total from recorded sales
- Optional live sync with Supabase (multi-device)
- Works offline as an installable PWA (syncs pending sales when internet returns)

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Supabase live sync setup

1. Create a new Supabase project.
2. In Supabase SQL Editor, run [supabase/schema.sql](supabase/schema.sql).
3. In project settings, copy:
	- Project URL
	- Anon public key
4. Create a local `.env` file from [.env.example](.env.example):

```bash
cp .env.example .env
```

5. Fill in your values in `.env`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

When keys are set, the app uses Supabase for live shared sales data.
Without keys, it automatically uses localStorage fallback.

## Deploy (Vercel)

1. Push this project to GitHub.
2. In Vercel, import the repository.
3. Set build settings:
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Add environment variables in Vercel project settings:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
5. Deploy.

## Deploy (Netlify)

1. Push this project to GitHub.
2. In Netlify, add new site from Git.
3. Set build settings:
	- Build Command: `npm run build`
	- Publish Directory: `dist`
4. Add environment variables:
	- `VITE_SUPABASE_URL`
	- `VITE_SUPABASE_ANON_KEY`
5. Deploy.

## Offline usage (PWA)

- Open the deployed app once while online.
- Install it to your device:
	- Android/Chrome: menu → Install app
	- iPhone/Safari: Share → Add to Home Screen
- After install, app pages load offline.
- Sales entered offline are saved locally and auto-sync to Supabase when internet returns.
