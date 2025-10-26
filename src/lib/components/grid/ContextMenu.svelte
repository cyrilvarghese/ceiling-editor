<script lang="ts">
  import { Button } from "$lib/components/ui/button";

  let {
    visible = false,
    x = 0,
    y = 0,
    onDelete = () => {},
  }: {
    visible?: boolean;
    x?: number;
    y?: number;
    onDelete?: () => void;
  } = $props();
</script>

{#if visible}
  <div
    role="menu"
    aria-label="Component options"
    class="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 z-50"
    style="left: {x}px; top: {y}px;"
  >
    <Button
      variant="ghost"
      role="menuitem"
      class="w-full px-4 py-2 justify-start text-left hover:bg-gray-100 text-sm h-auto focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
      onclick={onDelete}
    >
      Delete Component
    </Button>
  </div>
{/if}
