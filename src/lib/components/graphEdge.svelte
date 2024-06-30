<script lang="ts">
  import type { Coordinate, Edge } from './graph.svelte'

  export let moveArea: {
    start: Coordinate
    end: Coordinate
  }

  export let edge: Edge

  $: console.log(edge.start.coordinates)
</script>

<line
  x1={edge.start.elementRef?.getBoundingClientRect().x}
  y1={edge.start.elementRef?.getBoundingClientRect().y}
  x2={edge.end.elementRef?.getBoundingClientRect().x}
  y2={edge.end.elementRef?.getBoundingClientRect().y}
  stroke="red"
  stroke-width="2"
/>
