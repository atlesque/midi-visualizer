/**
 * Infrastructure: MIDI parser using Tone.js.
 * Adapts Tone's Midi class into our domain model.
 */
import * as Tone from 'tone'
import type { MidiParserPort } from '~/composables/domain/midi-parser'
import type { MidiData, MidiMeta, Note, Track } from '~/composables/domain/types'

/** Convert MIDI note number to name (e.g. 60 → "C4") */
function noteNumberToName(note: number): string {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(note / 12) - 1
  return `${notes[note % 12]}${octave}`
}

export const toneMidiParser: MidiParserPort = {
  async parse(_fileName: string, arrayBuffer: ArrayBuffer): Promise<MidiData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const midi = await (Tone.Midi as any).fromUrl(
      URL.createObjectURL(new Blob([arrayBuffer], { type: 'audio/midi' })),
    )

    const header = midi.header
    const bpm = header.bpm ?? 120
    const timeSig = header.timeSignature ?? [4, 4]

    // Compute total duration from all tracks
    let maxTime = 0

    const tracks: Track[] = midi.tracks.map((track: any, index: number) => {
      const notes: Note[] = track.notes.map((n: any) => {
        const end = n.time + n.duration
        if (end > maxTime) maxTime = end
        return {
          pitch: n.midi,
          name: noteNumberToName(n.midi),
          time: n.time,
          duration: n.duration,
          velocity: Math.round(n.velocity),
          channel: n.channel ?? 0,
        }
      })

      return {
        id: index,
        name: track.name || `Track ${index + 1}`,
        channel: track.channel ?? 0,
        notes,
        program: track.instrument?.number ?? 0,
      }
    })

    const meta: MidiMeta = {
      bpm,
      timeSignatureUpper: timeSig[0],
      timeSignatureLower: timeSig[1],
      duration: maxTime,
      title: header.name || undefined,
    }

    return { meta, tracks }
  },
}
