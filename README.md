# Local Tourist Day-Visit Planner (Kandy/Nugawela)

Stack: Next.js 14 (App Router, TypeScript) + Tailwind CSS + Supabase (Postgres + Auth) + Leaflet.js. Deploy: Vercel.

## Project structure
```
app/
  page.tsx                 -> Home: browse/filter places + map
  places/[id]/page.tsx     -> Place detail page
  plan/page.tsx            -> One-day visit plan builder (localStorage, no login)
  admin/login/page.tsx     -> Admin login (Supabase Auth)
  admin/dashboard/page.tsx -> Admin CRUD (protected)
components/
  PlaceCard.tsx, CategoryFilter.tsx, MapView.tsx, MapViewLoader.tsx, PlanContext.tsx
lib/
  supabase.ts (browser client), supabase-server.ts (server client), types.ts
middleware.ts               -> Protects /admin/dashboard
supabase/schema.sql          -> DB schema + RLS policies + seed data (10 places)
```

## Setup steps

1. **Install Node.js 18+** if not already installed.

2. **Create a Supabase project** at supabase.com (free tier is fine).

3. **Run the schema**: In Supabase Dashboard → SQL Editor → New query, paste the entire contents of `supabase/schema.sql` and run it. This creates the `places` table, Row Level Security policies (public read, authenticated-only write), and inserts the 10 seed places from the proposal.

4. **Create an admin user**: Supabase Dashboard → Authentication → Users → Add user. Use this email/password to log in at `/admin/login`.

5. **Get your API keys**: Supabase Dashboard → Project Settings → API. Copy the Project URL and the `anon public` key.

6. **Configure environment variables**: copy `.env.local.example` to `.env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

7. **Install dependencies**:
   ```
   npm install
   ```

8. **Run locally**:
   ```
   npm run dev
   ```
   Open http://localhost:3000

9. **Deploy to Vercel**:
   - Push this project to a GitHub repo.
   - Import the repo in Vercel.
   - Add the two environment variables (step 6) in Vercel → Project Settings → Environment Variables.
   - Deploy.

## Features implemented (mapped to requirements)

**Tourist (public, no login)**
- View list of places, filter by category (`app/page.tsx`, `CategoryFilter.tsx`)
- View details: description, opening hours, travel tips, distance (`places/[id]/page.tsx`)
- View location on interactive map (Leaflet + OpenStreetMap, `MapView.tsx`)
- Build a one-day visit plan: add/remove/reorder places, plan persists in browser via `localStorage` (`plan/page.tsx`, `PlanContext.tsx`)

**Administrator (authenticated via Supabase Auth)**
- Login/logout (`admin/login`)
- Add, edit, delete place records (`admin/dashboard`)
- Route protected by `middleware.ts` + Row Level Security on the database (writes require an authenticated session)

## Notes
- No booking/payment features, per project scope.
- Map tiles are free OpenStreetMap tiles via Leaflet — no API key needed.
- If `npm install` fails on `leaflet`/`react-leaflet` peer deps, run `npm install --legacy-peer-deps`.
