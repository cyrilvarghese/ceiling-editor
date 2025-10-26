<script lang="ts">
  import { COMPONENT_INFO } from "$lib/utils/components";
  import { ICON_PATHS } from "./IconPaths";
  import type { ComponentType } from "$lib/types";

  let {
    type,
    size = 8,
    x = 0,
    y = 0,
    class: className = "text-gray-700",
    style = "",
  }: {
    type: ComponentType;
    size?: number;
    x?: number;
    y?: number;
    class?: string;
    style?: string;
  } = $props();

  // Icon sizing: scale to fit within cell with padding
  const iconScale = size / 24; // Lucide icons are 24x24
  const iconSize = size * 0.6; // Icon takes 60% of cell size
  const iconOffset = size * 0.2; // Center with 20% padding
</script>

<g>
  <!-- Background rectangle -->
  <rect
    {x}
    {y}
    width={size}
    height={size}
    fill={COMPONENT_INFO[type].bgColor}
    stroke={COMPONENT_INFO[type].selectedBorderColor}
    stroke-width="0.5"
  />

  <!-- Native SVG icon -->
  <g transform="translate({x + size / 2}, {y + size / 2}) scale({iconScale * 0.6})">
    <path
      d={ICON_PATHS[type]}
      fill="none"
      stroke={COMPONENT_INFO[type].iconColor}
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      transform="translate(-12, -12)"
    />
  </g>
</g>
