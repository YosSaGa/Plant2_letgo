import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getSavedReminders,
  saveReminderStatus,
  batchCreateCalendarEvents,
  createGoogleCalendarEvent,
  getGoogleCalendarWebIntentUrl,
  downloadIcsFile,
} from '../lib/googleCalendar';
import './advice.css';

const plantEmoji = {
  'กะเพรา': '🌿',
  'โหระพา': '🌱',
  'พริก': '🌶️',
  'มะเขือเทศ': '🍅',
  'ผักกาดหอม': '🥬',
};

// ประเภทงานดูแล
const TASK_TYPES = {
  water: { label: 'รดน้ำ', icon: '💧', color: '#0ea5e9', defaultHour: 7, defaultMinute: 30 },
  fertilize: { label: 'ใส่ปุ๋ย', icon: '🌾', color: '#ca8a04', defaultHour: 9, defaultMinute: 0 },
  prune: { label: 'ตัดแต่งกิ่ง', icon: '✂️', color: '#db2777', defaultHour: 10, defaultMinute: 0 },
  sunlight: { label: 'ย้ายรับแดด', icon: '☀️', color: '#f97316', defaultHour: 8, defaultMinute: 0 },
  inspect: { label: 'ตรวจใบ/ศัตรูพืช', icon: '🔍', color: '#65a30d', defaultHour: 16, defaultMinute: 30 },
};

// mock: รอบการดูแลพื้นฐาน (ทุกกี่วัน) ของพืชแต่ละชนิด ตอนโตเต็มวัยปกติ
const CARE_PLAN = {
  'กะเพรา': {
    water: 2, fertilize: 14, inspect: 5,
    health: 'แข็งแรงดี',
    tips: ['เตรียมดินร่วนและยกร่องสูงราว 30 ซม.; ตากดิน 5-10 วันก่อนปลูก', 'ย้ายกล้าเมื่อมีใบจริง 3-4 คู่ โดยเว้นระยะต้น 30 ซม. และแถว 70 ซม.', '15 วันแรกหลังย้ายปลูกให้น้ำเช้า-บ่าย; เมื่อตั้งตัวแล้วจึงปรับตามความชื้นดิน'],
  },
  'โหระพา': {
    water: 2, fertilize: 14, inspect: 5,
    health: 'แข็งแรงดี',
    tips: ['ใช้ดินร่วน ระบายน้ำและอากาศดี; เสริมปุ๋ยหมักหรือปุ๋ยคอกรองพื้น', 'ย้ายกล้าเมื่อมีใบจริง 3-4 คู่ และจัดแปลงให้โปร่งเพื่อระบายอากาศ', '15 วันแรกหลังย้ายปลูกให้น้ำเช้า-บ่าย; หลังจากนั้นให้น้ำสม่ำเสมอตามความชื้นดิน'],
  },
  'มะเขือเทศ': {
    water: 1, fertilize: 10, prune: 12,
    health: 'ต้องการน้ำเพิ่ม',
    tips: ['ย้ายกล้าอายุประมาณ 30 วันลงแปลงสูง 25-30 ซม. ระยะต้น 50 ซม. แถว 100 ซม.', 'ทำค้างก่อนออกดอก สูงประมาณ 1-1.5 ม. เพื่อลดผลสัมผัสดินและดูแลง่าย', 'ให้น้ำตามความชื้นดิน ราวทุก 7 วัน และพ่นแคลเซียม-โบรอนเมื่อเริ่มติดผลเพื่อลดก้นผลเน่า'],
  },
  'พริก': {
    water: 1, fertilize: 10, inspect: 3,
    health: 'แข็งแรงดี',
    tips: ['ใช้ดินร่วนซุยระบายน้ำดี ไม่ท่วมขัง; ปรับดินด้วยปูนขาวตามความเหมาะสม', 'ย้ายปลูกเมื่อกล้าอายุราว 1 เดือนหรือมีใบจริง 4-5 ใบ ระยะต้น 50 ซม. แถว 100 ซม.', 'หลังปลูกให้น้ำทุกวันในช่วงตั้งตัว แล้วปรับตามความชื้นดิน; คลุมฟางเมื่อดินแห้งเพื่อลดการระเหย'],
  },
  'ผักกาดหอม': {
    water: 1, fertilize: 7, inspect: 3,
    health: 'แข็งแรงดี',
    tips: ['ใช้ดินร่วนซุย ระบายน้ำดี และไม่ปล่อยให้น้ำขัง เพราะรากตื้น', 'ให้น้ำสม่ำเสมอ โดย 2 สัปดาห์แรกหลังย้ายปลูกให้เช้า-เย็น', 'พรางแสงเมื่อแดดจัดและเก็บใบที่เสียหายออกจากแปลง'],
  },
};

