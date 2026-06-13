<template>
  <div
    class="drop-zone"
    :class="{
      'drop-zone--active': isDragging,
      'drop-zone--full': !hasFiles,
      'drop-zone--drag-over': isDraggingOver,
    }"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
    @click="onClick"
  >
    <!-- Empty state -->
    <div v-if="!hasFiles" class="drop-zone__empty">
      <div class="drop-zone__icon" :class="{ 'drop-zone__icon--hover': isDraggingOver }">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>
      <h2 class="drop-zone__title">Drop MIDI files here</h2>
      <p class="drop-zone__hint">Drag & drop your files onto this area, or click anywhere to browse</p>
      <p class="drop-zone__sub">Supports .mid and .midi</p>
    </div>

    <!-- Compact bar when files already loaded -->
    <div v-else class="drop-zone__bar" :class="{ 'drop-zone__bar--drag-over': isDraggingOver }">
      <div class="drop-zone__bar-content">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Drop MIDI files here or <strong>click to browse</strong></span>
      </div>
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
import { ref } from 'vue';

const emit = defineEmits<{
  files: [files: File[]]
}>()

defineProps<{
  hasFiles: boolean
}>()

const isDragging = ref(false)
const isDraggingOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

let dragCounter = 0
let dragEnterTimer: ReturnType<typeof setTimeout> | null = null

function onDragEnter() {
  dragCounter++
  isDragging.value = true
  // Brief delay to avoid flash on child elements
  clearTimeout(dragEnterTimer!)
  isDraggingOver.value = true
}

function onDragOver() {
  isDraggingOver.value = true
}

function onDragLeave() {
  dragCounter--
  if (dragCounter <= 0) {
    dragCounter = 0
    dragEnterTimer = setTimeout(() => {
      isDraggingOver.value = false
      isDragging.value = false
    }, 50)
  }
}

function onDrop(e: DragEvent) {
  dragCounter = 0
  isDragging.value = false
  isDraggingOver.value = false
  clearTimeout(dragEnterTimer!)
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    emit('files', Array.from(files))
  }
}

function onClick() {
  fileInput.value?.click()
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
  border: 2px dashed #5a5a6a;
  border-radius: 16px;
  margin: 20px;
  background: var(--color-surface-alt);
  transition:
    border-color 0.3s ease,
    background-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.3s ease;
}

.drop-zone:hover {
  border-color: #7d7d90;
  background-color: rgba(108, 92, 231, 0.04);
}

.drop-zone--full {
  grid-column: 1 / -1;
  grid-row: 1 / -1;
}

.drop-zone--active {
  background-color: rgba(108, 92, 231, 0.08);
}

.drop-zone--drag-over {
  border-color: var(--color-accent);
  background-color: rgba(108, 92, 231, 0.1);
  transform: scale(1.01);
  box-shadow:
    0 0 30px rgba(108, 92, 231, 0.15),
    inset 0 0 60px rgba(108, 92, 231, 0.05);
  animation: drop-zone-pulse 1.5s ease-in-out infinite;
}

@keyframes drop-zone-pulse {
  0%, 100% {
    box-shadow:
      0 0 30px rgba(108, 92, 231, 0.15),
      inset 0 0 60px rgba(108, 92, 231, 0.05);
  }
  50% {
    box-shadow:
      0 0 50px rgba(108, 92, 231, 0.25),
      inset 0 0 80px rgba(108, 92, 231, 0.08);
  }
}

/* ── Empty state ── */
.drop-zone__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 32px;
  pointer-events: none;
  user-select: none;
}

.drop-zone__icon {
  color: #7a7a85;
  transition:
    color 0.3s ease,
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.drop-zone--drag-over .drop-zone__icon,
.drop-zone__icon--hover {
  color: var(--color-accent);
  transform: translateY(-8px) scale(1.1);
}

.drop-zone__icon svg {
  display: block;
}

.drop-zone__title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #9e9eae;
  transition: color 0.3s ease;
}

.drop-zone--drag-over .drop-zone__title {
  color: var(--color-accent-soft);
}

.drop-zone__hint {
  font-size: 0.875rem;
  color: #6b6b78;
  text-align: center;
  line-height: 1.5;
}

.drop-zone__sub {
  font-size: 0.75rem;
  color: #55555f;
}

/* ── Compact bar (when files already loaded) ── */
.drop-zone__bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border: 1px dashed #5a5a6a;
  border-radius: 8px;
  background: rgba(108, 92, 231, 0.08);
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.drop-zone__bar:hover {
  background: rgba(108, 92, 231, 0.12);
  border-color: #7d7d90;
}

.drop-zone__bar--drag-over {
  background: rgba(108, 92, 231, 0.18);
  border-color: var(--color-accent);
  box-shadow: 0 0 20px rgba(108, 92, 231, 0.2);
}

.drop-zone__bar-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9e9eae;
  font-size: 0.8125rem;
  pointer-events: none;
  user-select: none;
  transition: color 0.25s ease;
}

.drop-zone__bar:hover .drop-zone__bar-content {
  color: #c5c5d0;
}

.drop-zone__bar--drag-over .drop-zone__bar-content {
  color: var(--color-accent-soft);
}

.drop-zone__bar-content strong {
  color: var(--color-accent);
  font-weight: 600;
  transition: color 0.2s ease;
}

.drop-zone__bar:hover .drop-zone__bar-content strong {
  color: #8b7cf7;
}

.drop-zone__bar-content svg {
  flex-shrink: 0;
  opacity: 0.9;
  transition: opacity 0.25s ease;
}

.drop-zone__bar:hover .drop-zone__bar-content svg {
  opacity: 1;
}

.drop-zone__bar--drag-over .drop-zone__bar-content svg {
  opacity: 1;
  color: var(--color-accent);
}

/* ── Hidden file input ── */
.drop-zone__input {
  display: none;
}
</style>
