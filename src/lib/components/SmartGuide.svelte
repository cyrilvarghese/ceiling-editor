<script lang="ts">
  /**
   * SmartGuide - Reusable component for distance measurement guides
   * Renders a line with distance label from grid edge to highlighted cell
   */

  // Guide styling constants
  const GUIDE_COLOR = "#fb923c"; // orange-400 - guide line and text color

  let {
    orientation,
    startX,
    startY,
    endX,
    endY,
    distance,
    labelOffsetX = 0,
    labelOffsetY = 0,
  }: {
    orientation: "horizontal" | "vertical";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
    distance: number;
    labelOffsetX?: number;
    labelOffsetY?: number;
  } = $props();

  // Calculate label position based on orientation
  // For positive offsets (right/bottom), position near start (near cell)
  // For negative offsets (left/top), position near end (near cell)
  const labelX = $derived(
    orientation === "horizontal"
      ? (labelOffsetX > 0 ? startX + labelOffsetX : endX + labelOffsetX)
      : (startX + endX) / 2 + labelOffsetX
  );

  const labelY = $derived(
    orientation === "vertical"
      ? (labelOffsetY > 0 ? startY + labelOffsetY : endY + labelOffsetY)
      : (startY + endY) / 2 + labelOffsetY
  );

  const textAnchor = $derived(
    orientation === "horizontal"
      ? (labelOffsetX < 0 ? "end" : "start")
      : "middle"
  );

  const dominantBaseline = $derived(
    orientation === "horizontal" ? "middle" : "auto"
  );
</script>

<svg
  class="fixed top-0 left-0 w-full h-full pointer-events-none z-40"
  style="overflow: visible;"
>
  <!-- Guide line -->
  <line
    x1={startX}
    y1={startY}
    x2={endX}
    y2={endY}
    stroke={GUIDE_COLOR}
    stroke-width="2"
    opacity="0.4"
  />

  <!-- Distance label with white stroke for visibility -->
  <text
    x={labelX}
    y={labelY}
    fill={GUIDE_COLOR}
    font-size="14"
    font-weight="600"
    text-anchor={textAnchor}
    font-family="system-ui, -apple-system, sans-serif"
    dominant-baseline={dominantBaseline}
    stroke="white"
    stroke-width="4"
    paint-order="stroke"
    style="user-select: none; -webkit-user-select: none;"
  >
    {distance.toFixed(1)}m
  </text>
</svg>
