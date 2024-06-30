<script lang="ts">
  import { theme } from '$lib/stores/themeStore'

  const toggleTheme = () => {
    theme.update(current => (current === 'light' ? 'dark' : 'light'))
  }
</script>

<button on:click={toggleTheme}> {$theme.slice(0, 1).toUpperCase().concat($theme.slice(1))}</button>
