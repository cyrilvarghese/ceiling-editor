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
  } from "$lib/stores/gridStore";
  import {
    getGridCellFromMouse,
    isValidGridPosition,
    gridToPixel,
    getGridCellCenter,
    calculateZoomToPoint,
  } from "$lib/utils/coordinates";
  import { COMPONENT_INFO, generateComponentId } from "$lib/utils/components";
  import { Button } from "$lib/components/ui/button";
  import CeilingIconSVG from "$lib/components/icons/CeilingIconSVG.svelte";
  import { X } from "lucide-svelte";
  import type { Component } from "$lib/types";

  let svgContainer = $state<HTMLDivElement>();
  let svgElement = $state<SVGSVGElement>();
  let highlightRect = $state<SVGRectElement>();
  let contextMenu = $state<HTMLDivElement>();

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

  // Handle mousemove with requestAnimationFrame throttling
  function handleMouseMove(event: MouseEvent) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;

    if (rafPending) return;
    rafPending = true;

    requestAnimationFrame(() => {
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
      const component = Array.from($gridStore.components.values()).find(
        (c) => c.gridX === pos.gridX && c.gridY === pos.gridY,
      );
      if (component) {
        gridStore.removeComponent(component.id);
      }
      return;
    }

    // Place component mode
    if ($gridStore.selectedComponentType && !$dragState.isDragging) {
      // Check if position is occupied
      const occupied = Array.from($gridStore.components.values()).some(
        (c) => c.gridX === pos.gridX && c.gridY === pos.gridY,
      );

      if (!occupied) {
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
        const component = Array.from($gridStore.components.values()).find(
          (c) => c.gridX === pos.gridX && c.gridY === pos.gridY,
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
        const occupied = Array.from($gridStore.components.values()).some(
          (c) =>
            c.id !== $dragState.componentId &&
            c.gridX === pos.gridX &&
            c.gridY === pos.gridY,
        );

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
      const component = Array.from($gridStore.components.values()).find(
        (c) => c.gridX === pos.gridX && c.gridY === pos.gridY,
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
  onkeydown={(e) => e.key === "Escape" && closeContextMenu()}
  style="cursor: {cursorStyle};background-color: #f5f5f7;"
>
  <svg
    bind:this={svgElement}
    width={SVG_SIZE}
    height={SVG_SIZE}
    class="absolute top-0 left-0"
    style="transform: {transform}; transform-origin: 0 0; filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.08)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.06));"
    onmousemove={handleMouseMove}
    onmousedown={handleMouseDown}
    onmouseup={handleMouseUp}
    onclick={handleClick}
    oncontextmenu={handleContextMenu}
    role="application"
    aria-label="Interactive ceiling grid - 100 by 100 cells. Click to place components, drag to move, right-click to delete."
    tabindex="0"
  >
    <title>Ceiling Grid Canvas</title>
    <desc
      >Interactive grid for placing ceiling components like lights, air vents,
      and smoke detectors. Click to place components, drag to move them,
      right-click to delete.</desc
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
          stroke="#d4d4d4"
          stroke-width="0.5"
        />
      </pattern>
    </defs>

    <!-- Grid background with border -->
    <rect
      width={SVG_SIZE}
      height={SVG_SIZE}
      fill="white"
      stroke="#d1d5db"
      stroke-width="2"
    />
    <rect width={SVG_SIZE} height={SVG_SIZE} fill="url(#grid-pattern)" />

    <!-- Components -->
    {#each Array.from($gridStore.components.values()) as component (component.id)}
      {#if component.type === "invalid"}
        <!-- Invalid marker: gray square -->
        <g
          style="cursor: not-allowed; user-select: none;"
          transform="translate({component.gridX * CELL_SIZE}, {component.gridY *
            CELL_SIZE})"
        >
          <rect
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill="#999999"
            stroke="#666666"
            stroke-width="0.5"
          />
        </g>
      {:else}
        <!-- Normal component with icon -->
        {#if $dragState.isDragging && $dragState.componentId === component.id}
          <!-- Original position (faded) -->
          <g
            style="cursor: move; user-select: none; opacity: 0.2;"
            transform="translate({component.gridX *
              CELL_SIZE}, {component.gridY * CELL_SIZE})"
          >
            <title>{COMPONENT_INFO[component.type].label}</title>
            <CeilingIconSVG
              type={component.type}
              size={CELL_SIZE}
              x={0}
              y={0}
              class="text-gray-700"
            />
          </g>
        {:else}
          <!-- Normal component -->
          <g
            style="cursor: {$deleteMode
              ? 'pointer'
              : 'move'}; user-select: none;"
            transform="translate({component.gridX *
              CELL_SIZE}, {component.gridY * CELL_SIZE})"
          >
            <title
              >{$deleteMode
                ? `Delete ${COMPONENT_INFO[component.type].label}`
                : COMPONENT_INFO[component.type].label}</title
            >
            <CeilingIconSVG
              type={component.type}
              size={CELL_SIZE}
              x={0}
              y={0}
              class="text-gray-700"
            />
          </g>
        {/if}
      {/if}
    {/each}

    <!-- Ghost component following cursor during drag -->
    {#if $dragState.isDragging && $dragState.componentId}
      {@const draggedComponent = $gridStore.components.get(
        $dragState.componentId,
      )}
      {#if draggedComponent}
        <g
          style="pointer-events: none; user-select: none; opacity: 0.7;"
          transform="translate({ghostPosition.svgX}, {ghostPosition.svgY}) scale(1.5)"
        >
          <CeilingIconSVG
            type={draggedComponent.type}
            size={12}
            x={-6}
            y={-6}
            class="text-gray-700"
          />
        </g>
      {/if}
    {/if}

    <!-- Hover highlight (rendered last to appear on top) -->
    {#if currentHighlight.visible}
      <rect
        bind:this={highlightRect}
        x={currentHighlight.gridX * CELL_SIZE}
        y={currentHighlight.gridY * CELL_SIZE}
        width={CELL_SIZE}
        height={CELL_SIZE}
        fill={$deleteMode ? "rgba(239, 68, 68, 0.4)" : "rgba(255, 200, 0, 0.4)"}
        stroke={$deleteMode ? "#dc2626" : "#000"}
        stroke-width="1"
        pointer-events="none"
      />

      <!-- X icon in delete mode -->
      {#if $deleteMode}
        <foreignObject
          x={currentHighlight.gridX * CELL_SIZE}
          y={currentHighlight.gridY * CELL_SIZE}
          width={CELL_SIZE}
          height={CELL_SIZE}
          pointer-events="none"
        >
          <div class="flex items-center justify-center w-full h-full">
            <X size={CELL_SIZE * 0.6} style="color: #dc2626;" strokeWidth={3} />
          </div>
        </foreignObject>
      {/if}

      <!-- Cell coordinate label with background -->
      <!-- <g pointer-events="none">
        <rect
          x={currentHighlight.gridX * CELL_SIZE + CELL_SIZE / 2 - 35}
          y={currentHighlight.gridY * CELL_SIZE - 25}
          width="70"
          height="18"
          fill="#7c3aed"
          rx="2"
        />
        <text
          x={currentHighlight.gridX * CELL_SIZE + CELL_SIZE / 2}
          y={currentHighlight.gridY * CELL_SIZE - 12}
          fill="white"
          font-size="10"
          font-weight="600"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
        >
          X: {currentHighlight.gridX}, Y: {currentHighlight.gridY}
        </text>
      </g> -->
    {/if}
  </svg>

  <!-- Smart guides for distance measurements -->
  {#if currentHighlight.visible && $showGuides && !$deleteMode}
    {@const screenX = $gridStore.translateX + (currentHighlight.gridX * CELL_SIZE + CELL_SIZE / 2) * $gridStore.scale}
    {@const screenY = $gridStore.translateY + (currentHighlight.gridY * CELL_SIZE + CELL_SIZE / 2) * $gridStore.scale}
    {@const cellX = currentHighlight.gridX}
    {@const cellY = currentHighlight.gridY}
    {@const distanceFromLeft = cellX * REAL_CELL_SIZE_M}
    {@const distanceFromTop = cellY * REAL_CELL_SIZE_M}
    {@const distanceFromRight = (GRID_SIZE - cellX - 1) * REAL_CELL_SIZE_M}
    {@const distanceFromBottom = (GRID_SIZE - cellY - 1) * REAL_CELL_SIZE_M}

    <!-- Smart guide - Distance from left (horizontal) -->
    {#if cellX > 0}
      {@const leftGuideX = $gridStore.translateX}
      {@const leftGuideEndX = $gridStore.translateX + (cellX * CELL_SIZE) * $gridStore.scale}
      {@const leftGuideY = screenY}
      <svg class="fixed top-0 left-0 w-full h-full pointer-events-none z-40" style="overflow: visible;">
        <!-- Horizontal line -->
        <line
          x1={leftGuideX}
          y1={leftGuideY}
          x2={leftGuideEndX}
          y2={leftGuideY}
          stroke="#ff4444"
          stroke-width="2"
          opacity="0.4"
        />
        <!-- Label -->
        <text
          x={(leftGuideX + leftGuideEndX) / 2}
          y={leftGuideY - 10}
          fill="#ff4444"
          font-size="14"
          font-weight="600"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
        >
          {distanceFromLeft.toFixed(1)}m
        </text>
      </svg>
    {/if}

    <!-- Smart guide - Distance from top (vertical) -->
    {#if cellY > 0}
      {@const topGuideY = $gridStore.translateY}
      {@const topGuideEndY = $gridStore.translateY + (cellY * CELL_SIZE) * $gridStore.scale}
      {@const topGuideX = screenX}
      <svg class="fixed top-0 left-0 w-full h-full pointer-events-none z-40" style="overflow: visible;">
        <!-- Vertical line -->
        <line
          x1={topGuideX}
          y1={topGuideY}
          x2={topGuideX}
          y2={topGuideEndY}
          stroke="#ff4444"
          stroke-width="2"
          opacity="0.4"
        />
        <!-- Label -->
        <text
          x={topGuideX + 15}
          y={(topGuideY + topGuideEndY) / 2}
          fill="#ff4444"
          font-size="14"
          font-weight="600"
          text-anchor="start"
          font-family="system-ui, -apple-system, sans-serif"
          dominant-baseline="middle"
        >
          {distanceFromTop.toFixed(1)}m
        </text>
      </svg>
    {/if}

    <!-- Smart guide - Distance from right (horizontal) -->
    {#if cellX < GRID_SIZE - 1}
      {@const rightGuideStartX = $gridStore.translateX + ((cellX + 1) * CELL_SIZE) * $gridStore.scale}
      {@const rightGuideEndX = $gridStore.translateX + (GRID_SIZE * CELL_SIZE) * $gridStore.scale}
      {@const rightGuideY = screenY}
      <svg class="fixed top-0 left-0 w-full h-full pointer-events-none z-40" style="overflow: visible;">
        <!-- Horizontal line -->
        <line
          x1={rightGuideStartX}
          y1={rightGuideY}
          x2={rightGuideEndX}
          y2={rightGuideY}
          stroke="#ff4444"
          stroke-width="2"
          opacity="0.4"
        />
        <!-- Label -->
        <text
          x={(rightGuideStartX + rightGuideEndX) / 2}
          y={rightGuideY - 10}
          fill="#ff4444"
          font-size="14"
          font-weight="600"
          text-anchor="middle"
          font-family="system-ui, -apple-system, sans-serif"
        >
          {distanceFromRight.toFixed(1)}m
        </text>
      </svg>
    {/if}

    <!-- Smart guide - Distance from bottom (vertical) -->
    {#if cellY < GRID_SIZE - 1}
      {@const bottomGuideStartY = $gridStore.translateY + ((cellY + 1) * CELL_SIZE) * $gridStore.scale}
      {@const bottomGuideEndY = $gridStore.translateY + (GRID_SIZE * CELL_SIZE) * $gridStore.scale}
      {@const bottomGuideX = screenX}
      <svg class="fixed top-0 left-0 w-full h-full pointer-events-none z-40" style="overflow: visible;">
        <!-- Vertical line -->
        <line
          x1={bottomGuideX}
          y1={bottomGuideStartY}
          x2={bottomGuideX}
          y2={bottomGuideEndY}
          stroke="#ff4444"
          stroke-width="2"
          opacity="0.4"
        />
        <!-- Label -->
        <text
          x={bottomGuideX + 15}
          y={(bottomGuideStartY + bottomGuideEndY) / 2}
          fill="#ff4444"
          font-size="14"
          font-weight="600"
          text-anchor="start"
          font-family="system-ui, -apple-system, sans-serif"
          dominant-baseline="middle"
        >
          {distanceFromBottom.toFixed(1)}m
        </text>
      </svg>
    {/if}
  {/if}

  <!-- Context menu -->
  {#if contextMenuState.visible}
    <div
      bind:this={contextMenu}
      role="menu"
      aria-label="Component options"
      class="fixed bg-white border border-gray-300 rounded-md shadow-lg py-1 z-50"
      style="left: {contextMenuState.x}px; top: {contextMenuState.y}px;"
    >
      <Button
        variant="ghost"
        role="menuitem"
        class="w-full px-4 py-2 justify-start text-left hover:bg-gray-100 text-sm h-auto focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
        onclick={deleteComponent}
      >
        Delete Component
      </Button>
    </div>
  {/if}

  <!-- Panning indicator -->
  {#if $panState.isPanning}
    <div
      role="status"
      aria-live="polite"
      class="fixed top-5 left-1/2 -translate-x-1/2 bg-black/75 text-white px-4 py-2 rounded-md"
    >
      Panning...
    </div>
  {/if}
</div>
