'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useDesignStore } from '@/lib/designState';
import { DesignElement } from '@/types/design';
import styles from './Canvas.module.css';

interface Position {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementStartX: number;
  elementStartY: number;
  resizing: boolean;
  resizeDirection?: string;
}

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementStartX: 0,
    elementStartY: 0,
    resizing: false,
  });

  const { elements, selectedId, selectElement, updateElement, zoom, gridSize, showGrid } = useDesignStore();

  const getGridSnappedValue = (value: number, gridSize: number) => {
    return Math.round(value / gridSize) * gridSize;
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    selectElement(elementId);

    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const startX = (e.clientX - canvasRect.left) / zoom;
    const startY = (e.clientY - canvasRect.top) / zoom;

    // Check if resizing
    const resizeDirection = getResizeDirection(e, element);
    if (resizeDirection) {
      setDragState({
        isDragging: false,
        resizing: true,
        resizeDirection,
        startX,
        startY,
        elementStartX: element.x,
        elementStartY: element.y,
      });
      return;
    }

    // Regular drag
    setDragState({
      isDragging: true,
      startX,
      startY,
      elementStartX: element.x,
      elementStartY: element.y,
      resizing: false,
    });
  };

  const getResizeDirection = (e: React.MouseEvent, element: DesignElement): string | null => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return null;

    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const handleSize = 8;

    if (offsetX < handleSize && offsetY < handleSize) return 'nw';
    if (offsetX > rect.width - handleSize && offsetY < handleSize) return 'ne';
    if (offsetX < handleSize && offsetY > rect.height - handleSize) return 'sw';
    if (offsetX > rect.width - handleSize && offsetY > rect.height - handleSize) return 'se';
    if (offsetY < handleSize) return 'n';
    if (offsetY > rect.height - handleSize) return 's';
    if (offsetX < handleSize) return 'w';
    if (offsetX > rect.width - handleSize) return 'e';

    return null;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragState.isDragging && !dragState.resizing) return;

      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const currentX = (e.clientX - canvasRect.left) / zoom;
      const currentY = (e.clientY - canvasRect.top) / zoom;

      const element = elements.find((el) => el.id === selectedId);
      if (!element) return;

      if (dragState.isDragging) {
        const deltaX = currentX - dragState.startX;
        const deltaY = currentY - dragState.startY;

        const newX = getGridSnappedValue(dragState.elementStartX + deltaX, gridSize);
        const newY = getGridSnappedValue(dragState.elementStartY + deltaY, gridSize);

        updateElement(selectedId!, { x: newX, y: newY });
      } else if (dragState.resizing && dragState.resizeDirection) {
        const deltaX = currentX - dragState.startX;
        const deltaY = currentY - dragState.startY;

        const updates: Partial<DesignElement> = {};

        switch (dragState.resizeDirection) {
          case 'se':
            updates.width = Math.max(20, getGridSnappedValue(element.width + deltaX, gridSize));
            updates.height = Math.max(20, getGridSnappedValue(element.height + deltaY, gridSize));
            break;
          case 'sw':
            updates.x = getGridSnappedValue(dragState.elementStartX + deltaX, gridSize);
            updates.width = Math.max(20, getGridSnappedValue(element.width - deltaX, gridSize));
            updates.height = Math.max(20, getGridSnappedValue(element.height + deltaY, gridSize));
            break;
          case 'ne':
            updates.y = getGridSnappedValue(dragState.elementStartY + deltaY, gridSize);
            updates.width = Math.max(20, getGridSnappedValue(element.width + deltaX, gridSize));
            updates.height = Math.max(20, getGridSnappedValue(element.height - deltaY, gridSize));
            break;
          case 'nw':
            updates.x = getGridSnappedValue(dragState.elementStartX + deltaX, gridSize);
            updates.y = getGridSnappedValue(dragState.elementStartY + deltaY, gridSize);
            updates.width = Math.max(20, getGridSnappedValue(element.width - deltaX, gridSize));
            updates.height = Math.max(20, getGridSnappedValue(element.height - deltaY, gridSize));
            break;
          case 'e':
            updates.width = Math.max(20, getGridSnappedValue(element.width + deltaX, gridSize));
            break;
          case 'w':
            updates.x = getGridSnappedValue(dragState.elementStartX + deltaX, gridSize);
            updates.width = Math.max(20, getGridSnappedValue(element.width - deltaX, gridSize));
            break;
          case 'n':
            updates.y = getGridSnappedValue(dragState.elementStartY + deltaY, gridSize);
            updates.height = Math.max(20, getGridSnappedValue(element.height - deltaY, gridSize));
            break;
          case 's':
            updates.height = Math.max(20, getGridSnappedValue(element.height + deltaY, gridSize));
            break;
        }

        updateElement(selectedId!, updates);
      }
    };

    const handleMouseUp = () => {
      setDragState({
        isDragging: false,
        startX: 0,
        startY: 0,
        elementStartX: 0,
        elementStartY: 0,
        resizing: false,
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, selectedId, elements, zoom, gridSize, updateElement]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      selectElement(null);
    }
  };

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      onClick={handleCanvasClick}
      style={{
        transform: `scale(${zoom})`,
        backgroundImage: showGrid ? `linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)` : 'none',
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      {elements.map((element) => (
        <div
          key={element.id}
          className={`${styles.element} ${selectedId === element.id ? styles.selected : ''}`}
          style={{
            position: 'absolute',
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            zIndex: element.zIndex,
            ...element.styles,
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          {/* Render element content based on type */}
          {element.type === 'text' && <span>{element.content}</span>}
          {element.type === 'image' && <img src={element.content} alt="content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {element.type === 'button' && <button>{element.content}</button>}
          {element.type === 'section' && <section>{element.content}</section>}
          {element.type === 'card' && <div className={styles.card}>{element.content}</div>}

          {/* Resize handles */}
          {selectedId === element.id && (
            <>
              <div className={styles.handle + ' ' + styles.nw}></div>
              <div className={styles.handle + ' ' + styles.ne}></div>
              <div className={styles.handle + ' ' + styles.sw}></div>
              <div className={styles.handle + ' ' + styles.se}></div>
              <div className={styles.handle + ' ' + styles.n}></div>
              <div className={styles.handle + ' ' + styles.s}></div>
              <div className={styles.handle + ' ' + styles.e}></div>
              <div className={styles.handle + ' ' + styles.w}></div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};
