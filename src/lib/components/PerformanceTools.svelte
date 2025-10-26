<script lang="ts">
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import {
    gridStore,
    GRID_SIZE,
    isPositionOccupied,
  } from "$lib/stores/gridStore";
  import { generateComponentId } from "$lib/utils/components";
  import type { ComponentType } from "$lib/types";

  // FPS tracking
  let fps = $state(0);
  let frameCount = $state(0);
  let lastTime = $state(performance.now());

  // Component count (derived from store)
  let componentCount = $derived($gridStore.components.size);

  function updateFPS() {
    performance.mark('fps-update-start');

    frameCount++;
    const currentTime = performance.now();
    const elapsed = currentTime - lastTime;

    if (elapsed >= 1000) {
      // Update every second
      fps = Math.round((frameCount * 1000) / elapsed);
      frameCount = 0;
      lastTime = currentTime;
    }

    performance.mark('fps-update-end');
    performance.measure('FPS Update', 'fps-update-start', 'fps-update-end');

    requestAnimationFrame(updateFPS);
  }

  // FPS color coding
  let fpsColor = $derived(
    fps >= 55 ? "#10b981" : fps >= 30 ? "#f59e0b" : "#ef4444",
  );

  // Test data generator
  function addRandomComponents(count: number) {
    let added = 0;
    const types: ComponentType[] = ["light", "supply", "return", "smoke"];
    const maxAttempts = count * 10; // Prevent infinite loop
    let attempts = 0;

    while (added < count && attempts < maxAttempts) {
      const gridX = Math.floor(Math.random() * GRID_SIZE);
      const gridY = Math.floor(Math.random() * GRID_SIZE);

      if (!isPositionOccupied($gridStore.components, gridX, gridY)) {
        const type = types[Math.floor(Math.random() * types.length)];
        gridStore.addComponent({
          id: generateComponentId(),
          type,
          gridX,
          gridY,
        });
        added++;
      }
      attempts++;
    }

    console.log(
      `[PERF] Added ${added} components in ${attempts} attempts (${((added / attempts) * 100).toFixed(1)}% success rate)`,
    );
  }

  function clearAllComponents() {
    gridStore.clearAllComponents();
    console.log("[PERF] Cleared all components");
  }

  onMount(() => {
    requestAnimationFrame(updateFPS);
  });
</script>

<!-- FPS Counter (always visible, top-left) -->
<div
  class="fixed top-5 left-5 z-50 bg-black/80 text-white px-3 py-2 rounded-md font-mono text-sm backdrop-blur-sm"
  style="min-width: 80px;"
>
  <div class="flex items-center justify-between gap-2">
    <span>FPS:</span>
    <span style="color: {fpsColor}; font-weight: 600;">{fps}</span>
  </div>
</div>

<!-- Test Data Generator Panel - Hidden -->
<!--
<div
  class="fixed top-20 left-5 z-50 bg-white border border-gray-300 rounded-md shadow-lg p-3"
  style="min-width: 200px;"
>
  <div class="space-y-3">
    <div class="text-sm font-semibold text-gray-700 border-b pb-2">
      Components: <span class="text-blue-600">{componentCount}</span> / {GRID_SIZE *
        GRID_SIZE}
    </div>

    <div class="space-y-2">
      <Button
        variant="outline"
        size="sm"
        class="w-full text-xs"
        onclick={() => addRandomComponents(10)}
      >
        Add 10
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="w-full text-xs"
        onclick={() => addRandomComponents(50)}
      >
        Add 50
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="w-full text-xs"
        onclick={() => addRandomComponents(100)}
      >
        Add 100
      </Button>

      <Button
        variant="outline"
        size="sm"
        class="w-full text-xs"
        onclick={() => addRandomComponents(500)}
      >
        Add 500
      </Button>
    </div>

    <Button
      variant="destructive"
      size="sm"
      class="w-full text-xs"
      onclick={clearAllComponents}
      disabled={componentCount === 0}
    >
      Clear All
    </Button>
  </div>
</div>
-->
