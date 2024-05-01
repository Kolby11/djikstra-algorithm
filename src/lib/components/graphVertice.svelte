<script lang="ts">
  import { clamp } from '$lib/utils/math'

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
    event.stopPropagation()
    if (!vertice || typeof window === 'undefined') return

    if (isAttached) {
      detachVertice()
    } else {
      attachVertice()
    }
  }

  function attachVertice() {
    if (!vertice || typeof window === 'undefined') return
    window.addEventListener('mousemove', moveVertice)
    window.addEventListener('click', detachVertice)
    isAttached = true
  }

  function detachVertice() {
    if (!vertice || typeof window === 'undefined') return
    window.removeEventListener('mousemove', moveVertice)
    window.removeEventListener('click', detachVertice)
    isAttached = false
  }

  function moveVertice(event: MouseEvent) {
    if (!vertice) return
    vertice.style.position = 'fixed'

    let rect = vertice.getBoundingClientRect()

    let center = {
      x: clamp(event.clientX - rect.width / 2, data.moveArea.start.x, data.moveArea.end.x - rect.width),
      y: clamp(event.clientY - rect.height / 2, data.moveArea.start.y, data.moveArea.end.y - rect.height),
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
