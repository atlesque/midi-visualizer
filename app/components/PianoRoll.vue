<template>
  <div
    ref="containerRef"
    class="piano-roll-wrapper"
    :class="{ 'piano-roll-wrapper--drag-over': isDraggingOver }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <canvas
      ref="canvasRef"
      class="piano-roll-canvas"
    />

    <!-- Empty state -->
    <div v-if="!hasFiles" class="piano-roll__empty">
      <DropZone :has-files="false" @files="$emit('files', $event)" />
    </div>

    <!-- Drag overlay when files already loaded -->
    <div
      v-if="hasFiles"
      class="piano-roll__drag-overlay"
      :class="{ 'piano-roll__drag-overlay--visible': isDraggingOver }"
    >
      <div class="piano-roll__drag-content">
        <UIcon name="i-lucide-upload" class="size-9" />
        <span>Drop MIDI files to add</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { MidiFileEntry } from '~/composables/domain/types';
import {
    computePitchRange,
    drawPianoRoll,
    setupPianoCanvas,
    type PianoRollConfig,
} from '~/utils/piano-roll';

const props = defineProps<{
  files: MidiFileEntry[]
  hasFiles: boolean
  timeRange?: number
  scrollOffset?: number
}>()

const emit = defineEmits<{
  files: [files: File[]]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDraggingOver = ref(false)
let resizeObserver: ResizeObserver | null = null
let dragCounter = 0

const TRACK_COLORS = [
  '#6c5ce7', '#00b894', '#fdcb6e', '#e17055',
  '#0984e3', '#fd79a8', '#00cec9', '#d63031',
  '#a29bfe', '#55efc4', '#ffeaa7', '#fab1a0',
  '#74b9ff', '#ff7675', '#81ecec', '#ff6b6b',
]

// ── Drag handlers ──────────────────────────────────────────

function onDragEnter() {
  dragCounter++
  isDraggingOver.value = true
}

function onDragOver() {
  isDraggingOver.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDraggingOver.value = false
  }
}

function onDrop(e: DragEvent) {
  dragCounter = 0
  isDraggingOver.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('files', Array.from(files))
  }
}

// ── Rendering ──────────────────────────────────────────────

function render() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  const width = rect.width
  const height = rect.height
  const dpr = window.devicePixelRatio || 1

  const ctx = setupPianoCanvas(canvas, width, height)

  // Flatten all visible tracks
  const allTracks = props.files.flatMap(f => f.data.tracks)
  const meta = props.files[0]?.data.meta

  if (!meta || allTracks.length === 0) {
    ctx.clearRect(0, 0, width, height)
    return
  }

  const pitchRange = computePitchRange(allTracks)

  const config: PianoRollConfig = {
    width,
    height,
    dpr,
    timeRange: props.timeRange ?? 30,
    scrollOffset: props.scrollOffset ?? 0,
    trackColors: TRACK_COLORS,
    pitchMin: pitchRange.min,
    pitchMax: pitchRange.max,
  }

  drawPianoRoll(ctx, allTracks, meta, config)
}

function scheduleRender() {
  if (props.hasFiles) {
    requestAnimationFrame(() => render())
  }
}

watch(() => props.files, scheduleRender, { deep: true })
watch(() => props.timeRange, scheduleRender)
watch(() => props.scrollOffset, scheduleRender)

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => scheduleRender())
    resizeObserver.observe(containerRef.value)
  }
  scheduleRender()
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.piano-roll-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
  background: #0f0f13;
  transition: filter 0.3s ease;
}

.piano-roll-wrapper--drag-over {
  filter: brightness(0.7);
}

.piano-roll-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.piano-roll__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* ── Drag overlay ── */
.piano-roll__drag-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  z-index: 20;
}

.piano-roll__drag-overlay--visible {
  opacity: 1;
  pointer-events: auto;
}

.piano-roll__drag-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 56px;
  border: 2px dashed var(--color-accent);
  border-radius: 16px;
  background: rgba(15, 15, 17, 0.9);
  backdrop-filter: blur(8px);
  color: var(--color-accent-soft);
  font-size: 1.1rem;
  font-weight: 500;
  animation: pr-drag-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 40px rgba(108, 92, 231, 0.2);
}

@keyframes pr-drag-in {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.piano-roll__drag-content :deep(svg) {
  flex-shrink: 0;
}
</style>
