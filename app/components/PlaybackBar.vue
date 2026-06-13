<template>
  <div class="playback-bar">
    <div class="playback-bar__controls">
      <button
        class="playback-bar__btn"
        :title="isPlaying ? 'Pause' : 'Play'"
        @click="$emit('togglePlay')"
      >
        <svg v-if="isPlaying" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="4" width="4" height="16" />
          <rect x="14" y="4" width="4" height="16" />
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </button>
    </div>

    <div class="playback-bar__time">
      <span class="playback-bar__time-label">{{ formatTime(scrollOffset) }}</span>
    </div>

    <div class="playback-bar__zoom">
      <span class="playback-bar__zoom-label">{{ timeRange }}s</span>
      <input
        type="range"
        min="5"
        max="120"
        :value="timeRange"
        class="playback-bar__slider"
        @input="$emit('update:timeRange', Number(($event.target as HTMLInputElement).value))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPlaying: boolean
  timeRange: number
  scrollOffset: number
}>()

defineEmits<{
  togglePlay: []
  'update:timeRange': [value: number]
}>()

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.playback-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--color-surface-alt);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  height: 48px;
}

.playback-bar__controls {
  display: flex;
  gap: 4px;
}

.playback-bar__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: var(--color-accent);
  color: white;
  cursor: pointer;
  transition: background-color 0.15s;
}

.playback-bar__btn:hover {
  background: var(--color-accent-soft);
}

.playback-bar__time {
  min-width: 40px;
}

.playback-bar__time-label {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.5);
}

.playback-bar__zoom {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.playback-bar__zoom-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  min-width: 30px;
}

.playback-bar__slider {
  width: 80px;
  accent-color: var(--color-accent);
  cursor: pointer;
}
</style>
