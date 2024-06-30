<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Coordinate, Edge, LinePosition } from './graph.svelte'
  import { theme } from '$lib/stores/themeStore'

  // Set default values for the gaps
  export let xGap = 25 // default fixed gap in pixels between vertical lines
  export let yGap = 25 // default fixed gap in pixels between horizontal lines
  export let graphCenterPosition: Coordinate // Value on which is the initial graph focused
  export let scale: number

  const scalingSteps = [-100, -10, 1, 10, 100]
  const scaleStepUp = 3

  let calculatedXGap: number = xGap
  let calculatedYGap: number = yGap

  $: {
    if (scale > 0) {
      calculatedXGap = xGap * ((scale % scaleStepUp) + 1)
    } else if (scale < 0) {
      calculatedXGap = xGap * (scaleStepUp - (Math.abs(scale) % scaleStepUp))
    } else {
      calculatedXGap = xGap
    }
  }
  $: {
    if (scale > 0) {
      calculatedYGap = yGap * ((scale % scaleStepUp) + 1)
    } else if (scale < 0) {
      calculatedYGap = yGap * (scaleStepUp - (Math.abs(scale) % scaleStepUp))
    } else {
      calculatedYGap = yGap
    }
  }

  $: {
    scale !== undefined && redraw()
  }

  export let graphSvgElementBounds: {
    start: {
      x: number
      y: number
    }
    end: {
      x: number
      y: number
    }
  }

  let graphSvgElement: SVGElement | undefined = undefined

  let horizonalLinesPositions: LinePosition[] = []
  let verticalLinesPostions: LinePosition[] = []

  type AxisValue = {
    value: number
    position: Coordinate
  }

  let horizontalAxis: AxisValue[] = []
  let verticalAxis: AxisValue[] = []

  function redraw() {
    calculateSvgElement()
    calculateGraphLines()
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

  const calculateGraphLines = () => {
    if (!graphSvgElement) return

    verticalLinesPostions = []
    horizonalLinesPositions = []

    const center: Coordinate = {
      x: (graphSvgElementBounds.start.x + graphSvgElementBounds.end.x) / 2,
      y: (graphSvgElementBounds.end.y - graphSvgElementBounds.start.y) / 2,
    }

    const verticalStartLine: LinePosition = {
      start: { x: center.x % calculatedXGap, y: 0 },
      end: { x: center.x % calculatedXGap, y: graphSvgElementBounds.end.y - graphSvgElementBounds.start.y },
    }

    verticalLinesPostions.push(verticalStartLine)

    // Calculate all lines from vertical start line to svg element right end
    while (
      verticalLinesPostions[verticalLinesPostions.length - 1].start.x + calculatedXGap <
      graphSvgElementBounds.end.x
    ) {
      const newVerticalLinePos: LinePosition = {
        start: {
          x: verticalLinesPostions[verticalLinesPostions.length - 1].start.x + calculatedXGap,
          y: verticalLinesPostions[verticalLinesPostions.length - 1].start.y,
        },
        end: {
          x: verticalLinesPostions[verticalLinesPostions.length - 1].end.x + calculatedXGap,
          y: verticalLinesPostions[verticalLinesPostions.length - 1].end.y,
        },
      }
      verticalLinesPostions.push(newVerticalLinePos)
    }

    const horizontalStartLine: LinePosition = {
      start: { x: graphSvgElementBounds.start.x, y: center.y % calculatedYGap },
      end: { x: graphSvgElementBounds.end.x, y: center.y % calculatedYGap },
    }

    horizonalLinesPositions.push(horizontalStartLine)
    // Calculate all lines from horizontal start line to svg element bottom end
    while (
      horizonalLinesPositions[horizonalLinesPositions.length - 1].start.y + calculatedYGap <
      graphSvgElementBounds.end.y
    ) {
      const newHorizontalLinePos: LinePosition = {
        start: {
          x: horizonalLinesPositions[horizonalLinesPositions.length - 1].start.x,
          y: horizonalLinesPositions[horizonalLinesPositions.length - 1].start.y + calculatedYGap,
        },
        end: {
          x: horizonalLinesPositions[horizonalLinesPositions.length - 1].end.x,
          y: horizonalLinesPositions[horizonalLinesPositions.length - 1].end.y + calculatedYGap,
        },
      }
      horizonalLinesPositions.push(newHorizontalLinePos)
    }
  }

  const calculateAxis = () => {
    if (!graphSvgElement) return

    verticalAxis = []
    horizontalAxis = []

    const center: Coordinate = {
      x: (graphSvgElementBounds.start.x + graphSvgElementBounds.end.x) / 2,
      y: (graphSvgElementBounds.end.y - graphSvgElementBounds.start.y) / 2,
    }

    const verticalStartValue: LinePosition = {
      start: { x: center.x % calculatedXGap, y: 0 },
      end: { x: center.x % calculatedXGap, y: graphSvgElementBounds.end.y - graphSvgElementBounds.start.y },
    }

    // Calculate all lines from vertical start line to svg element right end
    while (verticalAxis[verticalAxis.length - 1].position.x + calculatedXGap < graphSvgElementBounds.end.x) {
      const newVerticalValuePos: AxisValue = {
        value: 1,
        position: {
          x: verticalAxis[verticalAxis.length - 1].position.x,
          y: verticalAxis[verticalAxis.length - 1].position.y + calculatedYGap,
        },
      }
      verticalAxis.push(newVerticalValuePos)
    }

    const horizontalStartValue: LinePosition = {
      start: { x: graphSvgElementBounds.start.x, y: center.y % calculatedYGap },
      end: { x: graphSvgElementBounds.end.x, y: center.y % calculatedYGap },
    }
  }

  const moveGraph = (deltaX: number, deltaY: number) => {
    if (!graphSvgElement) return
    const rect = graphSvgElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      console.error('SVG has no dimensions')
      return
    }

    verticalLinesPostions.map(line => {
      const newLine = {
        start: { x: line.start.x + deltaX, y: line.start.y + deltaY },
        end: { x: line.end.x + deltaX, y: line.end.y + deltaY },
      }
      return newLine
    })

    horizonalLinesPositions.map(line => {
      return {
        start: { x: line.start.x + deltaX, y: line.start.y + deltaY },
        end: { x: line.end.x + deltaX, y: line.end.y + deltaY },
      }
    })
  }

  const dragStart = () => {
    window.addEventListener('mousemove', moveGraphListener)
    window.addEventListener('mouseup', dragEnd)
  }

  const dragEnd = () => {
    window.removeEventListener('mousemove', moveGraphListener)
    window.removeEventListener('mouseup', dragEnd)
  }

  const moveGraphListener = (e: MouseEvent) => {
    moveGraph(e.movementX, e.movementY)
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

<svg bind:this={graphSvgElement} on:mousedown={dragStart} class="absolute left-0 top-0 h-full w-full opacity-30">
  <!-- Grid -->
  {#each verticalLinesPostions as linePosition}
    <line
      x1={linePosition.start.x}
      y1={linePosition.start.y}
      x2={linePosition.end.x}
      y2={linePosition.end.y}
      stroke={$theme === 'dark' ? 'white' : 'black'}
      stroke-width="1"
    />
  {/each}
  {#each horizonalLinesPositions as linePosition}
    <line
      x1={linePosition.start.x}
      y1={linePosition.start.y}
      x2={linePosition.end.x}
      y2={linePosition.end.y}
      stroke={$theme === 'dark' ? 'white' : 'black'}
      stroke-width="1"
    />
  {/each}
  <slot />
</svg>
