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
          <DropZone
            :has-files="true"
            class="app-layout__drop-bar"
            @files="handleFiles"
          />
          <VizCanvas
            :files="midiFiles.visibleFiles.value"
            :has-files="true"
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

.app-layout__drop-bar {
  flex-shrink: 0;
  margin: 0;
  min-height: 48px;
}
</style>
