'use client';

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { DesignState, DesignActions, DesignElement, Breakpoint, ResponsiveOverride, DesignStyles } from '@/types/design';

// Generate unique ID
const generateId = () => `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Default breakpoints
const DEFAULT_BREAKPOINTS = {
  desktop: { name: 'desktop' as Breakpoint, width: 1280, height: 1024, label: 'Desktop' },
  tablet: { name: 'tablet' as Breakpoint, width: 768, height: 1024, label: 'Tablet' },
  mobile: { name: 'mobile' as Breakpoint, width: 375, height: 812, label: 'Mobile' },
};

interface DesignStore extends DesignState, DesignActions {}

const initialState: DesignState = {
  elements: [],
  selectedId: null,
  breakpoints: DEFAULT_BREAKPOINTS,
  currentBreakpoint: 'desktop',
  zoom: 1,
  gridSize: 10,
  showGrid: true,
  history: [],
  historyIndex: -1,
};

export const useDesignStore = create<DesignStore>()(
  immer((set, get) => {
    const saveToHistory = () => {
      set((state) => {
        const { history, historyIndex, elements, selectedId, currentBreakpoint, zoom } = state;
        // Remove future history if we make a new change
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
          elements: JSON.parse(JSON.stringify(elements)),
          selectedId,
          currentBreakpoint,
          zoom,
          breakpoints: state.breakpoints,
          gridSize: state.gridSize,
          showGrid: state.showGrid,
          history: [],
          historyIndex: 0,
        });
        
        // Limit history to 50 states
        if (newHistory.length > 50) newHistory.shift();
        
        state.history = newHistory;
        state.historyIndex = newHistory.length - 1;
      });
    };

    return {
      ...initialState,

      addElement: (element: DesignElement) => {
        set((state) => {
          state.elements.push(element);
        });
        saveToHistory();
      },

      updateElement: (id: string, updates: Partial<DesignElement>) => {
        set((state) => {
          const element = state.elements.find((el) => el.id === id);
          if (element) {
            Object.assign(element, updates);
          }
        });
        saveToHistory();
      },

      deleteElement: (id: string) => {
        set((state) => {
          state.elements = state.elements.filter((el) => el.id !== id);
          if (state.selectedId === id) state.selectedId = null;
        });
        saveToHistory();
      },

      selectElement: (id: string | null) => {
        set((state) => {
          state.selectedId = id;
        });
      },

      duplicateElement: (id: string) => {
        set((state) => {
          const original = state.elements.find((el) => el.id === id);
          if (original) {
            const duplicate: DesignElement = {
              ...original,
              id: generateId(),
              x: original.x + 20,
              y: original.y + 20,
            };
            state.elements.push(duplicate);
            state.selectedId = duplicate.id;
          }
        });
        saveToHistory();
      },

      updateStyles: (id: string, styles: Partial<DesignStyles>) => {
        set((state) => {
          const element = state.elements.find((el) => el.id === id);
          if (element) {
            element.styles = { ...element.styles, ...styles };
          }
        });
        saveToHistory();
      },

      updateResponsiveStyle: (id: string, breakpoint: Breakpoint, override: ResponsiveOverride) => {
        set((state) => {
          const element = state.elements.find((el) => el.id === id);
          if (element) {
            if (!element.responsive) element.responsive = {};
            const existing = element.responsive[breakpoint as keyof typeof element.responsive] || {};
            element.responsive[breakpoint as keyof typeof element.responsive] = { ...existing, ...override };
          }
        });
        saveToHistory();
      },

      setBreakpoint: (breakpoint: Breakpoint) => {
        set((state) => {
          state.currentBreakpoint = breakpoint;
        });
      },

      setZoom: (zoom: number) => {
        set((state) => {
          state.zoom = Math.max(0.1, Math.min(3, zoom)); // Clamp between 0.1 and 3
        });
      },

      setGridSize: (size: number) => {
        set((state) => {
          state.gridSize = size;
        });
      },

      toggleGrid: () => {
        set((state) => {
          state.showGrid = !state.showGrid;
        });
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            const historyState = state.history[state.historyIndex];
            state.elements = JSON.parse(JSON.stringify(historyState.elements));
            state.selectedId = historyState.selectedId;
            state.currentBreakpoint = historyState.currentBreakpoint;
            state.zoom = historyState.zoom;
          }
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            const historyState = state.history[state.historyIndex];
            state.elements = JSON.parse(JSON.stringify(historyState.elements));
            state.selectedId = historyState.selectedId;
            state.currentBreakpoint = historyState.currentBreakpoint;
            state.zoom = historyState.zoom;
          }
        });
      },

      batchUpdate: (updates: Array<{ id: string; data: Partial<DesignElement> }>) => {
        set((state) => {
          updates.forEach(({ id, data }) => {
            const element = state.elements.find((el) => el.id === id);
            if (element) {
              Object.assign(element, data);
            }
          });
        });
        saveToHistory();
      },

      clear: () => {
        set(initialState);
      },
    };
  })
);
