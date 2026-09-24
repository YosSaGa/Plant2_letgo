import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import './hold-to-confirm.css';

export default function HoldToConfirm({
  onConfirm,
  duration = 1.8,
  label = 'กดค้างไว้เพื่อลบถาวร',
  holdingLabel = 'กดค้างไว้... ปล่อยเพื่อยกเลิก',
  successLabel = 'ยืนยันสำเร็จ!',
  disabled = false,
  icon: CustomIcon,
}) {
  const progress = useMotionValue(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const animationRef = useRef(null);

  // Button transformation values
  const buttonScale = useTransform(progress, [0, 1], [1, 0.96]);
  // Fill progress width: 0% to 100%
  const fillWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  
  // Ring stroke calculation (radius = 10, circumference = 2 * PI * 10 ≈ 62.83)
  const circumference = 62.83;
  const strokeDashoffset = useTransform(progress, [0, 1], [circumference, 0]);

  const handlePointerDown = (e) => {
    if (disabled || isCompleted) return;
    
    // Prevent context menu or drag
    if (e.button !== undefined && e.button !== 0) return;

    setIsHolding(true);
    progress.set(0);

    if (animationRef.current) {
      animationRef.current.stop();
    }

    animationRef.current = animate(progress, 1, {
      duration: duration,
      ease: 'linear',
      onComplete: () => {
        setIsHolding(false);
        setIsCompleted(true);
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      },
    });
  };

  const handlePointerUp = () => {
    if (isCompleted || disabled) return;
    setIsHolding(false);

    if (animationRef.current) {
      animationRef.current.stop();
    }

    animate(progress, 0, {
      duration: 0.3,
      ease: 'easeOut',
    });
  };

  return (
    <div className="hold-confirm-stage">
      <div className="hold-confirm-wrap">
        <motion.button
          type="button"
          className={`hold-confirm-btn ${isHolding ? 'holding' : ''} ${isCompleted ? 'completed' : ''}`}
          style={{ scale: buttonScale }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          disabled={disabled || isCompleted}
        >
          {/* Animated Fill Bar */}
          <motion.div
            className="hold-confirm-fill"
            style={{ width: fillWidth }}
          />

          {/* Button Text & Icon */}
          <div className="hold-confirm-content">
            {/* SVG Ring Progress */}
            <div className="hold-confirm-ring-wrap">
              <svg className="hold-confirm-ring-svg" width="24" height="24" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.25)"
                  strokeWidth="3"
                />
                <motion.circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke={isHolding ? '#ffffff' : '#dc2626'}
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <span>
              {isCompleted
                ? successLabel
                : isHolding
                ? holdingLabel
                : label}
            </span>

            {isCompleted ? (
              <CheckCircle2 size={18} />
            ) : CustomIcon ? (
              <CustomIcon size={18} />
            ) : (
              <Trash2 size={18} />
            )}
          </div>
        </motion.button>
      </div>

      <div className={`hold-confirm-hint ${isHolding ? 'holding' : ''}`}>
        <AlertTriangle size={13} />
        <span>
          {isHolding
            ? 'กำลังยืนยัน... ปล่อยมือเพื่อยกเลิกทันที'
            : 'แตะหรือกดค้างไว้ 2 วินาที เพื่อยืนยันคำสั่งขั้นเด็ดขาด'}
        </span>
      </div>
    </div>
  );
}
