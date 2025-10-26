<script lang="ts">
  let {
    visible = false,
  }: {
    visible?: boolean;
  } = $props();
</script>

{#if visible}
  <div
    role="status"
    aria-live="polite"
    class="fixed top-5 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-md"
  >
    Panning...
  </div>
{/if}
