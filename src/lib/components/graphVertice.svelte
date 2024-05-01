<script lang="ts" context="module">
  export type VertexEvent<T extends Event> = T & {
    detail: {
      element: EventTarget
    }
    id: string
  }
</script>

<script lang="ts">
  import { clamp } from '$lib/utils/math'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let vertex: {
    id: string
    x: number
    y: number
  }

  export let data: {
    moveArea: {
      start: { x: number; y: number }
      end: { x: number; y: number }
    }
  }

  let openOptions = false
  let optionsOffset = 0
  let vertice: HTMLButtonElement | null = null
  let isAttached = false

  function onVerticeLeftClick(event: MouseEvent) {
    event.stopPropagation()
    if (!vertice) return

    if (isAttached) {
      detachVertice()
    } else {
      attachVertice()
    }
  }

  function onVerticeRightClick(event: MouseEvent) {
    event.preventDefault()
    if (!vertice) return

    const rect = vertice.getBoundingClientRect()
    optionsOffset = rect.height // Calculate offset for options menu
    openOptions = !openOptions
  }

  function attachVertice() {
    window.addEventListener('mousemove', moveVertice)
    window.addEventListener('mouseup', detachVertice)
    isAttached = true
  }

  function detachVertice() {
    window.removeEventListener('mousemove', moveVertice)
    window.removeEventListener('mouseup', detachVertice)
    isAttached = false
  }

  function moveVertice(event: MouseEvent) {
    if (!vertice) return
    vertice.style.position = 'fixed'

    let rect = vertice.getBoundingClientRect()
    let center = {
      x: clamp(event.clientX - rect.width / 2, data.moveArea.start.x, data.moveArea.end.x - rect.width),
      y: clamp(event.clientY - rect.height / 2, data.moveArea.start.y, data.moveArea.end.y - rect.height),
    }

    vertice.style.left = `${center.x}px`
    vertice.style.top = `${center.y}px`

    // Update the vertex data and notify parent components
    vertex.x = center.x
    vertex.y = center.y
    dispatch('update', { id: vertex.id, x: center.x, y: center.y })
  }

  function onDragStart(event: MouseEvent) {
    event.preventDefault() // Optional based on use-case
    dispatch('dragStart', { id: vertex.id, element: vertice })
  }

  function onDragEnd(event: MouseEvent) {
    dispatch('dragEnd', { id: vertex.id, element: vertice })
  }
</script>

<button
  bind:this={vertice}
  draggable="true"
  on:click={onVerticeLeftClick}
  on:contextmenu={onVerticeRightClick}
  on:mousedown={onDragStart}
  on:mouseup={onDragEnd}
  class="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-red-300"
>
  <div>A</div>
  {#if openOptions}
    <div class="absolute z-20 rounded bg-white px-4 py-2 shadow-md" style={`top: ${optionsOffset}px`}>Options</div>
  {/if}
</button>
