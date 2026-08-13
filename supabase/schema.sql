-- Run this whole file in Supabase SQL Editor (Project -> SQL Editor -> New query)

create table if not exists places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Religious','Nature','Heritage','Cultural','Sightseeing')),
  distance_km numeric not null,
  description text not null,
  opening_hours text not null,
  travel_tips text not null,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz default now()
);

alter table places enable row level security;

-- Public (anon) can read all places
create policy "Public read access" on places
  for select using (true);

-- Only authenticated (admin) users can insert/update/delete
create policy "Admin insert" on places
  for insert to authenticated with check (true);

create policy "Admin update" on places
  for update to authenticated using (true);

create policy "Admin delete" on places
  for delete to authenticated using (true);

-- Seed data (Nugawela / Kandy, 25km radius) matching the project proposal
insert into places (name, category, distance_km, description, opening_hours, travel_tips, latitude, longitude) values
('Sri Dalada Maligawa (Temple of the Tooth)', 'Religious', 10, 'Sri Lanka''s most sacred Buddhist temple, houses the Sacred Tooth Relic.', '5:30 AM - 8:00 PM', 'Dress modestly (cover shoulders/knees). Entry fee for foreign visitors.', 7.2936, 80.6413),
('Udawatta Kele Sanctuary', 'Nature', 10, 'Ancient rainforest reserve in Kandy city with peaceful walking trails.', '6:00 AM - 6:00 PM', 'Small entry fee. Wear comfortable shoes, watch for monkeys.', 7.3000, 80.6400),
('Kandy Viewpoint (Arthur''s Seat)', 'Sightseeing', 11, 'Panoramic viewpoint overlooking Kandy city and lake.', 'Open 24 hours', 'Best visited at sunset for the best views.', 7.2925, 80.6337),
('Sri Maha Bodhi Viharaya (Bahirawakanda Buddha)', 'Religious', 11, 'Large hilltop Buddha statue offering sweeping city views.', '6:00 AM - 9:00 PM', 'Some steps to climb; free entry, donations welcome.', 7.2954, 80.6259),
('Asgiri Maha Vihara', 'Heritage', 10.5, 'Historic monastery with an ornate stupa and wood carvings.', '7:00 AM - 6:00 PM', 'Remove shoes before entering shrine rooms.', 7.2969, 80.6317),
('Royal Palace Park', 'Nature', 10, 'Hilltop garden with views over Kandy Lake.', '8:00 AM - 6:00 PM', 'Small entry fee, good for a short relaxed walk.', 7.2942, 80.6428),
('Museum of the Tusker Rajah', 'Heritage', 10, 'Museum honouring Rajah, the ceremonial tusker elephant.', '9:00 AM - 5:00 PM', 'Located next to the Temple of the Tooth; quick 20-30 min visit.', 7.2933, 80.6410),
('Nagasthenna Waterfall', 'Nature', 9, 'Small waterfall located within Kandy town itself.', 'Open daylight hours', 'Can get slippery near the rocks after rain.', 7.2833, 80.6167),
('Narampanawa Waterfall', 'Nature', 24, 'Scenic forest waterfall safe for bathing.', '7:00 AM - 5:00 PM', 'Requires a short hike; bring water and wear grip shoes.', 7.1667, 80.7000),
('Hunas Waterfall (Hunnasgiriya)', 'Nature', 22, 'Waterfall with a natural pool and picnic area.', '7:00 AM - 5:00 PM', 'Popular for picnics on weekends; arrive early to avoid crowds.', 7.3667, 80.7500);
