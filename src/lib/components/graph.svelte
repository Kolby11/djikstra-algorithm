<script lang="ts" context="module">
  export type Edge = {
    id: string
    start: Vertex
    end: Vertex
    position: LinePosition
    oriented?: boolean
    value?: number
    style: {
      color: string
    }
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
  import GraphDragLine from './graphDragLine.svelte'

  import GraphEdge from './graphEdge.svelte'

  import type { Vertex } from './graphVertex.svelte'
  import GraphVertex from './graphVertex.svelte'

  import Plane from './plane.svelte'

  // Set default values for the gaps
  export let xGap = 25 // fixed gap in pixels between vertical lines
  export let yGap = 25 // fixed gap in pixels between horizontal lines
  let graphScale: number = 0

  export let graphCenterPosition: Coordinate = { x: 0, y: 0 }

  let dragLine: GraphDragLine | undefined = undefined

  const vertices: Record<string, Vertex> = {
    A: { id: 'A', name: 'A', coordinates: { x: 0, y: 0 }, style: { backgroundColor: '#bbff55' } },
    B: { id: 'B', name: 'B', coordinates: { x: 0, y: 0 }, style: { backgroundColor: '#bbff55' } },
    C: { id: 'C', name: 'C', coordinates: { x: 0, y: 0 }, style: { backgroundColor: '#bbff55' } },
  }

  const edges: Record<string, Edge> = {
    '2': {
      id: '2',
      start: vertices.A,
      end: vertices.B,
      position: { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } },
      oriented: true,
      style: { color: 'ff00ff' },
    },
  }

  let graphSvgElementBounds: { start: Coordinate; end: Coordinate }

  const createEdge = (startVertex: Vertex, endVertex: Vertex) => {
    console.log(startVertex, endVertex)
    const edgeId = startVertex.id + endVertex.id
    edges[edgeId] = {
      id: edgeId,
      start: startVertex,
      end: endVertex,
      position: { start: startVertex.coordinates, end: endVertex.coordinates },
      style: { color: 'ff00ff' },
    }
  }
</script>

<div class="flex h-full flex-col">
  <div class="flex">
    Options
    <input min={-10} max={10} step="1" bind:value={graphScale} type="range" />
    {graphScale}
  </div>
  <div class="relative h-full w-full overflow-hidden rounded-3xl">
    <div class="relative h-full w-full">
      <!-- Verices -->
      {#each Object.entries(vertices) as [vertexId, vertex]}
        <GraphVertex
          moveArea={graphSvgElementBounds}
          bind:vertex
          on:dragStart={() => {
            vertex.elementRef && dragLine?.startDrag(vertex)
          }}
          on:dragEnd={() => {
            vertex.elementRef && dragLine?.endDragOnVertex(vertex)
          }}
        />
        <!-- on:delete={() => handleVertexDelete(vertexId)} -->
      {/each}
    </div>
    <Plane bind:graphCenterPosition bind:scale={graphScale} {xGap} {yGap} bind:graphSvgElementBounds>
      <!-- Edges -->
      {#each Object.values(edges) as edge}
        <GraphEdge moveArea={graphSvgElementBounds} bind:edge />
      {/each}
      <!-- Drag line -->
      <GraphDragLine bind:this={dragLine} {createEdge} moveArea={graphSvgElementBounds} />
    </Plane>
  </div>
</div>
