/**
 * TestJourneyModal.jsx
 * Modern Dark-Mode Vertical Timeline Modal for System Testing Journey
 * Displays every user and automated action, page navigation, and timestamp
 * inspired by developer activity timelines.
 */

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Clock, 
  ArrowRight, 
  MousePointer, 
  Compass, 
  FileText, 
  Copy, 
  Trash2, 
  X, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import './testJourneyModal.css';

export default function TestJourneyModal({
  isOpen,
  onClose,
  timelineLogs = [],
  onClearLogs,
  isManualRecording = false,
  testMode = 'auto'
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    try {
      const summaryText = timelineLogs.map((log, index) => {
        return `[#${index + 1}] ${log.timestamp} - ${log.title}\n   Route: ${log.route}\n   Details: ${log.details || '-'}\n   Status: ${log.status}`;
      }).join('\n\n');

      navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  };

  const getNodeIcon = (log) => {
    if (log.status === 'active' || log.isCurrent) {
      return <Clock size={13} className="qa-node-icon-pulse" />;
    }
    if (log.type === 'navigation') {
      return <Compass size={13} />;
    }
    if (log.type === 'click') {
      return <MousePointer size={12} />;
    }
    if (log.type === 'form') {
      return <FileText size={12} />;
    }
    return <Check size={13} strokeWidth={3} />;
  };

  return createPortal(
    <AnimatePresence>
      <div className="qa-timeline-backdrop" onClick={onClose}>
        <motion.div 
          className="qa-timeline-modal"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="qa-timeline-header">
            <div className="qa-timeline-header-left">
              <div className="qa-timeline-badge-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="qa-timeline-title">
                  ไทม์ไลน์การทดสอบระบบ (Test Execution Journey)
                </h3>
                <p className="qa-timeline-subtitle">
                  บันทึกเส้นทางการทดสอบ การกดปุ่ม และการเปลี่ยนหน้าแบบเรียลไทม์
                </p>
              </div>
            </div>

            <div className="qa-timeline-header-right">
              {isManualRecording ? (
                <span className="qa-recording-pill">
                  <span className="qa-recording-dot" />
                  กำลังบันทึกสด (Manual)
                </span>
              ) : (
                <span className="qa-mode-pill">
                  {testMode === 'manual' ? '👤 Manual Mode' : '🤖 Auto Test'}
                </span>
              )}

              <button 
                type="button" 
                className="qa-timeline-close-btn"
                onClick={onClose}
                aria-label="ปิดหน้าต่าง"
                title="ปิด"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* STATS BAR */}
          <div className="qa-timeline-stats-bar">
            <div className="qa-timeline-stat-item">
              <span className="qa-stat-num">{timelineLogs.length}</span>
              <span className="qa-stat-desc">กิจกรรมทั้งหมด</span>
            </div>
            <div className="qa-timeline-stat-divider" />
            <div className="qa-timeline-stat-item">
              <span className="qa-stat-num" style={{ color: '#34d399' }}>
                {timelineLogs.filter(l => l.status !== 'failed').length}
              </span>
              <span className="qa-stat-desc">ผ่านสำเร็จ (Pass)</span>
            </div>
            <div className="qa-timeline-stat-divider" />
            <div className="qa-timeline-stat-item">
              <span className="qa-stat-num" style={{ color: '#38bdf8' }}>
                {new Set(timelineLogs.map(l => l.route)).size}
              </span>
              <span className="qa-stat-desc">หน้าที่ทดสอบ</span>
            </div>
            {isManualRecording && (
              <span className="qa-timeline-live-tag">
                🔴 Live Action Tracker Active
              </span>
            )}
          </div>

          {/* BODY: VERTICAL TIMELINE */}
          <div className="qa-timeline-body">
            {timelineLogs.length === 0 ? (
              <div className="qa-timeline-empty">
                <span style={{ fontSize: 42, marginBottom: 12 }}>🌱</span>
                <h4>ยังไม่มีประวัติการทดสอบ</h4>
                <p>
                  กดเริ่มรัน <strong>เทสทั้งระบบ</strong> หรือเปิดโหมด <strong>ทดสอบด้วยตัวเอง</strong> เพื่อบันทึกการกระทำทุกขั้นตอนลงในไทม์ไลน์นี้
                </p>
              </div>
            ) : (
              <div className="qa-timeline-tree">
                {/* Continuous Vertical Guide Line */}
                <div className="qa-timeline-line" />

                {timelineLogs.map((log, index) => {
                  const isLatest = index === 0;
                  const isSuccess = log.status !== 'failed';

                  return (
                    <motion.div 
                      key={log.id || index}
                      className={`qa-timeline-item ${isLatest ? 'latest' : ''}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                    >
                      {/* Node Indicator on the Line */}
                      <div className={`qa-timeline-node ${log.type} ${isSuccess ? 'success' : 'fail'} ${isLatest && isManualRecording ? 'pulsing' : ''}`}>
                        {getNodeIcon(log)}
                      </div>

                      {/* Content Card */}
                      <div className="qa-timeline-content">
                        <div className="qa-timeline-meta-row">
                          <span className="qa-timeline-time">
                            {log.date ? `${log.date} · ` : ''}{log.timestamp}
                          </span>
                          {log.route && (
                            <span className="qa-timeline-route-badge">
                              {log.route}
                            </span>
                          )}
                          {log.duration && (
                            <span className="qa-timeline-duration-tag">
                              {log.duration}
                            </span>
                          )}
                        </div>

                        <h4 className="qa-timeline-item-title">
                          {log.title}
                        </h4>

                        {log.details && (
                          <p className="qa-timeline-item-desc">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="qa-timeline-footer">
            <div className="qa-timeline-footer-left">
              {onClearLogs && timelineLogs.length > 0 && (
                <button 
                  type="button" 
                  className="qa-timeline-btn-text"
                  onClick={onClearLogs}
                >
                  <Trash2 size={14} />
                  <span>ล้างประวัติ</span>
                </button>
              )}
            </div>

            <div className="qa-timeline-footer-right">
              {timelineLogs.length > 0 && (
                <button 
                  type="button" 
                  className="qa-timeline-btn qa-timeline-btn-secondary"
                  onClick={handleCopyLogs}
                >
                  {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                  <span>{copied ? 'คัดลอกเรียบร้อย!' : 'คัดลอกประวัติ'}</span>
                </button>
              )}

              <button 
                type="button" 
                className="qa-timeline-btn qa-timeline-btn-primary"
                onClick={onClose}
              >
                <span>ปิดหน้าต่าง</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
