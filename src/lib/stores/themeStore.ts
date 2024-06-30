import type { Writable } from 'svelte/store'
import { get, writable } from 'svelte/store'

// Create a writable store with a default value
export const theme: Writable<string> = writable('light') // default theme

// This function will be called in $layout.svelte to initialize the theme
export function initTheme() {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme')
    theme.set(storedTheme ?? 'light')
    applyThemeClass(get(theme))
  }
}

// Apply the actual theme class to the document element
function applyThemeClass(value: string) {
  if (value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Reactively update and store the theme selection
theme.subscribe(value => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', value)
    applyThemeClass(value)
  }
})
