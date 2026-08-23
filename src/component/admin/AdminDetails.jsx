import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Sprout, ScanSearch } from 'lucide-react';
import AdminLayout from './AdminLayout';
import './admin-interactions.css';

const users = [
  ['พิมพ์ชนก ใจดี', 'pimchanok@example.com', '18 ส.ค. 2569', 14, 5], ['ณัฐวุฒิ พงษ์ไทย', 'nattawut@example.com', '17 ส.ค. 2569', 9, 2], ['ศิริพร วัฒนะ', 'siriporn@example.com', '16 ส.ค. 2569', 22, 7], ['ธนกฤต มั่นคง', 'thanakrit@example.com', '15 ส.ค. 2569', 6, 1], ['กัญญารัตน์ แสงทอง', 'kanyarat@example.com', '14 ส.ค. 2569', 18, 4]];
const plants = [['พริก','พิมพ์ชนก ใจดี','กระถาง','ต้นกล้า','18 ส.ค. 2569'],['โหระพา','ศิริพร วัฒนะ','ลงดิน','โตเต็มวัย','17 ส.ค. 2569'],['กะเพรา','ณัฐวุฒิ พงษ์ไทย','กระถาง','เมล็ด','16 ส.ค. 2569'],['มะเขือเทศ','กัญญารัตน์ แสงทอง','ลงดิน','ต้นกล้า','15 ส.ค. 2569'],['ผักกาดหอม','ธนกฤต มั่นคง','กระถาง','โตเต็มวัย','14 ส.ค. 2569']];
const reports = [['มะเขือเทศ','Bacterial Wilt','สูง','92%','18 ส.ค. 2569'],['โหระพา','Downy Mildew','สูง','93%','17 ส.ค. 2569'],['พริก','Root Rot','สูง','94%','17 ส.ค. 2569'],['กะเพรา','Leaf Spot','ปานกลาง','90%','16 ส.ค. 2569'],['ผักกาดหอม','Aphid Infestation','ต่ำ','85%','15 ส.ค. 2569']];

const config = {
  users: { title: 'ผู้ใช้งาน', subtitle: 'รายชื่อผู้ใช้งานในระบบจากข้อมูลจำลอง', icon: Users, rows: users, headers: ['ชื่อ','อีเมล','วันที่สมัคร','พืชที่ปลูก','ผลตรวจโรค'] },
  plants: { title: 'ข้อมูลพืช', subtitle: 'บันทึกพืชทั้งหมดจากข้อมูลจำลอง', icon: Sprout, rows: plants, headers: ['ชนิดพืช','เจ้าของ','วิธีปลูก','ระยะเติบโต','วันที่เพิ่ม'] },
  reports: { title: 'รายงานโรคพืช', subtitle: 'ผลตรวจล่าสุด เรียงจากใหม่ไปเก่า', icon: ScanSearch, rows: reports, headers: ['ชนิดพืช','โรคที่พบ','ความรุนแรง','ความมั่นใจ','วันที่ตรวจ'] },
};
export default function AdminDetails({ type }) {
  const page = config[type]; const [query, setQuery] = useState(''); const [filter, setFilter] = useState('ทั้งหมด');
  const options = type === 'plants' ? ['ทั้งหมด','พริก','โหระพา','กะเพรา','มะเขือเทศ','ผักกาดหอม','กระถาง','ลงดิน'] : type === 'reports' ? ['ทั้งหมด','Downy Mildew','Root Rot','Leaf Spot','Bacterial Wilt'] : ['ทั้งหมด'];
  const rows = useMemo(() => page.rows.filter((row) => (filter === 'ทั้งหมด' || row.includes(filter)) && row.join(' ').toLowerCase().includes(query.toLowerCase())), [page.rows, filter, query]);
  const Icon = page.icon;
  return <AdminLayout><motion.header className="admin-head admin-detail-head" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><div><p className="admin-kicker"><Icon size={15} /> ADMIN MOCKUP</p><h1>{page.title}</h1><p>{page.subtitle}</p></div></motion.header><motion.section className="admin-card admin-detail-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }}><div className="admin-detail-tools"><label><Search size={18}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ค้นหาข้อมูล" /></label>{options.length > 1 && <select value={filter} onChange={(e) => setFilter(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select>}</div><div className="admin-table-wrap"><table className="admin-table"><thead><tr>{page.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, i) => <td key={i}>{type === 'reports' && i === 2 ? <span className={`severity severity-${value}`}>{value}</span> : value}</td>)}</tr>)}</tbody></table>{!rows.length && <p className="admin-no-result">ไม่พบข้อมูลที่ตรงกัน</p>}</div></motion.section></AdminLayout>;
}
