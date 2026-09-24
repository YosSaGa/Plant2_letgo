-- ==============================================================================
-- Migration: Fix plant_master Sequence and Add Soft Delete / Status Support
-- Created: 2026-09-24
-- ==============================================================================

-- 1. รีเซ็ต Sequence ให้ตรงกับ MAX(plant_id) ในตาราง plant_master เพื่อแก้ปัญหา duplicate key error
SELECT setval(
  pg_get_serial_sequence('public.plant_master', 'plant_id'),
  coalesce(max(plant_id), 1)
) FROM public.plant_master;

-- 2. เพิ่มคอลัมน์ is_active และ status สำหรับรองรับการซ่อนพืช (Soft Delete) โดยไม่กระทบแปลงปลูกเดิม
ALTER TABLE public.plant_master ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.plant_master ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'เปิดใช้งาน';

-- 3. อัปเดตข้อมูลพืชเดิม 5 ชนิดให้มีสถานะเป็นเปิดใช้งาน
UPDATE public.plant_master 
SET is_active = true, status = 'เปิดใช้งาน' 
WHERE is_active IS NULL;
