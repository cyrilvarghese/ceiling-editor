<script lang="ts">
  import CeilingIconSVG from "$lib/components/icons/CeilingIconSVG.svelte";
  import { COMPONENT_INFO } from "$lib/utils/components";
  import type { Component } from "$lib/types";

  let {
    component,
    cellSize = 10,
    isDragging = false,
    isDraggedComponent = false,
    isDeleteMode = false,
  }: {
    component: Component;
    cellSize?: number;
    isDragging?: boolean;
    isDraggedComponent?: boolean;
    isDeleteMode?: boolean;
  } = $props();

  const cursorStyle = $derived(isDeleteMode ? "pointer" : "move");
  const opacity = $derived(isDraggedComponent ? 0.2 : 1);
  const title = $derived(
    isDeleteMode
      ? `Click to Delete ${COMPONENT_INFO[component.type].label}`
      : COMPONENT_INFO[component.type].label
  );
</script>

{#if component.type === "invalid"}
  <!-- Invalid marker: gray square -->
  <g
    style="cursor: not-allowed; user-select: none;"
    transform="translate({component.gridX * cellSize}, {component.gridY * cellSize})"
  >
    <title>{COMPONENT_INFO[component.type].label}</title>
    <CeilingIconSVG
      type={component.type}
      size={cellSize}
      x={0}
      y={0}
      class="text-gray-700"
    />
  </g>
{:else}
  <!-- Normal component with icon -->
  <g
    style="cursor: {cursorStyle}; user-select: none; opacity: {opacity};"
    transform="translate({component.gridX * cellSize}, {component.gridY * cellSize})"
  >
    <title>{title}</title>
    <CeilingIconSVG
      type={component.type}
      size={cellSize}
      x={0}
      y={0}
      class="text-gray-700"
    />
  </g>
{/if}
