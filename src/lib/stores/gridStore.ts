import { writable, derived } from 'svelte/store';
import type { Component, ComponentType, DragState, PanState, GridState } from '../types';

// Constants
export const GRID_SIZE = 100;
export const CELL_SIZE = 10;
export const SVG_SIZE = GRID_SIZE * CELL_SIZE;
export const REAL_CELL_SIZE_M = 0.6; // Each grid cell is 0.6m x 0.6m in real world

// Grid state store
function createGridStore() {
  // Calculate initial translation to center the grid at 190% zoom
  const initialScale = 1.9;
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const scaledGridSize = SVG_SIZE * initialScale;

  const initialTranslateX = (viewportWidth - scaledGridSize) / 2;
  const initialTranslateY = (viewportHeight - scaledGridSize) / 2;

  const { subscribe, set, update } = writable<GridState>({
    scale: initialScale,
    translateX: initialTranslateX,
    translateY: initialTranslateY,
    components: new Map<string, Component>(),
    selectedComponentType: 'light',
  });

  return {
    subscribe,
    setScale: (scale: number) => update(state => ({ ...state, scale })),
    setTranslate: (translateX: number, translateY: number) =>
      update(state => ({ ...state, translateX, translateY })),
    setSelectedComponentType: (type: ComponentType | null) =>
      update(state => ({ ...state, selectedComponentType: type })),
    addComponent: (component: Component) =>
      update(state => {
        const newComponents = new Map(state.components);
        newComponents.set(component.id, component);
        return { ...state, components: newComponents };
      }),
    removeComponent: (id: string) =>
      update(state => {
        const newComponents = new Map(state.components);
        newComponents.delete(id);
        return { ...state, components: newComponents };
      }),
    updateComponent: (id: string, updates: Partial<Component>) =>
      update(state => {
        const newComponents = new Map(state.components);
        const existing = newComponents.get(id);
        if (existing) {
          newComponents.set(id, { ...existing, ...updates });
        }
        return { ...state, components: newComponents };
      }),
    resetView: () => {
      const resetScale = 1.9;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const scaledGridSize = SVG_SIZE * resetScale;

      const resetTranslateX = (viewportWidth - scaledGridSize) / 2;
      const resetTranslateY = (viewportHeight - scaledGridSize) / 2;

      return update(state => ({
        ...state,
        scale: resetScale,
        translateX: resetTranslateX,
        translateY: resetTranslateY,
      }));
    },
    reset: () => {
      const resetScale = 1.0;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const scaledGridSize = SVG_SIZE * resetScale;

      const resetTranslateX = (viewportWidth - scaledGridSize) / 2;
      const resetTranslateY = (viewportHeight - scaledGridSize) / 2;

      return set({
        scale: resetScale,
        translateX: resetTranslateX,
        translateY: resetTranslateY,
        components: new Map<string, Component>(),
        selectedComponentType: null,
      });
    },
  };
}

export const gridStore = createGridStore();

// Drag state store
export const dragState = writable<DragState>({
  isDragging: false,
  componentId: null,
  startGridX: 0,
  startGridY: 0,
  offsetX: 0,
  offsetY: 0,
});

// Pan state store
export const panState = writable<PanState>({
  isPanning: false,
  startX: 0,
  startY: 0,
});

// Space key pressed state
export const spaceKeyPressed = writable<boolean>(false);

// Delete mode state
export const deleteMode = writable<boolean>(false);

// Smart guides toggle state
export const showGuides = writable<boolean>(true);

// Derived store: Get component at grid position
export const getComponentAtPosition = derived(
  gridStore,
  $gridStore => (gridX: number, gridY: number): Component | undefined => {
    for (const component of $gridStore.components.values()) {
      if (component.gridX === gridX && component.gridY === gridY) {
        return component;
      }
    }
    return undefined;
  }
);

// Derived store: Check if position is occupied
export const isPositionOccupied = derived(
  gridStore,
  $gridStore => (gridX: number, gridY: number): boolean => {
    for (const component of $gridStore.components.values()) {
      if (component.gridX === gridX && component.gridY === gridY) {
        return true;
      }
    }
    return false;
  }
);
