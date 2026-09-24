import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Pencil, Plus, RefreshCw, Search, Sprout, Trash2, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import AdminDeletePlantModal from './AdminDeletePlantModal';
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
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  const notifyPlantMasterChange = () => {
    try {
      localStorage.setItem('plookploen_plant_master_sync', Date.now().toString());
      window.dispatchEvent(new Event('plant_master_updated'));
    } catch (_) {}
  };

  const save = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      if (modal === 'create') {
        const created = await insertPlantMaster(form);
        if (created) {
          const isHidden = form.status === 'ซ่อนไว้' || form.status === 'ปิดใช้งาน';
          setPlants((items) => [
            ...items,
            {
              id: created.plant_id,
              emoji: created.icon || form.emoji,
              name: created.name_th,
              nameEn: created.name_en,
              category: (created.category || form.category).replace(' (ซ่อนไว้)', '').trim(),
              scientificName: created.scientific_name,
              status: isHidden ? 'ซ่อนไว้' : 'เปิดใช้งาน',
            },
          ]);
          notifyPlantMasterChange();
        }
      } else if (modal === 'edit') {
        await updatePlantMaster(form.id, form);
        setPlants((items) =>
          items.map((item) => (item.id === form.id ? { ...item, ...form } : item))
        );
        notifyPlantMasterChange();
      }
      setModal(null);
    } catch (err) {
      alert(`เกิดข้อผิดพลาดในการบันทึก: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (plant) => {
    const nextStatus = plant.status === 'เปิดใช้งาน' ? 'ซ่อนไว้' : 'เปิดใช้งาน';
    try {
      await updatePlantMaster(plant.id, { ...plant, status: nextStatus });
      setPlants((items) =>
        items.map((item) => (item.id === plant.id ? { ...item, status: nextStatus } : item))
      );
      notifyPlantMasterChange();
    } catch (err) {
      alert(`ไม่สามารถเปลี่ยนสถานะได้: ${err.message}`);
    }
  };

  const remove = (plant) => {
    setDeleteTarget(plant);
  };

  const handleHidePlant = async (plant) => {
    setIsProcessingDelete(true);
    try {
      await updatePlantMaster(plant.id, { ...plant, status: 'ซ่อนไว้' });
      setPlants((items) =>
        items.map((item) => (item.id === plant.id ? { ...item, status: 'ซ่อนไว้' } : item))
      );
      notifyPlantMasterChange();
      setDeleteTarget(null);
      showToast(`ซ่อนพืช "${plant.name}" เรียบร้อยแล้ว (สมาชิกใหม่จะไม่เห็นในรายการเลือกปลูก)`, 'success');
    } catch (err) {
      showToast(`ไม่สามารถซ่อนพืชได้: ${err.message}`, 'error');
    } finally {
      setIsProcessingDelete(false);
    }
  };

  const handlePermanentDelete = async (plant) => {
    setIsProcessingDelete(true);
    try {
      await deletePlantMaster(plant.id);
      setPlants((items) => items.filter((item) => item.id !== plant.id));
      notifyPlantMasterChange();
      setDeleteTarget(null);
      showToast(`ลบชนิดพืช "${plant.name}" ออกจากระบบถาวรเรียบร้อยแล้ว`, 'success');
    } catch (err) {
      showToast(`ไม่สามารถลบได้: ${err.message}`, 'error');
    } finally {
      setIsProcessingDelete(false);
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
                    <span className={`plant-master-status ${plant.status === 'ซ่อนไว้' ? 'hidden' : ''}`}>
                      {plant.status === 'ซ่อนไว้' ? '🟡 ซ่อนไว้' : '🟢 เปิดใช้งาน'}
                    </span>
                  </td>
                  <td>
                    <div className="plant-master-actions">
                      <button
                        onClick={() => toggleStatus(plant)}
                        title={plant.status === 'เปิดใช้งาน' ? 'คลิกเพื่อซ่อนพืชนี้ (ไม่ให้สมาชิกเลือกปลูกใหม่)' : 'คลิกเพื่อเปิดใช้งาน'}
                        style={plant.status === 'ซ่อนไว้' ? { background: '#fef3c7', color: '#b45309' } : {}}
                      >
                        {plant.status === 'เปิดใช้งาน' ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => openEdit(plant)}
                        aria-label={`แก้ไข ${plant.name}`}
                        title="แก้ไขข้อมูลพืช"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="danger"
                        onClick={() => remove(plant)}
                        aria-label={`ลบหรือซ่อน ${plant.name}`}
                        title="ตัวเลือก ซ่อน หรือ ลบถาวร"
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
                <div className="form-row">
                  <label>
                    ชื่อวิทยาศาสตร์
                    <input
                      value={form.scientificName}
                      onChange={(event) => setForm({ ...form, scientificName: event.target.value })}
                      placeholder="เช่น Ocimum tenuiflorum L."
                    />
                  </label>
                  <label>
                    สถานะการแสดงผล
                    <select
                      value={form.status}
                      onChange={(event) => setForm({ ...form, status: event.target.value })}
                    >
                      <option value="เปิดใช้งาน">🟢 เปิดใช้งาน</option>
                      <option value="ซ่อนไว้">🟡 ซ่อนไว้</option>
                    </select>
                  </label>
                </div>
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

      {/* Delete / Manage Modal with Hold-to-Confirm */}
      <AdminDeletePlantModal
        isOpen={Boolean(deleteTarget)}
        plant={deleteTarget}
        isProcessing={isProcessingDelete}
        onClose={() => setDeleteTarget(null)}
        onHide={handleHidePlant}
        onPermanentDelete={handlePermanentDelete}
      />

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 5000,
              background: toast.type === 'error' ? '#991b1b' : '#047857',
              color: '#ffffff',
              padding: '12px 20px',
              borderRadius: '12px',
              boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
              fontFamily: "'Prompt', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '9px',
            }}
          >
            <span style={{ fontSize: '16px' }}>{toast.type === 'error' ? '⚠️' : '✅'}</span>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
