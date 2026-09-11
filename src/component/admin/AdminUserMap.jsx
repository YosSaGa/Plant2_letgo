import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CircleMarker, MapContainer, TileLayer, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import { ArrowLeft, Crown, LocateFixed, MapPinned, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userLocations as fallbackUserLocations } from './mockDashboardData';
import { fetchUserProvinceStats, GOOGLE_MAPS_API_KEY } from './userMapService';
import './admin-user-map.css';
import './admin-polish.css';

const format = (value) => new Intl.NumberFormat('th-TH').format(value || 0);
const defaultCenter = [13.4, 100.3];
const days = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.', 'อา.'];

function FlyToLocation({ location, reduceMotion }) {
  const map = useMap();
  useEffect(() => {
    if (location && location.position) {
      map.flyTo(location.position, 8, { duration: reduceMotion ? 0 : 0.75 });
    }
  }, [location, map, reduceMotion]);
  return null;
}

function MapReady({ mapRef, reduceMotion, topPosition }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    const timer = window.setTimeout(() => {
      map.invalidateSize();
      if (!reduceMotion && topPosition) {
        map.flyTo(topPosition, 7.3, { duration: 1.2 });
      }
    }, 150);
    return () => window.clearTimeout(timer);
  }, [map, mapRef, reduceMotion, topPosition]);
  return null;
}

