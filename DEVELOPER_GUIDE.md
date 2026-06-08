# 🛠️ DEVELOPER QUICK START GUIDE

## Project Structure

```
portfolio-builder/
├── app/
│   ├── editor/design/page.tsx          ← Main editor page
│   ├── (auth)/                         ← Login/signup pages
│   ├── api/                            ← Backend routes
│   ├── dashboard/                      ← User dashboard
│   └── portfolio/[username]/           ← Public portfolio view
│
├── components/
│   ├── Canvas.tsx                      ← Design canvas (drag/resize)
│   ├── PropertyPanel.tsx               ← Styling controls
│   ├── Toolbar.tsx                     ← Element buttons & publish
│   ├── DesignPreview.tsx               ← Live preview iframe
│   ├── WelcomeModal.tsx                ← First-time guide
│   ├── ThemeProvider.tsx               ← Tailwind integration
│   └── *.module.css                    ← Scoped styles
│
├── lib/
│   ├── designState.ts                  ← Zustand store
│   ├── designToCode.ts                 ← Code generation
│   ├── firebase.ts                     ← Firebase config
│   ├── mongodb.ts                      ← MongoDB connection
│   ├── supabase.ts                     ← Supabase config
│   └── demiAI.ts                       ← AI integration
│
├── types/
│   ├── design.ts                       ← Type definitions
│   └── *.ts                            ← Other types
│
├── models/
│   ├── Portfolio.ts                    ← MongoDB schema
│   ├── UserPortfolio.ts                ← User portfolio model
│   └── *.ts                            ← Other schemas
│
└── public/                             ← Static assets
```

---

## Quick Commands

```bash
# Development
npm run dev                 # Start dev server on http://localhost:3000

# Build & Deploy
npm run build              # Production build
npm run start              # Start production server

# Code Quality
npm run lint              # Run ESLint
npm run type-check        # Check TypeScript

# Testing
npm test                  # Run tests (if configured)
```

---

## Key Files Explained

### **1. `types/design.ts` - Type Definitions**

Defines all TypeScript interfaces for the design system:

```typescript
interface DesignElement {
  id: string                     // Unique identifier
  type: 'text' | 'image' | ...  // Element type
  x: number                      // X position (pixels)
  y: number                      // Y position (pixels)
  width: number                  // Width (pixels)
  height: number                 // Height (pixels)
  content: string                // Text or image URL
  styles: DesignStyles           // Styling object
  zIndex: number                 // Layer order
  responsive?: {
    tablet?: Partial<DesignStyles>   // Tablet overrides
    mobile?: Partial<DesignStyles>   // Mobile overrides
  }
}

interface DesignStyles {
  // Text
  fontSize?: number
  fontWeight?: 400 | 500 | 600 | 700 | 900
  color?: string
  
  // Box
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  borderWidth?: number
  
  // Spacing
  padding?: number
  margin?: number
  
  // Effects
  opacity?: number
  boxShadow?: string
}
```

**When to modify**: Adding new styling properties or element types.

---

### **2. `lib/designState.ts` - State Management**

Zustand store managing all design state:

```typescript
interface DesignStore {
  // State
  elements: DesignElement[]
  selectedId: string | null
  zoom: number
  gridSize: number
  
  // Actions
  addElement(type: ElementType, defaults?: Partial<DesignElement>): void
  updateElement(id: string, updates: Partial<DesignElement>): void
  deleteElement(id: string): void
  selectElement(id: string | null): void
  undo(): void
  redo(): void
  
  // Getters
  selectedElement(): DesignElement | undefined
  getElementAt(x: number, y: number): DesignElement | undefined
}
```

**Usage:**
```typescript
// In any component
const { elements, selectedId, addElement } = useDesignStore()

// Add element
addElement('text', { x: 100, y: 100, content: 'Hello' })

// Update element
useDesignStore.getState().updateElement('elem-1', { content: 'Updated' })

// Subscribe to changes
useDesignStore.subscribe(state => console.log(state.elements))
```

**When to modify**: Adding new state properties or actions.

---

### **3. `lib/designToCode.ts` - Code Generation**

Converts design state to HTML/CSS/React:

```typescript
// Main function
function designToCode(elements: DesignElement[]): {
  html: string      // Just the content
  css: string       // Stylesheet
}

// Complete HTML document
function generateCompleteHtml(elements: DesignElement[]): string

// React component
function generateReactComponent(elements: DesignElement[]): string

// File download
function downloadCode(html: string, filename: string): void
```

