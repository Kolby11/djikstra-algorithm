<script lang="ts" context="module">
  type GridLine = {
    value: number
    start: Coordinate
    end: Coordinate
  }
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Coordinate, Edge, LinePosition } from './graph.svelte'
  import { theme } from '$lib/stores/themeStore'

  // Set default values for the gaps
  export let xGap = 25 // default fixed gap in pixels between vertical lines
  export let yGap = 25 // default fixed gap in pixels between horizontal lines
  export let graphCenterPosition: Coordinate // Value on which is the initial graph focused
  export let scale: number

  const scalingSteps = [100, 10, 1, 0.1, 0.01]
  $: currentScale = Math.floor(scale / scaleStepUp)
  const scaleStepUp = 3

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

  export let leftTopPoint: Coordinate

  let calculatedXGap: number = xGap
  let calculatedYGap: number = yGap

  let horizontalGridLines: GridLine[] = []
  let verticalGridLines: GridLine[] = []

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

  let graphSvgElement: SVGElement | undefined = undefined

  type AxisValue = {
    value: number
    position: Coordinate
  }

  let horizontalAxis: AxisValue[] = []
  let verticalAxis: AxisValue[] = []

  function redraw() {
    calculateSvgElement()
    calculateGridLines()
    calculateAxis()
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
    leftTopPoint = {
      x: graphSvgElementBounds.start.x + graphCenterPosition.x,
      y: graphSvgElementBounds.start.y + graphCenterPosition.y,
    }
  }

  const calculateGridLines = () => {
    if (!graphSvgElement) return

    horizontalGridLines = []
    verticalGridLines = []

    // Calculate the value of the most top-left point that fits the grid
    const leftTopXValue: number = Math.floor(leftTopPoint.x / calculatedXGap) * calculatedXGap
    const leftTopYValue: number = Math.floor(leftTopPoint.y / calculatedYGap) * calculatedYGap

    // Calculate the total width and height of the SVG element
    const svgWidth = graphSvgElementBounds.end.x - graphSvgElementBounds.start.x
    const svgHeight = graphSvgElementBounds.end.y - graphSvgElementBounds.start.y

    // Calculate the number of vertical and horizontal grid lines
    const verticalLineCount = Math.ceil(svgWidth / calculatedXGap)
    const horizontalLineCount = Math.ceil(svgHeight / calculatedYGap)

    // Add vertical grid lines
    for (let i = 0; i <= verticalLineCount; i++) {
      const xPosition = leftTopXValue + i * calculatedXGap - leftTopPoint.x
      const line: GridLine = {
        value: i - Math.floor(verticalLineCount / 2),
        start: { x: xPosition, y: 0 },
        end: { x: xPosition, y: svgHeight },
      }
      verticalGridLines.push(line)
    }

    // Add horizontal grid lines
    for (let i = 0; i <= horizontalLineCount; i++) {
      const yPosition = leftTopYValue + i * calculatedYGap - leftTopPoint.y
      const line: GridLine = {
        value: i - Math.floor(horizontalLineCount / 2),
        start: { x: 0, y: yPosition },
        end: { x: svgWidth, y: yPosition },
      }
      horizontalGridLines.push(line)
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

    verticalGridLines.forEach(line => {
      const axisValue: AxisValue = {
        value: line.value,
        position: {
          x: line.start.x,
          y: center.y,
        },
      }
      horizontalAxis.push(axisValue)
    })

    horizontalGridLines.forEach(line => {
      const axisValue: AxisValue = {
        value: line.value,
        position: {
          x: center.x,
          y: line.start.y,
        },
      }
      verticalAxis.push(axisValue)
    })
  }

  // const moveGraph = (deltaX: number, deltaY: number) => {
  //   if (!graphSvgElement) return
  //   const rect = graphSvgElement.getBoundingClientRect()
  //   if (rect.width === 0 || rect.height === 0) {
  //     console.error('SVG has no dimensions')
  //     return
  //   }
  //   const oldVerticalLinesPostions = [...verticalLinesPostions]

  //   verticalLinesPostions = verticalLinesPostions.map(line => {
  //     return {
  //       start: { x: line.start.x + deltaX, y: line.start.y + deltaY },
  //       end: { x: line.end.x + deltaX, y: line.end.y + deltaY },
  //     }
  //   })

  //   horizonalLinesPositions = horizonalLinesPositions.map(line => {
  //     return {
  //       start: { x: line.start.x + deltaX, y: line.start.y + deltaY },
  //       end: { x: line.end.x + deltaX, y: line.end.y + deltaY },
  //     }
  //   })
  // }

  const dragStart = (e: MouseEvent) => {
    e.preventDefault()
    window.addEventListener('mousemove', moveGraphListener)
    window.addEventListener('mouseup', dragEnd)
  }

  const dragEnd = () => {
    window.removeEventListener('mousemove', moveGraphListener)
    window.removeEventListener('mouseup', dragEnd)
  }

  const moveGraphListener = (e: MouseEvent) => {
    graphCenterPosition = {
      x: graphCenterPosition.x + e.movementX,
      y: graphCenterPosition.y + e.movementY,
    }
    console.log(graphCenterPosition)
    // moveGraph(e.movementX, e.movementY)
    redraw()
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

<svg
  bind:this={graphSvgElement}
  on:mousedown={dragStart}
  class="absolute left-0 top-0 h-full w-full cursor-grab opacity-30"
>
  <!-- Grid -->
  {#each horizontalGridLines as horizontalLine}
    <line
      x1={horizontalLine.start.x}
      y1={horizontalLine.start.y}
      x2={horizontalLine.end.x}
      y2={horizontalLine.end.y}
      stroke={$theme === 'dark' ? 'white' : 'black'}
      stroke-width="1"
    />
  {/each}
  {#each verticalGridLines as verticalLine}
    <line
      x1={verticalLine.start.x}
      y1={verticalLine.start.y}
      x2={verticalLine.end.x}
      y2={verticalLine.end.y}
      stroke={$theme === 'dark' ? 'white' : 'black'}
      stroke-width="1"
    />
  {/each}
  <!-- Axis -->
  {#each verticalAxis as axis}
    <text x={axis.position.x} y={axis.position.y} fill={$theme === 'dark' ? 'white' : 'black'}>
      {axis.value}
    </text>
  {/each}
  {#each horizontalAxis as axis}
    <text x={axis.position.x} y={axis.position.y} fill={$theme === 'dark' ? 'white' : 'black'}>
      {axis.value}
    </text>
  {/each}
  <slot />
</svg>
