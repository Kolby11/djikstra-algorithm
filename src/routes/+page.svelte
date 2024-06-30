<script>
  import Graph from '$lib/components/graph.svelte'
  import ThemeToggleButton from '$lib/components/themeToggleButton.svelte'
</script>

<main class="flex h-fit min-h-screen flex-col items-center justify-start dark:bg-gray-950 dark:text-white">
  <h1 class="py-4 text-2xl font-semibold">Graph-it</h1>
  <ThemeToggleButton />
  <div class="h-[50vh] w-full">
    <Graph />
  </div>
</main>
