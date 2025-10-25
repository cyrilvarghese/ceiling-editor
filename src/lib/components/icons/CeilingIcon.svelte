<script lang="ts">
  import {
    Lightbulb,
    Wind,
    RotateCcw,
    AlarmSmoke,
    CircleX,
  } from "lucide-svelte";
  import type { ComponentType } from "$lib/types";

  let {
    type,
    size = 20,
    class: className = "text-gray-700",
    style = "",
  }: {
    type: ComponentType;
    size?: number;
    class?: string;
    style?: string;
  } = $props();
</script>

{#if type === "light"}
  <Lightbulb {size} class={className} {style} />
{:else if type === "supply"}
  <Wind {size} class={className} {style} />
{:else if type === "return"}
  <RotateCcw {size} class={className} {style} />
{:else if type === "smoke"}
  <AlarmSmoke {size} class={className} {style} />
{:else if type === "invalid"}
  <CircleX {size} class={className} {style} />
{/if}
