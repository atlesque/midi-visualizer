/**
 * Application service: manages loaded MIDI files.
 * Orchestrates parsing, state, and track visibility.
 */
import { computed, ref } from 'vue'
import type { MidiParserPort } from '~/composables/domain/midi-parser'
import type { MidiFileEntry } from '~/composables/domain/types'

/** Singleton reactive state */
const files = ref<MidiFileEntry[]>([])
const selectedIndex = ref<number | null>(null)

export function useMidiFiles(parser?: MidiParserPort) {
  const fileCount = computed(() => files.value.length)
  const selectedFile = computed(() =>
    selectedIndex.value !== null ? files.value[selectedIndex.value] ?? null : null,
  )
  const visibleFiles = computed(() => files.value.filter(f => f.visible))

  async function addFile(name: string, arrayBuffer: ArrayBuffer) {
    if (!parser) {
      console.warn('[useMidiFiles] No parser provided — skipping parse')
      return
    }
    // Prevent duplicates by name
    if (files.value.some(f => f.name === name)) return

    const data = await parser.parse(name, arrayBuffer)
    const entry: MidiFileEntry = {
      name,
      loadedAt: new Date(),
      data,
      visible: true,
    }
    files.value.push(entry)
    if (selectedIndex.value === null) {
      selectedIndex.value = 0
    }
  }

  function removeFile(index: number) {
    files.value.splice(index, 1)
    if (selectedIndex.value !== null && selectedIndex.value >= files.value.length) {
      selectedIndex.value = files.value.length - 1
    }
  }

  function toggleVisibility(index: number) {
    const file = files.value[index]
    if (file) file.visible = !file.visible
  }

  function clearAll() {
    files.value = []
    selectedIndex.value = null
  }

  function selectFile(index: number) {
    selectedIndex.value = selectedIndex.value === index ? null : index
  }

  return {
    files,
    fileCount,
    selectedFile,
    selectedIndex,
    visibleFiles,
    addFile,
    removeFile,
    toggleVisibility,
    clearAll,
    selectFile,
  }
}
