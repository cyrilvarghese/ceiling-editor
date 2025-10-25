# Ceiling Grid Simulator

An interactive ceiling grid planning application built with Svelte 5, TypeScript, and Tailwind CSS. Design and visualize ceiling layouts with components like lights, air vents, and smoke detectors on a 100x100 grid.

## Features

### Grid & Canvas
- **100x100 interactive grid** for precise component placement
- **Pan & Zoom** - Navigate with mouse wheel zoom and space+drag to pan
- **Visual feedback** - Hover highlights and drop target indicators
- **Centered viewport** - Grid automatically centers on load at 100% zoom

### Component Management
- **Component Palette** - Quick access to ceiling components:
  - 💡 Lights (Yellow)
  - 🌀 Air Supply (Blue)
  - 🔄 Air Return (Purple)
  - 🚨 Smoke Detectors (Red)
  - ⚠️ Invalid Markers (Gray)

### Interaction Modes
- **Placement Mode** - Click to place selected component type
- **Drag Mode** - Drag existing components to reposition them
- **Delete Mode** - Toggle delete mode to remove components with a click
- **Pan Mode** - Hold space or middle mouse button to pan the canvas

### Additional Features
- **Color-coded components** - Each component type has a distinct color
- **Context menu** - Right-click components for quick actions
- **Keyboard shortcuts** - Space for pan mode
- **Responsive design** - Adapts to different screen sizes
- **Accessibility** - Full ARIA support and keyboard navigation

## Tech Stack

- **Svelte 5** - Modern reactive framework with runes
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-svelte** - High-quality UI components
- **Lucide Icons** - Beautiful, consistent icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## Usage Guide

### Basic Operations

1. **Selecting a Component**
   - Click any component button in the bottom toolbar
   - Selected component will highlight with colored background

2. **Placing Components**
   - Select a component type from the palette
   - Click any empty grid cell to place it
   - Hover to see placement preview

3. **Moving Components**
   - Click and drag any placed component
   - Ghost preview follows your cursor
   - Release to drop in new position

4. **Deleting Components**
   - Method 1: Click the Delete button, then click components to remove
   - Method 2: Right-click component → "Delete Component"

5. **Navigation**
   - **Zoom**: Scroll mouse wheel (adjustable sensitivity: 4x default)
   - **Pan**: Hold Space + Drag, or Middle Mouse + Drag
   - **Reset**: Click reset button (⟲) in zoom controls

### Keyboard Shortcuts

- `Space` - Hold to enable pan mode
- `ESC` - Close context menu

### Tips

- Grid coordinates are validated to prevent out-of-bounds placement
- Components cannot overlap - occupied cells cannot be used
- Hover tooltips show component types (or "Delete X" in delete mode)
- Zoom centers on mouse position for precise control
- Pan mode prevents accidental placements while navigating

## Project Structure

```
svelte-app/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ComponentPanel.svelte      # Bottom component palette
│   │   │   ├── GridCanvas.svelte          # Main SVG grid canvas
│   │   │   ├── ZoomControls.svelte        # Zoom UI controls
│   │   │   ├── icons/
│   │   │   │   ├── CeilingIcon.svelte     # Icon component
│   │   │   │   └── CeilingIconSVG.svelte  # SVG icon for grid
│   │   │   └── ui/                        # shadcn-svelte components
│   │   ├── stores/
│   │   │   └── gridStore.ts               # State management
│   │   ├── utils/
│   │   │   ├── components.ts              # Component metadata
│   │   │   └── coordinates.ts             # Grid calculations
│   │   └── types.ts                       # TypeScript definitions
│   ├── routes/
│   │   └── +page.svelte                   # Main page
│   └── app.css                            # Global styles
├── static/                                # Static assets
└── package.json
```

## Component Types

Each component has distinct visual styling:

| Component | Color | Icon | Use Case |
|-----------|-------|------|----------|
| Light | Yellow | 💡 Lightbulb | Ceiling light fixtures |
| Air Supply | Blue | 🌀 Wind | HVAC supply vents |
| Air Return | Purple | 🔄 Rotate | HVAC return vents |
| Smoke Detector | Red | 🚨 Alarm | Fire safety devices |
| Invalid | Gray | ❌ X Circle | Blocked/unusable spaces |

## Configuration

### Grid Settings

Edit `src/lib/stores/gridStore.ts`:

```typescript
export const GRID_SIZE = 100;  // Grid dimensions (100x100)
export const CELL_SIZE = 10;   // Cell size in pixels
export const SVG_SIZE = GRID_SIZE * CELL_SIZE;  // Total canvas size
```

### Zoom Settings

Adjust zoom speed in `src/lib/components/GridCanvas.svelte`:

```typescript
const delta = event.deltaY * -0.004;  // Zoom sensitivity multiplier
const newScale = Math.max(0.5, Math.min(5, currentScale + delta));  // Min/max zoom
```

### Component Colors

Customize colors in `src/lib/utils/components.ts`:

```typescript
export const COMPONENT_INFO: Record<ComponentType, ComponentInfo> = {
  light: {
    bgColor: '#fef3c7',      // yellow-100
    iconColor: '#ca8a04',    // yellow-600
    // ...
  },
  // ...
};
```

## Development

### Adding New Component Types

1. Update `ComponentType` in `src/lib/types.ts`
2. Add component info to `COMPONENT_INFO` in `src/lib/utils/components.ts`
3. Add icon case to `CeilingIcon.svelte` and `CeilingIconSVG.svelte`
4. Add to palette in `ComponentPanel.svelte`

 
 
## Performance Optimizations

- **RequestAnimationFrame throttling** - Smooth 60fps+ on any display
- **SVG patterns** - Efficient grid rendering
 
 
## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 15+

 
 

## Acknowledgments

- Built with [Svelte 5](https://svelte.dev)
- UI components from [shadcn-svelte](https://shadcn-svelte.com)
- Icons from [Lucide](https://lucide.dev)
