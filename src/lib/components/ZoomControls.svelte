<script lang="ts">
  import { gridStore, showGuides } from "$lib/stores/gridStore";
  import { Button } from "$lib/components/ui/button";
  import { Toggle } from "$lib/components/ui/toggle";
  import { Ruler, Plus, Minus, RotateCcw } from "lucide-svelte";

  function zoomIn() {
    const newScale = Math.min(5, $gridStore.scale + 0.1);
    gridStore.setScale(newScale);
  }

  function zoomOut() {
    const newScale = Math.max(0.5, $gridStore.scale - 0.1);
    gridStore.setScale(newScale);
  }

  function resetZoom() {
    gridStore.resetView();
  }

  function toggleGuides() {
    showGuides.update((val) => !val);
  }

  let zoomPercentage = $derived(Math.round($gridStore.scale * 100));
</script>

<div
  role="toolbar"
  aria-label="Zoom controls"
  class="fixed top-5 right-5 bg-white/95 backdrop-blur-md rounded-full px-3 py-4 z-50 toolbar-shadow"
>
  <div class="flex flex-col items-center gap-3">
    <!-- Zoom In Button -->
    <Button
      variant="ghost"
      class="w-10 h-10 p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onclick={zoomIn}
      disabled={$gridStore.scale >= 5}
      aria-label="Zoom in"
    >
      <div class="w-5 h-5 rounded-full flex items-center justify-center">
        <Plus size={20} class="w-5 h-5" />
      </div>
    </Button>

    <!-- Zoom Percentage Display -->
    <div class="flex flex-col items-center justify-center py-2">
      <span
        class="text-sm font-bold text-gray-700 text-center"
        aria-live="polite"
      >
        {zoomPercentage}%
      </span>
    </div>

    <!-- Zoom Out Button -->
    <Button
      variant="ghost"
      class="w-10 h-10 p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onclick={zoomOut}
      disabled={$gridStore.scale <= 0.5}
      aria-label="Zoom out"
    >
      <div class="w-5 h-5 rounded-full flex items-center justify-center">
        <Minus size={20} class="w-5 h-5" />
      </div>
    </Button>

    <!-- Divider -->
    <div class="h-px w-8 bg-gray-300"></div>

    <!-- Reset Button -->
    <Button
      variant="ghost"
      class="w-10 h-10 p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onclick={resetZoom}
      aria-label="Reset view"
      title="Reset view"
    >
      <div class="w-5 h-5 rounded-full flex items-center justify-center">
        <RotateCcw size={20} class="w-5 h-5" />
      </div>
    </Button>

    <!-- Divider -->
    <div class="h-px w-8 bg-gray-300"></div>

    <!-- Toggle Guides Button -->
    <Toggle
      pressed={$showGuides}
      onPressedChange={toggleGuides}
      aria-label="Toggle smart guides"
      title="Toggle smart guides"
      class="w-10 h-10 p-0 flex items-center justify-center rounded-full transition-colors data-[state=on]:bg-orange-100 data-[state=on]:text-orange-600 bg-gray-100 hover:bg-orange-200 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
    >
      <div class="w-5 h-5 rounded-full flex items-center justify-center">
        <Ruler size={20} class="w-5 h-5 text-orange-600" />
      </div>
    </Toggle>
  </div>
</div>

<style>
  @import '$lib/styles/shared.css';
</style>