**Key functions:**
- `stylesToInlineCss()` - Converts style object to CSS string
- `escapeHtml()` - Sanitizes text (prevents XSS)
- `generateResponsiveCss()` - Creates media queries for mobile/tablet

**When to modify**: Adding new styling properties, changing CSS generation logic, adding new export formats.

---

### **4. `components/Canvas.tsx` - Design Canvas**

Interactive editor with drag-drop and resize:

```typescript
// Key responsibilities:
- Render all design elements
- Handle mouse events (drag, resize)
- Compute element positions
- Show selection feedback
- Snap to grid

// Key methods:
onMouseDown()     // Start drag/resize
onMouseMove()     // Update position/size
onMouseUp()       // Finish drag/resize
handleSelect()    // Select element
```

**When to modify**: Adding new interaction modes (rotate, skew), changing drag behavior, adding new resize options.

---

### **5. `components/PropertyPanel.tsx` - Styling Panel**

Right-side controls for styling selected element:

```typescript
// Sections:
- Position & Size (X, Y, Width, Height)
- Text (Font size, weight, color, alignment)
- Background & Border (Color, radius, width)
- Spacing (Padding, margin)
- Effects (Opacity, shadow)
- Actions (Duplicate, delete)

// Each control:
- Shows current value
- Shows slider / color picker / input
- Syncs to Zustand store
- Updates live preview in real-time
```

**When to modify**: Adding new styling controls, changing UI layout, adding new element properties.

---

### **6. `components/Toolbar.tsx` - Control Bar**

Top toolbar with element buttons and publishing:

```typescript
// Sections:
- Logo/title area
- Add Elements buttons (Text, Image, Button, Section, Card)
- Edit buttons (Undo, Redo)
- View controls (Zoom, Grid)
- Publish button (green, prominent)
- Code button (advanced users)

// Modals:
- PublishModal: 3-step publishing (copy/download/preview)
- CodeModal: Show generated HTML/CSS/React
```

**When to modify**: Adding new element types, adding new tools, changing button labels.

---

### **7. `components/WelcomeModal.tsx` - Onboarding**

First-time user guide:

```typescript
// Shows:
- 4-step visual walkthrough
- Key features checklist
- Encouraging message

// Logic:
- Check localStorage for 'portfolio-designer-welcome'
- Show only if not present
- Store flag when dismissed
```

**When to modify**: Changing onboarding steps, updating tips, changing tutorial logic.

---

### **8. `app/editor/design/page.tsx` - Main Editor Page**

Assembles all components into editor layout:

```typescript
// Layout:
┌─ Toolbar ─────────────────────────┐
│ Text Image Button Section Card    │
├─────────────────────────────────────┤
│ Canvas │ PropertyPanel │ Preview   │
│  (50%) │     (25%)     │   (25%)   │
└─────────────────────────────────────┘

// Logic:
- Manage welcome modal state
- Check localStorage for welcome flag
- Render all components
```

**When to modify**: Changing layout, adjusting panel widths, moving components.

---

## Common Tasks

### **Add New Element Type**

1. Update `types/design.ts`:
```typescript
type ElementType = 'text' | 'image' | 'button' | 'section' | 'card' | 'YOUR_NEW_TYPE'

interface DesignElement {
  type: ElementType  // TypeScript now requires YOUR_NEW_TYPE handling
  // ...
}
```

2. Add button to `Toolbar.tsx`:
```typescript
<button onClick={() => addElement('YOUR_NEW_TYPE')}>
  Your Element
</button>
```

3. Add rendering to `Canvas.tsx`:
```typescript
{element.type === 'YOUR_NEW_TYPE' && (
  <YourCustomElement element={element} />
)}
```

4. Add CSS generation to `designToCode.ts`:
```typescript
case 'YOUR_NEW_TYPE':
  // Return HTML for your element
  return `<div class="your-element">...</div>`
```

---

### **Add New Style Property**

1. Update `types/design.ts`:
```typescript
interface DesignStyles {
  // ... existing styles ...
  yourProperty?: string | number  // Add your property
}
```

2. Update `PropertyPanel.tsx` to show control:
```typescript
<label>Your Property</label>
<input
  value={selectedElement?.styles?.yourProperty}
  onChange={(e) => updateElement(selectedId, {
    styles: { ...styles, yourProperty: e.target.value }
  })}
/>
```

