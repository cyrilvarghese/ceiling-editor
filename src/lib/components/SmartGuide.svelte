<script lang="ts">
  /**
   * SmartGuide - Reusable component for distance measurement guides
   * Renders a line with distance label from grid edge to highlighted cell
   */
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
  const labelX = $derived(
    orientation === "horizontal"
      ? endX + labelOffsetX
      : (startX + endX) / 2 + labelOffsetX
  );

  const labelY = $derived(
    orientation === "vertical"
      ? endY + labelOffsetY
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
    stroke="#fb923c"
    stroke-width="2"
    opacity="0.4"
  />

  <!-- Distance label with white stroke for visibility -->
  <text
    x={labelX}
    y={labelY}
    fill="#fb923c"
    font-size="14"
    font-weight="600"
    text-anchor={textAnchor}
    font-family="system-ui, -apple-system, sans-serif"
    dominant-baseline={dominantBaseline}
    stroke="white"
    stroke-width="4"
    paint-order="stroke"
  >
    {distance.toFixed(1)}m
  </text>
</svg>
