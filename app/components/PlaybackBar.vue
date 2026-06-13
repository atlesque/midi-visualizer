<template>
  <div class="playback-bar">
    <div class="playback-bar__controls">
      <UButton
        :icon="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'"
        :color="isPlaying ? 'neutral' : 'primary'"
        variant="solid"
        size="sm"
        square
        @click="$emit('togglePlay')"
      />
    </div>

    <div class="playback-bar__time">
      <span class="playback-bar__time-label">{{ formatTime(scrollOffset) }}</span>
    </div>

    <div class="playback-bar__zoom">
      <span class="playback-bar__zoom-label">{{ timeRange }}s</span>
      <USlider
        :model-value="timeRange"
        :min="5"
        :max="120"
        size="sm"
        class="playback-bar__slider"
        @update:model-value="$emit('update:timeRange', $event as number)"
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
  width: 100px;
}
</style>
