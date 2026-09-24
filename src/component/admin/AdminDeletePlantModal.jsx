import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeOff, Trash2, X, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import HoldToConfirm from '../common/HoldToConfirm';
import './admin-delete-modal.css';

export default function AdminDeletePlantModal({
  isOpen,
  plant,
  onClose,
  onHide,
  onPermanentDelete,
  isProcessing = false,
}) {
  const [selectedAction, setSelectedAction] = useState('hide'); // 'hide' | 'delete'

  if (!isOpen || !plant) return null;

  const handleConfirmHide = async () => {
    if (typeof onHide === 'function') {
      await onHide(plant);
    }
  };

  const handleConfirmDelete = async () => {
    if (typeof onPermanentDelete === 'function') {
      await onPermanentDelete(plant);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="plant-delete-backdrop" onClick={!isProcessing ? onClose : undefined}>
        <motion.div
          className="plant-delete-modal"
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="plant-delete-header">
            <div className="plant-delete-title-wrap">
              <div className="plant-delete-emoji-badge">
                {plant.emoji || '🌱'}
              </div>
              <div>
                <h3>จัดการชนิดพืช "{plant.name}"</h3>
                <p>หมวดหมู่: {plant.category || 'พืชทั่วไป'}</p>
              </div>
            </div>
            <button
              type="button"
              className="plant-delete-close-btn"
              onClick={onClose}
              disabled={isProcessing}
              title="ปิด"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="plant-delete-body">
            <p className="plant-delete-prompt-text">
              กรุณาเลือกรูปแบบการจัดการชนิดพืชนี้ เพื่อความปลอดภัยและความต่อเนื่องของแปลงปลูกสมาชิก:
            </p>

            <div className="plant-delete-options">
              {/* Option 1: Hide */}
              <div
                className={`plant-delete-option-card ${selectedAction === 'hide' ? 'selected-hide' : ''}`}
                onClick={() => !isProcessing && setSelectedAction('hide')}
              >
                <div className="plant-delete-option-header">
                  <div className="plant-delete-option-title">
                    <EyeOff size={18} />
                    <span>ซ่อนไว้ (แนะนำ)</span>
                  </div>
                  <span className="plant-delete-badge recommended">
                    <ShieldCheck size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                    ปลอดภัย
                  </span>
                </div>
                <p className="plant-delete-option-desc">
                  ซ่อนชนิดพืชนี้จากหน้ารายการเลือกปลูกของผู้ใช้ใหม่ แต่แปลงปลูกของสมาชิกเดิมที่เคยปลูกไว้จะไม่ได้รับผลกระทบ
                </p>

                {selectedAction === 'hide' && (
                  <div className="plant-delete-action-area">
                    <button
                      type="button"
                      className="plant-hide-confirm-btn"
                      onClick={handleConfirmHide}
                      disabled={isProcessing}
                    >
                      <Check size={18} />
                      <span>{isProcessing ? 'กำลังบันทึก...' : `ยืนยันการซ่อน "${plant.name}"`}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Option 2: Permanent Delete */}
              <div
                className={`plant-delete-option-card ${selectedAction === 'delete' ? 'selected-delete' : ''}`}
                onClick={() => !isProcessing && setSelectedAction('delete')}
              >
                <div className="plant-delete-option-header">
                  <div className="plant-delete-option-title">
                    <Trash2 size={18} />
                    <span>ลบถาวร (Danger Zone)</span>
                  </div>
                  <span className="plant-delete-badge danger">
                    <AlertTriangle size={12} style={{ display: 'inline', verticalAlign: '-1px', marginRight: 3 }} />
                    อันตราย
                  </span>
                </div>
                <p className="plant-delete-option-desc">
                  ลบชนิดพืชนี้ออกจากฐานข้อมูลอย่างถาวร ⚠️ แปลงปลูกของสมาชิกทุกคนที่เคยปลูกพืชนี้จะถูกลบทิ้งไปด้วยทันที
                </p>

                {selectedAction === 'delete' && (
                  <div className="plant-delete-action-area">
                    <HoldToConfirm
                      label={`กดค้าง 2 วิ เพื่อลบ "${plant.name}" ถาวร`}
                      holdingLabel="กำลังลบ... อย่าเพิ่งปล่อยมือ"
                      successLabel="ลบข้อมูลสำเร็จ!"
                      duration={1.8}
                      disabled={isProcessing}
                      onConfirm={handleConfirmDelete}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="plant-delete-footer">
            <button
              type="button"
              className="plant-delete-cancel-btn"
              onClick={onClose}
              disabled={isProcessing}
            >
              ยกเลิก
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
