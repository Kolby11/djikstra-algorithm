<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import GraphVertice, { type VertexEvent } from './graphVertice.svelte'

  // Set default values for the gaps
  export let xGap = 50 // fixed gap in pixels between vertical lines
  export let yGap = 50 // fixed gap in pixels between horizontal lines

  type Vertice = {
    id: string
    x: number
    y: number
  }

  type Edge = {
    start: string
    end: string
  }

  type Coordinate = {
    x: number
    y: number
  }

  type LinePosition = {
    start: Coordinate
    end: Coordinate
  }

  const vertices: Vertice[] = [
    { id: 'A', x: 50, y: 50 },
    { id: 'B', x: 200, y: 200 },
    { id: 'C', x: 350, y: 150 },
  ]

  const edges: Edge[] = [
    { start: 'A', end: 'B' },
    { start: 'B', end: 'C' },
  ]

  let graphSvgElement: SVGElement | null = null
  let graphSvgElementBounds: {
    start: {
      x: number
      y: number
    }
    end: {
      x: number
      y: number
    }
  }

  let xLinePositions: LinePosition[] = []
  let yLinePositions: LinePosition[] = []

  let selectedVertice: GraphVertice | null = null

  let dragVericeStart: HTMLElement | null = null
  let dragLine = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  }

  function redraw() {
    calculateSvgElement()
    drawGraphLines()
  }

  function calculateSvgElement() {
    if (!graphSvgElement) return
    const rect = graphSvgElement.getBoundingClientRect()
    graphSvgElementBounds = {
      start: {
        x: rect.x,
        y: rect.y,
      },
      end: {
        x: rect.x + rect.width,
        y: rect.y + rect.height,
      },
    }
  }

  function drawGraphLines() {
    if (!graphSvgElement) return
    const rect = graphSvgElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      console.error('SVG has no dimensions')
      return
    }

    // Calculate the number of lines based on the fixed gaps
    const xLineCount = Math.floor(rect.width / xGap)
    const yLineCount = Math.floor(rect.height / yGap)

    xLinePositions = []
    yLinePositions = []

    // Generate positions for vertical lines
    for (let i = 0; i <= xLineCount; i++) {
      let xPosition = i * xGap
      xLinePositions.push({
        start: { x: xPosition, y: 0 },
        end: { x: xPosition, y: rect.height },
      })
    }

    // Generate positions for horizontal lines
    for (let i = 0; i <= yLineCount; i++) {
      let yPosition = i * yGap
      yLinePositions.push({
        start: { x: 0, y: yPosition },
        end: { x: rect.width, y: yPosition },
      })
    }
  }

  function drawDragLine(event: MouseEvent) {
    if (typeof window === 'undefined') return
    if (!dragVericeStart || !graphSvgElement) return
    const rect = dragVericeStart.getBoundingClientRect()
    const svgRect = graphSvgElement.getBoundingClientRect()

    console.log('Drawing line', rect, svgRect, event.clientX, event.clientY)
    console.log('Start', dragVericeStart)
    dragLine = {
      x1: rect.x - svgRect.x + rect.width / 2,
      y1: rect.y - svgRect.y + rect.height / 2,
      x2: event.clientX - svgRect.x,
      y2: event.clientY - svgRect.y,
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') return
    redraw()
    window.addEventListener('resize', redraw)
  })

  onDestroy(() => {
    if (typeof window === 'undefined') return
    redraw()
    window.removeEventListener('resize', redraw)
  })

  function verticeDragStart(event: CustomEvent) {
    console.log('Drag start', event.detail.element)
    dragVericeStart = event.detail.element
    window.addEventListener('mousemove', drawDragLine)
  }

  function verticeDragEnd(event: VertexEvent<MouseEvent>) {
    console.log('Drag end', event.detail.element.getBoundingClientRect())
    window.removeEventListener('mousemove', drawDragLine)
    // edges.push({
    //   start: dragVericeStart,
    //   end: event.detail.element,
    // })

    console.log('Edges', edges)
  }

  function findVertex(id: string) {
    return vertices.find(v => v.id === id)
  }

  function handleVertexUpdate(event: CustomEvent) {
    const { id, x, y } = event.detail
    const vertex = findVertex(id)
    if (vertex) {
      vertex.x = x
      vertex.y = y
    }
  }
</script>

<div class="relative h-full w-full">
  <div>Options</div>
  <div class="relative h-full w-full">
    {#each vertices as vertex}
      <GraphVertice
        data={{ moveArea: graphSvgElementBounds }}
        {vertex}
        on:dragStart={verticeDragStart}
        on:dragEnd={verticeDragEnd}
        on:update={handleVertexUpdate}
      />
    {/each}
    <svg bind:this={graphSvgElement} class="absolute left-0 top-0 -z-10 h-full w-full opacity-30">
      <!-- Grid -->
      {#each xLinePositions as linePosition}
        <line
          x1={linePosition.start.x}
          y1={linePosition.start.y}
          x2={linePosition.end.x}
          y2={linePosition.end.y}
          stroke="black"
          stroke-width="1"
        />
      {/each}
      {#each yLinePositions as linePosition}
        <line
          x1={linePosition.start.x}
          y1={linePosition.start.y}
          x2={linePosition.end.x}
          y2={linePosition.end.y}
          stroke="black"
          stroke-width="1"
        />
      {/each}
      <!-- Edges -->
      <!-- {#each edges as edge}
      {/each} -->
      <!-- Drag line -->
      <line x1={dragLine.x1} y1={dragLine.y1} x2={dragLine.x2} y2={dragLine.y2} stroke="red" stroke-width="2" />
    </svg>
  </div>
</div>
