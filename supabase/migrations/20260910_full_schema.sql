-- ==============================================================================
-- 🌿 โครงสร้างฐานข้อมูลระบบ "ปลูกเพลิน (PlookPloen)" ฉบับสมบูรณ์ (9 ตาราง + Data)
-- อ้างอิงตามเอกสารโครงงานบทที่ 3 (หัวข้อ 3.7 E-R Diagram & 3.8 Data Dictionary)
-- ==============================================================================

-- 1. ตารางข้อมูลผู้ใช้งาน (profiles / users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  province text, -- เก็บจังหวัดครั้งแรกที่เข้าใช้งาน (สำหรับแผนที่ผู้ใช้)
  district text, -- อำเภอ/เขต
  created_at timestamptz not null default now()
);

-- 2. ตารางข้อมูลพืชกลาง (plant_master - 5 ชนิดเป้าหมาย)
create table if not exists public.plant_master (
  plant_id serial primary key,
  name_th varchar(100) not null,
  name_en varchar(100) not null,
  scientific_name varchar(150) not null,
  category varchar(100) not null, -- พืชผักสวนครัวยอดนิยม / พืชเศรษฐกิจ
  icon text,
  created_at timestamptz not null default now()
);

-- 3. ตารางพืชที่ผู้ใช้ปลูก (user_plants)
create table if not exists public.user_plants (
  user_plant_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  plant_id integer references public.plant_master(plant_id) on delete cascade,
  growth_stage varchar(50) not null default 'ต้นกล้า', -- เมล็ด / ต้นกล้า / โตเต็มวัย
  planting_method varchar(50) not null default 'กระถาง', -- กระถาง / ปลูกลงดิน
  pot_size varchar(50), -- เช่น 8 นิ้ว, 10 นิ้ว (กรณีปลูกกระถาง)
  amount integer not null default 1 check (amount > 0),
  planted_date date not null default current_date,
  updated_at timestamptz not null default now()
);

-- 4. ตารางบันทึกประวัติสภาพอากาศ (weather_readings จาก OpenWeather)
create table if not exists public.weather_readings (
  reading_id uuid primary key default gen_random_uuid(),
  user_plant_id uuid references public.user_plants(user_plant_id) on delete cascade,
  temperature float not null, -- อุณหภูมิ (°C)
  humidity float not null,    -- ความชื้นสัมพัทธ์ (%)
  fetched_at timestamptz not null default now()
);

-- 5. ตารางเกณฑ์คำนวณการรดน้ำ (watering_guide)
create table if not exists public.watering_guide (
  watering_id serial primary key,
  plant_id integer references public.plant_master(plant_id) on delete cascade,
  growth_stage varchar(50) not null,
  temp_min float default 20.0,
  temp_max float default 38.0,
  water_amount_ml integer not null, -- มิลลิลิตร
  watering_freq_days integer not null default 1, -- รอบรดน้ำ (วัน)
  note text
);

-- 6. ตารางคำแนะนำการให้ปุ๋ย (fertilizer_guide)
create table if not exists public.fertilizer_guide (
  fertilizer_id serial primary key,
  plant_id integer references public.plant_master(plant_id) on delete cascade,
  growth_stage varchar(50) not null,
  fertilizer_type varchar(100) not null, -- สูตรปุ๋ย เช่น 15-15-15, 46-0-0
  fertilizer_note text
);

-- 7. ตารางคำแนะนำการตัดแต่งกิ่ง (pruning_guide)
create table if not exists public.pruning_guide (
  pruning_id serial primary key,
  plant_id integer references public.plant_master(plant_id) on delete cascade,
  growth_stage varchar(50) not null,
  pruning_action varchar(150) not null,
  pruning_note text
);

