<script lang="ts">
  import GridCanvas from '$lib/components/GridCanvas.svelte';
  import ComponentPanel from '$lib/components/ComponentPanel.svelte';
  import ZoomControls from '$lib/components/ZoomControls.svelte';
</script>

<div class="w-full h-screen overflow-hidden">
  <GridCanvas />
  <ComponentPanel />
  <ZoomControls />
</div>
