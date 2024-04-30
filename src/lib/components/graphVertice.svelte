<script lang="ts">
  export let data: {
    moveArea: {
      start: {
        x: number
        y: number
      }
      end: {
        x: number
        y: number
      }
    }
  }

  let vertice: HTMLButtonElement | null = null
  let isAttached = false

  function onVerticeClick(event: MouseEvent) {
    if (!vertice || typeof window === 'undefined') return

    if (isAttached) {
      window.removeEventListener('mousemove', moveVertice)
      isAttached = false
    } else {
      window.addEventListener('mousemove', moveVertice)
      isAttached = true
    }
  }

  function moveVertice(event: MouseEvent) {
    if (!vertice) return
    vertice.style.position = 'fixed'

    let rect = vertice.getBoundingClientRect()

    let center = {
      x: event.clientX - rect.width / 2,
      y: event.clientY - rect.height / 2,
    }

    vertice.style.left = center.x + 'px'
    vertice.style.top = center.y + 'px'
  }
</script>

<button
  bind:this={vertice}
  on:click={onVerticeClick}
  class="flex h-10 w-10 items-center justify-center rounded-full bg-red-300"
  style="position: absolute; left: 0; top: 0;"
>
  <div>A</div>
</button>
