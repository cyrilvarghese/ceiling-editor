<script lang="ts">
  import { onMount } from "svelte";
  import {
    gridStore,
    dragState,
    panState,
    spaceKeyPressed,
    deleteMode,
    showGuides,
    GRID_SIZE,
    CELL_SIZE,
    SVG_SIZE,
    REAL_CELL_SIZE_M,
    getComponentAtPosition,
    isPositionOccupied,
  } from "$lib/stores/gridStore";
  import {
    getGridCellFromMouse,
    isValidGridPosition,
    calculateZoomToPoint,
  } from "$lib/utils/coordinates";
  import { COMPONENT_INFO, generateComponentId } from "$lib/utils/components";
  import { generateSmartGuides } from "$lib/utils/smartGuides";
  import { Button } from "$lib/components/ui/button";
  import SmartGuide from "$lib/components/SmartGuide.svelte";
  import ContextMenu from "$lib/components/grid/ContextMenu.svelte";
  import PanningIndicator from "$lib/components/grid/PanningIndicator.svelte";
  import DragGhost from "$lib/components/grid/DragGhost.svelte";
  import HighlightOverlay from "$lib/components/grid/HighlightOverlay.svelte";
  import ComponentRenderer from "$lib/components/grid/ComponentRenderer.svelte";
  import type { Component } from "$lib/types";

  // SVG styling constants
  const SVG_COLORS = {
    background: "#f5f5f7", // gray-100 - canvas background
    gridLine: "#d4d4d4", // gray-300 - grid lines
    gridBorder: "#d4d4d4", // gray-300 - grid outer border
    gridFill: "white", // white - grid background
  } as const;

  const SVG_SHADOWS = {
    grid: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.06))",
  } as const;

  let svgContainer = $state<HTMLDivElement>();
  let svgElement = $state<SVGSVGElement>();

  let currentHighlight = $state({ gridX: -1, gridY: -1, visible: false });
  let contextMenuState = $state({
    visible: false,
    x: 0,
    y: 0,
    componentId: "",
  });
  let rafPending = $state(false);
  let lastMouseX = $state(0);
  let lastMouseY = $state(0);
  let ghostPosition = $state({ svgX: 0, svgY: 0 });

  let transform = $derived(
    `translate(${$gridStore.translateX}px, ${$gridStore.translateY}px) scale(${$gridStore.scale})`,
  );
  let cursorStyle = $derived(
    $panState.isPanning
      ? "grabbing"
      : $spaceKeyPressed
        ? "grab"
        : $deleteMode
          ? "crosshair"
          : "default",
  );

  // Generate smart guide data
  let smartGuides = $derived(
    currentHighlight.visible && $showGuides && !$deleteMode
      ? generateSmartGuides(
          currentHighlight.gridX,
          currentHighlight.gridY,
          GRID_SIZE,
          {
            translateX: $gridStore.translateX,
            translateY: $gridStore.translateY,
            scale: $gridStore.scale,
          }
        )
      : []
  );

  // Handle mousemove with requestAnimationFrame throttling
  function handleMouseMove(event: MouseEvent) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(() => {
      const frameStart = performance.now();
      performance.mark("mousemove-start");

      const pos = getGridCellFromMouse(
        { clientX: lastMouseX, clientY: lastMouseY } as MouseEvent,
        svgContainer as unknown as HTMLElement,
        $gridStore.translateX,
        $gridStore.translateY,
        $gridStore.scale,
      );

      if ($panState.isPanning) {
        // Update pan position
        gridStore.setTranslate(
          lastMouseX - $panState.startX,
          lastMouseY - $panState.startY,
        );
      } else if ($dragState.isDragging) {
        // Update ghost position to follow cursor
        ghostPosition = { svgX: pos.svgX, svgY: pos.svgY };

        // Also show highlight for drop target
        if (isValidGridPosition(pos.gridX, pos.gridY)) {
          currentHighlight = {
            gridX: pos.gridX,
            gridY: pos.gridY,
            visible: true,
          };
        } else {
          currentHighlight.visible = false;
        }
      } else {
        // Update highlight
        if (isValidGridPosition(pos.gridX, pos.gridY)) {
          currentHighlight = {
            gridX: pos.gridX,
            gridY: pos.gridY,
            visible: true,
          };
        } else {
          currentHighlight.visible = false;
        }
      }

      performance.mark("mousemove-end");
      const frameEnd = performance.now();
      const frameTime = frameEnd - frameStart;

      performance.measure("MouseMove RAF", "mousemove-start", "mousemove-end");

      // Log slow frames to console
      if (frameTime > 16) {
        console.warn(
          `[PERF] Slow mousemove frame: ${frameTime.toFixed(2)}ms ` +
            `(Target: <16ms for 60fps, Components: ${$gridStore.components.size})`,
        );
      }

      rafPending = false;
    });
  }

  // Handle click to place component or delete in delete mode
  function handleClick(event: MouseEvent) {
    // Don't handle clicks if panning
    if ($panState.isPanning) return;

    const pos = getGridCellFromMouse(
      event,
      svgContainer as unknown as HTMLElement,
      $gridStore.translateX,
      $gridStore.translateY,
      $gridStore.scale,
    );

    if (!isValidGridPosition(pos.gridX, pos.gridY)) return;

    // Delete mode - remove component at clicked position
    if ($deleteMode) {
      const component = getComponentAtPosition(
        $gridStore.components,
        pos.gridX,
        pos.gridY,
      );
      if (component) {
        gridStore.removeComponent(component.id);
      }
      return;
    }

    // Place component mode
    if ($gridStore.selectedComponentType && !$dragState.isDragging) {
      // Check if position is occupied
      if (!isPositionOccupied($gridStore.components, pos.gridX, pos.gridY)) {
        const newComponent: Component = {
          id: generateComponentId(),
          type: $gridStore.selectedComponentType,
          gridX: pos.gridX,
          gridY: pos.gridY,
        };
        gridStore.addComponent(newComponent);
      }
    }
  }

  // Handle mousedown - start drag or pan
  function handleMouseDown(event: MouseEvent) {
    // Don't start drag if in delete mode
    if ($deleteMode) {
      return;
    }

    // Pan if space bar is held OR middle mouse button
    if ($spaceKeyPressed || event.button === 1) {
      panState.set({
        isPanning: true,
        startX: event.clientX - $gridStore.translateX,
        startY: event.clientY - $gridStore.translateY,
      });
      event.preventDefault();
      return;
    }

    // Check if clicking on a component to drag
    if (event.button === 0) {
      const pos = getGridCellFromMouse(
        event,
        svgContainer as unknown as HTMLElement,
        $gridStore.translateX,
        $gridStore.translateY,
        $gridStore.scale,
      );

      if (isValidGridPosition(pos.gridX, pos.gridY)) {
        const component = getComponentAtPosition(
          $gridStore.components,
          pos.gridX,
          pos.gridY,
        );

        if (component && component.type !== "invalid") {
          dragState.set({
            isDragging: true,
            componentId: component.id,
            startGridX: component.gridX,
            startGridY: component.gridY,
            offsetX: 0,
            offsetY: 0,
          });
        }
      }
    }
  }

  // Handle mouseup - drop component or end pan
  function handleMouseUp(event: MouseEvent) {
    if ($panState.isPanning) {
      panState.set({ isPanning: false, startX: 0, startY: 0 });
    }

    if ($dragState.isDragging && $dragState.componentId) {
      const pos = getGridCellFromMouse(
        event,
        svgContainer as unknown as HTMLElement,
        $gridStore.translateX,
        $gridStore.translateY,
        $gridStore.scale,
      );

      if (isValidGridPosition(pos.gridX, pos.gridY)) {
        // Check if target position is occupied
        const occupyingComponent = getComponentAtPosition(
          $gridStore.components,
          pos.gridX,
          pos.gridY,
        );
        const occupied =
          occupyingComponent &&
          occupyingComponent.id !== $dragState.componentId;

        if (!occupied) {
          gridStore.updateComponent($dragState.componentId, {
            gridX: pos.gridX,
            gridY: pos.gridY,
          });
        }
      }

      dragState.set({
        isDragging: false,
        componentId: null,
        startGridX: 0,
        startGridY: 0,
        offsetX: 0,
        offsetY: 0,
      });
    }
  }

  // Handle right-click context menu
  function handleContextMenu(event: MouseEvent) {
    event.preventDefault();

    const pos = getGridCellFromMouse(
      event,
      svgContainer as unknown as HTMLElement,
      $gridStore.translateX,
      $gridStore.translateY,
      $gridStore.scale,
    );

    if (isValidGridPosition(pos.gridX, pos.gridY)) {
      const component = getComponentAtPosition(
        $gridStore.components,
        pos.gridX,
        pos.gridY,
      );

      if (component) {
        contextMenuState = {
          visible: true,
          x: event.clientX,
          y: event.clientY,
          componentId: component.id,
        };
      }
    }
  }

  // RAF-based throttle for wheel zoom (adapts to display refresh rate)
  let rafId: number | null = null;
  let pendingZoomData: {
    mouseX: number;
    mouseY: number;
    newScale: number;
  } | null = null;

  // Process zoom in animation frame
  function processZoom() {
    performance.mark("zoom-start");

    if (!pendingZoomData) {
      rafId = null;
      return;
    }

    const { mouseX, mouseY, newScale } = pendingZoomData;

    const { translateX, translateY } = calculateZoomToPoint(
      mouseX,
      mouseY,
      $gridStore.translateX,
      $gridStore.translateY,
      $gridStore.scale,
      newScale,
    );

    gridStore.setScale(newScale);
    gridStore.setTranslate(translateX, translateY);

    performance.mark("zoom-end");
    performance.measure("Zoom RAF", "zoom-start", "zoom-end");

    rafId = null;
    pendingZoomData = null;
  }

  // Handle zoom with wheel
  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rect = svgContainer?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const delta = event.deltaY * -0.004;
    const currentScale = $gridStore.scale;
    const newScale = Math.max(0.5, Math.min(5, currentScale + delta));

    // Store zoom data (batches multiple events per frame)
    pendingZoomData = { mouseX, mouseY, newScale };

    // Schedule RAF if not already pending (one RAF per display frame)
    if (rafId === null) {
      rafId = requestAnimationFrame(processZoom);
    }
  }

  // Delete component from context menu
  function deleteComponent() {
    if (contextMenuState.componentId) {
      gridStore.removeComponent(contextMenuState.componentId);
    }
    contextMenuState.visible = false;
  }

  // Close context menu on click outside
  function closeContextMenu() {
    contextMenuState.visible = false;
  }

  // Keyboard handlers
  function handleKeyDown(event: KeyboardEvent) {
    if (event.code === "Space" && !$spaceKeyPressed) {
      spaceKeyPressed.set(true);
      event.preventDefault();
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    if (event.code === "Space") {
      spaceKeyPressed.set(false);
      event.preventDefault();
    }
  }

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  });

  // Setup non-passive wheel event listener
  $effect(() => {
    if (!svgContainer) return;

    // Add wheel listener with { passive: false } to allow preventDefault()
    svgContainer?.addEventListener(
      "wheel",
      handleWheel as unknown as EventListener & WheelEvent,
      { passive: false },
    );

    return () => {
      svgContainer?.removeEventListener(
        "wheel",
        handleWheel as unknown as EventListener,
      );
    };
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  tabindex="0"
  role="application"
  aria-label="Grid canvas container"
  class="w-full h-full fixed top-0 left-0 overflow-hidden"
  bind:this={svgContainer}
  onclick={closeContextMenu}
  style="cursor: {cursorStyle};background-color: {SVG_COLORS.background};"
>
  <svg
    bind:this={svgElement}
    width={SVG_SIZE}
    height={SVG_SIZE}
    class="absolute top-0 left-0"
    style="transform: {transform}; transform-origin: 0 0; filter: {SVG_SHADOWS.grid};"
    onmousemove={handleMouseMove}
    onmousedown={handleMouseDown}
    onmouseup={handleMouseUp}
    onclick={handleClick}
    oncontextmenu={handleContextMenu}
    role="application"
    aria-label="Interactive ceiling grid - 100 by 100 cells. Click to place components, drag to move, right-click to delete."
    tabindex="0"
  >
    <defs>
      <pattern
        id="grid-pattern"
        width={CELL_SIZE}
        height={CELL_SIZE}
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M {CELL_SIZE} 0 L 0 0 0 {CELL_SIZE}"
          fill="none"
          stroke={SVG_COLORS.gridLine}
          stroke-width="0.5"
        />
      </pattern>
    </defs>

    <!-- Grid background with border -->
    <rect
      width={SVG_SIZE}
      height={SVG_SIZE}
      fill={SVG_COLORS.gridFill}
      stroke={SVG_COLORS.gridBorder}
      stroke-width="2"
    />
    <rect width={SVG_SIZE} height={SVG_SIZE} fill="url(#grid-pattern)" />

    <!-- Components -->
    {#each Array.from($gridStore.components.values()) as component (component.id)}
      <ComponentRenderer
        {component}
        cellSize={CELL_SIZE}
        isDragging={$dragState.isDragging}
        isDraggedComponent={$dragState.isDragging &&
          $dragState.componentId === component.id}
        isDeleteMode={$deleteMode}
      />
    {/each}

    <!-- Ghost component following cursor during drag -->
    {#if $dragState.isDragging && $dragState.componentId}
      <DragGhost
        component={$gridStore.components.get($dragState.componentId)}
        svgX={ghostPosition.svgX}
        svgY={ghostPosition.svgY}
      />
    {/if}

    <!-- Hover highlight (rendered last to appear on top) -->
    <HighlightOverlay
      visible={currentHighlight.visible}
      gridX={currentHighlight.gridX}
      gridY={currentHighlight.gridY}
      cellSize={CELL_SIZE}
      isDragging={$dragState.isDragging}
      isDeleteMode={$deleteMode}
      selectedType={$gridStore.selectedComponentType}
    />
  </svg>

  <!-- Smart guides for distance measurements -->
  {#each smartGuides as guide (guide.orientation + guide.startX + guide.startY)}
    <SmartGuide
      orientation={guide.orientation}
      startX={guide.startX}
      startY={guide.startY}
      endX={guide.endX}
      endY={guide.endY}
      distance={guide.distance}
      labelOffsetX={guide.labelOffsetX}
      labelOffsetY={guide.labelOffsetY}
    />
  {/each}

  <!-- Context menu -->
  <ContextMenu
    visible={contextMenuState.visible}
    x={contextMenuState.x}
    y={contextMenuState.y}
    onDelete={deleteComponent}
  />

  <!-- Panning indicator -->
  <PanningIndicator visible={$panState.isPanning} />
</div>
