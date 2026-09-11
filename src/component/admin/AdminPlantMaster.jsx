import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, RefreshCw, Search, Sprout, Trash2, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { deletePlantMaster, fetchPlantMasterList, insertPlantMaster, updatePlantMaster } from './adminDataService';
import './admin-interactions.css';
import './admin-plant-master.css';

const emptyForm = {
  emoji: '🌱',
  name: '',
  nameEn: '',
  category: 'ผักสวนครัว',
  scientificName: '',
  status: 'เปิดใช้งาน',
};

export default function AdminPlantMaster() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadPlants = async () => {
    setLoading(true);
    try {
      const list = await fetchPlantMasterList();
      setPlants(list);
    } catch (err) {
      console.error('Error loading plant master:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const visiblePlants = useMemo(() => {
    return plants.filter((plant) =>
      `${plant.name} ${plant.category} ${plant.scientificName} ${plant.nameEn || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [plants, query]);

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      if (modal === 'create') {
        const created = await insertPlantMaster(form);
        if (created) {
          setPlants((items) => [
            ...items,
            {
              id: created.plant_id,
              emoji: created.icon || form.emoji,
              name: created.name_th,
              nameEn: created.name_en,
              category: created.category,
              scientificName: created.scientific_name,
              status: 'เปิดใช้งาน',
            },
          ]);
        }
      } else if (modal === 'edit') {
        await updatePlantMaster(form.id, form);
        setPlants((items) =>
          items.map((item) => (item.id === form.id ? { ...item, ...form } : item))
        );
      }
      setModal(null);
    } catch (err) {
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (plant) => {
    if (!window.confirm(`ยืนยันการลบชนิดพืช “${plant.name}” ออกจากฐานข้อมูลกลางหรือไม่?`)) return;

    try {
      await deletePlantMaster(plant.id);
      setPlants((items) => items.filter((item) => item.id !== plant.id));
    } catch (err) {
      alert(`ไม่สามารถลบได้: ${err.message}`);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
  };

  const openEdit = (plant) => {
    setForm(plant);
    setModal('edit');
  };

  return (
    <AdminLayout>
      <motion.header
        className="admin-head admin-detail-head plant-master-head"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="admin-kicker">
            <Sprout size={15} /> MASTER DATA · LIVE SUPABASE
          </p>
          <h1>ข้อมูลพืชกลาง</h1>
          <p>จัดการชนิดพืชที่ระบบรองรับสำหรับผู้ใช้งานทั้งหมดในระบบ PlookPloen</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={loadPlants}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '9px',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              background: 'rgba(16, 185, 129, 0.08)',
              color: '#047857',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            รีเฟรช
          </button>
          <button className="plant-master-add" onClick={openCreate}>
            <Plus size={18} /> เพิ่มชนิดพืช
          </button>
        </div>
      </motion.header>

      <motion.section
        className="admin-card admin-detail-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="plant-master-summary">
          <span>
            ชนิดพืชทั้งหมด <b>{plants.length}</b> รายการ
          </span>
          <small>ข้อมูลจริงจากตาราง plant_master ในฐานข้อมูล</small>
        </div>

        <div className="admin-detail-tools">
          <label>
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชนิดพืชหรือชื่อวิทยาศาสตร์..."
            />
          </label>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table plant-master-table">
            <thead>
              <tr>
                <th>ชนิดพืช</th>
                <th>หมวดหมู่</th>
                <th>ชื่อวิทยาศาสตร์</th>
                <th>สถานะ</th>
                <th aria-label="จัดการ" />
              </tr>
            </thead>
            <tbody>
              {visiblePlants.map((plant) => (
                <tr key={plant.id}>
                  <td>
                    <span className="plant-master-name">
                      <i>{plant.emoji}</i>
                      {plant.name}
                    </span>
                  </td>
                  <td>{plant.category}</td>
                  <td>
                    <em>{plant.scientificName || '-'}</em>
                  </td>
                  <td>
                    <span className="plant-master-status">{plant.status}</span>
                  </td>
                  <td>
                    <div className="plant-master-actions">
                      <button
                        onClick={() => openEdit(plant)}
                        aria-label={`แก้ไข ${plant.name}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="danger"
                        onClick={() => remove(plant)}
                        aria-label={`ลบ ${plant.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
              กำลังโหลดข้อมูลพืชจาก Supabase...
            </p>
          )}

          {!loading && !visiblePlants.length && (
            <p className="admin-no-result">
              {plants.length === 0 ? 'ยังไม่มีข้อมูลพืชในระบบ' : 'ไม่พบชนิดพืชที่ค้นหา'}
            </p>
          )}
        </div>
      </motion.section>

      <AnimatePresence>
        {modal && (
          <motion.div
            className="plant-master-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setModal(null)}
          >
            <motion.form
              className="plant-master-modal"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              onSubmit={save}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <header>
                <div>
                  <p>MASTER DATA</p>
                  <h2>{modal === 'create' ? 'เพิ่มชนิดพืชใหม่' : 'แก้ไขชนิดพืช'}</h2>
                </div>
                <button type="button" onClick={() => setModal(null)} aria-label="ปิด">
                  <X size={20} />
                </button>
              </header>

              <div className="plant-master-form">
                <label>
                  ไอคอน Emoji
                  <input
                    value={form.emoji}
                    maxLength="4"
                    onChange={(event) => setForm({ ...form, emoji: event.target.value })}
                  />
                </label>
                <label>
                  ชื่อพืชภาษาไทย <b>*</b>
                  <input
                    required
                    autoFocus
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    placeholder="เช่น กะเพรา, ต้นหอม"
                  />
                </label>
                <label>
                  ชื่อภาษาอังกฤษ
                  <input
                    value={form.nameEn || ''}
                    onChange={(event) => setForm({ ...form, nameEn: event.target.value })}
                    placeholder="เช่น Holy Basil"
                  />
                </label>
                <label>
                  หมวดหมู่
                  <select
                    value={form.category}
                    onChange={(event) => setForm({ ...form, category: event.target.value })}
                  >
                    <option>พืชผักสวนครัวยอดนิยม</option>
                    <option>พืชเศรษฐกิจ</option>
                    <option>ไม้ผล</option>
                    <option>ไม้ดอก</option>
                  </select>
                </label>
                <label>
                  ชื่อวิทยาศาสตร์
                  <input
                    value={form.scientificName}
                    onChange={(event) => setForm({ ...form, scientificName: event.target.value })}
                    placeholder="เช่น Ocimum tenuiflorum L."
                  />
                </label>
                <label>
                  สถานะ
                  <select
                    value={form.status}
                    onChange={(event) => setForm({ ...form, status: event.target.value })}
                  >
                    <option>เปิดใช้งาน</option>
                    <option>ปิดใช้งาน</option>
                  </select>
                </label>
              </div>

              <footer>
                <button
                  type="button"
                  className="plant-master-cancel"
                  onClick={() => setModal(null)}
                  disabled={saving}
                >
                  ยกเลิก
                </button>
                <button className="plant-master-save" type="submit" disabled={saving}>
                  {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </footer>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}

