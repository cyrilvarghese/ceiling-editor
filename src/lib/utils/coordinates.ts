import { CELL_SIZE, GRID_SIZE } from '../stores/gridStore';
import type { MousePosition } from '../types';

/**
 * Converts mouse event coordinates to grid cell coordinates
 * This is the critical transformation that accounts for zoom and pan
 *
 * @param event - Mouse event
 * @param containerElement - The parent container (NOT the transformed SVG)
 * @param translateX - Current pan X offset
 * @param translateY - Current pan Y offset
 * @param scale - Current zoom level
 * @returns Object with screen, SVG, and grid coordinates
 */
export function getGridCellFromMouse(
  event: MouseEvent,
  containerElement: HTMLElement,
  translateX: number,
  translateY: number,
  scale: number
): MousePosition {
  // Step 1: Get mouse position relative to CONTAINER (not transformed SVG)
  const containerRect = containerElement.getBoundingClientRect();
  const mouseX = event.clientX - containerRect.left;
  const mouseY = event.clientY - containerRect.top;

  // Step 2: Reverse the transform (undo pan and zoom)
  // CRITICAL: Subtract translation FIRST, then divide by scale
  const svgX = (mouseX - translateX) / scale;
  const svgY = (mouseY - translateY) / scale;

  // Step 3: Snap to grid cell
  // Use Math.floor to snap to the cell boundary (not Math.round)
  const gridX = Math.floor(svgX / CELL_SIZE);
  const gridY = Math.floor(svgY / CELL_SIZE);

  return {
    screenX: mouseX,
    screenY: mouseY,
    svgX,
    svgY,
    gridX,
    gridY,
  };
}

/**
 * Checks if grid coordinates are within valid bounds
 */
export function isValidGridPosition(gridX: number, gridY: number): boolean {
  return gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE;
}

/**
 * Converts grid cell coordinates to pixel position in SVG
 */
export function gridToPixel(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: gridX * CELL_SIZE,
    y: gridY * CELL_SIZE,
  };
}

/**
 * Gets the center point of a grid cell in SVG coordinates
 */
export function getGridCellCenter(gridX: number, gridY: number): { x: number; y: number } {
  return {
    x: gridX * CELL_SIZE + CELL_SIZE / 2,
    y: gridY * CELL_SIZE + CELL_SIZE / 2,
  };
}

/**
 * Calculates zoom adjustment to keep cursor point fixed during zoom
 * This prevents the jarring experience of zooming to the origin
 *
 * @param mouseX - Mouse X position relative to container
 * @param mouseY - Mouse Y position relative to container
 * @param currentTranslateX - Current pan X offset
 * @param currentTranslateY - Current pan Y offset
 * @param currentScale - Current zoom level
 * @param newScale - New zoom level
 * @returns New translation values that keep the point under cursor fixed
 */
export function calculateZoomToPoint(
  mouseX: number,
  mouseY: number,
  currentTranslateX: number,
  currentTranslateY: number,
  currentScale: number,
  newScale: number
): { translateX: number; translateY: number } {
  // Point under cursor before zoom
  const svgXBefore = (mouseX - currentTranslateX) / currentScale;
  const svgYBefore = (mouseY - currentTranslateY) / currentScale;

  // Point that would be under cursor after zoom (if we didn't adjust translation)
  const svgXAfter = (mouseX - currentTranslateX) / newScale;
  const svgYAfter = (mouseY - currentTranslateY) / newScale;

  // Adjust translation to keep the same point under cursor
  const translateX = currentTranslateX + (svgXAfter - svgXBefore) * newScale;
  const translateY = currentTranslateY + (svgYAfter - svgYBefore) * newScale;

  return { translateX, translateY };
}
