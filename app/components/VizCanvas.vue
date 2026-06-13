<template>
  <div ref="containerRef" class="viz-canvas-wrapper">
    <canvas
      ref="canvasRef"
      class="viz-canvas"
    />
    <div v-if="!hasFiles" class="viz-canvas__empty">
      <DropZone :has-files="false" @files="$emit('files', $event)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { MidiFileEntry } from '~/composables/domain/types'
import { useVisualization } from '~/composables/useVisualization'

const props = defineProps<{
  files: MidiFileEntry[]
  hasFiles: boolean
}>()

defineEmits<{
  files: [files: File[]]
}>()

const containerRef = ref<HTMLDivElement | null>(null)
const { canvasRef, render } = useVisualization()
let resizeObserver: ResizeObserver | null = null

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
</style>
