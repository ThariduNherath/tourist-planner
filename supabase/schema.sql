-- Safe to run on a NEW or EXISTING database (Supabase -> SQL Editor -> New query)

-- 1) places table (full column set used by the app)
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
alter table places add column if not exists opening_time time;
alter table places add column if not exists closing_time time;
alter table places add column if not exists facilities text[];
alter table places add column if not exists entry_fee text;
alter table places add column if not exists best_time text;
alter table places add column if not exists image_url text;

-- 2) admins table
create table if not exists admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table admins enable row level security;
drop policy if exists "Read own admin row" on admins;
create policy "Read own admin row" on admins
  for select to authenticated using (user_id = auth.uid());
-- no insert/update/delete policies: admins are added only from the SQL editor

-- 3) is_admin() helper
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 4) places RLS: public read, admin-only write
alter table places enable row level security;
drop policy if exists "Public read access" on places;
drop policy if exists "Admin insert" on places;
drop policy if exists "Admin update" on places;
drop policy if exists "Admin delete" on places;
create policy "Public read access" on places for select using (true);
create policy "Admin insert" on places for insert to authenticated with check (public.is_admin());
create policy "Admin update" on places for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admin delete" on places for delete to authenticated using (public.is_admin());

-- 5) seed data (only if the table is empty)
insert into places (name, category, distance_km, description, opening_hours, travel_tips, latitude, longitude)
select * from (values
('Sri Dalada Maligawa (Temple of the Tooth)', 'Religious', 10, 'Sri Lanka''s most sacred Buddhist temple, houses the Sacred Tooth Relic.', '5:30 AM - 8:00 PM', 'Dress modestly (cover shoulders/knees). Entry fee for foreign visitors.', 7.2936, 80.6413),
('Udawatta Kele Sanctuary', 'Nature', 10, 'Ancient rainforest reserve in Kandy city with peaceful walking trails.', '6:00 AM - 6:00 PM', 'Small entry fee. Wear comfortable shoes, watch for monkeys.', 7.3000, 80.6400),
('Kandy Viewpoint (Arthur''s Seat)', 'Sightseeing', 11, 'Panoramic viewpoint overlooking Kandy city and lake.', 'Open 24 hours', 'Best visited at sunset for the best views.', 7.2925, 80.6337),
('Sri Maha Bodhi Viharaya (Bahirawakanda Buddha)', 'Religious', 11, 'Large hilltop Buddha statue offering sweeping city views.', '6:00 AM - 9:00 PM', 'Some steps to climb; free entry, donations welcome.', 7.2954, 80.6259),
('Asgiri Maha Vihara', 'Heritage', 10.5, 'Historic monastery with an ornate stupa and wood carvings.', '7:00 AM - 6:00 PM', 'Remove shoes before entering shrine rooms.', 7.2969, 80.6317),
('Royal Palace Park', 'Nature', 10, 'Hilltop garden with views over Kandy Lake.', '8:00 AM - 6:00 PM', 'Small entry fee, good for a short relaxed walk.', 7.2942, 80.6428),
('Museum of the Tusker Rajah', 'Heritage', 10, 'Museum honouring Rajah, the ceremonial tusker elephant.', '9:00 AM - 5:00 PM', 'Located next to the Temple of the Tooth; quick 20-30 min visit.', 7.2933, 80.6410),
('Nagasthenna Waterfall', 'Nature', 9, 'Small waterfall located within Kandy town itself.', 'Open daylight hours', 'Can get slippery near the rocks after rain.', 7.2833, 80.6167),
('Narampanawa Waterfall', 'Nature', 24, 'Scenic forest waterfall safe for bathing.', '7:00 AM - 5:00 PM', 'Requires a short hike; bring water and wear grip shoes.', 7.1667, 80.7000),
('Hunas Waterfall (Hunnasgiriya)', 'Nature', 22, 'Waterfall with a natural pool and picnic area.', '7:00 AM - 5:00 PM', 'Popular for picnics on weekends; arrive early to avoid crowds.', 7.3667, 80.7500)
) as v(name, category, distance_km, description, opening_hours, travel_tips, latitude, longitude)
where not exists (select 1 from places);

-- 6) exact opening/closing times so the plan page can warn about opening hours
update places p set opening_time = v.o::time, closing_time = v.c::time
from (values
  ('Sri Dalada%','05:30','20:00'), ('Udawatta%','06:00','18:00'), ('Sri Maha Bodhi%','06:00','21:00'),
  ('Asgiri%','07:00','18:00'), ('Royal Palace%','08:00','18:00'), ('Museum of the Tusker%','09:00','17:00'),
  ('Narampanawa%','07:00','17:00'), ('Hunas%','07:00','17:00')
) as v(n, o, c)
where p.name like v.n and p.opening_time is null;

-- 7) add an admin (replace with the uuid from Authentication -> Users)
-- insert into admins (user_id) values ('<auth-user-uuid>') on conflict do nothing;
