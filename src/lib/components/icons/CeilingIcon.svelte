<script lang="ts">
  import {
    Lightbulb,
    Wind,
    RotateCcw,
    AlarmSmoke,
    CircleSlash2,
    Trash2,
  } from "lucide-svelte";
  import type { ComponentType } from "$lib/types";

  type IconType = ComponentType | "delete";

  let {
    type,
    size = 20,
    class: className = "text-gray-700",
    style = "",
  }: {
    type: IconType;
    size?: number;
    class?: string;
    style?: string;
  } = $props();
</script>

<div class={className} style="width: {size}px; height: {size}px; {style}">
  {#if type === "light"}
    <Lightbulb size={size} />
  {:else if type === "supply"}
    <Wind size={size} />
  {:else if type === "return"}
    <RotateCcw size={size} />
  {:else if type === "smoke"}
    <AlarmSmoke size={size} />
  {:else if type === "invalid"}
    <CircleSlash2 size={size} />
  {:else if type === "delete"}
    <Trash2 size={size} />
  {/if}
</div>