// ตัวปรับตาม "ระยะการเจริญเติบโต" — เมล็ดต้องดูแลถี่/ใกล้ชิดกว่าต้นโต และยังไม่ต้องทำบางงาน
const STAGE_MODIFIERS = {
  'เมล็ด': {
    health: 'เพิ่งเพาะเมล็ด ต้องดูแลใกล้ชิดเป็นพิเศษ',
    waterFactor: 0.5, // รดน้ำถี่ขึ้น (จำนวนวันต่อรอบน้อยลง)
    disableTasks: ['prune', 'fertilize'], // เมล็ดยังไม่ต้องตัดแต่งหรือใส่ปุ๋ย
    tips: [
      'รดน้ำเป็นละอองฝอยเบาๆ อย่าให้ดินแฉะจนเมล็ดลอย',
      'คลุมด้วยพลาสติกใสหรือกระดาษชื้นช่วยรักษาความชื้นจนกว่าจะงอก',
      'วางในที่แสงรำไร ยังไม่ต้องให้รับแดดจัดจนกว่าจะงอกใบจริง',
    ],
  },
  'ต้นกล้า': {
    health: 'ต้นกล้ากำลังเติบโต ต้องระวังเรื่องแสงและความชื้น',
    waterFactor: 0.75,
    disableTasks: ['prune'], // ต้นกล้ายังเล็กเกินไปที่จะตัดแต่งกิ่ง
    tips: [
      'ค่อยๆ ให้ต้นกล้ารับแดดเพิ่มขึ้นทีละน้อย (Hardening off)',
      'ระวังโรคเน่าคอดินจากความชื้นสะสมมากเกินไป',
      'เริ่มใส่ปุ๋ยสูตรอ่อนๆ เมื่อมีใบจริง 2-3 ใบขึ้นไป',
    ],
  },
  'โตเต็มวัย': {
    health: null, // ใช้ค่า health เดิมของพืชแต่ละชนิดจาก CARE_PLAN
    waterFactor: 1,
    disableTasks: [],
    tips: [],
  },
};

// ตัวปรับตาม "วิธีการปลูก" — กระถางดินแห้งเร็วกว่า ต้องรดน้ำถี่กว่าปลูกลงดิน
const METHOD_MODIFIERS = {
  'กระถาง': {
    waterFactor: 0.85,
    tips: [
      'ดินในกระถางแห้งเร็วกว่าปลูกลงดิน ควรตรวจความชื้นหน้าดินก่อนรดน้ำทุกครั้ง',
      'เลือกกระถางที่มีรูระบายน้ำ ป้องกันรากเน่า',
      'ย้ายกระถางตามทิศแดดได้สะดวกกว่าปลูกลงดิน',
    ],
  },
  'ลงดิน': {
    waterFactor: 1.2,
    tips: [
      'ดินกลางแจ้งเก็บความชื้นได้นานกว่า ลดความถี่การรดน้ำลงได้',
      'พรวนดินรอบโคนต้นเป็นระยะ ช่วยให้รากได้รับอากาศ',
      'หมั่นกำจัดวัชพืชรอบต้น ไม่ให้แย่งน้ำและธาตุอาหารของพืชหลัก',
    ],
  },
};

// รวมค่าจาก CARE_PLAN พื้นฐาน + ปรับตามระยะ + ปรับตามวิธีปลูก ให้เป็นแผนดูแลที่ต่างกันจริงในแต่ละกรณี
function buildCarePlan(plantType, stage, method, potSize) {
  const base = CARE_PLAN[plantType] || CARE_PLAN['กะเพรา'];
  const stageMod = STAGE_MODIFIERS[stage] || STAGE_MODIFIERS['โตเต็มวัย'];
  const methodMod = METHOD_MODIFIERS[method] || METHOD_MODIFIERS['กระถาง'];

  const plan = {};
  Object.keys(TASK_TYPES).forEach((key) => {
    if (base[key] == null) return; // งานนี้ไม่เกี่ยวกับพืชชนิดนี้เลย
    if (stageMod.disableTasks.includes(key)) return; // ระยะนี้ยังไม่ต้องทำงานนี้
    const factor = key === 'water' ? stageMod.waterFactor * methodMod.waterFactor : 1;
    plan[key] = Math.max(1, Math.round(base[key] * factor));
  });

  plan.health = stageMod.health || base.health;

  // แยกเคล็ดลับเป็น 3 กลุ่ม เพื่อให้เห็นชัดว่าแตกต่างกันตามระยะ/วิธีปลูก/พืชแต่ละชนิด
  const plantingLabel = method === 'กระถาง'
    ? `ปลูกในกระถาง${potSize ? ` ${potSize} นิ้ว` : ''}`
    : 'ปลูกลงดิน';
  const potSizeTips = method === 'กระถาง' && potSize
    ? [`กระถางขนาด ${potSize} นิ้วควรมีรูระบายน้ำ และเลือกขนาดให้รากมีพื้นที่เติบโตเพียงพอ`]
    : [];

  plan.tipGroups = [
    { title: `ตามระยะ: ${stage}`, tips: stageMod.tips },
    { title: `ตามวิธีปลูก: ${plantingLabel}`, tips: [...methodMod.tips, ...potSizeTips] },
    { title: `เคล็ดลับทั่วไปสำหรับ${plantType}`, tips: base.tips },
  ].filter((g) => g.tips.length > 0);

  return plan;
}

const DAY_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const MONTH_LABELS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];
const MONTH_LABELS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
];
const MONTHS_TO_SHOW = 6;

