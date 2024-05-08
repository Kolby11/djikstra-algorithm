<script lang="ts" context="module">
  export type Edge = {
    start: string
    end: string
  }

  export type Coordinate = {
    x: number
    y: number
  }

  export type LinePosition = {
    start: Coordinate
    end: Coordinate
  }
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import GraphDragLine from './graphDragLine.svelte'
  import GraphEdge from './graphEdge.svelte'
  import GraphVertex from './graphVertex.svelte'

  // Set default values for the gaps
  export let xGap = 50 // fixed gap in pixels between vertical lines
  export let yGap = 50 // fixed gap in pixels between horizontal lines

  const vertices: Record<string, HTMLButtonElement | undefined> = { A: undefined, B: undefined, C: undefined }

  const edges: Edge[] = []
  const edgesCoordinates: Record<string, LinePosition> = {}

  let graphSvgElement: SVGElement | undefined = undefined
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

  let dragLine: GraphDragLine | undefined = undefined

  let dragStartVertex:
    | {
        id: string
        element: HTMLButtonElement
      }
    | undefined = undefined

  function redraw() {
    calculateSvgElement()
    drawGraphLines()
    recalculateEdgesCoordinates()
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

  function recalculateEdgesCoordinates(vertexId?: string) {
    edges.forEach(edge => {
      if (vertexId && edge.start !== vertexId && edge.end !== vertexId) return
      const startVertex = vertices[edge.start]
      const endVertex = vertices[edge.end]
      if (!startVertex || !endVertex) return

      const startRect = startVertex.getBoundingClientRect()
      const endRect = endVertex.getBoundingClientRect()

      edgesCoordinates[edge.start + edge.end] = {
        start: {
          x: startRect.x - graphSvgElementBounds.start.x + startRect.width / 2,
          y: startRect.y - graphSvgElementBounds.start.y + startRect.height / 2,
        },
        end: {
          x: endRect.x - graphSvgElementBounds.start.x + endRect.width / 2,
          y: endRect.y - graphSvgElementBounds.start.y + endRect.height / 2,
        },
      }
    })
  }

  function verticeDragStart(vertexId: string) {
    const vertex = vertices[vertexId]
    if (vertex) {
      dragStartVertex = { id: vertexId, element: vertex }
      dragLine?.startDrag()
    }
  }

  function verticeDragEnd(vertexId: string) {
    if (dragStartVertex && dragStartVertex.id !== vertexId) {
      edges.push({
        start: dragStartVertex.id,
        end: vertexId,
      })
      recalculateEdgesCoordinates()
    }

    dragStartVertex = undefined
    dragLine?.endDrag()
  }

  function handleVertexUpdate(vertexId: string) {
    recalculateEdgesCoordinates(vertexId)
  }

  function handleVertexDelete(vertexId: string) {
    delete vertices.vertexId

    console.log(edges)
    const a = edges.filter(edge => {
      !Object.values(edge).includes(vertexId)
    })
    console.log(a)
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
</script>

<div class="relative h-full w-full">
  <div>Options</div>
  <div class="relative h-full w-full">
    {#each Object.keys(vertices) as vertexId}
      <GraphVertex
        bind:vertice={vertices[vertexId]}
        id={vertexId}
        data={{ moveArea: graphSvgElementBounds }}
        on:dragStart={() => verticeDragStart(vertexId)}
        on:dragEnd={() => verticeDragEnd(vertexId)}
        on:update={() => handleVertexUpdate(vertexId)}
        on:delete={() => handleVertexDelete(vertexId)}
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
      {#each Object.values(edgesCoordinates) as edgeCoordinates}
        <GraphEdge data={{ moveArea: graphSvgElementBounds, position: edgeCoordinates }} />
      {/each}
      <!-- Drag line -->
      <GraphDragLine
        bind:this={dragLine}
        data={{ moveArea: graphSvgElementBounds }}
        dragVerticeStart={dragStartVertex?.element}
      />
    </svg>
  </div>
</div>
