<template>
  <aside class="sidebar">
    <div class="sidebar__header">
      <h3 class="sidebar__title">Files</h3>
      <UButton
        v-if="files.length > 0"
        variant="ghost"
        size="xs"
        color="error"
        @click="$emit('clear')"
      >
        Clear all
      </UButton>
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
          <UTooltip :text="file.visible ? 'Hide' : 'Show'">
            <UButton
              icon="i-lucide-eye"
              :variant="file.visible ? 'ghost' : 'soft'"
              size="xs"
              :color="file.visible ? 'neutral' : 'neutral'"
              class="sidebar__action-btn"
              :class="{ 'sidebar__action-btn--off': !file.visible }"
              @click.stop="$emit('toggle', index)"
            />
          </UTooltip>
          <UTooltip text="Remove">
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              size="xs"
              color="neutral"
              class="sidebar__action-btn sidebar__action-btn--danger"
              @click.stop="$emit('remove', index)"
            />
          </UTooltip>
        </div>
      </li>
    </TransitionGroup>

    <div v-if="files.length === 0" class="sidebar__empty">
      No files loaded
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { MidiFileEntry } from '~/composables/domain/types';

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

.sidebar__action-btn {
  padding: 2px;
}

.sidebar__action-btn--off {
  opacity: 0.3;
}

.sidebar__action-btn--danger:hover {
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
