/**
 * Infrastructure: MIDI parser using @tonejs/midi.
 * Adapts @tonejs/midi's parsed structure into our domain model.
 */
import { Midi } from '@tonejs/midi'
import type { MidiParserPort } from '~/composables/domain/midi-parser'
import type { MidiData, MidiMeta, Note, Track } from '~/composables/domain/types'

export const toneMidiParser: MidiParserPort = {
  async parse(_fileName: string, arrayBuffer: ArrayBuffer): Promise<MidiData> {
    const midi = new Midi(arrayBuffer)

    const header = midi.header
    const bpm = header.tempos[0]?.bpm ?? 120
    const timeSig = header.timeSignatures[0]?.timeSignature ?? [4, 4]

    const tracks: Track[] = midi.tracks.map((track, index: number) => {
      const notes: Note[] = track.notes.map((n) => ({
        pitch: n.midi,
        name: n.name,
        time: n.time,
        duration: n.duration,
        velocity: Math.round(n.velocity * 127),
        channel: track.channel,
      }))

      return {
        id: index,
        name: track.name || `Track ${index + 1}`,
        channel: track.channel,
        notes,
        program: track.instrument.number ?? 0,
      }
    })

    const meta: MidiMeta = {
      bpm,
      timeSignatureUpper: timeSig[0] ?? 4,
      timeSignatureLower: timeSig[1] ?? 4,
      duration: midi.duration,
      title: header.name || undefined,
    }

    return { meta, tracks }
  },
}
