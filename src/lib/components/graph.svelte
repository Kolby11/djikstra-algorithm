<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import GraphVertice from './graphVertice.svelte'

  // Set default values for the gaps
  export let xGap = 50 // fixed gap in pixels between vertical lines
  export let yGap = 50 // fixed gap in pixels between horizontal lines

  type Coordinate = {
    x: number
    y: number
  }

  type LinePosition = {
    start: Coordinate
    end: Coordinate
  }

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
  <GraphVertice data={{ moveArea: graphSvgElementBounds }} />
  <svg bind:this={graphSvgElement} class="absolute left-0 top-0 -z-10 h-full w-full">
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
  </svg>
</div>
