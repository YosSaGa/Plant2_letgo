/**
 * LogoutConfirmModal.jsx
 * PlookPloen Green-Theme Confirmation Modal (Thai Language)
 * Displays ShieldQuestion icon in emerald badge, Thai confirmation text,
 * and split "ยกเลิก" / "ใช่, ออกจากระบบ" buttons.
 */

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldQuestion } from 'lucide-react';
import './logoutConfirmModal.css';

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false
}) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        if (!isLoggingOut && typeof onClose === 'function') {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoggingOut, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div 
        className="logout-modal-backdrop" 
        onClick={() => {
          if (!isLoggingOut && typeof onClose === 'function') onClose();
        }}
      >
        <motion.div
          className="logout-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div className="logout-modal-body">
            {/* Emerald Circular Badge with Shield Question Icon */}
            <div className="logout-modal-icon-badge">
              <ShieldQuestion size={28} strokeWidth={2.2} />
            </div>

            {/* Title (Thai) */}
            <h3 id="logout-modal-title" className="logout-modal-title">
              ต้องการออกจากระบบใช่หรือไม่?
            </h3>

            {/* Subtext (Thai) */}
            <p className="logout-modal-subtext">
              คุณสามารถเข้าสู่ระบบกลับมาดูแลแปลงปลูกได้ตลอดเวลา
            </p>
          </div>

          {/* Split 50/50 Footer Action Buttons (Thai) */}
          <div className="logout-modal-footer">
            <button
              type="button"
              className="logout-modal-btn logout-modal-btn-cancel"
              onClick={onClose}
              disabled={isLoggingOut}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className="logout-modal-btn logout-modal-btn-confirm"
              onClick={onConfirm}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="logout-modal-spinner" />
                  <span>กำลังออกจากระบบ...</span>
                </>
              ) : (
                'ใช่, ออกจากระบบ'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