export default function AdminUserMap() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  // ข้อมูลจังหวัดและรูปแบบแผนที่
  const [locations, setLocations] = useState(() => [...fallbackUserLocations].sort((a, b) => b.users - a.users));
  const [mapLayer, setMapLayer] = useState('google'); // 'google' | 'satellite' | 'osm'

  useEffect(() => {
    let isMounted = true;
    fetchUserProvinceStats().then((data) => {
      if (isMounted && data && data.length > 0) {
        setLocations(data);
        if (data[0]?.position && mapRef.current) {
          mapRef.current.flyTo(data[0].position, 7.3, { duration: reduceMotion ? 0 : 1.2 });
        }
      }
    });
    return () => { isMounted = false; };
  }, [reduceMotion]);

  // จังหวัดที่มีผู้ใช้งานมากที่สุด (อันดับ 1)
  const topProvince = locations[0];
  const chartData = selected?.trend?.map((total, index) => ({ day: days[index] || `วันที่ ${index + 1}`, total })) || [];

  return (
    <main className="aum-root">
      {/* ส่วนหัวหน้าเว็บ */}
      <header className="aum-header">
        <button onClick={() => navigate('/admin/dashboard')}>
          <ArrowLeft size={19} /> กลับแดชบอร์ด
        </button>
        <div>
          <p>ADMIN SYSTEM</p>
          <h1>แผนที่การกระจายตัวของผู้ใช้งาน</h1>
        </div>
      </header>

      {/* กล่องเนื้อหาหลัก */}
      <div className="aum-layout">
        {/* แผนที่ประเทศไทย */}
        <section className="aum-map-wrap">
          <MapContainer center={defaultCenter} zoom={5.4} scrollWheelZoom className="aum-map">
            {mapLayer === 'google' && (
              <TileLayer
                attribution="&copy; Google Maps"
                url={`https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`}
              />
            )}
            {mapLayer === 'satellite' && (
              <TileLayer
                attribution="&copy; Google Satellite"
                url={`https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${GOOGLE_MAPS_API_KEY}`}
              />
            )}
            {mapLayer === 'osm' && (
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            )}
            <MapReady mapRef={mapRef} reduceMotion={reduceMotion} topPosition={topProvince?.position} />
            <FlyToLocation location={selected} reduceMotion={reduceMotion} />

            {locations.map((location, index) => {
              const isTop = index === 0;
              const isSel = selected?.name === location.name;
              return (
                <CircleMarker
                  key={location.name}
                  center={location.position}
                  radius={isSel ? Math.max(14, location.users / 35) : Math.max(9, location.users / 45)}
                  pathOptions={{
                    color: isSel ? '#022c22' : isTop ? '#f59e0b' : '#047857',
                    weight: isSel || isTop ? 3 : 1.5,
                    fillColor: isTop ? '#10b981' : '#34d399',
                    fillOpacity: isTop ? 0.85 : 0.65,
                    className: isTop && !reduceMotion ? 'map-pulse' : '',
                  }}
                  eventHandlers={{ click: () => setSelected(location) }}
                >
                  <LeafletTooltip>
                    {isTop ? '🏆 [อันดับ 1 สูงสุด] ' : ''}
                    {location.name} · {format(location.users)} ผู้ใช้งาน
                  </LeafletTooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>

          {/* สลับมุมมองแผนที่ (Google Maps / ดาวเทียม / OSM) */}
          <div className="aum-map-switcher">
            <button
              type="button"
              className={mapLayer === 'google' ? 'active' : ''}
              onClick={() => setMapLayer('google')}
            >
              🗺️ Google Maps
            </button>
            <button
              type="button"
              className={mapLayer === 'satellite' ? 'active' : ''}
              onClick={() => setMapLayer('satellite')}
            >
              🛰️ ดาวเทียม
            </button>
            <button
              type="button"
              className={mapLayer === 'osm' ? 'active' : ''}
              onClick={() => setMapLayer('osm')}
            >
              🌐 OSM
            </button>
          </div>

          <button
            className="aum-reset"
            onClick={() => mapRef.current?.flyTo(defaultCenter, 5.4, { duration: reduceMotion ? 0 : 0.75 })}
          >
            <LocateFixed size={17} /> รีเซ็ตมุมมอง
          </button>

          <span className="aum-map-label">
            <MapPinned size={17} /> ประเทศไทย · Google Maps Live
          </span>
        </section>

        {/* แผงข้อมูลด้านขวา */}
        <aside className="aum-panel">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.name}
                initial={{ opacity: 0, x: reduceMotion ? 0 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -15 }}
              >
                <button className="aum-list-back" onClick={() => setSelected(null)}>
                  ← ดูรายชื่อทั้งหมด
                </button>
                <p className="aum-kicker">
                  {locations[0]?.name === selected.name ? '🏆 อันดับ 1 มีผู้ใช้มากที่สุด' : 'จังหวัดที่เลือก'}
                </p>
                <h2>{selected.name}</h2>

                <div className="aum-user-total">
                  <Users size={22} />
                  <div>
                    <span>ผู้ใช้งานทั้งหมด</span>
                    <strong>{format(selected.users)} คน</strong>
                  </div>
                </div>

                <h3>แนวโน้มการเข้าใช้ 7 วันล่าสุด</h3>
                <ResponsiveContainer width="100%" height={210}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="locationFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#059669"
                      strokeWidth={3}
                      fill="url(#locationFill)"
                      isAnimationActive={!reduceMotion}
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <div className="aum-detail-cards">
                  <p>
                    <span>สัดส่วนเทียบกับอันดับ 1</span>
                    <b>{Math.round((selected.users / (topProvince?.users || 1)) * 100)}%</b>
                  </p>
                  <p>
                    <span>การเติบโตสัปดาห์นี้</span>
                    <b>
                      +{selected.trend && selected.trend[0] > 0
                        ? Math.round(((selected.trend[6] - selected.trend[0]) / selected.trend[0]) * 100)
                        : 14}
                      %
                    </b>
                  </p>
                  <p>
                    <span>วันที่เข้าใช้มากที่สุด</span>
                    <b>วันเสาร์</b>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : -15 }}
              >
                <p className="aum-kicker">ผู้ใช้งานตามพื้นที่</p>
                <h2>เลือกจังหวัดเพื่อดูรายละเอียด</h2>

                {/* แถบไฮไลต์จังหวัดอันดับ 1 ที่มีผู้ใช้งานมากที่สุด */}
                {topProvince && (
                  <div
                    className="aum-top-banner"
                    onClick={() => setSelected(topProvince)}
                    title="คลิกเพื่อดูรายละเอียดจังหวัดอันดับ 1"
                  >
                    <div className="aum-top-badge">
                      <Crown size={14} /> จังหวัดที่มีผู้ใช้งานมากที่สุด (อันดับ 1)
                    </div>
                    <div className="aum-top-content">
                      <h3>{topProvince.name}</h3>
                      <p>
                        <b>{format(topProvince.users)}</b> ผู้ใช้งาน
                      </p>
                    </div>
                  </div>
                )}

                <p className="aum-intro">คลิก marker บนแผนที่ หรือเลือกรายการจากอันดับด้านล่าง</p>

                <div className="aum-location-list">
                  {locations.map((location, index) => {
                    const isTop = index === 0;
                    return (
                      <motion.button
                        key={location.name}
                        onClick={() => setSelected(location)}
                        style={isTop ? { borderColor: '#10b981', background: '#f0fdf4' } : undefined}
                        whileHover={reduceMotion ? undefined : { y: -4, boxShadow: '0 12px 24px -8px rgba(6,78,59,0.18)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <b style={isTop ? { background: '#f59e0b', color: '#fff' } : undefined}>
                          {isTop ? '★' : index + 1}
                        </b>
                        <span>
                          {location.name}
                          {isTop && (
                            <span style={{ marginLeft: 6, color: '#059669', fontSize: 11, fontWeight: 700 }}>
                              (ยอดสูงสุด)
                            </span>
                          )}
                          <small>ผู้ใช้งานในระบบ</small>
                        </span>
                        <strong>{format(location.users)}</strong>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </main>
  );
}
