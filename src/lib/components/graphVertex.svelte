<script lang="ts">
  import { clamp } from '$lib/utils/math'
  import { createEventDispatcher } from 'svelte'
  import type { Coordinate } from './graph.svelte'
  import ColorPicker from './colorPicker.svelte'

  const dispatch = createEventDispatcher()

  export let data: {
    moveArea: {
      start: Coordinate
      end: Coordinate
    }
  }

  export let id: string

  export let vertice: HTMLDivElement | null = null

  let openOptions = false
  let optionsOffset = 0
  let isAttached = false

  function onVertexLeftClick(event: MouseEvent) {
    event.stopPropagation()
    if (!vertice) return

    if (isAttached) {
      detachVertex()
    } else {
      attachVertex()
    }
  }

  function onVerticeRightClick(event: MouseEvent) {
    event.preventDefault()
    if (!vertice) return

    const rect = vertice.getBoundingClientRect()
    optionsOffset = rect.height // Calculate offset for options menu
    openOptions = !openOptions
  }

  function attachVertex() {
    window.addEventListener('mousemove', moveVertex)
    window.addEventListener('mouseup', detachVertex)
    isAttached = true
  }

  function detachVertex(event?: MouseEvent, flag = true) {
    window.removeEventListener('mousemove', moveVertex)
    window.removeEventListener('mouseup', detachVertex)
    if (flag) isAttached = false
  }

  function moveVertex(event: MouseEvent) {
    if (!vertice) return
    vertice.style.position = 'fixed'

    let rect = vertice.getBoundingClientRect()
    let center = {
      x: clamp(event.clientX - rect.width / 2, data.moveArea.start.x, data.moveArea.end.x - rect.width),
      y: clamp(event.clientY - rect.height / 2, data.moveArea.start.y, data.moveArea.end.y - rect.height),
    }

    vertice.style.left = `${center.x}px`
    vertice.style.top = `${center.y}px`

    dispatch('update', event)
  }

  function onDragStart(event: MouseEvent) {
    event.preventDefault()
    detachVertex(event, false)
    dispatch('dragStart', event)
  }

  function onDragEnd(event: MouseEvent) {
    event.preventDefault()
    dispatch('dragEnd', event)
  }

  function deleteVertex() {
    dispatch('delete')
    vertice?.parentNode?.removeChild(vertice)
  }
</script>

<div bind:this={vertice} class="relative z-10 flex items-center justify-center">
  <button
    draggable="true"
    on:mousedown={onDragStart}
    on:mouseup={onDragEnd}
    on:click={onVertexLeftClick}
    on:contextmenu={onVerticeRightClick}
    class="h-10 w-10 rounded-full bg-red-300"
  >
    {id}
  </button>
  {#if openOptions}
    <div class="absolute z-20 rounded bg-white px-4 py-2 shadow-md" style={`top: ${optionsOffset}px`}>
      Options
      <button on:click={deleteVertex}>Delete</button>
      <ColorPicker />
    </div>
  {/if}
</div>