3. Update `designToCode.ts` to include in CSS:
```typescript
function stylesToInlineCss(styles: DesignStyles) {
  return {
    // ... existing styles ...
    yourProperty: styles.yourProperty,
  }
}
```

---

### **Connect to Database**

1. Setup MongoDB connection in `lib/mongodb.ts`
2. Create schema in `models/Portfolio.ts`:
```typescript
const portfolioSchema = new Schema({
  userId: String,
  title: String,
  design: [  // Array of design elements
    {
      type: Object,
      ref: 'DesignElement'
    }
  ],
  createdAt: Date
})
```

3. Create API endpoint in `app/api/portfolio/route.ts`:
```typescript
// POST /api/portfolio - Save design
// GET /api/portfolio/:id - Load design

export async function POST(req: Request) {
  const { userId, design } = await req.json()
  // Save to MongoDB
  return Response.json({ success: true })
}
```

4. Load design in editor:
```typescript
useEffect(() => {
  const loadDesign = async () => {
    const res = await fetch(`/api/portfolio/${portfolioId}`)
    const { design } = await res.json()
    // Load elements into store
  }
  loadDesign()
}, [portfolioId])
```

---

## Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| **next** | 16.2.0 | Framework |
| **react** | 19.2.4 | UI library |
| **zustand** | 4.5.0 | State management |
| **immer** | 10.1.1 | Immutable updates |
| **lucide-react** | Latest | Icons |
| **tailwindcss** | Latest | CSS framework |
| **mongodb** | Latest | Database |
| **firebase** | Latest | Auth/Realtime DB |
| **supabase** | Latest | Alternative backend |

---

## Performance Tips

### **Memoization**
```typescript
// Expensive component? Memoize it
const Canvas = React.memo(({ elements }) => {
  return (...)
})
```

### **Selector Hooks**
```typescript
// Instead of: const store = useDesignStore()
// Use: const elements = useDesignStore(s => s.elements)

// Only subscribes to elements, not whole store
```

### **Lazy Loading**
```typescript
// Large modals? Load them lazily
const PublishModal = dynamic(() => import('./PublishModal'))
```

---

## Debugging

### **Check Zustand State**
```typescript
// In browser console
import { useDesignStore } from '@/lib/designState'
useDesignStore.getState()  // View all state
useDesignStore.subscribe(console.log)  // Watch changes
```

### **View Generated Code**
```typescript
// In Canvas.tsx
import { designToCode } from '@/lib/designToCode'
console.log(designToCode(elements))  // See HTML/CSS
```

### **Monitor Performance**
```typescript
// React DevTools → Profiler
// Look for unnecessary re-renders
// Check component rendering time
```

---

## Next Steps / Roadmap

### **Priority 1 - User Features**
- ✅ Basic editor (DONE)
- ✅ Publishing (DONE)
- 🟡 Save designs (database integration needed)
- 🟡 Load saved designs
- 🟡 Responsive viewport switcher (mobile/tablet edit mode)

### **Priority 2 - Advanced Tools**
- ⚪ Layer panel (element hierarchy tree)
- ⚪ Alignment tools (align left/center/right)
- ⚪ Keyboard shortcuts (Ctrl+C/V, Delete)
- ⚪ Duplicate with offset
- ⚪ Copy element styles

### **Priority 3 - Polish**
- ⚪ Component library
- ⚪ Design templates
- ⚪ Animations
- ⚪ Advanced effects (blur, filters)
- ⚪ Collaboration features

---

## Getting Help

### **Common Errors**

**"Cannot read property 'elements' of undefined"**
```
Fix: Make sure useDesignStore() is called at component top-level
```

**"Element shifts when resizing"**
```
Fix: Check that resize is using correct origin point (top-left)
```

**"Styles not updating in preview"**
```
Fix: Ensure designToCode() is memoized correctly and dependencies are right
```

**"TypeScript errors for new properties"**
```
Fix: Update types/design.ts with new property and all type interfaces
```

---

## Resources

- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Next.js Docs**: https://nextjs.org/docs
- **React Docs**: https://react.dev
- **CSS Tricks**: https://css-tricks.com
- **HTML/CSS Canvas**: MDN Web Docs

---

Happy coding! 🚀
