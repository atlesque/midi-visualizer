/**
 * Domain-level interface for MIDI file parsing.
 * The actual implementation is in infrastructure — this defines the contract.
 */
import type { MidiData } from './types'

export interface MidiParserPort {
  /** Parse raw MIDI bytes into domain model */
  parse(fileName: string, arrayBuffer: ArrayBuffer): Promise<MidiData>
}
