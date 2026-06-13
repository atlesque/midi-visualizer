/**
 * Domain types for MIDI data representation.
 * These are pure data structures — no framework or rendering dependencies.
 */

/** A single note event */
export interface Note {
  /** MIDI note number (0–127) */
  pitch: number
  /** Note name (e.g. "C4") */
  name: string
  /** Start time in seconds */
  time: number
  /** Duration in seconds */
  duration: number
  /** Velocity (0–127) */
  velocity: number
  /** MIDI channel (0–15) */
  channel: number
}

/** A named track containing notes */
export interface Track {
  /** Track index */
  id: number
  /** Instrument or track name */
  name: string
  /** MIDI channel */
  channel: number
  /** Note events */
  notes: Note[]
  /** Program number (instrument) */
  program: number
}

/** Metadata about a MIDI file */
export interface MidiMeta {
  /** Tempo in BPM */
  bpm: number
  /** Time signature numerator */
  timeSignatureUpper: number
  /** Time signature denominator */
  timeSignatureLower: number
  /** Total duration in seconds */
  duration: number
  /** Song title from metadata, if any */
  title?: string
}

/** Fully parsed MIDI document */
export interface MidiData {
  meta: MidiMeta
  tracks: Track[]
}

/** A loaded file with its parsed data */
export interface MidiFileEntry {
  /** File name */
  name: string
  /** Timestamp loaded */
  loadedAt: Date
  /** Parsed MIDI data */
  data: MidiData
  /** Whether the track is visible in the visualization */
  visible: boolean
}
