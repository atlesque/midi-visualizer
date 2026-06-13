<template>
  <UApp>
    <div class="app-layout">
      <template v-if="hasFiles">
        <FileSidebar
          :files="midiFiles.files.value"
          :selected-index="midiFiles.selectedIndex.value"
          @select="midiFiles.selectFile"
          @remove="midiFiles.removeFile"
          @toggle="midiFiles.toggleVisibility"
          @clear="midiFiles.clearAll"
        />
        <div class="app-layout__main">
          <div class="app-layout__top-bar">
            <button class="app-layout__upload-btn" @click="openFilePicker">
              <UIcon name="i-lucide-upload" class="size-4" />
              <span>Upload</span>
            </button>
            <input
              ref="fileInputRef"
              type="file"
              accept=".mid,.midi"
              multiple
              class="app-layout__file-input"
              @change="onFileInputChange"
            />
            <div class="app-layout__view-toggle">
              <UTooltip text="Track view">
                <UButton
                  :variant="viewMode === 'tracks' ? 'solid' : 'ghost'"
                  size="xs"
                  icon="i-lucide-list"
                  square
                  @click="viewMode = 'tracks'"
                />
              </UTooltip>
              <UTooltip text="Piano roll">
                <UButton
                  :variant="viewMode === 'piano' ? 'solid' : 'ghost'"
                  size="xs"
                  icon="i-lucide-music"
                  square
                  @click="viewMode = 'piano'"
                />
              </UTooltip>
            </div>
          </div>
          <VizCanvas
            v-if="viewMode === 'tracks'"
            :files="midiFiles.visibleFiles.value"
            :has-files="true"
            :time-range="timeRange"
            @files="handleFiles"
          />
          <PianoRoll
            v-else
            :files="midiFiles.visibleFiles.value"
            :has-files="true"
            :time-range="timeRange"
            :scroll-offset="scrollOffset"
            @files="handleFiles"
          />
          <PlaybackBar
            :is-playing="isPlaying"
            :time-range="timeRange"
            :scroll-offset="scrollOffset"
            @toggle-play="togglePlay"
            @update:time-range="timeRange = $event"
          />
        </div>
      </template>
      <DropZone
        v-else
        :has-files="false"
        class="app-layout__empty"
        @files="handleFiles"
      />
    </div>
  </UApp>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMidiFiles } from '~/composables/useMidiFiles'
import { toneMidiParser } from '~/utils/midi'

const midiFiles = useMidiFiles(toneMidiParser)
const isPlaying = ref(false)
const timeRange = ref(30)
const scrollOffset = ref(0)
const hasFiles = ref(false)
const viewMode = ref<'tracks' | 'piano'>('piano')
const fileInputRef = ref<HTMLInputElement | null>(null)

function openFilePicker() {
  fileInputRef.value?.click()
}

function onFileInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files
  if (files && files.length > 0) {
    handleFiles(Array.from(files))
    input.value = '' // reset so the same file can be re-selected
  }
}

watch(midiFiles.fileCount, (count) => {
  hasFiles.value = count > 0
})

async function handleFiles(files: File[]) {
  const midiFiles_ = files.filter(
    f => f.name.endsWith('.mid') || f.name.endsWith('.midi'),
  )

  for (const file of midiFiles_) {
    const buffer = await file.arrayBuffer()
    await midiFiles.addFile(file.name, buffer)
  }

  // Autozoom: fit the entire MIDI duration to the canvas width
  autoZoomToFit()
}

/** Set timeRange to the max duration across all loaded files */
function autoZoomToFit() {
  if (midiFiles.files.value.length === 0) return
  const maxDuration = Math.max(
    ...midiFiles.files.value.map(f => f.data.meta.duration),
  )
  if (maxDuration > 0) {
    timeRange.value = Math.ceil(maxDuration)
    scrollOffset.value = 0
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}
</script>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-layout__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.app-layout__empty {
  flex: 1;
}

.app-layout__upload-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.app-layout__upload-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.app-layout__file-input {
  display: none;
}

.app-layout__top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-layout__view-toggle {
  display: flex;
  gap: 4px;
  padding-right: 8px;
  flex-shrink: 0;
}
</style>
