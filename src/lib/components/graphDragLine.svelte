<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Coordinate } from './graph.svelte'
  import type { Vertex } from './graphVertex.svelte'

  export let moveArea: {
    start: Coordinate
    end: Coordinate
  }

  export let createEdge: (startVertex: Vertex, endVertex: Vertex) => void

  let startVertex: Vertex | undefined = undefined

  let isDragging = false

  let dragLine = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  }

  function drawDragLine(event: MouseEvent) {
    if (typeof window === 'undefined' || !isDragging) return
    if (!startVertex?.elementRef) return
    const rect = startVertex.elementRef.getBoundingClientRect()

    dragLine = {
      x1: rect.x - moveArea.start.x + rect.width / 2,
      y1: rect.y - moveArea.start.y + rect.height / 2,
      x2: event.clientX - moveArea.start.x,
      y2: event.clientY - moveArea.start.y,
    }
  }

  export function startDrag(vertex: Vertex) {
    if (!vertex.elementRef) return
    startVertex = vertex
    isDragging = true
    window.addEventListener('mousemove', drawDragLine)
    window.addEventListener('mouseup', endDrag)
    window.addEventListener('contextmenu', event => {
      event.preventDefault()
      endDrag()
    })
  }

  export const endDrag = () => {
    isDragging = false // Update the dragging state
    dragLine = { x1: 0, y1: 0, x2: 0, y2: 0 } // Reset the line coordinates
    window.removeEventListener('mousemove', drawDragLine)
    window.removeEventListener('mousemove', endDrag)
  }

  export const endDragOnVertex = (vertex: Vertex) => {
    if (!vertex.elementRef) return
    if (!startVertex || startVertex === vertex) return
    isDragging = false // Update the dragging state
    dragLine = { x1: 0, y1: 0, x2: 0, y2: 0 } // Reset the line coordinates
    window.removeEventListener('mousemove', drawDragLine)
    window.removeEventListener('mousemove', endDrag)
    createEdge(startVertex, vertex)
  }
</script>

{#if isDragging}
  <line x1={dragLine.x1} y1={dragLine.y1} x2={dragLine.x2} y2={dragLine.y2} stroke="red" stroke-width="2" />
{/if}
