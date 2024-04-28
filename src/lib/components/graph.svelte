<script lang="ts">
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

  let graphSvgElement: SVGElement

  let xLinePositions: LinePosition[] = []
  let yLinePositions: LinePosition[] = []

  let selectedVertice: HTMLButtonElement | null = null

  import { onDestroy, onMount } from 'svelte'

  function drawGraphLines() {
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

  function onVerticeClick(event: MouseEvent) {
    if (selectedVertice) {
      selectedVertice.classList.remove('bg-red-500')
      selectedVertice = null
    }
    console.log('Vertice selected')
  }

  onMount(() => {
    drawGraphLines()
    window.addEventListener('resize', drawGraphLines)
  })

  onDestroy(() => {
    window.removeEventListener('resize', drawGraphLines)
  })
</script>

<div class="relative h-full w-full">
  <button class="flex h-10 w-10 items-center justify-center rounded-full bg-red-300">
    <div>A</div>
  </button>
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
