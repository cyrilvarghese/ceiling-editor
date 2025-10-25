export type ComponentType = 'light' | 'supply' | 'return' | 'smoke' | 'invalid';

export interface Component {
  id: string;
  type: ComponentType;
  gridX: number;
  gridY: number;
}

export interface GridCell {
  x: number;
  y: number;
  isEmpty: boolean;
  component?: Component;
}

export interface DragState {
  isDragging: boolean;
  componentId: string | null;
  startGridX: number;
  startGridY: number;
  offsetX: number;
  offsetY: number;
}

export interface PanState {
  isPanning: boolean;
  startX: number;
  startY: number;
}

export interface GridState {
  scale: number;
  translateX: number;
  translateY: number;
  components: Map<string, Component>;
  selectedComponentType: ComponentType | null;
}

export interface MousePosition {
  screenX: number;
  screenY: number;
  svgX: number;
  svgY: number;
  gridX: number;
  gridY: number;
}
