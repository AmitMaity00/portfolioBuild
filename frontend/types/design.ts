// Design element types and interfaces
export type ElementType = 'text' | 'image' | 'button' | 'section' | 'card';
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

export interface TextStyles {
  color: string;
  fontSize: number;
  fontWeight: string;
  fontFamily: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: number;
}

export interface BoxStyles {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  boxShadow: string;
  padding: string;
  margin: string;
}

export interface LayoutStyles {
  display: 'block' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: number;
}

export interface DesignStyles extends TextStyles, BoxStyles, LayoutStyles {
  opacity: number;
  transform?: string;
  transition?: string;
}

export interface ResponsiveOverride {
  width?: number;
  height?: number;
  fontSize?: number;
  padding?: string;
  margin?: string;
  display?: string;
}

export interface DesignElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string; // text content or image URL
  styles: Partial<DesignStyles>;
  responsive?: {
    tablet?: ResponsiveOverride;
    mobile?: ResponsiveOverride;
  };
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
  parent?: string; // parent element ID for grouping
}

export interface BreakpointConfig {
  name: Breakpoint;
  width: number;
  height: number;
  label: string;
}

export interface DesignState {
  elements: DesignElement[];
  selectedId: string | null;
  breakpoints: Record<Breakpoint, BreakpointConfig>;
  currentBreakpoint: Breakpoint;
  zoom: number;
  gridSize: number;
  showGrid: boolean;
  history: DesignState[];
  historyIndex: number;
}

export interface DesignActions {
  // Element operations
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  duplicateElement: (id: string) => void;
  
  // Styling
  updateStyles: (id: string, styles: Partial<DesignStyles>) => void;
  updateResponsiveStyle: (id: string, breakpoint: Breakpoint, override: ResponsiveOverride) => void;
  
  // Canvas operations
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setZoom: (zoom: number) => void;
  setGridSize: (size: number) => void;
  toggleGrid: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // Batch operations
  batchUpdate: (updates: Array<{ id: string; data: Partial<DesignElement> }>) => void;
  clear: () => void;
}

export interface GeneratedCode {
  html: string;
  css: string;
  tailwind?: string;
}
