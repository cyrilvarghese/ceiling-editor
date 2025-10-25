<script lang="ts">
  import { gridStore, deleteMode } from "$lib/stores/gridStore";
  import { COMPONENT_INFO } from "$lib/utils/components";
  import { Button } from "$lib/components/ui/button";
  import CeilingIcon from "$lib/components/icons/CeilingIcon.svelte";
  import { Trash2 } from "lucide-svelte";
  import type { ComponentType } from "$lib/types";

  const componentTypes: ComponentType[] = [
    "light",
    "supply",
    "return",
    "smoke",
    "invalid",
  ];

  function selectComponent(type: ComponentType) {
    // Exit delete mode when selecting a component
    if ($deleteMode) {
      deleteMode.set(false);
    }

    if ($gridStore.selectedComponentType === type) {
      gridStore.setSelectedComponentType(null);
    } else {
      gridStore.setSelectedComponentType(type);
    }
  }

  function toggleDeleteMode() {
    deleteMode.set(!$deleteMode);
    if ($deleteMode) {
      // Clear selected component when entering delete mode
      gridStore.setSelectedComponentType(null);
    }
  }
</script>

<div
  role="toolbar"
  aria-label="Ceiling component palette"
  class="fixed bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md rounded-full px-12 py-6 z-50 toolbar-shadow"
>
  <div class="flex items-center gap-6">
    {#each componentTypes as type (type)}
      <Button
        variant="ghost"
        class="relative group flex flex-col items-center gap-1.5 p-0 h-auto hover:bg-transparent focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        onclick={() => selectComponent(type)}
        aria-label={COMPONENT_INFO[type].label}
        aria-pressed={$gridStore.selectedComponentType === type}
      >
        <div
          data-type={type}
          class="w-14 h-14 flex items-center justify-center rounded-full transition-all component-button {$gridStore.selectedComponentType ===
          type
            ? 'scale-110 selected'
            : 'bg-white hover:scale-105'}"
          style={$gridStore.selectedComponentType === type
            ? `background-color: ${COMPONENT_INFO[type].selectedBgColor};`
            : ""}
        >
          <CeilingIcon
            {type}
            size={20}
            style="color: {COMPONENT_INFO[type].iconColor}"
          />
        </div>

        <!-- Label -->
        <span class="text-xs font-medium text-gray-600 whitespace-nowrap">
          {COMPONENT_INFO[type].label}
        </span>
      </Button>
    {/each}

    <!-- Separator -->
    <div class="h-12 w-px bg-gray-300"></div>

    <!-- Delete Mode Toggle -->
    <Button
      variant="ghost"
      class="relative group flex flex-col items-center gap-1.5 p-0 h-auto hover:bg-transparent focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onclick={toggleDeleteMode}
      aria-label="Delete mode"
      aria-pressed={$deleteMode}
    >
      <div
        class="w-14 h-14 flex items-center justify-center rounded-full transition-all component-button {$deleteMode
          ? 'scale-110 selected bg-red-100'
          : 'bg-white hover:scale-105'}"
      >
        <Trash2
          size={20}
          style="color: {$deleteMode ? '#dc2626' : '#6b7280'}"
        />
      </div>

      <!-- Label -->
      <span class="text-xs font-medium text-gray-600 whitespace-nowrap">
        Delete
      </span>
    </Button>
  </div>
</div>

<style>
  .toolbar-shadow {
    box-shadow:
      0 4px 12px rgba(0, 0, 0, 0.1),
      0 2px 4px rgba(0, 0, 0, 0.06);
  }

  .component-button {
    box-shadow: none;
  }

  .component-button:hover {
    box-shadow: none;
  }

  .component-button.selected {
    box-shadow: none;
  }

  /* Hover colors per type */
  [data-type="light"].component-button:hover:not(.selected) {
    background-color: #fef3c7 !important; /* yellow-100 */
  }
  [data-type="supply"].component-button:hover:not(.selected) {
    background-color: #dbeafe !important; /* blue-100 */
  }
  [data-type="return"].component-button:hover:not(.selected) {
    background-color: #e9d5ff !important; /* purple-100 */
  }
  [data-type="smoke"].component-button:hover:not(.selected) {
    background-color: #fee2e2 !important; /* red-100 */
  }
  [data-type="invalid"].component-button:hover:not(.selected) {
    background-color: #f3f4f6 !important; /* gray-100 */
  }
</style>