-- 8. ตารางปฏิทินกิจกรรมการดูแล (calendar_activities)
create table if not exists public.calendar_activities (
  activity_id uuid primary key default gen_random_uuid(),
  user_plant_id uuid references public.user_plants(user_plant_id) on delete cascade,
  activity_type varchar(50) not null, -- รดน้ำ / ใส่ปุ๋ย / ตัดแต่งกิ่ง / ตรวจโรค
  due_date date not null default current_date,
  is_done boolean not null default false,
  synced_to_google boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. ตารางบันทึกผลการตรวจโรคพืช AI (disease_checks)
create table if not exists public.disease_checks (
  check_id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  plant_id integer references public.plant_master(plant_id) on delete set null,
  image_url text,
  detected_disease text not null,
  confidence_score float not null,
  checked_at timestamptz not null default now()
);

-- ==============================================================================
-- 📍 ฟังก์ชัน & View สำหรับแผนที่แอดมิน (บันทึก Location ครั้งแรกเท่านั้น)
-- ==============================================================================

-- ฟังก์ชันบันทึกตำแหน่งผู้ใช้ "เฉพาะครั้งแรกเท่านั้น" (ถ้ามีอยู่แล้วจะไม่ทับ ป้องกันพิกัดมั่ว)
create or replace function public.set_user_first_location(
  p_user_id uuid,
  p_province text,
  p_district text default null
) returns void language plpgsql security definer as $$
begin
  update public.profiles
  set 
    province = coalesce(province, p_province),
    district = coalesce(district, p_district)
  where id = p_user_id 
    and (province is null or trim(province) = '');
end;
$$;

-- View สรุปจำนวนผู้ใช้งานแยกตามจังหวัดสำหรับแผนที่ Admin (เรียงลำดับมากไปน้อย)
create or replace view public.user_province_stats as
select 
  trim(province) as province,
  count(*)::int as users
from public.profiles
where province is not null and trim(province) <> ''
group by trim(province)
order by users desc;

-- ==============================================================================
-- 🔐 Row Level Security (RLS) & นโยบายความปลอดภัย
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.plant_master enable row level security;
alter table public.user_plants enable row level security;
alter table public.weather_readings enable row level security;
alter table public.watering_guide enable row level security;
alter table public.fertilizer_guide enable row level security;
alter table public.pruning_guide enable row level security;
alter table public.calendar_activities enable row level security;
alter table public.disease_checks enable row level security;

-- ตรวจสอบสิทธิ์ Admin
create or replace function public.is_admin() returns boolean language sql stable security definer as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Policies
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid() or public.is_admin());

create policy "plant_master_read_all" on public.plant_master for select using (true);
create policy "plant_master_admin_modify" on public.plant_master for all using (public.is_admin());

create policy "user_plants_all" on public.user_plants for all using (user_id = auth.uid() or user_id is null or public.is_admin());
create policy "calendar_activities_all" on public.calendar_activities for all using (true);
create policy "guides_read_all" on public.watering_guide for select using (true);
create policy "fertilizer_read_all" on public.fertilizer_guide for select using (true);
create policy "pruning_read_all" on public.pruning_guide for select using (true);
create policy "weather_all" on public.weather_readings for all using (true);
create policy "disease_checks_all" on public.disease_checks for all using (true);

-- Trigger เมื่อมี User สมัครผ่าน Supabase Auth -> สร้างแถวใน public.profiles อัตโนมัติ
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username, display_name, email, province, district, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'province',
    new.raw_user_meta_data->>'district',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update set
    email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 🌱 ข้อมูลเริ่มต้น (Pre-seeded Data จากคู่มือวิชาการ กรมวิชาการเกษตร 5 ชนิด)
-- ==============================================================================

-- 1. เพิ่มพืชเป้าหมาย 5 ชนิด
insert into public.plant_master (plant_id, name_th, name_en, scientific_name, category, icon) values
(1, 'พริก', 'Chili Pepper', 'Capsicum annuum L.', 'พืชผักสวนครัวยอดนิยม', '🌶️'),
(2, 'โหระพา', 'Sweet Basil', 'Ocimum basilicum L.', 'พืชผักสวนครัวยอดนิยม', '🌱'),
(3, 'กะเพรา', 'Holy Basil', 'Ocimum tenuiflorum L.', 'พืชผักสวนครัวยอดนิยม', '🌿'),
(4, 'มะเขือเทศ', 'Tomato', 'Solanum lycopersicum L.', 'พืชเศรษฐกิจ', '🍅'),
(5, 'ผักกาดหอม', 'Lettuce', 'Lactuca sativa L.', 'พืชเศรษฐกิจ', '🥬')
on conflict (plant_id) do update set
  name_th = excluded.name_th,
  name_en = excluded.name_en,
  scientific_name = excluded.scientific_name;