function buildMonthTasks(plan, year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const taskKeys = Object.keys(plan).filter((k) => TASK_TYPES[k]);
  const map = {};
  for (let day = 1; day <= daysInMonth; day++) {
    const tasks = [];
    taskKeys.forEach((key) => {
      const freq = plan[key];
      if (day % freq === 0 || day === 1) tasks.push(key);
    });
    if (tasks.length) map[day] = tasks;
  }
  return { map, daysInMonth };
}

function PlantAdvice({ plant, weather, onBack }) {
  const plantType = plant?.type || 'กะเพรา';
  const stage = plant?.stage || 'โตเต็มวัย';
  const method = plant?.method || 'กระถาง';
  const potSize = plant?.potSize;
  const plan = useMemo(() => buildCarePlan(plantType, stage, method, potSize), [plantType, stage, method, potSize]);
  const emoji = plantEmoji[plantType] || '🌱';

  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const monthList = useMemo(
    () =>
      Array.from({ length: MONTHS_TO_SHOW }, (_, i) => {
        const d = new Date(todayYear, todayMonth + i, 1);
        return { year: d.getFullYear(), month: d.getMonth() };
      }),
    [todayYear, todayMonth]
  );

  const monthsData = useMemo(
    () =>
      monthList.map(({ year, month }) => ({
        year,
        month,
        ...buildMonthTasks(plan, year, month),
      })),
    [monthList, plan]
  );

  const [monthIndex, setMonthIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState(todayDate);

  const [completedTasks, setCompletedTasks] = useState({});

  // State สำหรับ Popup แจ้งเตือนทั่วไป (แทน Toast)
  const [alertData, setAlertData] = useState(null);

  // State สำหรับยืนยันการทำแล้ว/ยังไม่ทำ
  const [pendingConfirm, setPendingConfirm] = useState(null);

  useEffect(() => {
    setCompletedTasks({});
    setPendingConfirm(null);
    setAlertData(null);
    setMonthIndex(0);
    setSelectedDay(todayDate);
  }, [plant?.id]);

  // Google Calendar Integration states
  const [savedReminders, setSavedReminders] = useState({});
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 0 });
  const [syncFeedback, setSyncFeedback] = useState(null);

  useEffect(() => {
    setSavedReminders(getSavedReminders());
  }, []);

  const taskKey = (y, m, d, t) => `${y}-${m}-${d}:${t}`;

  // Helper สร้าง Event Object สำหรับ Google Calendar
  const buildEventPayload = (y, m, d, taskTypeKey) => {
    const tInfo = TASK_TYPES[taskTypeKey] || { label: taskTypeKey, icon: '🌱' };
    const plantLabel = `${plantType} (ระยะ${stage})`;
    const doaTips = plan.tips?.length ? plan.tips.map((tip, idx) => `• ${tip}`).join('\n') : '';

    const title = `🌱 [ปลูกเพลิน] ${tInfo.label}: ${plantLabel}`;
    const description = [
      `🌿 กิจกรรมดูแลพืช: ${tInfo.label} (${tInfo.icon})`,
      `🪴 ชนิดพืช: ${plantType}`,
      `🌱 ระยะการเติบโต: ${stage}`,
      `🪴 วิธีการปลูก: ${method === 'กระถาง' ? `กระถาง ${potSize || '-'} นิ้ว` : 'ลงดิน'}`,
      `----------------------------------------`,
      `📋 คำแนะนำตามหลักวิชาการของกรมวิชาการเกษตร:`,
      doaTips,
      `----------------------------------------`,
      `💡 บันทึกอัตโนมัติจากแอปพลิเคชันปลูกเพลิน (PlookPloen)`,
    ]
      .filter(Boolean)
      .join('\n');

    const hour = tInfo.defaultHour ?? (taskTypeKey === 'water' ? 7 : taskTypeKey === 'fertilize' ? 9 : 16);
    const minute = tInfo.defaultMinute ?? (taskTypeKey === 'water' ? 30 : 0);

    return {
      title,
      description,
      year: y,
      month: m,
      day: d,
      hour,
      minute,
      durationMinutes: 30,
      userPlantId: plant?.id || null,
      activityType: tInfo.label,
      uniqueKey: taskKey(y, m, d, taskTypeKey),
    };
  };

  // รวมรายการงานทั้งหมดของเดือนที่กำลังแสดงผล
  const allMonthEvents = useMemo(() => {
    const currentMonthEntry = monthsData[monthIndex];
    if (!currentMonthEntry?.map) return [];
    const events = [];
    Object.entries(currentMonthEntry.map).forEach(([dayStr, tasks]) => {
      const d = parseInt(dayStr, 10);
      tasks.forEach((t) => {
        events.push(buildEventPayload(currentMonthEntry.year, currentMonthEntry.month, d, t));
      });
    });
    return events;
  }, [monthsData, monthIndex, plan, plantType, stage, method, potSize]);

  // รวมรายการงานของวันที่เลือก
  const selectedDayEvents = useMemo(() => {
    const currentMonthEntry = monthsData[monthIndex];
    if (!currentMonthEntry) return [];
    const currentMonthTasks = currentMonthEntry.map[selectedDay] || [];
    return currentMonthTasks.map((t) =>
      buildEventPayload(currentMonthEntry.year, currentMonthEntry.month, selectedDay, t)
    );
  }, [monthsData, monthIndex, selectedDay, plan, plantType, stage, method, potSize]);

  // จัดการซิงค์แบบกลุ่ม (เช่น ทั้งเดือน หรือทั้งวัน)
  const handleSyncBatch = async (eventsToSync, label = 'ทั้งหมด') => {
    if (!eventsToSync || eventsToSync.length === 0) {
      setAlertData({
        title: 'ไม่มีงานที่ต้องแจ้งเตือน',
        desc: 'ไม่มีรายการดูแลพืชในวันที่หรือช่วงเวลาที่เลือก',
        icon: '🌤️',
      });
      return;
    }

    setIsSyncing(true);
    setSyncProgress({ current: 0, total: eventsToSync.length });
    setSyncFeedback(null);

    try {
      const { createdEvents, errors } = await batchCreateCalendarEvents(
        eventsToSync,
        (current, total) => {
          setSyncProgress({ current, total });
        }
      );

      setSavedReminders(getSavedReminders());

      if (createdEvents.length > 0) {
        setSyncFeedback({
          status: 'success',
          title: `ตั้งเตือนลง Google Calendar สำเร็จ (${createdEvents.length} รายการ)`,
          desc: `ระบบได้บันทึกแจ้งเตือนกิจกรรมดูแล${plantType} (${label}) พร้อมคำแนะนำจากกรมวิชาการเกษตรลงใน Google Calendar เรียบร้อยแล้ว!`,
          link: 'https://calendar.google.com',
          createdCount: createdEvents.length,
          totalCount: eventsToSync.length,
        });
      } else if (errors.length > 0) {
        setSyncFeedback({
          status: 'error',
          title: 'ไม่สามารถเชื่อมต่อ Google Calendar API ได้',
          desc: errors[0]?.error || 'เกิดข้อผิดพลาดในการเชื่อมต่อ หรือปิดหน้าต่างยืนยันสิทธิ์',
          fallbackEvents: eventsToSync,
        });
      }
    } catch (err) {
      console.error('Batch sync error:', err);
      setSyncFeedback({
        status: 'error',
        title: 'การเชื่อมต่อขัดข้อง',
        desc: err.message || 'ไม่สามารถเปิดหน้าต่างยืนยันสิทธิ์ Google ได้ (กรุณาอนุญาตป๊อปอัป)',
        fallbackEvents: eventsToSync,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // จัดการตั้งเตือนงานเดี่ยว
  const handleSyncSingleTask = async (d, t) => {
    const currentMonthEntry = monthsData[monthIndex];
    if (!currentMonthEntry) return;
    const y = currentMonthEntry.year;
    const m = currentMonthEntry.month;
    const ev = buildEventPayload(y, m, d, t);
    const uKey = taskKey(y, m, d, t);

    // ถ้าตั้งเตือนไว้แล้ว กดเพื่อเปิดดูใน Google Calendar
    if (savedReminders[uKey]) {
      const item = savedReminders[uKey];
      window.open(item.htmlLink || 'https://calendar.google.com', '_blank');
      return;
    }

    setIsSyncing(true);
    try {
      const res = await createGoogleCalendarEvent(ev);
      saveReminderStatus(uKey, {
        eventId: res.id,
        htmlLink: res.htmlLink,
        title: ev.title,
      });
      setSavedReminders(getSavedReminders());
      setAlertData({
        title: 'ตั้งเตือนสำเร็จ!',
        desc: `บันทึกงาน "${TASK_TYPES[t]?.label}" ลงใน Google Calendar เรียบร้อยแล้ว`,
        icon: '🔔',
      });
    } catch (err) {
      // Fallback เปิด Web Intent ทันที
      const intentUrl = getGoogleCalendarWebIntentUrl(ev);
      window.open(intentUrl, '_blank');
      saveReminderStatus(uKey, { title: ev.title, fallback: true });
      setSavedReminders(getSavedReminders());
    } finally {
      setIsSyncing(false);
    }
  };

  // ดาวน์โหลด .ics
  const handleDownloadIcs = (events) => {
    downloadIcsFile(events, `plookploen-${plantType}-schedule.ics`);
  };

  // เช็กว่าเป็นอนาคตหรือไม่
  const isFutureDay = (y, m, d) => {
    const target = new Date(y, m, d);
    const now = new Date(todayYear, todayMonth, todayDate);
    return target.getTime() > now.getTime();
  };

  // เช็กว่าเป็นอดีตที่เลยมาแล้วหรือไม่
  const isPastDay = (y, m, d) => {
    const target = new Date(y, m, d);
    const now = new Date(todayYear, todayMonth, todayDate);
    return target.getTime() < now.getTime();
  };

  // ดับเบิลคลิกที่ "วันในปฏิทิน"
  const handleDayDoubleClick = (y, m, d) => {
    const monthEntry = monthsData.find((entry) => entry.year === y && entry.month === m);
    const tasks = monthEntry?.map[d] || [];

    if (tasks.length === 0) {
      setAlertData({
        title: 'ไม่ต้องทำอะไร',
        desc: `วันที่ ${d} ${MONTH_LABELS[m]} ไม่มีงานที่ต้องดูแล${plantType}เลยนะ พักได้สบายๆ`,
        icon: '🌤️'
      });
      return;
    }

    if (isFutureDay(y, m, d)) {
      setAlertData({
        title: 'ยังไม่ถึงกำหนด',
        desc: 'งานนี้ยังไม่ถึงวันที่ต้องทำ รอให้ถึงวันนั้นก่อนนะ จะได้ไม่ลืมทำ 🌱',
        icon: '⏳'
      });
      return;
    }

    if (isPastDay(y, m, d)) {
      setAlertData({
        title: 'เลยกำหนดแล้ว',
        desc: 'งานนี้เลยกำหนดเวลาไปแล้ว ไม่สามารถติ๊กย้อนหลังได้ 🥀',
        icon: '⚠️'
      });
      return;
    }

    const alreadyDone = tasks.every((t) => completedTasks[taskKey(y, m, d, t)]);
    setPendingConfirm({ y, m, d, tasks, alreadyDone });
  };

  const confirmDayDone = () => {
    if (!pendingConfirm) return;
    const { y, m, d, tasks, alreadyDone } = pendingConfirm;
    setCompletedTasks((prev) => {
      const updated = { ...prev };
      tasks.forEach((t) => {
        updated[taskKey(y, m, d, t)] = !alreadyDone;
      });
      return updated;
    });
    setPendingConfirm(null);
  };

  const cancelConfirm = () => setPendingConfirm(null);

  const goToMonth = (idx) => {
    const clamped = Math.max(0, Math.min(MONTHS_TO_SHOW - 1, idx));
    setMonthIndex(clamped);
    setSelectedDay(clamped === 0 ? todayDate : 1);
  };

  const { year, month, map: taskMap, daysInMonth } = monthsData[monthIndex];

  const firstWeekday = new Date(year, month, 1).getDay();
  const leadingBlanks = Array.from({ length: firstWeekday });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const daysSincePlanted = plant?.plantedAt
    ? Math.max(0, Math.floor((today - new Date(plant.plantedAt)) / (1000 * 60 * 60 * 24)))
    : 0;

  const nextTask = useMemo(() => {
    for (let mi = 0; mi < monthsData.length; mi++) {
      const m = monthsData[mi];
      const startDay = mi === 0 ? todayDate : 1;
      for (let d = startDay; d <= m.daysInMonth; d++) {
        if (m.map[d]) {
          return { day: d, month: m.month, year: m.year, tasks: m.map[d] };
        }
      }
    }
    return null;
  }, [monthsData, todayDate]);

  const selectedTasks = taskMap[selectedDay] || [];

  const pendingMonthLabel = pendingConfirm ? MONTH_LABELS[pendingConfirm.m] : '';
  const pendingIcons = pendingConfirm ? pendingConfirm.tasks.map((t) => TASK_TYPES[t].icon).join(' ') : '';
  const pendingLabels = pendingConfirm ? pendingConfirm.tasks.map((t) => TASK_TYPES[t].label).join(', ') : '';
  const pendingColor = pendingConfirm ? TASK_TYPES[pendingConfirm.tasks[0]].color : '#059669';

  return (
    <motion.div
      className="adv-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* ใช้ createPortal เพื่อโยน Popup ไปที่ document.body ให้ลอยกลางจอเสมอ */}
      {createPortal(
        <>
          <AnimatePresence>
            {alertData && (
              <motion.div
                className="adv-confirm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAlertData(null)}
              >
                <motion.div
                  className="adv-confirm-modal"
                  initial={{ scale: 0.85, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="adv-confirm-icon adv-confirm-icon-neutral">
                    {alertData.icon}
                  </div>
                  <h3 className="adv-display adv-confirm-title">{alertData.title}</h3>
                  <p className="adv-confirm-desc">{alertData.desc}</p>
                  <div className="adv-confirm-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="adv-confirm-ok adv-confirm-ok-full"
                      onClick={() => setAlertData(null)}
                    >
                      ตกลง
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pendingConfirm && (
              <motion.div
                className="adv-confirm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={cancelConfirm}
              >
                <motion.div
                  className="adv-confirm-modal"
                  initial={{ scale: 0.85, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.85, opacity: 0, y: 20 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="adv-confirm-icon" style={{ '--tc': pendingColor }}>
                    {pendingIcons}
                  </div>
                  <h3 className="adv-display adv-confirm-title">
                    {pendingConfirm.alreadyDone
                      ? 'ยกเลิกการทำเครื่องหมายว่าทำแล้ว?'
                      : 'ยืนยันว่าทำแล้วใช่ไหม?'}
                  </h3>
                  <p className="adv-confirm-desc">
                    วันที่ {pendingConfirm.d} {pendingMonthLabel} · {pendingLabels}
                    {pendingConfirm.alreadyDone
                      ? ' — จะเปลี่ยนกลับเป็นยังไม่ได้ทำ'
                      : ' — เมื่อยืนยันแล้วช่องวันที่นี้จะขึ้นสีเขียว ✓'}
                  </p>
                  <div className="adv-confirm-actions">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="adv-confirm-cancel"
                      onClick={cancelConfirm}
                    >
                      ไม่ใช่
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="adv-confirm-ok"
                      onClick={confirmDayDone}
                    >
                      {pendingConfirm.alreadyDone ? 'ยืนยันยกเลิก' : 'ใช่ ทำแล้ว'}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showSyncModal && (
              <motion.div
                className="adv-confirm-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !isSyncing && setShowSyncModal(false)}
              >
                <motion.div
                  className="adv-confirm-modal adv-sync-modal"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="adv-sync-modal-header">
                    <div className="adv-sync-badge-icon">🔔</div>
                    <div>
                      <h3 className="adv-display adv-confirm-title" style={{ margin: 0 }}>
                        ตั้งเตือนลง Google Calendar
                      </h3>
                      <p className="adv-sync-modal-sub">
                        {emoji} {plantType} ({stage}) · {MONTH_LABELS[month]} {year + 543}
                      </p>
                    </div>
                  </div>

                  {isSyncing ? (
                    <div className="adv-sync-loading-box">
                      <div className="adv-sync-spinner" />
                      <p className="adv-sync-loading-title">กำลังเชื่อมต่อและบันทึกลง Google Calendar...</p>
                      <div className="adv-sync-progress-bar">
                        <div
                          className="adv-sync-progress-fill"
                          style={{
                            width: `${syncProgress.total ? (syncProgress.current / syncProgress.total) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <p className="adv-sync-loading-counter">
                        {syncProgress.current} จาก {syncProgress.total} กิจกรรม
                      </p>
                    </div>
                  ) : syncFeedback ? (
                    <div className="adv-sync-feedback-box">
                      <div className={`adv-sync-feedback-icon ${syncFeedback.status}`}>
                        {syncFeedback.status === 'success' ? '✅' : '⚠️'}
                      </div>
                      <h4 className="adv-sync-feedback-title">{syncFeedback.title}</h4>
                      <p className="adv-sync-feedback-desc">{syncFeedback.desc}</p>
                      <div className="adv-confirm-actions" style={{ marginTop: '1.25rem' }}>
                        {syncFeedback.link && (
                          <a
                            href={syncFeedback.link}
                            target="_blank"
                            rel="noreferrer"
                            className="adv-confirm-ok"
                            style={{
                              textAlign: 'center',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            <span>เปิดดูใน Google Calendar ↗</span>
                          </a>
                        )}
                        {syncFeedback.status === 'error' && (
                          <button
                            type="button"
                            className="adv-confirm-ok"
                            onClick={() => {
                              const ev = syncFeedback.fallbackEvents?.[0] || allMonthEvents[0];
                              if (ev) window.open(getGoogleCalendarWebIntentUrl(ev), '_blank');
                            }}
                          >
                            เปิด Google Calendar สำเร็จรูป ↗
                          </button>
                        )}
                        <button
                          type="button"
                          className="adv-confirm-cancel"
                          onClick={() => {
                            setSyncFeedback(null);
                            setShowSyncModal(false);
                          }}
                        >
                          ปิด
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="adv-sync-options">
                      {/* บัตรตั้งเตือนทั้งเดือน (มาครบใน 1 คลิก) */}
                      <div className="adv-sync-option-card adv-sync-primary-card">
                        <div className="adv-sync-option-top">
                          <span className="adv-sync-card-badge">คลิกเดียวมาครบ 🌟</span>
                          <span className="adv-sync-count">{allMonthEvents.length} กิจกรรม</span>
                        </div>
                        <h4 className="adv-sync-option-title">
                          📅 ตั้งเตือนทั้งเดือน {MONTH_LABELS[month]}
                        </h4>
                        <p className="adv-sync-option-desc">
                          บันทึกรอบรดน้ำ, ใส่ปุ๋ย, ตรวจศัตรูพืชตลอดทั้งเดือน {allMonthEvents.length} ครั้ง พร้อมคำแนะนำกรมวิชาการเกษตร และแจ้งเตือนล่วงหน้า 30 นาที
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="adv-sync-action-btn primary"
                          onClick={() => handleSyncBatch(allMonthEvents, `ทั้งเดือน ${MONTH_LABELS[month]}`)}
                          disabled={allMonthEvents.length === 0}
                        >
                          🚀 ตั้งเตือนทั้งเดือนนี้ลง Google Calendar ({allMonthEvents.length} งาน)
                        </motion.button>
                      </div>

                      {/* บัตรตั้งเตือนเฉพาะวันนี้ */}
                      <div className="adv-sync-option-card">
                        <div className="adv-sync-option-top">
                          <span className="adv-sync-card-badge-neutral">งานเฉพาะวันนี้</span>
                          <span className="adv-sync-count">{selectedDayEvents.length} กิจกรรม</span>
                        </div>
                        <h4 className="adv-sync-option-title">
                          🗓️ วันที่ {selectedDay} {MONTH_LABELS[month]}
                        </h4>
                        <p className="adv-sync-option-desc">
                          {selectedDayEvents.length > 0
                            ? `มีงาน: ${selectedTasks.map((t) => TASK_TYPES[t]?.label).join(', ')}`
                            : 'วันนี้ไม่มีงานที่ต้องดูแล'}
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="adv-sync-action-btn secondary"
                          onClick={() => handleSyncBatch(selectedDayEvents, `วันที่ ${selectedDay}`)}
                          disabled={selectedDayEvents.length === 0}
                        >
                          🔔 ตั้งเตือนเฉพาะงานวันนี้ ({selectedDayEvents.length})
                        </motion.button>
                      </div>

                      {/* เมนูเสริม: ดาวน์โหลด ICS หรือปิด */}
                      <div className="adv-sync-alt-row">
                        <button
                          type="button"
                          className="adv-sync-text-btn"
                          onClick={() => handleDownloadIcs(allMonthEvents)}
                          title="ดาวน์โหลดไฟล์ .ics สำหรับเปิดในแอปปฏิทิน"
                        >
                          📥 ดาวน์โหลดไฟล์ปฏิทิน (.ics)
                        </button>
                        <button
                          type="button"
                          className="adv-sync-text-btn"
                          onClick={() => setShowSyncModal(false)}
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}


      <div className="adv-wrap">
        <motion.button whileHover={{ x: -5 }} whileTap={{ scale: 0.95 }} className="adv-back-btn" onClick={onBack}>
          ← กลับ
        </motion.button>

        <motion.header
          className="adv-card adv-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.3 }}
        >
          <div className="adv-plant-icon">{emoji}</div>
          <div>
            <h1 className="adv-display adv-title">คำแนะนำการดูแล{plantType}</h1>
            <p className="adv-sub">
              ระยะ: {stage} · แบบ: {method === 'กระถาง' ? `กระถาง ${potSize || '-'} นิ้ว` : 'ปลูกลงดิน'} · {plant?.amount || 1} ต้น
            </p>
          </div>
        </motion.header>

        {/* Dashboard cards */}
        <div className="adv-dashboard">
          <motion.div className="adv-card adv-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <span className="adv-stat-label">สภาพอากาศตอนนี้</span>
            <div className="adv-weather-mini-row">
              <span className="adv-stat-value">🌡️ {weather?.temp ?? '--'}°C</span>
              <span className="adv-stat-value">💧 {weather?.humidity ?? '--'}%</span>
            </div>
            <div className="adv-moisture-bar">
              <motion.div
                className="adv-moisture-fill"
                initial={{ width: 0 }}
                animate={{ width: `${weather?.humidity ?? 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>

          <motion.div className="adv-card adv-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="adv-stat-label">สถานะสุขภาพ</span>
            <span className="adv-stat-value adv-health">🌱 {plan.health}</span>
          </motion.div>

          <motion.div className="adv-card adv-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <span className="adv-stat-label">อายุการปลูก</span>
            <span className="adv-stat-value">{daysSincePlanted} วัน</span>
          </motion.div>

          <motion.div className="adv-card adv-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <span className="adv-stat-label">งานถัดไป</span>
            {nextTask ? (
              <span className="adv-stat-value adv-next-task">
                {nextTask.tasks.map((t) => TASK_TYPES[t].icon).join(' ')} วันที่ {nextTask.day}
                {nextTask.month !== month ? ` ${MONTH_LABELS_SHORT[nextTask.month]}` : ''}
              </span>
            ) : (
              <span className="adv-stat-value">ไม่มีงานใน 6 เดือนนี้</span>
            )}
          </motion.div>
        </div>

        <div className="adv-content">
          {/* ปฏิทิน */}
          <section className="adv-card adv-calendar-card">
            <div className="adv-calendar-nav">
              <h2 className="adv-display adv-section-title adv-calendar-title">
                📅 ปฏิทินดูแล — {MONTH_LABELS[month]} {year + 543}
              </h2>
              <div className="adv-calendar-nav-actions">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`adv-google-sync-btn ${
                    allMonthEvents.length > 0 && allMonthEvents.every((e) => savedReminders[e.uniqueKey])
                      ? 'all-synced'
                      : ''
                  }`}
                  onClick={() => {
                    setSyncFeedback(null);
                    setShowSyncModal(true);
                  }}
                  title="คลิกเพื่อตั้งเตือนการดูแลพืชลง Google Calendar ครบทั้งเดือน"
                >
                  <span className="adv-sync-btn-icon">🔔</span>
                  <span className="adv-sync-btn-text">
                    {allMonthEvents.length > 0 && allMonthEvents.every((e) => savedReminders[e.uniqueKey])
                      ? `ตั้งเตือนแล้ว ✓ (${allMonthEvents.length})`
                      : `ตั้งเตือน Google Calendar (${allMonthEvents.length} งาน)`}
                  </span>
                </motion.button>
                <div className="adv-month-arrows">
                  <motion.button
                    whileHover={{ scale: monthIndex === 0 ? 1 : 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="adv-arrow-btn"
                    disabled={monthIndex === 0}
                    onClick={() => goToMonth(monthIndex - 1)}
                  >
                    ‹
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: monthIndex === MONTHS_TO_SHOW - 1 ? 1 : 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="adv-arrow-btn"
                    disabled={monthIndex === MONTHS_TO_SHOW - 1}
                    onClick={() => goToMonth(monthIndex + 1)}
                  >
                    ›
                  </motion.button>
                </div>
              </div>
            </div>

            <div className="adv-month-pills">
              {monthsData.map((m, idx) => (
                <motion.button
                  key={`${m.year}-${m.month}`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`adv-month-pill ${idx === monthIndex ? 'active' : ''}`}
                  onClick={() => goToMonth(idx)}
                >
                  {MONTH_LABELS_SHORT[m.month]} {String(m.year + 543).slice(-2)}
                </motion.button>
              ))}
            </div>

            <div className="adv-legend">
              {Object.entries(TASK_TYPES)
                .filter(([key]) => plan[key])
                .map(([key, t]) => (
                  <span key={key} className="adv-legend-item" style={{ '--tc': t.color }}>
                    <span className="adv-legend-dot" />
                    {t.icon} {t.label}
                  </span>
                ))}
            </div>

            <p className="adv-calendar-hint">💡 ดับเบิลคลิกที่วันในปฏิทินเพื่อทำเครื่องหมายว่าทำแล้ว</p>

            <div className="adv-weekday-row">
              {DAY_LABELS.map((d) => (
                <div key={d} className="adv-weekday">{d}</div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={monthIndex}
                className="adv-grid"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                {leadingBlanks.map((_, i) => (
                  <div key={`blank-${i}`} className="adv-cell adv-cell-blank" />
                ))}
                {dayCells.map((day) => {
                  const tasks = taskMap[day] || [];
                  const isToday = monthIndex === 0 && day === todayDate;
                  const isSelected = day === selectedDay;
                  const isDone = tasks.length > 0 && tasks.every((t) => completedTasks[taskKey(year, month, day, t)]);
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      className={`adv-cell ${isToday ? 'adv-cell-today' : ''} ${isSelected ? 'adv-cell-selected' : ''} ${isDone ? 'adv-cell-done' : ''}`}
                      onClick={() => setSelectedDay(day)}
                      onDoubleClick={() => handleDayDoubleClick(year, month, day)}
                    >
                      <span className="adv-cell-day">{day}</span>
                      {tasks.length > 0 && (
                        <span className="adv-cell-dots">
                          {tasks.map((t) => (
                            <span key={t} className="adv-dot" style={{ background: TASK_TYPES[t].color }} />
                          ))}
                        </span>
                      )}
                      {isDone && <span className="adv-cell-check">✓</span>}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </section>

          {/* งานของวันที่เลือก + เคล็ดลับ */}
          <div className="adv-side">
            <section className="adv-card adv-day-card">
              <div className="adv-day-card-header">
                <h3 className="adv-display adv-section-title-sm" style={{ margin: 0 }}>
                  🗓️ วันที่ {selectedDay} {MONTH_LABELS[month]}
                </h3>
                {selectedDayEvents.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="adv-day-quick-sync-btn"
                    onClick={() => handleSyncBatch(selectedDayEvents, `วันที่ ${selectedDay}`)}
                    title="ตั้งเตือนเฉพาะงานของวันนี้ลง Google Calendar"
                  >
                    🔔 ตั้งเตือนวันนี้ ({selectedDayEvents.length})
                  </motion.button>
                )}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {selectedTasks.length === 0 ? (
                    <p className="adv-empty-day">ไม่มีงานที่ต้องทำในวันนี้ 🌤️</p>
                  ) : (
                    <ul className="adv-task-list">
                      {selectedTasks.map((t) => {
                        const done = !!completedTasks[taskKey(year, month, selectedDay, t)];
                        const isSynced = !!savedReminders[taskKey(year, month, selectedDay, t)];
                        return (
                          <li
                            key={t}
                            className={`adv-task-item ${done ? 'adv-task-done' : ''}`}
                            style={{ '--tc': TASK_TYPES[t].color }}
                          >
                            <span className={`adv-task-check ${done ? 'checked' : ''}`}>{done ? '✓' : ''}</span>
                            <span className="adv-task-icon">{TASK_TYPES[t].icon}</span>
                            <span className="adv-task-label">{TASK_TYPES[t].label}</span>
                            <button
                              type="button"
                              className={`adv-task-bell-btn ${isSynced ? 'synced' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSyncSingleTask(selectedDay, t);
                              }}
                              title={
                                isSynced
                                  ? 'ตั้งเตือนใน Google Calendar แล้ว (คลิกเพื่อดู)'
                                  : 'คลิกเพื่อตั้งเตือนงานนี้ลง Google Calendar'
                              }
                            >
                              {isSynced ? '🔔✓' : '🔔'}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </motion.div>
              </AnimatePresence>
            </section>


            <section className="adv-card adv-tips-card">
              <h3 className="adv-display adv-section-title-sm">💡 เคล็ดลับการดูแล{plantType}</h3>
              {plan.tipGroups.map((group) => (
                <div key={group.title} className="adv-tips-group">
                  <p className="adv-tips-group-title">{group.title}</p>
                  <ul className="adv-tips-list">
                    {group.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default PlantAdvice;
