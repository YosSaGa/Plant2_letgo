import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitMerge,
  User,
  Shield,
  Layers,
  ArrowDown,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Database,
  Cpu,
  Globe,
  Lock,
  Compass,
  AlertTriangle,
  X,
  HelpCircle,
  Play
} from 'lucide-react';
import './systemFlow.css';

export default function SystemFlowDiagram({ onShowToast }) {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState('user');
  const [selectedNode, setSelectedNode] = useState(null);
  const [copied, setCopied] = useState(false);

  const notify = (msg) => {
    if (onShowToast) onShowToast(msg);
  };

  const handleLaunch = (route) => {
    notify(`🚀 กำลังนำทางไปหน้า ${route}...`);
    navigate(route);
  };

  const copyNodeSpecs = (node) => {
    const text = `[Flow Node] ${node.title}\nRoute: ${node.route || '-'}\nType: ${node.type}\nObjective: ${node.objective}\nProcess: ${node.process}\nDatabase/API: ${node.db || '-'}`;
    navigator.clipboard.writeText(text);
    notify('📋 คัดลอกข้อมูลโหนดเรียบร้อย!');
  };

  return (
    <div className="qa-flow-canvas-wrapper">
      <div className="qa-flow-toolbar">
        <div className="qa-flow-toolbar-left">
          <div style={{ background: '#ecfdf5', color: '#059669', padding: '8px', borderRadius: '10px' }}>
            <GitMerge size={22} />
          </div>
          <div>
            <h3 className="qa-flow-toolbar-title">
              PlookPloen Interactive System Flowchart
            </h3>
            <span style={{ fontSize: '12.5px', color: '#64748b' }}>
              คลิกที่แต่ละบล็อกหรือรูปข้าวหลามตัด (Decision) เพื่อดูขั้นตอน Input/Output และฐานข้อมูล
            </span>
          </div>
        </div>

        <div className="qa-flow-mode-tabs">
          <button
            type="button"
            className={`qa-flow-mode-btn ${activeMode === 'user' ? 'active-user' : ''}`}
            onClick={() => setActiveMode('user')}
          >
            <User size={15} />
            <span>ผังผู้ใช้งาน (User Flow)</span>
          </button>

          <button
            type="button"
            className={`qa-flow-mode-btn ${activeMode === 'admin' ? 'active-admin' : ''}`}
            onClick={() => setActiveMode('admin')}
          >
            <Shield size={15} />
            <span>ผังแอดมิน (Admin Guard Flow)</span>
          </button>

          <button
            type="button"
            className={`qa-flow-mode-btn ${activeMode === 'all' ? 'active-all' : ''}`}
            onClick={() => setActiveMode('all')}
          >
            <Layers size={15} />
            <span>ผังคู่ขนาน (Dual Swimlane)</span>
          </button>
        </div>
      </div>

      <div className="qa-flowchart-legend">
        <span style={{ fontWeight: 700, color: '#334155' }}>สัญลักษณ์ Flowchart:</span>
        <div className="qa-legend-item">
          <div className="qa-legend-shape-pill" />
          <span>จุดเริ่มต้น / สิ้นสุด (Terminal)</span>
        </div>
        <div className="qa-legend-item">
          <div className="qa-legend-shape-diamond" />
          <span>จุดตรวจสอบเงื่อนไข (Decision Diamond)</span>
        </div>
        <div className="qa-legend-item">
          <div className="qa-legend-shape-process" />
          <span>กระบวนการ / หน้าจอเว็บ (Process / Page)</span>
        </div>
        <div className="qa-legend-item">
          <div className="qa-legend-shape-db" />
          <span>ฐานข้อมูล / AI Service (Database / Cloud)</span>
        </div>
      </div>

      <div className="qa-flow-board">
        {(activeMode === 'user' || activeMode === 'all') && (
          <div className="qa-fc-container" style={{ marginBottom: activeMode === 'all' ? 60 : 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '4px 12px', borderRadius: 999 }}>
                👤 USER JOURNEY FLOWCHART (เส้นทางผู้ใช้งานทั่วไป)
              </span>
            </div>

            <div 
              className="qa-fc-terminal-node"
              onClick={() => setSelectedNode({
                title: 'จุดเริ่มต้น: ผู้ใช้เปิดเว็บ PlookPloen',
                type: 'Terminal (Start)',
                route: '/',
                objective: 'โหลดหน้าแรกของแอปพลิเคชันเพื่อเริ่มต้นใช้งาน',
                process: 'Browser ดึงไฟล์ Index HTML/JS จาก Vite Server และเริ่มกระบวนการ React Hydration',
                output: 'หน้าเว็บพร้อมปฏิสัมพันธ์'
              })}
            >
              <div className="qa-fc-terminal-pulse" />
              <span>START: ผู้ใช้เข้าสู่เว็บไซต์ PlookPloen</span>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-decision-card"
              onClick={() => setSelectedNode({
                title: 'ตรวจสอบสถานะ: เข้าสู่ระบบแล้วหรือยัง? (Is Authenticated?)',
                type: 'Decision (เงื่อนไขการตรวจสอบสิทธิ์)',
                objective: 'ตรวจสอบ JWT Session ใน Supabase Auth',
                process: 'AuthContext อ่านค่า Session จาก LocalStorage หากไม่มี ถือเป็น Guest หากมี ถือเป็น Member',
                output: 'Yes (ล็อกอินแล้ว) หรือ No (ยังไม่ได้ล็อกอิน)'
              })}
            >
              <span className="qa-fc-decision-badge">Decision Diamond</span>
              <h4 className="qa-fc-decision-title">ผู้ใช้เข้าสู่ระบบแล้วหรือยัง?</h4>
              <p className="qa-fc-decision-sub">ตรวจสอบค่า `user` ใน `useAuth()` จาก Supabase</p>
            </div>

            <div className="qa-fc-branch-row">
              <div className="qa-fc-branch-col">
                <span className="qa-fc-arrow-label no">❌ ยังไม่ล็อกอิน (No)</span>
                <div className="qa-fc-arrow-line dashed" style={{ height: 24 }} />
                <div className="qa-fc-arrow-head">▼</div>

                <div 
                  className="qa-fc-process-node user-border"
                  onClick={() => setSelectedNode({
                    title: 'หน้าเข้าสู่ระบบ & สมัครสมาชิก (Auth Gateway)',
                    route: '/login',
                    type: 'Process / Protected Form',
                    objective: 'ให้ผู้ใช้ลงทะเบียนหรือเข้าสู่ระบบเพื่อบันทึกข้อมูลสวน',
                    process: 'ส่งอีเมลและรหัสผ่านไปตรวจสอบที่ Supabase Auth API หากถูกต้องจะได้ JWT Token',
                    output: 'Session Token ถูกจัดเก็บ และ Redirect เข้าสู่สวน',
                    db: 'auth.users, public.profiles'
                  })}
                >
                  <div className="qa-fc-node-body">
                    <div className="qa-fc-node-icon-box user">🔐</div>
                    <div className="qa-fc-node-main">
                      <div className="qa-fc-node-header">
                        <h5 className="qa-fc-node-title">เข้าสู่ระบบ / สมัครสมาชิก</h5>
                        <span className="qa-fc-route-tag"><Globe size={11} /> /login</span>
                      </div>
                      <p className="qa-fc-node-summary">ลงชื่อเข้าใช้งานด้วย Email & Password บันทึก JWT Token</p>
                      <div className="qa-fc-node-footer">
                        <span className="qa-fc-db-pill"><Database size={12} /> <code>auth.users</code></span>
                        <button type="button" className="qa-fc-quick-launch-btn" onClick={(e) => { e.stopPropagation(); handleLaunch('/login'); }}>
                          <Play size={10} /> ทดสอบหน้านี้
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="qa-fc-connector">
                  <span className="qa-fc-arrow-label yes">เข้าสู่ระบบสำเร็จ</span>
                  <div className="qa-fc-arrow-line" style={{ height: 20 }} />
                  <div className="qa-fc-arrow-head">▼</div>
                </div>
              </div>

              <div className="qa-fc-branch-col">
                <span className="qa-fc-arrow-label yes">✅ ล็อกอินอยู่แล้ว (Yes)</span>
                <div className="qa-fc-arrow-line" style={{ height: 24 }} />
                <div className="qa-fc-arrow-head">▼</div>

                <div style={{ background: '#ecfdf5', border: '1px dashed #10b981', padding: '16px', borderRadius: '14px', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#065f46' }}>⚡ ดึงข้อมูลโปรไฟล์ & สวนอัตโนมัติ</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#047857' }}>โหลดต้นไม้จากตาราง <code>user_plants</code></p>
                </div>

                <div className="qa-fc-connector">
                  <div className="qa-fc-arrow-line" style={{ height: 20 }} />
                  <div className="qa-fc-arrow-head">▼</div>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <span className="qa-fc-arrow-label">รวมกระบวนการเข้าสู่พื้นที่สวน</span>
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-process-node user-border"
              onClick={() => setSelectedNode({
                title: 'สวนเสมือนจริง 3 มิติ และสภาพอากาศสด (Virtual Garden & Weather)',
                route: '/',
                type: 'Process / Interactive Canvas',
                objective: 'จำลองบรรยากาศสวนตามเวลาจริงและแสดงผลกระทบของอากาศต่อพืช',
                process: '1. ดึงข้อมูลสภาพอากาศ OpenWeatherMap API\n2. ปรับแสงสว่าง Canvas (เช้า/บ่าย/เย็น) ตามเวลาจริง\n3. แสดงพืชในสวนของผู้ใช้',
                output: 'ภาพกราฟิกสวนสด + การ์ดอุณหภูมิและความชื้น',
                db: 'SessionStorage, OpenWeatherMap API'
              })}
            >
              <div className="qa-fc-node-body">
                <div className="qa-fc-node-icon-box user">🌿</div>
                <div className="qa-fc-node-main">
                  <div className="qa-fc-node-header">
                    <h5 className="qa-fc-node-title">สวนเสมือนจริง & สภาพอากาศเรียลไทม์</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /</span>
                  </div>
                  <p className="qa-fc-node-summary">แสดงโมเดลสวน 3D คำนวณช่วงเวลาเช้า-เย็นและสภาพอากาศสด</p>
                  <div className="qa-fc-node-footer">
                    <span className="qa-fc-db-pill"><Database size={12} /> <code>OpenWeather API</code></span>
                    <button type="button" className="qa-fc-quick-launch-btn" onClick={(e) => { e.stopPropagation(); handleLaunch('/'); }}>
                      <Play size={10} /> ไปยังหน้าสวน
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-process-node user-border"
              onClick={() => setSelectedNode({
                title: 'การเพิ่มต้นไม้ใหม่ลงสวน (Plant Registration)',
                route: '/add-plant',
                type: 'Process / Form Management',
                objective: 'บันทึกชนิดและระยะการเติบโตของพืชลงในฐานข้อมูลสวนของผู้ใช้',
                process: 'ผู้ใช้เลือกชนิดพืช (พริก, โหระพา, กะเพรา, มะเขือเทศ, ผักกาดหอม) ➔ เลือกระยะ (เมล็ด, กล้า, โต) ➔ เลือกกระถาง ➔ บันทึกลง Supabase',
                output: 'Record ต้นไม้ใหม่ในฐานข้อมูล และปรากฏบนสวนจำลอง',
                db: 'public.user_plants, public.plant_master'
              })}
            >
              <div className="qa-fc-node-body">
                <div className="qa-fc-node-icon-box user">🪴</div>
                <div className="qa-fc-node-main">
                  <div className="qa-fc-node-header">
                    <h5 className="qa-fc-node-title">เพิ่มต้นไม้ใหม่ลงสวน (Add Plant)</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /add-plant</span>
                  </div>
                  <p className="qa-fc-node-summary">เลือกชนิดพืช (5 ชนิด), ระยะการเติบโต, ขนาดกระถาง หรือปลูกลงดิน</p>
                  <div className="qa-fc-node-footer">
                    <span className="qa-fc-db-pill"><Database size={12} /> <code>public.user_plants</code></span>
                    <button type="button" className="qa-fc-quick-launch-btn" onClick={(e) => { e.stopPropagation(); handleLaunch('/add-plant'); }}>
                      <Play size={10} /> ทดสอบเพิ่มพืช
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-process-node user-border"
              onClick={() => setSelectedNode({
                title: 'การดูแลรักษาและบันทึก Journal (Plant Care & Tracking)',
                route: '/plant-details',
                type: 'Process / Simulation',
                objective: 'บันทึกการให้น้ำ ปุ๋ย และติดตามระยะการเจริญเติบโต',
                process: 'เมื่อกดรดน้ำ/ใส่ปุ๋ย ระบบจะอัปเดต timestamp ล่าสุด และบันทึกลง plant_care_logs',
                output: 'สถานะความชุ่มชื้นอัปเดต และบันทึกประวัติการดูแล',
                db: 'public.user_plants, public.plant_care_logs'
              })}
            >
              <div className="qa-fc-node-body">
                <div className="qa-fc-node-icon-box user">💧</div>
                <div className="qa-fc-node-main">
                  <div className="qa-fc-node-header">
                    <h5 className="qa-fc-node-title">บันทึกการดูแลและติดตามการเติบโต</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /plant-details</span>
                  </div>
                  <p className="qa-fc-node-summary">จำลองการรดน้ำ ใส่ปุ๋ย บันทึกความสูงและบันทึกประวัติกิจกรรม</p>
                  <div className="qa-fc-node-footer">
                    <span className="qa-fc-db-pill"><Database size={12} /> <code>public.plant_care_logs</code></span>
                    <button type="button" className="qa-fc-quick-launch-btn" onClick={(e) => { e.stopPropagation(); handleLaunch('/plant-details'); }}>
                      <Play size={10} /> ดูหน้าการดูแล
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-decision-card"
              onClick={() => setSelectedNode({
                title: 'ตรวจสอบภาพถ่าย: ดัชนีสีพืช ExG > 0.05 หรือไม่?',
                type: 'Decision (Computer Vision Pre-filter)',
                objective: 'ป้องกันไม่ให้ผู้ใช้อัปโหลดภาพสิ่งของที่ไม่ใช่พืชเข้าสู่อัลกอริทึม Deep Learning',
                process: 'คำนวณสูตร Excess Green: ExG = 2G - R - B หากค่าเกิน 0.05 จึงส่งต่อให้ Model',
                output: 'Yes (ผ่านเกณฑ์ใบพืช) หรือ No (ภาพไม่ใช่พืช ปฏิเสธทันที)'
              })}
            >
              <span className="qa-fc-decision-badge">Decision Diamond</span>
              <h4 className="qa-fc-decision-title">ตรวจพบใบพืชหรือไม่ (ExG Index &gt; 0.05)?</h4>
              <p className="qa-fc-decision-sub">ตัวกรองสีกรีนเพื่อคัดกรองสิ่งแปลกปลอมก่อนเข้าสู่ AI</p>
            </div>

            <div className="qa-fc-branch-row">
              <div className="qa-fc-branch-col">
                <span className="qa-fc-arrow-label no">❌ ExG &lt; 0.05 (ไม่ใช่ใบพืช)</span>
                <div className="qa-fc-arrow-line dashed" style={{ height: 24 }} />
                <div className="qa-fc-arrow-head">▼</div>

                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px', borderRadius: '12px', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c' }}>⚠️ แจ้งเตือน: ภาพไม่เข้าเกณฑ์</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: 11.5, color: '#991b1b' }}>ขอให้ผู้ใช้ถ่ายภาพใบพืชใหม่ที่ชัดเจน</p>
                </div>
              </div>

              <div className="qa-fc-branch-col">
                <span className="qa-fc-arrow-label yes">✅ ExG &gt; 0.05 (ใบพืชสมบูรณ์)</span>
                <div className="qa-fc-arrow-line" style={{ height: 24 }} />
                <div className="qa-fc-arrow-head">▼</div>

                <div 
                  className="qa-fc-process-node user-border"
                  onClick={() => setSelectedNode({
                    title: 'การประมวลผลด้วย Deep Learning (ResNet-50 AI Engine)',
                    route: '/disease-detection',
                    type: 'Process / AI Microservice',
                    objective: 'วินิจฉัยโรคพืชและคำนวณความแม่นยำ (Confidence Rate)',
                    process: 'ส่งภาพไปยัง FastAPI (server.py) พอร์ต 8000 ประมวลผลผ่าน ResNet-50 Fine-tuned',
                    output: 'ชื่อโรค, ค่าความเชื่อมั่น %, คำแนะนำการรักษาทางการเกษตร',
                    db: 'FastAPI (Python), public.disease_logs'
                  })}
                >
                  <div className="qa-fc-node-body">
                    <div className="qa-fc-node-icon-box user">🔬</div>
                    <div className="qa-fc-node-main">
                      <div className="qa-fc-node-header">
                        <h5 className="qa-fc-node-title">FastAPI AI Model (ResNet-50)</h5>
                        <span className="qa-fc-route-tag"><Cpu size={11} /> :8000/predict</span>
                      </div>
                      <p className="qa-fc-node-summary">วิเคราะห์ชื่อโรคพืช, อัตราความเชื่อมั่น และแนวทางรักษา</p>
                      <div className="qa-fc-node-footer">
                        <span className="qa-fc-db-pill"><Database size={12} /> <code>disease_logs</code></span>
                        <button type="button" className="qa-fc-quick-launch-btn" onClick={(e) => { e.stopPropagation(); handleLaunch('/disease-detection'); }}>
                          <Play size={10} /> ตรวจโรคพืช
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-process-node user-border"
              onClick={() => setSelectedNode({
                title: 'สถิติภาพรวมสวนและการประเมินผล (Garden Analytics)',
                route: '/summary',
                type: 'Process / Reporting Dashboard',
                objective: 'สรุปภาพรวมจำนวนพืช สถานะความพร้อม และคู่มือดูแลเฉพาะชนิด',
                process: 'คำนวณ Aggregate สัดส่วนชนิดพืช วาดกราฟ Recharts Pie/Bar Chart',
                output: 'แดชบอร์ดสรุปสถิติสวนส่วนบุคคล',
                db: 'public.user_plants'
              })}
            >
              <div className="qa-fc-node-body">
                <div className="qa-fc-node-icon-box user">📊</div>
                <div className="qa-fc-node-main">
                  <div className="qa-fc-node-header">
                    <h5 className="qa-fc-node-title">สถิติภาพรวมสวน & คลังความรู้</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /summary</span>
                  </div>
                  <p className="qa-fc-node-summary">แสดงแผนภูมิสถิติ Recharts สรุปสัดส่วนต้นไม้และการเก็บเกี่ยว</p>
                  <div className="qa-fc-node-footer">
                    <span className="qa-fc-db-pill"><Database size={12} /> <code>Recharts Data</code></span>
                    <button type="button" className="qa-fc-quick-launch-btn" onClick={(e) => { e.stopPropagation(); handleLaunch('/summary'); }}>
                      <Play size={10} /> ดูหน้าสถิติ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div className="qa-fc-terminal-node end">
              <span>END: สิ้นสุดขั้นตอนของผู้ใช้งานทั่วไป</span>
            </div>
          </div>
        )}

        {(activeMode === 'admin' || activeMode === 'all') && (
          <div className="qa-fc-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#7c3aed', background: '#f5f3ff', padding: '4px 12px', borderRadius: 999 }}>
                🛡️ ADMIN JOURNEY & ROUTE GUARD FLOWCHART (เส้นทางผู้ดูแลระบบ)
              </span>
            </div>

            <div 
              className="qa-fc-terminal-node admin"
              onClick={() => setSelectedNode({
                title: 'จุดเริ่มต้น: ผู้ดูแลระบบเข้าใช้งาน (Admin Entry)',
                type: 'Terminal (Start)',
                route: '/admin/login',
                objective: 'ผู้ดูแลระบบกรอกรหัสผ่านเพื่อเข้าสู่ศูนย์ควบคุม',
                process: 'โหลดหน้า Admin Login Interface เพื่อรับข้อมูล Credentials',
                output: 'แบบฟอร์มตรวจสอบสิทธิ์'
              })}
            >
              <div className="qa-fc-terminal-pulse" />
              <span>START: ผู้ดูแลระบบเข้าสู่ส่วนควบคุม (/admin/login)</span>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div 
              className="qa-fc-decision-card"
              style={{ borderColor: '#8b5cf6', boxShadow: '0 6px 18px rgba(139, 92, 246, 0.15)' }}
              onClick={() => setSelectedNode({
                title: 'ตรวจสอบสิทธิ์: มีบทบาทเป็น Admin หรือไม่? (Admin Route Guard)',
                type: 'Decision (Security Guard in AdminRoute.jsx)',
                objective: 'ป้องกันผู้ใช้ทั่วไปไม่ให้เข้าถึงหน้าจัดการของผู้ดูแลระบบ',
                process: 'AdminRoute.jsx ตรวจสอบ user && profile?.role === "admin" ใน Supabase',
                output: 'Yes (อนุมัติเข้าใช้งาน) หรือ No (ปฏิเสธและดีดกลับ)'
              })}
            >
              <span className="qa-fc-decision-badge" style={{ background: '#f5f3ff', color: '#6d28d9' }}>Security Guard</span>
              <h4 className="qa-fc-decision-title" style={{ color: '#4c1d95' }}>
                มีสิทธิ์เป็น Admin หรือไม่ (profile.role === 'admin')?
              </h4>
              <p className="qa-fc-decision-sub" style={{ color: '#5b21b6' }}>
                ตรวจสอบความถูกต้องใน <code>AdminRoute.jsx</code>
              </p>
            </div>

            <div className="qa-fc-branch-row">
              <div className="qa-fc-branch-col">
                <span className="qa-fc-arrow-label no">❌ บทบาทไม่ใช่ Admin (No)</span>
                <div className="qa-fc-arrow-line dashed" style={{ height: 24 }} />
                <div className="qa-fc-arrow-head">▼</div>

                <div style={{ background: '#fef2f2', border: '2px solid #f87171', padding: '16px', borderRadius: '14px', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#991b1b' }}>🚫 ปฏิเสธการเข้าถึง (403 Forbidden)</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#b91c1c' }}>
                    Redirect อัตโนมัติกลับไปที่ <code>/admin/login</code>
                  </p>
                </div>
              </div>

              <div className="qa-fc-branch-col">
                <span className="qa-fc-arrow-label yes">✅ สิทธิ์ถูกต้อง (Role: admin)</span>
                <div className="qa-fc-arrow-line" style={{ height: 24 }} />
                <div className="qa-fc-arrow-head">▼</div>

                <div style={{ background: '#f5f3ff', border: '1px solid #8b5cf6', padding: '16px', borderRadius: '14px', width: '100%', textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#5b21b6' }}>🔓 อนุมัติการเข้าสู่ Admin Layout</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#6d28d9' }}>
                    เปิดการใช้งาน Sidebar นำทางและชุดเครื่องมือผู้ดูแลระบบ
                  </p>
                </div>
              </div>
            </div>

            <div className="qa-fc-connector">
              <span className="qa-fc-arrow-label">กระจายการทำงานไปยัง 5 โมดูลผู้ดูแลระบบ</span>
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div className="qa-fc-parallel-grid">
              <div 
                className="qa-fc-parallel-card"
                onClick={() => setSelectedNode({
                  title: 'แดชบอร์ดภาพรวมระบบ (Executive Control Room)',
                  route: '/admin/dashboard',
                  type: 'Admin Process / Analytics',
                  objective: 'ติดตามประสิทธิภาพ KPI รวมของระบบ',
                  process: 'รวบรวมจำนวนผู้ใช้, ต้นไม้ในระบบ, สถิติตรวจโรค, กราฟสมาชิก 7/30 วัน',
                  output: 'KPI Cards + Recharts Area Chart',
                  db: 'public.profiles, public.user_plants, public.disease_logs'
                })}
              >
                <div className="qa-fc-parallel-header">
                  <span style={{ fontSize: 22 }}>🎛️</span>
                  <div>
                    <h5 className="qa-fc-parallel-title">แดชบอร์ดภาพรวม</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /admin/dashboard</span>
                  </div>
                </div>
                <p className="qa-fc-parallel-desc">สรุป KPI ผู้ใช้งาน, พืชในระบบ, และกราฟการเติบโต</p>
                <button type="button" className="qa-fc-quick-launch-btn admin" onClick={(e) => { e.stopPropagation(); handleLaunch('/admin/dashboard'); }}>
                  <Play size={10} /> ดูแดชบอร์ด
                </button>
              </div>

              <div 
                className="qa-fc-parallel-card"
                onClick={() => setSelectedNode({
                  title: 'แผนที่พิกัดผู้ใช้งาน GIS (GIS User Distribution Map)',
                  route: '/admin/dashboard/user-map',
                  type: 'Admin Process / Geographic Map',
                  objective: 'วิเคราะห์การกระจายตัวของสมาชิกตามพิกัดและจังหวัด',
                  process: 'โหลดข้อมูลพิกัดละติจูด/ลองจิจูด แสดงบน Leaflet Map พร้อม CircleMarker',
                  output: 'แผนที่ประเทศไทยแบบโต้ตอบ + Popup ข้อมูลจังหวัด',
                  db: 'React-Leaflet, public.profiles'
                })}
              >
                <div className="qa-fc-parallel-header">
                  <span style={{ fontSize: 22 }}>🗺️</span>
                  <div>
                    <h5 className="qa-fc-parallel-title">แผนที่พิกัด GIS</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /admin/dashboard/user-map</span>
                  </div>
                </div>
                <p className="qa-fc-parallel-desc">แผนที่ Leaflet วิเคราะห์ความหนาแน่นของผู้ใช้รายจังหวัด</p>
                <button type="button" className="qa-fc-quick-launch-btn admin" onClick={(e) => { e.stopPropagation(); handleLaunch('/admin/dashboard/user-map'); }}>
                  <Play size={10} /> ดูแผนที่ GIS
                </button>
              </div>

              <div 
                className="qa-fc-parallel-card"
                onClick={() => setSelectedNode({
                  title: 'การบริหารจัดการสมาชิก (User Directory)',
                  route: '/admin/users',
                  type: 'Admin Process / Table CRUD',
                  objective: 'ตรวจสอบและดูแลความถูกต้องของบัญชีสมาชิก',
                  process: 'ดึงรายชื่อสมาชิก, อีเมล, วันที่สมัคร, จำนวนต้นไม้ที่ดูแล',
                  output: 'ตารางข้อมูลผู้ใช้งานพร้อมระบบค้นหาและกรอง',
                  db: 'public.profiles, auth.users'
                })}
              >
                <div className="qa-fc-parallel-header">
                  <span style={{ fontSize: 22 }}>👥</span>
                  <div>
                    <h5 className="qa-fc-parallel-title">จัดการสมาชิก</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /admin/users</span>
                  </div>
                </div>
                <p className="qa-fc-parallel-desc">ตรวจสอบรายชื่อสมาชิก, วันที่สมัคร และสิทธิ์ในระบบ</p>
                <button type="button" className="qa-fc-quick-launch-btn admin" onClick={(e) => { e.stopPropagation(); handleLaunch('/admin/users'); }}>
                  <Play size={10} /> จัดการผู้ใช้
                </button>
              </div>

              <div 
                className="qa-fc-parallel-card"
                onClick={() => setSelectedNode({
                  title: 'จัดการฐานข้อมูลพืชกลาง (Plant Master Hub)',
                  route: '/admin/plants',
                  type: 'Admin Process / Master CRUD',
                  objective: 'กำหนดค่าตั้งต้นของพืชที่เปิดให้ปลูกในระบบ',
                  process: 'เพิ่ม/แก้ไขชนิดพืช, กำหนดวันเติบโตแต่ละระยะ, เกณฑ์การรดน้ำและแสง',
                  output: 'ข้อมูลพืชกลางถูกอัปเดตสำหรับผู้ใช้ทุกคน',
                  db: 'public.plant_master'
                })}
              >
                <div className="qa-fc-parallel-header">
                  <span style={{ fontSize: 22 }}>🌿</span>
                  <div>
                    <h5 className="qa-fc-parallel-title">ข้อมูลพืชกลาง</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /admin/plants</span>
                  </div>
                </div>
                <p className="qa-fc-parallel-desc">กำหนดสายพันธุ์พืช, จำนวนวันเติบโต และเกณฑ์การดูแล</p>
                <button type="button" className="qa-fc-quick-launch-btn admin" onClick={(e) => { e.stopPropagation(); handleLaunch('/admin/plants'); }}>
                  <Play size={10} /> จัดการพืชกลาง
                </button>
              </div>

              <div 
                className="qa-fc-parallel-card"
                onClick={() => setSelectedNode({
                  title: 'รายงานการระบาดของโรคพืช (Disease Outbreak Reports)',
                  route: '/admin/disease-reports',
                  type: 'Admin Process / Epidemiology Analytics',
                  objective: 'เฝ้าระวังและติดตามสถิติการเกิดโรคพืชในระบบ',
                  process: 'รวบรวม Logs การส่งตรวจภาพใบพืช และคำนวณอัตราการเกิดโรคพืชยอดฮิต',
                  output: 'อันดับโรคพืชที่พบบ่อย พร้อมภาพถ่ายหลักฐานเพื่อการวิเคราะห์',
                  db: 'public.disease_logs'
                })}
              >
                <div className="qa-fc-parallel-header">
                  <span style={{ fontSize: 22 }}>⚠️</span>
                  <div>
                    <h5 className="qa-fc-parallel-title">รายงานโรคพืช</h5>
                    <span className="qa-fc-route-tag"><Globe size={11} /> /admin/disease-reports</span>
                  </div>
                </div>
                <p className="qa-fc-parallel-desc">สถิติการตรวจพบโรคพืชที่พบบ่อยและแนวโน้มการระบาด</p>
                <button type="button" className="qa-fc-quick-launch-btn admin" onClick={(e) => { e.stopPropagation(); handleLaunch('/admin/disease-reports'); }}>
                  <Play size={10} /> ดูรายงานโรค
                </button>
              </div>
            </div>

            <div className="qa-fc-connector">
              <div className="qa-fc-arrow-line" />
              <div className="qa-fc-arrow-head">▼</div>
            </div>

            <div className="qa-fc-terminal-node admin end">
              <span>END: สิ้นสุดการบริหารจัดการระบบโดยผู้ดูแล</span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedNode && (
          <div className="qa-fc-inspector-overlay" onClick={() => setSelectedNode(null)}>
            <motion.div
              className="qa-fc-inspector-drawer"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: 380, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 380, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            >
              <div className="qa-fc-inspector-header">
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: 4 }}>
                    {selectedNode.type}
                  </span>
                  <h4 className="qa-fc-inspector-title" style={{ marginTop: 6 }}>
                    {selectedNode.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }}
                >
                  <X size={20} color="#64748b" />
                </button>
              </div>

              {selectedNode.route && (
                <div className="qa-fc-inspector-section">
                  <div className="qa-fc-inspector-label">
                    <Globe size={14} /> เส้นทางหน้าเว็บ (URL Route)
                  </div>
                  <div className="qa-fc-inspector-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <code>{selectedNode.route}</code>
                    <button
                      type="button"
                      className="qa-fc-quick-launch-btn"
                      onClick={() => handleLaunch(selectedNode.route)}
                    >
                      <ExternalLink size={12} /> ไปยังหน้านี้
                    </button>
                  </div>
                </div>
              )}

              <div className="qa-fc-inspector-section">
                <div className="qa-fc-inspector-label">
                  <HelpCircle size={14} /> วัตถุประสงค์ (Objective)
                </div>
                <div className="qa-fc-inspector-content">
                  {selectedNode.objective}
                </div>
              </div>

              <div className="qa-fc-inspector-section">
                <div className="qa-fc-inspector-label">
                  <Cpu size={14} /> กระบวนการทำงาน (Processing Logic)
                </div>
                <div className="qa-fc-inspector-content" style={{ whiteSpace: 'pre-line' }}>
                  {selectedNode.process}
                </div>
              </div>

              {selectedNode.output && (
                <div className="qa-fc-inspector-section">
                  <div className="qa-fc-inspector-label">
                    <Sparkles size={14} /> ผลลัพธ์ที่ได้ (Output)
                  </div>
                  <div className="qa-fc-inspector-content">
                    {selectedNode.output}
                  </div>
                </div>
              )}

              {selectedNode.db && (
                <div className="qa-fc-inspector-section">
                  <div className="qa-fc-inspector-label">
                    <Database size={14} /> ฐานข้อมูล / API ที่เชื่อมโยง
                  </div>
                  <div className="qa-fc-inspector-content">
                    <code>{selectedNode.db}</code>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: 16, display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="qa-btn qa-btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => copyNodeSpecs(selectedNode)}
                >
                  <Copy size={15} />
                  <span>คัดลอกรายละเอียด</span>
                </button>

                {selectedNode.route && (
                  <button
                    type="button"
                    className="qa-btn qa-btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => handleLaunch(selectedNode.route)}
                  >
                    <Play size={15} />
                    <span>ทดสอบหน้านี้ทันที</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
