import './figma-export.css';

const screens = [
  { name: '01 — หน้าแรก', path: '/', height: '1180px' },
  { name: '02 — สรุปสวน', path: '/summary', height: '1180px' },
  { name: '03 — ตรวจโรคพืช', path: '/disease-detection', height: '1700px' },
  { name: '04 — รายละเอียดการดูแล', path: '/plant-details', height: '1800px' },
  { name: '05 — คู่มือดูแลพืช', path: '/care-guide', height: '1900px' },
];

// Temporary board for importing all app screens into HTML to Design / Figma.
export default function FigmaExport() {
  return (
    <main className="figma-export">
      <header className="figma-export__header">
        <p>MY SMART GARDEN</p>
        <h1>Figma import board</h1>
        <span>นำเข้าหน้านี้เพียง URL เดียว แล้วลบไฟล์นี้ได้หลังใช้งาน</span>
      </header>

      {screens.map((screen) => (
        <section className="figma-export__screen" key={screen.path}>
          <h2>{screen.name}</h2>
          <iframe
            title={screen.name}
            src={screen.path}
            style={{ height: screen.height }}
            scrolling="no"
          />
        </section>
      ))}
    </main>
  );
}
