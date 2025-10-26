<script lang="ts">
  import GridCanvas from '$lib/components/GridCanvas.svelte';
  import ComponentPanel from '$lib/components/ComponentPanel.svelte';
  import ZoomControls from '$lib/components/ZoomControls.svelte';
  import PerformanceTools from '$lib/components/PerformanceTools.svelte';
</script>

<div class="w-full h-screen overflow-hidden">
  <GridCanvas />
  <PerformanceTools />
  <ComponentPanel />
  <ZoomControls />
</div>