-- 2. ข้อมูลคู่มือการรดน้ำ (watering_guide)
insert into public.watering_guide (plant_id, growth_stage, water_amount_ml, watering_freq_days, note) values
(1, 'เมล็ด', 100, 1, 'รดน้ำให้ชุ่มดินชื้นสม่ำเสมอ ระวังอย่าให้น้ำขังจนเน่า'),
(1, 'ต้นกล้า', 250, 1, 'รดน้ำทุกวันช่วงเช้า สังเกตความชื้นโคนต้น'),
(1, 'โตเต็มวัย', 400, 1, 'รดน้ำสม่ำเสมอช่วงติดดอกและผล และให้น้ำทันทีหลังใส่ปุ๋ย'),
(2, 'เมล็ด', 80, 1, 'รักษาความชื้นในดินรำไร หว่านเมล็ดกลบดินบางๆ'),
(2, 'ต้นกล้า', 200, 1, 'ช่วง 15 วันแรกให้น้ำเช้า-บ่ายให้กล้าตั้งตัว'),
(2, 'โตเต็มวัย', 350, 1, 'ให้น้ำสม่ำเสมอ และชะลอการให้น้ำเมื่อช่อดอกเริ่มเปลี่ยนเป็นสีน้ำตาล'),
(3, 'เมล็ด', 80, 1, 'ดินร่วนซุย รดน้ำพ่นฝอยสม่ำเสมอ'),
(3, 'ต้นกล้า', 200, 1, 'ช่วง 15 วันแรกให้น้ำเช้า-บ่าย หลีกเลี่ยงความชื้นขังแฉะ'),
(3, 'โตเต็มวัย', 350, 1, 'ให้น้ำสม่ำเสมอ ชะลอน้ำเมื่อเตรียมเก็บเกี่ยวช่อดอก'),
(4, 'เมล็ด', 100, 1, 'เพาะในถาดพีทมอส รักษาความชื้นในโรงเรือนพรางแสง'),
(4, 'ต้นกล้า', 300, 1, 'ย้ายกล้าอายุ 30 วัน รดน้ำให้ชุ่มโคนต้น'),
(4, 'โตเต็มวัย', 500, 1, 'ให้น้ำสม่ำเสมอ อย่าให้ขาดน้ำช่วงติดผลเพื่อป้องกันผลแตก'),
(5, 'เมล็ด', 80, 1, 'พ่นละอองน้ำเบาๆ ดินชื้นพอเหมาะ'),
(5, 'ต้นกล้า', 150, 1, 'รดน้ำสม่ำเสมอแต่อย่าให้แฉะ ระวังโคนเน่า'),
(5, 'โตเต็มวัย', 250, 1, 'รดน้ำช่วงเช้า ระวังน้ำค้างขังในกาบใบช่วงฤดูฝน');

