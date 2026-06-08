'use client';

import React from 'react';
import { useDesignStore } from '@/lib/designState';
import { DesignStyles } from '@/types/design';
import styles from './PropertyPanel.module.css';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => (
  <div className={styles.colorInput}>
    <label>{label}</label>
    <div className={styles.colorInputWrapper}>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
      <span>{value}</span>
    </div>
  </div>
);

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step = 1, onChange }) => (
  <div className={styles.sliderInput}>
    <label>{label}</label>
    <div className={styles.sliderWrapper}>
      <input type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className={styles.numberInput} min={min} max={max} step={step} />
    </div>
  </div>
);

export const PropertyPanel: React.FC = () => {
  const { elements, selectedId, updateElement, updateStyles, deleteElement, duplicateElement } = useDesignStore();
  const selectedElement = elements.find((el) => el.id === selectedId);

  if (!selectedElement) {
    return (
      <div className={styles.panel}>
        <div className={styles.emptyState}>
          <p>Select an element to edit properties</p>
        </div>
      </div>
    );
  }

  const handleStyleChange = (key: keyof DesignStyles, value: any) => {
    updateStyles(selectedId!, { [key]: value });
  };

  const handleSize = (key: 'width' | 'height', value: number) => {
    updateElement(selectedId!, { [key]: Math.max(20, value) });
  };

  const handlePosition = (key: 'x' | 'y', value: number) => {
    updateElement(selectedId!, { [key]: value });
  };

  const handleContent = (value: string) => {
    updateElement(selectedId!, { content: value });
  };

  return (
    <div className={styles.panel}>
      {/* Element Info */}
      <div className={styles.section}>
        <h3>Element Info</h3>
        <div className={styles.infoItem}>
          <span className={styles.label}>Type:</span>
          <span className={styles.value}>{selectedElement.type}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>ID:</span>
          <span className={styles.value} style={{ fontSize: '12px', fontFamily: 'monospace' }}>{selectedElement.id}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Z-Index:</span>
          <input
            type="number"
            value={selectedElement.zIndex}
            onChange={(e) => updateElement(selectedId!, { zIndex: Number(e.target.value) })}
            className={styles.numberInput}
          />
        </div>
      </div>

      {/* Content */}
      {(selectedElement.type === 'text' || selectedElement.type === 'button' || selectedElement.type === 'card' || selectedElement.type === 'section') && (
        <div className={styles.section}>
          <h3>Content</h3>
          <textarea value={selectedElement.content} onChange={(e) => handleContent(e.target.value)} className={styles.textarea} placeholder="Element content" />
        </div>
      )}

      {/* Image URL */}
      {selectedElement.type === 'image' && (
        <div className={styles.section}>
          <h3>Image</h3>
          <input type="text" value={selectedElement.content} onChange={(e) => handleContent(e.target.value)} className={styles.input} placeholder="Image URL" />
        </div>
      )}

      {/* Position & Size */}
      <div className={styles.section}>
        <h3>Position & Size</h3>
        <div className={styles.gridRow}>
          <SliderInput label="X" value={selectedElement.x} min={0} max={2000} onChange={(v) => handlePosition('x', v)} />
          <SliderInput label="Y" value={selectedElement.y} min={0} max={2000} onChange={(v) => handlePosition('y', v)} />
        </div>
        <div className={styles.gridRow}>
          <SliderInput label="Width" value={selectedElement.width} min={20} max={1000} onChange={(v) => handleSize('width', v)} />
          <SliderInput label="Height" value={selectedElement.height} min={20} max={1000} onChange={(v) => handleSize('height', v)} />
        </div>
      </div>

      {/* Text Styles */}
      {(selectedElement.type === 'text' || selectedElement.type === 'button') && (
        <div className={styles.section}>
          <h3>Text</h3>
          <SliderInput label="Font Size" value={selectedElement.styles.fontSize || 16} min={8} max={72} onChange={(v) => handleStyleChange('fontSize', v)} />
          <div className={styles.gridRow}>
            <div>
              <label>Font Weight</label>
              <select value={selectedElement.styles.fontWeight || '400'} onChange={(e) => handleStyleChange('fontWeight', e.target.value)} className={styles.select}>
                <option value="400">Normal</option>
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="900">Black</option>
              </select>
            </div>
            <div>
              <label>Text Align</label>
              <select value={selectedElement.styles.textAlign || 'left'} onChange={(e) => handleStyleChange('textAlign', e.target.value as any)} className={styles.select}>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
          <ColorInput label="Text Color" value={selectedElement.styles.color || '#000000'} onChange={(v) => handleStyleChange('color', v)} />
          <SliderInput label="Line Height" value={selectedElement.styles.lineHeight || 1.5} min={1} max={3} step={0.1} onChange={(v) => handleStyleChange('lineHeight', v)} />
        </div>
      )}

      {/* Background & Border */}
      <div className={styles.section}>
        <h3>Background & Border</h3>
        <ColorInput label="Background" value={selectedElement.styles.backgroundColor || '#ffffff'} onChange={(v) => handleStyleChange('backgroundColor', v)} />
        <ColorInput label="Border Color" value={selectedElement.styles.borderColor || '#000000'} onChange={(v) => handleStyleChange('borderColor', v)} />
        <div className={styles.gridRow}>
          <SliderInput label="Border Width" value={selectedElement.styles.borderWidth || 0} min={0} max={10} onChange={(v) => handleStyleChange('borderWidth', v)} />
          <SliderInput label="Border Radius" value={selectedElement.styles.borderRadius || 0} min={0} max={50} onChange={(v) => handleStyleChange('borderRadius', v)} />
        </div>
      </div>

      {/* Spacing */}
      <div className={styles.section}>
        <h3>Spacing</h3>
        <input
          type="text"
          value={selectedElement.styles.padding || '0'}
          onChange={(e) => handleStyleChange('padding', e.target.value)}
          className={styles.input}
          placeholder="Padding (e.g., 10px 20px)"
        />
        <input
          type="text"
          value={selectedElement.styles.margin || '0'}
          onChange={(e) => handleStyleChange('margin', e.target.value)}
          className={styles.input}
          placeholder="Margin (e.g., 10px 20px)"
        />
      </div>

      {/* Effects */}
      <div className={styles.section}>
        <h3>Effects</h3>
        <SliderInput label="Opacity" value={selectedElement.styles.opacity ?? 1} min={0} max={1} step={0.1} onChange={(v) => handleStyleChange('opacity', v)} />
        <input
          type="text"
          value={selectedElement.styles.boxShadow || 'none'}
          onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
          className={styles.input}
          placeholder="Box Shadow (e.g., 0 4px 12px rgba(0,0,0,0.15))"
        />
      </div>

      {/* Actions */}
      <div className={styles.section}>
        <h3>Actions</h3>
        <div className={styles.buttonGroup}>
          <button onClick={() => duplicateElement(selectedId!)} className={styles.button}>
            Duplicate
          </button>
          <button onClick={() => deleteElement(selectedId!)} className={`${styles.button} ${styles.danger}`}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
