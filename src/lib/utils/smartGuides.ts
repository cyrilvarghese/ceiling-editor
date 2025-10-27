import type { GridState } from "$lib/types";
import { CELL_SIZE, REAL_CELL_SIZE_M } from "$lib/stores/gridStore";

export interface GuideData {
  orientation: "horizontal" | "vertical";
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  distance: number;
  labelOffsetX?: number;
  labelOffsetY?: number;
}

/**
 * Calculate screen coordinates for a grid cell center
 */
export function calculateScreenPosition(
  gridX: number,
  gridY: number,
  translateX: number,
  translateY: number,
  scale: number
): { screenX: number; screenY: number } {
  return {
    screenX: translateX + (gridX * CELL_SIZE + CELL_SIZE / 2) * scale,
    screenY: translateY + (gridY * CELL_SIZE + CELL_SIZE / 2) * scale,
  };
}

/**
 * Calculate distances from grid edges in meters
 */
export function calculateDistances(
  gridX: number,
  gridY: number,
  gridSize: number
): {
  fromLeft: number;
  fromTop: number;
  fromRight: number;
  fromBottom: number;
} {
  return {
    fromLeft: gridX * REAL_CELL_SIZE_M,
    fromTop: gridY * REAL_CELL_SIZE_M,
    fromRight: (gridSize - gridX - 1) * REAL_CELL_SIZE_M,
    fromBottom: (gridSize - gridY - 1) * REAL_CELL_SIZE_M,
  };
}

/**
 * Generate smart guide data for all four directions
 */
export function generateSmartGuides(
  gridX: number,
  gridY: number,
  gridSize: number,
  gridState: Pick<GridState, "translateX" | "translateY" | "scale">
): GuideData[] {
  const guides: GuideData[] = [];
  const { screenX, screenY } = calculateScreenPosition(
    gridX,
    gridY,
    gridState.translateX,
    gridState.translateY,
    gridState.scale
  );
  const distances = calculateDistances(gridX, gridY, gridSize);

  // Left guide (horizontal)
  if (gridX > 0) {
    guides.push({
      orientation: "horizontal",
      startX: gridState.translateX,
      startY: screenY,
      endX: gridState.translateX + gridX * CELL_SIZE * gridState.scale,
      endY: screenY,
      distance: distances.fromLeft,
      labelOffsetX: -24,
    });
  }

  // Top guide (vertical)
  if (gridY > 0) {
    guides.push({
      orientation: "vertical",
      startX: screenX,
      startY: gridState.translateY,
      endX: screenX,
      endY: gridState.translateY + gridY * CELL_SIZE * gridState.scale,
      distance: distances.fromTop,
      labelOffsetY: -24,
    });
  }

  // Right guide (horizontal)
  if (gridX < gridSize - 1) {
    guides.push({
      orientation: "horizontal",
      startX: gridState.translateX + (gridX + 1) * CELL_SIZE * gridState.scale,
      startY: screenY,
      endX: gridState.translateX + gridSize * CELL_SIZE * gridState.scale,
      endY: screenY,
      distance: distances.fromRight,
      labelOffsetX: 24,
    });
  }

  // Bottom guide (vertical)
  if (gridY < gridSize - 1) {
    guides.push({
      orientation: "vertical",
      startX: screenX,
      startY: gridState.translateY + (gridY + 1) * CELL_SIZE * gridState.scale,
      endX: screenX,
      endY: gridState.translateY + gridSize * CELL_SIZE * gridState.scale,
      distance: distances.fromBottom,
      labelOffsetY: 34,
    });
  }

  return guides;
}
