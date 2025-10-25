<script lang="ts">
  import {
    Lightbulb,
    Wind,
    RotateCcw,
    AlarmSmoke,
    CircleSlash2,
  } from "lucide-svelte";
  import { COMPONENT_INFO } from "$lib/utils/components";
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
</script>

<g>
  <rect
    {x}
    {y}
    width={size}
    height={size}
    fill={COMPONENT_INFO[type].bgColor}
    stroke={COMPONENT_INFO[type].selectedBorderColor}
    stroke-width="0.5"
  />
  <foreignObject {x} {y} width={size} height={size}>
    <div class="flex items-center justify-center w-full h-full">
      {#if type === "light"}
        <Lightbulb {size} class={className} style="color: {COMPONENT_INFO[type].iconColor}; {style}" />
      {:else if type === "supply"}
        <Wind {size} class={className} style="color: {COMPONENT_INFO[type].iconColor}; {style}" />
      {:else if type === "return"}
        <RotateCcw {size} class={className} style="color: {COMPONENT_INFO[type].iconColor}; {style}" />
      {:else if type === "smoke"}
        <AlarmSmoke {size} class={className} style="color: {COMPONENT_INFO[type].iconColor}; {style}" />
      {:else if type === "invalid"}
        <CircleSlash2 {size} class={className} style="color: {COMPONENT_INFO[type].iconColor}; {style}" />
      {/if}
    </div>
  </foreignObject>
</g>
