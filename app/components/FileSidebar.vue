<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <h3 class="sidebar__title">Files</h3>
      <button
        v-if="files.length > 0"
        class="sidebar__clear"
        @click="$emit('clear')"
      >
        Clear all
      </button>
    </div>

    <TransitionGroup name="file-list" tag="ul" class="sidebar__list">
      <li
        v-for="(file, index) in files"
        :key="file.name"
        class="sidebar__item"
        :class="{ 'sidebar__item--selected': selectedIndex === index }"
        @click="$emit('select', index)"
      >
        <div class="sidebar__item-info">
          <span class="sidebar__item-name">{{ file.name }}</span>
          <span class="sidebar__item-meta">
            {{ file.data.tracks.length }} tracks · {{ formatDuration(file.data.meta.duration) }}
          </span>
        </div>
        <div class="sidebar__item-actions">
          <button
            class="sidebar__vis-toggle"
            :class="{ 'sidebar__vis-toggle--off': !file.visible }"
            :title="file.visible ? 'Hide' : 'Show'"
            @click.stop="$emit('toggle', index)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="file.visible" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle v-if="file.visible" cx="12" cy="12" r="3" />
              <path v-else d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
            </svg>
          </button>
          <button
            class="sidebar__remove"
            title="Remove"
            @click.stop="$emit('remove', index)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </li>
    </TransitionGroup>

    <div v-if="files.length === 0" class="sidebar__empty">
      No files loaded
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { MidiFileEntry } from '~/composables/domain/types'

defineProps<{
  files: MidiFileEntry[]
  selectedIndex: number | null
}>()

defineEmits<{
  select: [index: number]
  remove: [index: number]
  toggle: [index: number]
  clear: []
}>()

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  min-width: 260px;
  background: var(--color-surface-alt);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.sidebar__title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.5);
}

.sidebar__clear {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.15s;
}

.sidebar__clear:hover {
  color: #e17055;
}

.sidebar__list {
  list-style: none;
  overflow-y: auto;
  flex: 1;
  padding: 8px;
}

.sidebar__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s;
  margin-bottom: 4px;
}

.sidebar__item:hover {
  background: var(--color-surface-hover);
}

.sidebar__item--selected {
  background: rgba(108, 92, 231, 0.12);
}

.sidebar__item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.sidebar__item-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar__item-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

.sidebar__item-actions {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.sidebar__vis-toggle,
.sidebar__remove {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.3);
  transition: color 0.15s, background-color 0.15s;
}

.sidebar__vis-toggle:hover {
  color: var(--color-accent-soft);
  background: rgba(108, 92, 231, 0.1);
}

.sidebar__vis-toggle--off {
  color: rgba(255, 255, 255, 0.1);
}

.sidebar__remove:hover {
  color: #e17055;
  background: rgba(225, 112, 85, 0.1);
}

.sidebar__empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.2);
}

.file-list-enter-active,
.file-list-leave-active {
  transition: all 0.25s ease;
}

.file-list-enter-from,
.file-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
