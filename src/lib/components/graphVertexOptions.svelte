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
  class={`absolute z-20 rounded-xl bg-gradient-to-tr from-gray-50 to-gray-200 px-4 py-2 shadow-md transition ${isOpen ? 'scale-100 rounded-none' : 'scale-0 rounded-full'}`}
  style={`top: ${offset}px`}
>
  <h1 class="text-center text-xl">Options - {vertex.name}</h1>
  <div class="flex">
    <div class="flex w-40 flex-col gap-y-1">
      <div>
        <label
          for="name"
          class="relative flex w-fit items-center justify-start gap-x-1 rounded-lg border-2 border-green-400 px-1.5 py-1 text-green-600 after:border-2"
        >
          <p class="absolute -top-4 rounded-md bg-gray-100 px-1">Name</p>
          <input
            class="w-full rounded-md bg-transparent focus-within:outline-none"
            type="text"
            name="name"
            id="name"
            autocomplete="off"
            on:input={e => (vertex.name = e.currentTarget.value)}
            value={vertex.name}
          />
        </label>
      </div>
      <div>
        <label
          for="value"
          class="relative flex w-fit items-center justify-start gap-x-1 rounded-lg border-2 border-purple-400 px-1.5 py-1"
        >
          <p class="absolute -top-4 bg-transparent">Value</p>
          <input
            class="w-16 rounded-md bg-transparent focus-within:outline-none"
            type="number"
            name="value"
            id="value"
            autocomplete="off"
            on:input={e => (vertex.value = Number(e.currentTarget.value))}
            value={vertex.value}
          />
        </label>
      </div>
    </div>
    <ColorPicker bind:color={vertex.style.backgroundColor} />
  </div>
  <div class="flex items-center justify-between">
    <button on:click={deleteVertexFn}>Delete</button>
    <button on:click={() => (isOpen = false)}>Close</button>
  </div>
</div>
