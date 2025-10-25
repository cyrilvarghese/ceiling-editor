<script lang="ts">
  import { gridStore } from "$lib/stores/gridStore";
  import { Button } from "$lib/components/ui/button";

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
      <span class="text-xl font-bold" aria-hidden="true">+</span>
    </Button>

    <!-- Zoom Percentage Display -->
    <div class="flex flex-col items-center justify-center py-2">
      <span class="text-lg font-bold text-gray-700 text-center" aria-live="polite">
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
      <span class="text-xl font-bold" aria-hidden="true">−</span>
    </Button>

    <!-- Divider -->
    <div class="h-px w-8 bg-gray-300"></div>

    <!-- Reset Button -->
    <Button
      variant="ghost"
      class="w-10 h-10 p-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-xs font-medium focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onclick={resetZoom}
      aria-label="Reset view"
    >
      <span aria-hidden="true">⟲</span>
    </Button>
  </div>
</div>

<style>
  .toolbar-shadow {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
  }
</style>