-- 3. ข้อมูลคู่มือการใส่ปุ๋ย (fertilizer_guide จากคู่มือกรมวิชาการเกษตร)
insert into public.fertilizer_guide (plant_id, growth_stage, fertilizer_type, fertilizer_note) values
(1, 'เมล็ด', 'ปุ๋ยคอก/ปุ๋ยหมัก', 'คลุกเคล้าดินเพาะอัตรา 1:1 เพื่อให้ดินร่วนซุย'),
(1, 'ต้นกล้า', '15-15-15 + 46-0-0', 'หลังย้ายปลูก 15-20 วัน โรยข้างแถวพรวนดินกลบ'),
(1, 'โตเต็มวัย', '12-24-12 / 13-13-21', 'ใส่เมื่อเริ่มออกดอกและติดผล เพื่อบำรุงผลผลิตและเมล็ด'),
(2, 'เมล็ด', 'ปุ๋ยคอกแห้ง', 'ผสมวัสดุปลูก 1 กก./ตร.ม.'),
(2, 'ต้นกล้า', '15-15-15', 'ใส่หลังย้ายปลูก 15 วัน และใส่สูตรผสม 46-0-0 เมื่ออายุ 45 วัน'),
(2, 'โตเต็มวัย', '13-13-21', 'ใส่เมื่ออายุ 60 วันหลังย้ายปลูกเพื่อบำรุงช่อดอกและเมล็ด'),
(3, 'เมล็ด', 'ปุ๋ยคอกแห้ง', 'คลุกเคล้าแปลงเพาะกล้าให้ร่วนซุย'),
(3, 'ต้นกล้า', '15-15-15', 'ใส่หลังย้ายปลูก 15 วัน และ 45 วันเพื่อเร่งทรงพุ่ม'),
(3, 'โตเต็มวัย', '13-13-21', 'ใส่หลังย้ายปลูก 60 วัน โรยสองข้างแถวแล้วพรวนดินกลบ'),
(4, 'เมล็ด', 'พีทมอส + ปุ๋ยอินทรีย์', 'ใช้วัสดุเพาะกล้าคุณภาพสูง'),
(4, 'ต้นกล้า', '15-15-15', 'รองก้นหลุมก่อนปลูก และรดสารชีวภัณฑ์ป้องกันโรคเหี่ยว'),
(4, 'โตเต็มวัย', '13-13-21 + แคลเซียมโบรอน', 'ฉีดพ่นแคลเซียมโบรอนทุก 7 วันเพื่อป้องกันอาการก้นผลเน่า'),
(5, 'เมล็ด', 'ปุ๋ยหมักละเอียด', 'เตรียมดินเพาะกล้าให้โปร่งและอุ้มน้ำ'),
(5, 'ต้นกล้า', 'ปุ๋ยอินทรีย์ / N-P-K สัดส่วนพอเหมาะ', 'ใส่บำรุงการเจริญเติบโตของใบ'),
(5, 'โตเต็มวัย', 'ปุ๋ยไนโตรเจนอินทรีย์', 'เน้นบำรุงใบเขียวกรอบ งดปุ๋ยก่อนเก็บเกี่ยว 7 วัน');

-- 4. ข้อมูลคู่มือการตัดแต่งกิ่ง (pruning_guide)
insert into public.pruning_guide (plant_id, growth_stage, pruning_action, pruning_note) values
(1, 'ต้นกล้า', 'เด็ดยอดแรก', 'เพื่อกระตุ้นให้แตกกิ่งแขนงทรงพุ่มหนา'),
(1, 'โตเต็มวัย', 'ตัดแต่งกิ่งล่างและกิ่งโปร่ง', 'ตัดใบล่างที่สัมผัสดินออกเพื่อให้อากาศถ่ายเทสะดวก ลดการสะสมเชื้อรา'),
(2, 'ต้นกล้า', 'เด็ดยอดกิ่งหลัก', 'กระตุ้นการแตกกิ่งข้างให้พุ่มใบดก'),
(2, 'โตเต็มวัย', 'ตัดแต่งช่อดอกโรย', 'ตัดช่อดอกที่เริ่มแห้งเพื่อเก็บเมล็ดและตัดกิ่งแห้งเสียทิ้ง'),
(3, 'ต้นกล้า', 'เด็ดยอดอ่อน', 'เพื่อให้ต้นแตกแขนงใบเก็บเกี่ยวได้นานขึ้น'),
(3, 'โตเต็มวัย', 'ตัดแต่งกิ่งแก่ชิดโคน', 'กำจัดกิ่งที่ถูกแมลงกัดแทะและกิ่งแห้งออกไปเผาทำลาย'),
(4, 'ต้นกล้า', 'ปักค้างแบบกระโจม', 'ปักค้างสูง 1-1.5 เมตร เพื่อพยุงลำต้นก่อนออกดอก'),
(4, 'โตเต็มวัย', 'เดิดแขนงข้างออก', 'ไว้กิ่งหลัก 1-2 กิ่ง เพื่อให้ผลมีขนาดใหญ่และทรงพุ่มโปร่ง'),
(5, 'โตเต็มวัย', 'ปลิดใบล่างที่เน่าช้ำ', 'ตัดใบล่างที่ติดผิวดินออกเพื่อป้องกันโรคจากแบคทีเรียและเชื้อรา');
