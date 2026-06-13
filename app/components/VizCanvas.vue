<template>
  <div
    ref="containerRef"
    class="viz-canvas-wrapper"
    :class="{ 'viz-canvas-wrapper--drag-over': isDraggingOver }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <canvas
      ref="canvasRef"
      class="viz-canvas"
    />

    <!-- Empty state drop zone -->
    <div v-if="!hasFiles" class="viz-canvas__empty">
      <DropZone :has-files="false" @files="$emit('files', $event)" />
    </div>

    <!-- Drag overlay when files already loaded -->
    <div v-if="hasFiles" class="viz-canvas__drag-overlay" :class="{ 'viz-canvas__drag-overlay--visible': isDraggingOver }">
      <div class="viz-canvas__drag-content">
        <UIcon name="i-lucide-upload" class="size-9" />
        <span>Drop MIDI files to add</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import type { MidiFileEntry } from '~/composables/domain/types';
import { useVisualization } from '~/composables/useVisualization';

const props = defineProps<{
  files: MidiFileEntry[]
  hasFiles: boolean
  timeRange?: number
}>()

const emit = defineEmits<{
  files: [files: File[]]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const { canvasRef, timeRange: vizTimeRange, render } = useVisualization()
const isDraggingOver = ref(false)
let resizeObserver: ResizeObserver | null = null
let dragCounter = 0

// Sync external timeRange prop into visualization composable
watch(() => props.timeRange, (val) => {
  if (val !== undefined) {
    vizTimeRange.value = val
  }
}, { immediate: true })

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

function scheduleRender() {
  if (props.hasFiles) {
    requestAnimationFrame(() => render(props.files))
  }
}

watch(() => props.files, scheduleRender, { deep: true })

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
.viz-canvas-wrapper {
  position: relative;
  flex: 1;
  overflow: hidden;
  transition: filter 0.3s ease;
}

.viz-canvas-wrapper--drag-over {
  filter: brightness(0.7);
}

.viz-canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.viz-canvas__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* ── Drag overlay (when files already loaded) ── */
.viz-canvas__drag-overlay {
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

.viz-canvas__drag-overlay--visible {
  opacity: 1;
  pointer-events: auto;
}

.viz-canvas__drag-content {
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
  animation: viz-drag-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 40px rgba(108, 92, 231, 0.2);
}

@keyframes viz-drag-in {
  from {
    opacity: 0;
    transform: scale(0.85);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.viz-canvas__drag-content :deep(svg) {
  flex-shrink: 0;
}
</style>
