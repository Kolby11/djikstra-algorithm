<script>
  import { initTheme } from '$lib/stores/themeStore'
  import { onMount } from 'svelte'
  import '../app.css'

  onMount(() => {
    initTheme()
  })
</script>

<slot />
