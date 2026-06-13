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
          @files="handleFiles"
        />
        <div class="app-layout__main">
          <div class="app-layout__top-bar">
            <UTabs
              v-model="viewMode"
              :items="viewTabs"
              variant="link"
              color="primary"
              size="md"
              :content="false"
              class="app-layout__view-toggle"
            />
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
            :selected-file-name="midiFiles.selectedFile.value?.name ?? null"
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
import { ref, watch } from "vue";
import { useMidiFiles } from "~/composables/useMidiFiles";
import { toneMidiParser } from "~/utils/midi";

const midiFiles = useMidiFiles(toneMidiParser);
const isPlaying = ref(false);
const timeRange = ref(30);
const scrollOffset = ref(0);
const hasFiles = ref(false);
const viewMode = ref<"tracks" | "piano">("piano");

const viewTabs = [
  { label: "Tracks", icon: "i-lucide-list", value: "tracks" },
  { label: "Piano", icon: "i-lucide-music", value: "piano" },
];
watch(midiFiles.fileCount, (count) => {
  hasFiles.value = count > 0;
});

async function handleFiles(files: File[]) {
  const midiFiles_ = files.filter(
    (f) => f.name.endsWith(".mid") || f.name.endsWith(".midi"),
  );

  for (const file of midiFiles_) {
    const buffer = await file.arrayBuffer();
    await midiFiles.addFile(file.name, buffer);
  }

  // Autozoom: fit the entire MIDI duration to the canvas width
  autoZoomToFit();
}

/** Set timeRange to the max duration across all loaded files */
function autoZoomToFit() {
  if (midiFiles.files.value.length === 0) return;
  const maxDuration = Math.max(
    ...midiFiles.files.value.map((f) => f.data.meta.duration),
  );
  if (maxDuration > 0) {
    timeRange.value = Math.ceil(maxDuration);
    scrollOffset.value = 0;
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value;
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

.app-layout__top-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.app-layout__view-toggle {
  flex-shrink: 0;
}
</style>
