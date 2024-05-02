<script lang="ts">
  import type { Coordinate } from './graph.svelte'

  export let data: {
    moveArea: {
      start: Coordinate
      end: Coordinate
    }
    position: {
      start: Coordinate
      end: Coordinate
    }
  }
</script>

<line
  x1={data.position.start.x}
  y1={data.position.start.y}
  x2={data.position.end.x}
  y2={data.position.end.y}
  stroke="red"
  stroke-width="2"
/>
