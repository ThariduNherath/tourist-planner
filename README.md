# Tourist Planner

A local day-visit planner for Nugawela, near Kandy, built with Next.js, TypeScript, Tailwind CSS, Supabase, and Leaflet. The app helps visitors discover nearby attractions, view details, build a custom itinerary, and manage a curated list of places from an admin dashboard.

## Overview

This project is designed for a tourism experience in a small local area. Visitors can:

- browse places by category
- read descriptions, timings, travel tips, and distances
- view the location on an interactive map
- save a one-day route in the browser
- print or copy a plan for mobile use during travel

Administrators can:

- sign in securely with Supabase Auth
- add new places
- edit place details
- delete place entries
- keep the public catalog current and accurate

## Tech stack

- Next.js 14 with App Router
- React 18 + TypeScript
- Tailwind CSS
- Supabase for database + authentication
- Leaflet + react-leaflet for map rendering
- Jest for test support

## Project structure

```text
.
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── page.tsx        # admin CRUD dashboard
│   │   └── login/
│   │       └── page.tsx        # admin login
│   ├── map/
│   │   └── page.tsx            # full map view
│   ├── places/
│   │   ├── page.tsx            # place list and filters
│   │   └── [id]/
│   │       └── page.tsx        # detailed place page
│   ├── plan/
│   │   └── page.tsx           # itinerary builder
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # home page
├── components/
│   ├── AmbientBackground.tsx
│   ├── CategoryFilter.tsx
│   ├── DataContext.tsx        # place data provider
│   ├── HeroBanner.tsx
│   ├── LocationPicker.tsx
│   ├── MapView.tsx
│   ├── MapViewLoader.tsx
│   ├── NavBar.tsx
│   ├── PlaceCard.tsx
│   ├── PlanContext.tsx        # local plan provider
│   └── Toast.tsx
├── lib/
│   ├── supabase.ts            # browser Supabase client
│   ├── supabase-server.ts     # server-side Supabase client
│   ├── types.ts               # place/category types
│   └── utils.ts               # formatting and distance helpers
├── public/
│   └── hero/
├── supabase/
│   └── schema.sql             # database schema and seed data
├── tests/
│   └── utils.test.ts
├── .env.example               # environment template
├── middleware.ts              # admin access protection
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── jest.config.js
├── README.md
└── text.txt
```

## Core user flows

### Public visitor experience

1. A user lands on the home page and sees favourite nearby attractions.
2. They browse places and filter by category.
3. They open a place detail page to read the description, timings, and travel tips.
4. They add chosen stops to the personal day plan.
5. They reorder, remove, or adjust visit durations for each stop.
6. They view the route on the map and print/copy the final itinerary.

### Admin workflow

1. Admin user signs in at `/admin/login`.
2. App checks Supabase Auth session and verifies admin role.
3. Admin can create new place entries or update existing records.
4. Changes are sent to the `places` table in Supabase.
5. Public pages immediately reflect the latest data through the client fetch layer.

## Data model

The main database table is `places` and is defined in `supabase/schema.sql`.

Key fields:

- `id`: record identifier
- `name`: place title
- `category`: category such as Religious, Nature, Heritage, Cultural, or Sightseeing
- `distance_km`: approximate distance from a central location
- `description`: general description of the place
- `opening_time`: optional opening time
- `closing_time`: optional closing time
- `opening_hours`: fallback text if specific hours are not available
- `travel_tips`: practical tips for visitors
- `latitude` and `longitude`: map coordinates
- `image_url`: optional image source
- `facilities`: string array or list of amenities
- `created_at`: timestamp

The TypeScript type for this model lives in `lib/types.ts`.

## Environment setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

Copy the example file and fill in your Supabase values:

```bash
copy .env.example .env.local
```

Example contents:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create a Supabase project

1. Open Supabase.
2. Create a new project.
3. Open the SQL editor.
4. Run the full contents of `supabase/schema.sql`.
5. This creates the `places` table, inserts seed records, and configures the required policies.

### 4. Create an admin account

1. Go to Supabase Dashboard → Authentication → Users.
2. Add an admin user.
3. Use those credentials at `/admin/login`.

## Runtime and local development

Start the app:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Admin security model

The app uses a simple but effective protection flow:

- `middleware.ts` blocks unauthenticated access to `/admin/dashboard`
- the admin dashboard checks the current Supabase session
- a database lookup verifies that the user belongs to the `admins` table
- writes to the `places` table are protected by Supabase Row Level Security

This prevents public users from modifying data while still allowing the admin to manage content from the app.

## Deployment

The project is ready for deployment on Vercel.

### Vercel deployment steps

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy the app.

## Useful scripts

```bash
npm run dev
npm run build
npm start
npm run test
npm run lint
```

## Testing

The repo includes a simple Jest setup for utility validation.

```bash
npm run test
```

## Troubleshooting

### Map or Leaflet issues

If you hit dependency problems with Leaflet packages, run:

```bash
npm install --legacy-peer-deps
```

### Admin login is redirecting

Check the following:

- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is present
- the user exists in Supabase Auth
- the user record is present in the `admins` table

### Data is empty on the public pages

Check if:

- the `places` table exists
- the SQL seed script ran successfully
- the browser client can access the Supabase project
- the public table policies allow read access

## Contributing

To extend this app:

- keep business logic in `lib/` helpers where possible
- keep the route pages focused on UI flow and composition
- store shared state in the provider components rather than duplicating fetch logic
- keep styles consistent with the existing Tailwind theme

## Documentation index

For more detailed instructions, see:

- [docs/README.md](docs/README.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/SETUP.md](docs/SETUP.md)

## Notes

- The project is intentionally scoped to a single-day local tourist planner and does not include booking or payment flows.
- The map uses free OpenStreetMap tiles and does not require an API key.
- The itinerary persists locally in the browser using `localStorage`, which is appropriate for a no-login route planner.
