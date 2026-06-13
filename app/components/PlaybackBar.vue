<template>
  <div class="playback-bar">
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
  timeRange: number
}>()

defineEmits<{
  'update:timeRange': [value: number]
}>()
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
