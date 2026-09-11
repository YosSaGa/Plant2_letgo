import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ScanSearch, Search, Sprout, Users } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { fetchAdminDiseaseReports, fetchAdminPlantsList, fetchAdminUsersList } from './adminDataService';
import './admin-interactions.css';

const config = {
  users: {
    title: 'ผู้ใช้งาน',
    subtitle: 'รายชื่อและสถิติผู้ใช้งานจริงจากฐานข้อมูลระบบ',
    icon: Users,
    headers: ['ชื่อ', 'อีเมล', 'วันที่สมัคร', 'พืชที่ปลูก', 'ผลตรวจโรค'],
  },
  plants: {
    title: 'บันทึกการปลูกพืช',
    subtitle: 'ประวัติการปลูกพืชจริงจากผู้ใช้งานในระบบ',
    icon: Sprout,
    headers: ['ชนิดพืช', 'เจ้าของ', 'วิธีปลูก', 'ระยะเติบโต', 'วันที่เพิ่ม'],
  },
  reports: {
    title: 'รายงานการตรวจโรคพืช',
    subtitle: 'ผลตรวจโรคพืช AI จริงในระบบ เรียงจากใหม่ไปเก่า',
    icon: ScanSearch,
    headers: ['ชนิดพืช', 'โรคที่พบ', 'ความรุนแรง', 'ความมั่นใจ', 'วันที่ตรวจ'],
  },
};

export default function AdminDetails({ type }) {
  const page = config[type] || config.users;
  const [dataRows, setDataRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ทั้งหมด');

  const loadData = async () => {
    setLoading(true);
    try {
      let rows = [];
      if (type === 'users') {
        rows = await fetchAdminUsersList();
      } else if (type === 'plants') {
        rows = await fetchAdminPlantsList();
      } else if (type === 'reports') {
        rows = await fetchAdminDiseaseReports();
      }
      setDataRows(rows);
    } catch (err) {
      console.error('Error fetching admin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [type]);

  // ตัวเลือกฟิลเตอร์
  const options = useMemo(() => {
    if (type === 'plants') {
      return ['ทั้งหมด', 'กระถาง', 'ลงดิน', 'ต้นกล้า', 'เมล็ด', 'โตเต็มวัย'];
    }
    if (type === 'reports') {
      return ['ทั้งหมด', 'สูง', 'ปานกลาง', 'ต่ำ'];
    }
    return ['ทั้งหมด'];
  }, [type]);

  const rows = useMemo(() => {
    return dataRows.filter((row) => {
      const matchFilter = filter === 'ทั้งหมด' || row.some((col) => String(col).includes(filter));
      const matchQuery = !query.trim() || row.join(' ').toLowerCase().includes(query.toLowerCase());
      return matchFilter && matchQuery;
    });
  }, [dataRows, filter, query]);

  const Icon = page.icon;

  return (
    <AdminLayout>
      <motion.header
        className="admin-head admin-detail-head"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="admin-kicker">
            <Icon size={15} /> PLOOKPLOEN CONTROL ROOM
          </p>
          <h1>{page.title}</h1>
          <p>{page.subtitle}</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            background: 'rgba(16, 185, 129, 0.08)',
            color: '#047857',
            fontSize: '13px',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'กำลังโหลด...' : 'รีเฟรชข้อมูล'}
        </button>
      </motion.header>

      <motion.section
        className="admin-card admin-detail-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
      >
        <div className="admin-detail-tools">
          <label>
            <Search size={18} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาข้อมูล..."
            />
          </label>
          {options.length > 1 && (
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          )}
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {page.headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  {row.map((value, i) => (
                    <td key={i}>
                      {type === 'reports' && i === 2 ? (
                        <span className={`severity severity-${value}`}>{value}</span>
                      ) : (
                        value
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6b7280' }}>
              กำลังโหลดข้อมูลจากฐานข้อมูล...
            </p>
          )}

          {!loading && !rows.length && (
            <p className="admin-no-result">
              {dataRows.length === 0 ? 'ยังไม่มีข้อมูลบันทึกในระบบ' : 'ไม่พบข้อมูลที่ตรงกับคำค้นหา'}
            </p>
          )}
        </div>
      </motion.section>
    </AdminLayout>
  );
}

