<script lang="ts">
  import CeilingIconSVG from "$lib/components/icons/CeilingIconSVG.svelte";
  import { COMPONENT_INFO } from "$lib/utils/components";
  import type { ComponentType } from "$lib/types";

  // Icon rendering constants
  const ICON_BASE_SIZE = 24;
  const ICON_SCALE_FACTOR = 0.6;
  const ICON_CENTER_OFFSET = -12;

  // Highlight colors
  const HIGHLIGHT_COLORS = {
    transparent: "transparent",
    delete: "rgba(239, 68, 68, 0.4)", // red-500 with 40% opacity
    default: "rgba(255, 200, 0, 0.4)", // yellow with 40% opacity
    opacity: "99", // 60% opacity in hex
  } as const;

  const SVG_COLORS = {
    deleteIcon: "#dc2626", // red-600
  } as const;

  let {
    visible = false,
    gridX = 0,
    gridY = 0,
    cellSize = 10,
    isDragging = false,
    isDeleteMode = false,
    selectedType = null as ComponentType | null,
  }: {
    visible?: boolean;
    gridX?: number;
    gridY?: number;
    cellSize?: number;
    isDragging?: boolean;
    isDeleteMode?: boolean;
    selectedType?: ComponentType | null;
  } = $props();

  // Calculate background color
  const bgColor = $derived((() => {
    if (isDragging) return HIGHLIGHT_COLORS.transparent;
    if (isDeleteMode) return HIGHLIGHT_COLORS.delete;
    if (selectedType) return `${COMPONENT_INFO[selectedType].bgColor}${HIGHLIGHT_COLORS.opacity}`;
    return HIGHLIGHT_COLORS.default;
  })());

  // Delete icon transform
  const deleteIconTransform = $derived({
    x: gridX * cellSize + cellSize / 2,
    y: gridY * cellSize + cellSize / 2,
    scale: (cellSize * ICON_SCALE_FACTOR) / ICON_BASE_SIZE,
  });
</script>

{#if visible}
  <rect
    x={gridX * cellSize}
    y={gridY * cellSize}
    width={cellSize}
    height={cellSize}
    fill={bgColor}
    stroke={isDragging ? "black" : "none"}
    stroke-width={isDragging ? "2" : "0"}
    pointer-events="none"
  />

  <!-- Icon in highlight -->
  {#if isDeleteMode}
    <!-- Native SVG X icon -->
    <g
      transform="translate({deleteIconTransform.x}, {deleteIconTransform.y}) scale({deleteIconTransform.scale})"
      opacity="0.5"
      pointer-events="none"
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        fill="none"
        stroke={SVG_COLORS.deleteIcon}
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
        transform="translate({ICON_CENTER_OFFSET}, {ICON_CENTER_OFFSET})"
      />
    </g>
  {:else if selectedType && !isDragging}
    <g opacity="0.4">
      <CeilingIconSVG
        type={selectedType}
        size={cellSize}
        x={gridX * cellSize}
        y={gridY * cellSize}
        class="text-gray-700"
      />
    </g>
  {/if}
{/if}
