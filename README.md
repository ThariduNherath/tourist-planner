# Tourist Planner

A local day-visit planner for Nugawela, near Kandy (25 km radius), built with Next.js, TypeScript, Tailwind CSS, Supabase, and Leaflet. Visitors can discover nearby attractions, view details, and build a one-day itinerary with timings and travel estimates. Administrators manage the place catalog from a secure dashboard.

ITE2953 Programming Group Project (25S1) 

## Overview

Visitors can:

- browse places, search, sort, and filter by category
- read descriptions, opening hours, entry fee, best time to visit, facilities, travel tips, and distance
- view places on an interactive map and open directions in Google Maps
- build a one-day plan: add stops, reorder them, set time spent at each stop
- see arrival and leave times, distance and estimated travel time between stops, and opening-hours warnings
- copy the plan or print / save it as PDF

Administrators can:

- sign in securely with Supabase Auth
- add, edit, and delete places (with a map location picker)
- view dashboard statistics (places per category, average distance, image coverage)

## Tech stack

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Row Level Security)
- Leaflet + react-leaflet with OpenStreetMap tiles (no API key needed)
- Jest for unit tests
- Vercel for hosting, Git/GitHub for version control

## Project structure

```text
.
├── app/
│   ├── admin/
│   │   ├── dashboard/page.tsx   # admin CRUD dashboard
│   │   └── login/page.tsx       # admin login
│   ├── map/page.tsx             # full map view
│   ├── places/
│   │   ├── page.tsx             # place list, search, filters
│   │   └── [id]/page.tsx        # place detail page
│   ├── plan/page.tsx            # day-plan builder
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # home page
├── components/
│   ├── AmbientBackground.tsx
│   ├── CategoryFilter.tsx
│   ├── DataContext.tsx          # places data provider
│   ├── HeroBanner.tsx
│   ├── LocationPicker.tsx
│   ├── MapView.tsx
│   ├── MapViewLoader.tsx
│   ├── NavBar.tsx
│   ├── PlaceCard.tsx
│   ├── PlanContext.tsx          # local day-plan provider
│   └── Toast.tsx
├── lib/
│   ├── supabase.ts              # browser Supabase client
│   ├── supabase-server.ts       # server-side Supabase client
│   ├── types.ts                 # Place / Category types
│   └── utils.ts                 # time, distance, travel-time helpers
├── public/hero/                 # hero images
├── supabase/schema.sql          # schema, policies, seed data
├── tests/utils.test.ts          # Jest unit tests
├── .env.example
├── middleware.ts                # admin route protection
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
└── README.md
```

## Core user flows

### Public visitor

1. Land on the home page and see nearby favourites.
2. Browse places, search, sort, and filter by category.
3. Open a place to see hours, entry fee, best time, facilities, tips, and map.
4. Add stops to the day plan.
5. On the plan page, set the start time, reorder stops, and choose time at each stop.
6. Review the timeline, travel estimates, and route on the map, then copy or print the plan.

### Admin

1. Sign in at `/admin/login`.
2. The app checks the Supabase session and confirms the user is in the `admins` table.
3. Create, edit, or delete places.
4. Changes are written to the `places` table and appear on public pages after reload.

## Data model

Main table: `places` (defined in `supabase/schema.sql`).

| Column | Description |
|---|---|
| `id` | record identifier |
| `name` | place title |
| `category` | Religious, Nature, Heritage, Cultural, or Sightseeing |
| `distance_km` | approximate distance from Nugawela |
| `description` | general description |
| `opening_time`, `closing_time` | optional opening and closing times |
| `opening_hours` | fallback text when exact times are not available |
| `entry_fee` | optional text, e.g. "Free" or "Rs. 1,000 (foreign) / Rs. 100 (local)" |
| `best_time` | optional text, e.g. "Early morning, 6-9 AM" |
| `travel_tips` | practical tips (dress code, parking, etc.) |
| `facilities` | text array of amenities |
| `latitude`, `longitude` | map coordinates |
| `image_url` | optional image URL |
| `created_at` | timestamp |

Admin table: `admins` (`user_id` references `auth.users`).

The day plan is not stored in the database. It is kept in the browser (`localStorage`).

The TypeScript type lives in `lib/types.ts`.

## Travel time estimate

For each leg between two consecutive stops:

- distance = straight-line (haversine) distance between the two places
- road distance is approximated as distance x 1.4
- speed is chosen automatically from the leg distance: `min(40, 20 + 2 x km)` km/h (short city legs are slower, longer legs faster)
- time = road distance / speed, rounded to the nearest 5 minutes (minimum 5)
- the visitor can type a speed override on the plan page to apply one speed to all legs

This is an approximation, not live routing or real traffic data.

## Environment setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

```bash
copy .env.example .env.local
```

Contents:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create a Supabase project

1. Open Supabase and create a new project.
2. Open the SQL editor and run the full contents of `supabase/schema.sql`.
3. This creates the `places` and `admins` tables, seed records, and policies.

If your database was created before `entry_fee` and `best_time` were added, run:

```sql
alter table places add column if not exists entry_fee text;
alter table places add column if not exists best_time text;
```

### 4. Create an admin account

1. Supabase Dashboard, Authentication, Users: add a user.
2. Insert that user's id into the `admins` table:

```sql
insert into admins (user_id) values ('<auth-user-uuid>');
```

3. Sign in at `/admin/login`.

## Local development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Admin security model

- `middleware.ts` redirects unauthenticated visitors away from `/admin/dashboard`.
- The dashboard checks the Supabase session and verifies the user exists in the `admins` table.
- Writes to `places` are enforced by Supabase Row Level Security (public read, admin-only write). This is the real protection; client-side checks are for user experience.

## Deployment (Vercel)

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Deploy.

## Scripts

```bash
npm run dev
npm run build
npm start
npm run test
npm run lint
```

## Testing

Unit tests (Jest) cover the helpers in `lib/utils.ts`: category filtering, distance sum and sorting, time formatting, minutes conversion, haversine distance, travel time, and automatic speed.

```bash
npm run test
```

Manual test cases (browse, filter, plan builder, admin CRUD, route protection, mobile layout) are documented in the project report, Chapter 5.

## Troubleshooting

### Map or Leaflet install issues

```bash
npm install --legacy-peer-deps
```

### Admin login keeps redirecting

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
- the user exists in Supabase Auth
- the user's id is present in the `admins` table

### Public pages show no data

- the `places` table exists and the seed script ran
- the public read policy on `places` is enabled
- the environment variables point to the right Supabase project

### Saving a place fails with a column error

- run the `alter table` statements in the environment setup section to add `entry_fee` and `best_time`

## Scope and limitations

- Focused on information and one-day visit planning: no booking, no payment, no hotel or transport reservation.
- Travel time is an estimate based on straight-line distance, not live routing.
- The day plan is stored per browser and is not synced across devices.
- The map uses free OpenStreetMap tiles.

## Future work

- public transport information
- distance-radius filter
- auto-optimised stop order
- real routing API for accurate travel times


