<script lang="ts">
  export let color: string = '#FFFFFF'

  let red: number = 255
  let green: number = 255
  let blue: number = 255
  let hue: number = 0

  const updateColor = (r: number, g: number, b: number) => {
    red = r
    green = g
    blue = b
    color = `rgb(${r}, ${g}, ${b})`
  }

  const convertToHexadecimal = () => {
    color = `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`
  }

  const updateHue = () => {
    // Update the palette colors based on the hue
  }

  const pickColor = (event: MouseEvent) => {
    const rect = (event.target as HTMLDivElement).getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Assume the div is 256x256 for simplicity
    const saturation = (x / 256) * 100
    const lightness = 100 - (y / 256) * 100

    const hslToRgb = (h: number, s: number, l: number) => {
      s /= 100
      l /= 100
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l - c / 2
      let r = 0,
        g = 0,
        b = 0
      if (h >= 0 && h < 60) {
        r = c
        g = x
        b = 0
      } else if (h >= 60 && h < 120) {
        r = x
        g = c
        b = 0
      } else if (h >= 120 && h < 180) {
        r = 0
        g = c
        b = x
      } else if (h >= 180 && h < 240) {
        r = 0
        g = x
        b = c
      } else if (h >= 240 && h < 300) {
        r = x
        g = 0
        b = c
      } else if (h >= 300 && h < 360) {
        r = c
        g = 0
        b = x
      }
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      return [r, g, b]
    }

    const [r, g, b] = hslToRgb(hue, saturation, lightness)
    updateColor(r, g, b)
  }

  const dragStart = (event: MouseEvent) => {
    event.preventDefault()
    window.addEventListener('mousemove', pickColor)
    window.addEventListener('mouseup', dragEnd)
  }
  const dragEnd = (event: MouseEvent) => {
    window.removeEventListener('mousemove', pickColor)
    window.removeEventListener('mouseup', dragEnd)
  }
</script>

<div class="flex">
  <div class="relative size-32 border border-gray-300" on:click={pickColor} on:mousedown={dragStart}>
    <div class="absolute z-10 h-full w-full bg-gradient-to-tr from-white to-transparent"></div>
    <div class="absolute z-10 h-full w-full bg-gradient-to-t from-black to-transparent opacity-50"></div>
    <div class="absolute z-20 h-full w-full mix-blend-multiply" style="background: hsl({hue}, 100%, 50%);"></div>
  </div>
  <div>
    <label for="hue">Hue: {hue}</label>
    <input name="hue" type="range" min="0" max="360" bind:value={hue} on:input={updateHue} />
    <div>
      <label for="red">Red: {red}</label>
      <input
        name="red"
        type="range"
        min="0"
        max="255"
        bind:value={red}
        on:input={convertToHexadecimal}
        class="w-full"
      />
    </div>
    <div>
      <label for="green">Green: {green}</label>
      <input
        name="green"
        type="range"
        min="0"
        max="255"
        bind:value={green}
        on:input={convertToHexadecimal}
        class="w-full"
      />
    </div>
    <div>
      <label for="blue">Blue: {blue}</label>
      <input
        name="blue"
        type="range"
        min="0"
        max="255"
        bind:value={blue}
        on:input={convertToHexadecimal}
        class="w-full"
      />
    </div>
    <div class="size-8" style={`background-color: rgb(${red}, ${green}, ${blue});`}></div>
  </div>
</div>
