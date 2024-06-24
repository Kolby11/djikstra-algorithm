<script lang="ts">
  import type { EventHandler } from 'svelte/elements'
  import ColorPicker from './colorPicker.svelte'
  import type { Vertex } from './graphVertex.svelte'

  export let vertex: Vertex
  export let offset: number
  export let isOpen = false

  export let deleteVertexFn: EventHandler = () => {
    throw new Error('Delete function not implemented')
  }
</script>

<div
  class={`absolute z-50 rounded-xl bg-white px-4 py-2 shadow-md transition ${isOpen ? 'scale-100 rounded-none' : 'scale-0 rounded-full'}`}
  style={`top: ${offset}px`}
>
  <h1 class="text-center text-xl">Options - {vertex.name}</h1>
  <ColorPicker />
  <input type="text" on:input={e => (vertex.name = e.currentTarget.value)} value={vertex.name} />
  <div class="flex items-center justify-between">
    <button on:click={deleteVertexFn}>Delete</button>
    <button on:click={() => (isOpen = false)}>Close</button>
  </div>
</div>
