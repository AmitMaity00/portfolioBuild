'use client';

import React, { useState } from 'react';
import { X, Lightbulb } from 'lucide-react';
import styles from './WelcomeModal.module.css';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>

        <div className={styles.content}>
          <h1>👋 Welcome to Portfolio Designer!</h1>
          <p className={styles.subtitle}>Create your portfolio like Canva - no coding required</p>

          <div className={styles.tips}>
            <div className={styles.tip}>
              <div className={styles.icon}>1️⃣</div>
              <div>
                <h3>Add Elements</h3>
                <p>Click Text, Image, Button, Section, or Card to add elements to your canvas</p>
              </div>
            </div>

            <div className={styles.tip}>
              <div className={styles.icon}>2️⃣</div>
              <div>
                <h3>Drag & Customize</h3>
                <p>Drag elements anywhere, resize with handles, then customize colors, fonts, and spacing</p>
              </div>
            </div>

            <div className={styles.tip}>
              <div className={styles.icon}>3️⃣</div>
              <div>
                <h3>See Changes Instantly</h3>
                <p>The live preview on the right shows exactly how your site will look</p>
              </div>
            </div>

            <div className={styles.tip}>
              <div className={styles.icon}>🚀</div>
              <div>
                <h3>Publish</h3>
                <p>Click "Publish Site" when done to get your code, download, or deploy instantly</p>
              </div>
            </div>
          </div>

          <div className={styles.features}>
            <h3>Key Features:</h3>
            <ul>
              <li>Free positioning (no grid layout)</li>
              <li>Full control over colors, fonts, spacing</li>
              <li>Undo/Redo your changes</li>
              <li>Live preview while editing</li>
              <li>Export as HTML or React code</li>
              <li>Download as standalone file</li>
            </ul>
          </div>

          <button className={styles.startBtn} onClick={onClose}>
            Start Designing →
          </button>
        </div>
      </div>
    </div>
  );
};
