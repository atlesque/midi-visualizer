/**
 * Application composable: orchestrates canvas rendering.
 * Bridges Vue reactive state and imperative canvas drawing.
 */
import { ref, watch, onUnmounted } from 'vue'
import type { MidiFileEntry } from '~/composables/domain/types'
import { drawMidiVisualization, setupCanvas, type DrawConfig } from '~/utils/canvas'

export function useVisualization() {
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  const timeRange = ref(30) // seconds visible
  const scrollOffset = ref(0)
  const isPlaying = ref(false)
  let animFrameId: number | null = null
  let currentTime = 0

  const TRACK_COLORS = [
    '#6c5ce7', '#00b894', '#fdcb6e', '#e17055',
    '#0984e3', '#fd79a8', '#00cec9', '#d63031',
  ]

  /** Render the current state of all visible files */
  function render(files: MidiFileEntry[]) {
    const canvas = canvasRef.value
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const dpr = window.devicePixelRatio || 1

    const ctx = setupCanvas(canvas, width, height)

    // Flatten all visible tracks
    const allTracks = files.flatMap(f => f.data.tracks)
    const meta = files[0]?.data.meta

    if (!meta || allTracks.length === 0) {
      ctx.clearRect(0, 0, width, height)
      return
    }

    const config: DrawConfig = {
      width,
      height,
      dpr,
      timeRange: timeRange.value,
      scrollOffset: scrollOffset.value,
      trackColors: TRACK_COLORS,
    }

    drawMidiVisualization(ctx, allTracks, meta, config)
  }

  /** Start playback animation */
  function play() {
    isPlaying.value = true
    const startTime = performance.now()
    const initialOffset = scrollOffset.value

    function tick() {
      const elapsed = (performance.now() - startTime) / 1000
      currentTime = initialOffset + elapsed
      scrollOffset.value = currentTime

      if (currentTime >= timeRange.value) {
        scrollOffset.value = currentTime
      }

      if (isPlaying.value) {
        animFrameId = requestAnimationFrame(tick)
      }
    }

    animFrameId = requestAnimationFrame(tick)
  }

  /** Stop playback */
  function stop() {
    isPlaying.value = false
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId)
      animFrameId = null
    }
  }

  /** Toggle play/pause */
  function togglePlay() {
    if (isPlaying.value) stop()
    else play()
  }

  onUnmounted(() => {
    stop()
  })

  return {
    canvasRef,
    timeRange,
    scrollOffset,
    isPlaying,
    render,
    play,
    stop,
    togglePlay,
  }
}
