<script lang="ts">
  import type { Coordinate } from './graph.svelte'

  export let data: {
    moveArea: {
      start: Coordinate
      end: Coordinate
    }
  }

  export let dragVerticeStart: HTMLButtonElement | undefined = undefined

  let isDragging = false

  let dragLine = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  }

  function drawDragLine(event: MouseEvent) {
    if (typeof window === 'undefined' || !isDragging) return
    if (!dragVerticeStart) return
    const rect = dragVerticeStart.getBoundingClientRect()

    dragLine = {
      x1: rect.x - data.moveArea.start.x + rect.width / 2,
      y1: rect.y - data.moveArea.start.y + rect.height / 2,
      x2: event.clientX - data.moveArea.start.x,
      y2: event.clientY - data.moveArea.start.y,
    }
  }

  export function startDrag() {
    console.log('start drag')
    isDragging = true
    window.addEventListener('mousemove', drawDragLine)
    window.addEventListener('mouseup', endDrag)
    window.addEventListener('contextmenu', event => {
      event.preventDefault()
      endDrag()
    })
  }

  export function endDrag() {
    console.log('end drag')
    isDragging = false // Update the dragging state
    dragLine = { x1: 0, y1: 0, x2: 0, y2: 0 } // Reset the line coordinates
    window.removeEventListener('mousemove', drawDragLine)
  }
</script>

{#if isDragging}
  <line x1={dragLine.x1} y1={dragLine.y1} x2={dragLine.x2} y2={dragLine.y2} stroke="red" stroke-width="2" />
{/if}
