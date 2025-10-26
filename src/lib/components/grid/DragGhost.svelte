<script lang="ts">
  import CeilingIconSVG from "$lib/components/icons/CeilingIconSVG.svelte";
  import type { Component } from "$lib/types";

  let {
    component,
    svgX = 0,
    svgY = 0,
  }: {
    component: Component | undefined;
    svgX?: number;
    svgY?: number;
  } = $props();
</script>

{#if component}
  <g
    style="pointer-events: none; user-select: none; opacity: 0.7;"
    transform="translate({svgX}, {svgY}) scale(1.5)"
  >
    <CeilingIconSVG
      type={component.type}
      size={12}
      x={-6}
      y={-6}
      class="text-gray-700"
    />
  </g>
{/if}
