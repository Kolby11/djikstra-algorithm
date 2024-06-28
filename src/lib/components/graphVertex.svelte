<script lang="ts" context="module">
  export type Vertex = {
    id: string
    name: string
    elementRef?: HTMLDivElement
    style: {
      backgroundColor: string
    }
  }
</script>

<script lang="ts">
  import { clamp } from '$lib/utils/math'
  import { createEventDispatcher } from 'svelte'
  import type { Coordinate } from './graph.svelte'
  import GraphVertexOptions from './graphVertexOptions.svelte'

  const dispatch = createEventDispatcher()

  export let data: {
    moveArea: {
      start: Coordinate
      end: Coordinate
    }
  }

  export let vertex: Vertex
  export let vertice: HTMLDivElement | null = null

  let openOptions: boolean = false
  let optionsOffset: number = 0
  let isAttached: boolean = false

  function onVertexLeftClick(event: MouseEvent) {
    event.stopPropagation()
    if (!vertex.elementRef) return

    if (isAttached) {
      detachVertex()
    } else {
      attachVertex()
    }
  }

  function onVerticeRightClick(event: MouseEvent) {
    event.preventDefault()
    if (!vertex.elementRef) return

    const rect = vertex.elementRef.getBoundingClientRect()
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
    if (!vertex.elementRef) return
    vertex.elementRef.style.position = 'fixed'

    let rect = vertex.elementRef.getBoundingClientRect()
    let center = {
      x: clamp(event.clientX - rect.width / 2, data.moveArea.start.x, data.moveArea.end.x - rect.width),
      y: clamp(event.clientY - rect.height / 2, data.moveArea.start.y, data.moveArea.end.y - rect.height),
    }

    vertex.elementRef.style.left = `${center.x}px`
    vertex.elementRef.style.top = `${center.y}px`

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
    vertex.elementRef?.parentNode?.removeChild(vertex.elementRef)
  }
</script>

<div bind:this={vertice} class="relative z-10 flex items-center justify-center">
  <button
    draggable="true"
    on:mousedown={onDragStart}
    on:mouseup={onDragEnd}
    on:click={onVertexLeftClick}
    on:contextmenu={onVerticeRightClick}
    class="h-10 w-10 rounded-full"
    style={`background-color: ${vertex.style.backgroundColor || '#000000'};`}
  >
    {vertex.name}
  </button>
  <GraphVertexOptions bind:vertex offset={optionsOffset} bind:isOpen={openOptions} deleteVertexFn={deleteVertex} />
</div>
