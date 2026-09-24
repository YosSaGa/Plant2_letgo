-- ==============================================================================
-- 🔒 นโยบายแยกข้อมูลผู้ใช้แบบเด็ดขาด (Strict Multi-Tenant User Isolation)
-- ข้อมูลใคร ข้อมูลมัน: แยกตาราง user_plants, disease_checks, calendar_activities
-- ==============================================================================

-- 1. ล้างข้อมูลพืชตกค้างที่ไม่มี user_id (user_id is null) เพื่อไม่ให้รั่วไหลไปสู่ผู้ใช้อื่น
DELETE FROM public.user_plants WHERE user_id IS NULL;

-- 2. บังคับให้ user_id ใน user_plants ต้องไม่เป็น NULL เสมอ
ALTER TABLE public.user_plants ALTER COLUMN user_id SET NOT NULL;

-- 3. รีเซ็ตและเปิดใช้งาน Row Level Security (RLS) บนตารางข้อมูลผู้ใช้ทั้งหมด
ALTER TABLE public.user_plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_readings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. จัดการนโยบาย (Policies) ของตาราง user_plants
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "user_plants_all" ON public.user_plants;
DROP POLICY IF EXISTS "user_plants_select" ON public.user_plants;
DROP POLICY IF EXISTS "user_plants_insert" ON public.user_plants;
DROP POLICY IF EXISTS "user_plants_update" ON public.user_plants;
DROP POLICY IF EXISTS "user_plants_delete" ON public.user_plants;

-- ผู้ใช้ดูได้เฉพาะพืชของตนเอง (Admin ดูภาพรวมได้)
CREATE POLICY "user_plants_select" ON public.user_plants
  FOR SELECT USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ผู้ใช้เพิ่มพืชได้เฉพาะในบัญชีตนเองเท่านั้น
CREATE POLICY "user_plants_insert" ON public.user_plants
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

-- ผู้ใช้แก้ไขได้เฉพาะพืชในแปลงของตนเอง
CREATE POLICY "user_plants_update" ON public.user_plants
  FOR UPDATE USING (
    auth.uid() = user_id OR public.is_admin()
  ) WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

-- ผู้ใช้ลบได้เฉพาะพืชในแปลงของตนเอง
CREATE POLICY "user_plants_delete" ON public.user_plants
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 5. จัดการนโยบาย (Policies) ของตาราง disease_checks (ประวัติตรวจโรคพืช AI)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "disease_checks_all" ON public.disease_checks;
DROP POLICY IF EXISTS "disease_checks_select" ON public.disease_checks;
DROP POLICY IF EXISTS "disease_checks_insert" ON public.disease_checks;
DROP POLICY IF EXISTS "disease_checks_delete" ON public.disease_checks;

-- ผู้ใช้ดูประวัติตรวจโรคได้เฉพาะของตนเอง (Admin ดูเพื่อมอนิเตอร์ภาพรวมโรคพืชได้)
CREATE POLICY "disease_checks_select" ON public.disease_checks
  FOR SELECT USING (
    auth.uid() = user_id OR user_id IS NULL OR public.is_admin()
  );

-- ผู้ใช้บันทึกประวัติตรวจโรคลงบัญชีตนเอง
CREATE POLICY "disease_checks_insert" ON public.disease_checks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL OR public.is_admin()
  );

-- ผู้ใช้ลบประวัติตรวจโรคของตนเองได้
CREATE POLICY "disease_checks_delete" ON public.disease_checks
  FOR DELETE USING (
    auth.uid() = user_id OR public.is_admin()
  );

-- ------------------------------------------------------------------------------
-- 6. จัดการนโยบาย (Policies) ของตาราง calendar_activities (ปฏิทินงานดูแลพืช)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "calendar_activities_all" ON public.calendar_activities;
DROP POLICY IF EXISTS "calendar_activities_select" ON public.calendar_activities;
DROP POLICY IF EXISTS "calendar_activities_insert" ON public.calendar_activities;
DROP POLICY IF EXISTS "calendar_activities_update" ON public.calendar_activities;
DROP POLICY IF EXISTS "calendar_activities_delete" ON public.calendar_activities;

-- เข้าถึงกิจกรรมดูแลพืชได้เฉพาะเมื่อเป็นเจ้าของ user_plants นั้นๆ
CREATE POLICY "calendar_activities_select" ON public.calendar_activities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_plants up
      WHERE up.user_plant_id = calendar_activities.user_plant_id
      AND (up.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "calendar_activities_insert" ON public.calendar_activities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_plants up
      WHERE up.user_plant_id = calendar_activities.user_plant_id
      AND (up.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "calendar_activities_update" ON public.calendar_activities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_plants up
      WHERE up.user_plant_id = calendar_activities.user_plant_id
      AND (up.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "calendar_activities_delete" ON public.calendar_activities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.user_plants up
      WHERE up.user_plant_id = calendar_activities.user_plant_id
      AND (up.user_id = auth.uid() OR public.is_admin())
    )
  );

-- ------------------------------------------------------------------------------
-- 7. จัดการนโยบาย (Policies) ของตาราง weather_readings (ประวัติสภาพอากาศประจำแปลง)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "weather_all" ON public.weather_readings;
DROP POLICY IF EXISTS "weather_select" ON public.weather_readings;
DROP POLICY IF EXISTS "weather_insert" ON public.weather_readings;

CREATE POLICY "weather_select" ON public.weather_readings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_plants up
      WHERE up.user_plant_id = weather_readings.user_plant_id
      AND (up.user_id = auth.uid() OR public.is_admin())
    )
  );

CREATE POLICY "weather_insert" ON public.weather_readings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_plants up
      WHERE up.user_plant_id = weather_readings.user_plant_id
      AND (up.user_id = auth.uid() OR public.is_admin())
    )
  );
