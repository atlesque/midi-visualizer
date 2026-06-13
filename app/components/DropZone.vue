<template>
  <div
    class="drop-zone"
    :class="{ 'drop-zone--active': isDragging, 'drop-zone--full': !hasFiles }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <div v-if="!hasFiles" class="drop-zone__empty">
      <div class="drop-zone__icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 16V4m0 0L8 8m4-4l4 4" />
          <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
        </svg>
      </div>
      <h2 class="drop-zone__title">Drop MIDI files here</h2>
      <p class="drop-zone__sub">or click to browse — supports .mid and .midi</p>
    </div>
    <div v-else class="drop-zone__overlay" :class="{ 'drop-zone__overlay--visible': isDragging }">
      <span>Drop to add more files</span>
    </div>
    <input
      ref="fileInput"
      type="file"
      accept=".mid,.midi"
      multiple
      class="drop-zone__input"
      @change="onInputChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  files: [files: File[]]
}>()

defineProps<{
  hasFiles: boolean
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

let dragCounter = 0

function onDragEnter() {
  dragCounter++
  isDragging.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    isDragging.value = false
  }
}

function onDrop(e: DragEvent) {
  dragCounter = 0
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('files', Array.from(files))
  }
}

function onInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('files', Array.from(target.files))
  }
  // Reset so the same file can be re-selected
  target.value = ''
}
</script>

<style scoped>
.drop-zone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.drop-zone--full {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}

.drop-zone--active {
  background-color: rgba(108, 92, 231, 0.08);
}

.drop-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.3);
}

.drop-zone__icon {
  opacity: 0.4;
}

.drop-zone__title {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.drop-zone__sub {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.25);
}

.drop-zone__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(108, 92, 231, 0.1);
  border: 2px dashed var(--color-accent);
  border-radius: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  font-weight: 500;
  color: var(--color-accent-soft);
}

.drop-zone__overlay--visible {
  opacity: 1;
}

.drop-zone__input {
  display: none;
}
</style>
