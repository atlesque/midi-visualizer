/**
 * Infrastructure: Canvas drawing primitives for a Piano Roll visualization.
 *
 * Piano roll maps:
 *   X-axis = time (seconds)
 *   Y-axis = pitch (MIDI note number, high notes at top)
 *   Left gutter = piano keyboard labels
 */
import type { MidiFileEntry, MidiMeta, Note, Track } from '~/composables/domain/types'

export interface PianoRollConfig {
  /** Canvas width in CSS pixels */
  width: number
  /** Canvas height in CSS pixels */
  height: number
  /** Device pixel ratio */
  dpr: number
  /** Time range visible (seconds) */
  timeRange: number
  /** Scroll offset in seconds */
  scrollOffset: number
  /** Colors per track index */
  trackColors: string[]
  /** Lowest MIDI pitch to display (inclusive) */
  pitchMin: number
  /** Highest MIDI pitch to display (inclusive) */
  pitchMax: number
  /** File name whose notes should be highlighted with an outline */
  highlightedFileName?: string | null
}

/** Standard piano key layout: which MIDI notes are white vs black */
const BLACK_KEYS = new Set([1, 3, 6, 8, 10]) // C#, D#, F#, G#, A# within each octave

function isBlackKey(pitch: number): boolean {
  return BLACK_KEYS.has(pitch % 12)
}

/** Return a label like "C4" for a given MIDI pitch */
function pitchLabel(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1
  const noteIndex = pitch % 12
  // Map MIDI note index to name
  const map: Record<number, string> = {
    0: 'C', 1: 'C#', 2: 'D', 3: 'D#', 4: 'E', 5: 'F',
    6: 'F#', 7: 'G', 8: 'G#', 9: 'A', 10: 'A#', 11: 'B',
  }
  return `${map[noteIndex] ?? '?'}${octave}`
}

const PIANO_GUTTER_WIDTH = 64
const DEFAULT_TRACK_COLORS = [
  '#6c5ce7', '#00b894', '#fdcb6e', '#e17055',
  '#0984e3', '#fd79a8', '#00cec9', '#d63031',
  '#a29bfe', '#55efc4', '#ffeaa7', '#fab1a0',
  '#74b9ff', '#ff7675', '#81ecec', '#ff6b6b',
]

/** Draw the full piano roll frame */
export function drawPianoRoll(
  ctx: CanvasRenderingContext2D,
  files: MidiFileEntry[],
  meta: MidiMeta,
  config: PianoRollConfig,
) {
  const { width, height, dpr, timeRange, scrollOffset, trackColors } = config
  const colors = trackColors.length > 0 ? trackColors : DEFAULT_TRACK_COLORS
  const pitchMin = config.pitchMin
  const pitchMax = config.pitchMax
  const pitchSpan = pitchMax - pitchMin + 1
  const highlightedFileName = config.highlightedFileName ?? null

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const noteAreaWidth = width - PIANO_GUTTER_WIDTH
  const rowHeight = height / pitchSpan

  // --- 1. Draw piano keyboard gutter ---
  drawPianoGutter(ctx, pitchMin, pitchMax, rowHeight, height)

  // --- 2. Draw background grid (time) ---
  drawTimeGrid(ctx, meta.bpm, scrollOffset, timeRange, noteAreaWidth, height, PIANO_GUTTER_WIDTH)

  // --- 3. Draw horizontal pitch rows ---
  drawPitchRows(ctx, pitchMin, pitchMax, pitchSpan, rowHeight, noteAreaWidth, PIANO_GUTTER_WIDTH)

  // --- 4. Draw notes from all tracks, highlighting selected file ---
  let globalTrackIndex = 0
  for (const file of files) {
    const isHighlighted = highlightedFileName !== null && file.name === highlightedFileName
    for (const track of file.data.tracks) {
      const color = colors[globalTrackIndex % colors.length]!
      drawPianoRollNotes(
        ctx, track.notes, pitchMin, pitchMax, pitchSpan, rowHeight,
        noteAreaWidth, timeRange, scrollOffset, color, PIANO_GUTTER_WIDTH,
        isHighlighted,
      )
      globalTrackIndex++
    }
  }

  // --- 5. Vertical divider ---
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PIANO_GUTTER_WIDTH, 0)
  ctx.lineTo(PIANO_GUTTER_WIDTH, height)
  ctx.stroke()

  ctx.globalAlpha = 1
}

/** Draw piano key shapes and labels in the left gutter */
function drawPianoGutter(
  ctx: CanvasRenderingContext2D,
  pitchMin: number,
  pitchMax: number,
  rowHeight: number,
  height: number,
) {
  const pitchSpan = pitchMax - pitchMin + 1

  // Background for gutter
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, PIANO_GUTTER_WIDTH, height)

  for (let i = 0; i < pitchSpan; i++) {
    const pitch = pitchMax - i // high notes at top
    const y = i * rowHeight
    const isBlack = isBlackKey(pitch)

    if (isBlack) {
      ctx.fillStyle = '#2d2d3f'
      ctx.fillRect(0, y, PIANO_GUTTER_WIDTH, rowHeight)
      // Small black key indicator
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(PIANO_GUTTER_WIDTH - 20, y + 1, 18, rowHeight - 2)
    } else {
      ctx.fillStyle = '#252540'
      ctx.fillRect(0, y, PIANO_GUTTER_WIDTH, rowHeight)
    }

    // Draw label on white keys only
    if (!isBlack) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = `${Math.max(8, Math.min(11, rowHeight - 2))}px system-ui, sans-serif`
      ctx.textBaseline = 'middle'
      ctx.fillText(pitchLabel(pitch), 4, y + rowHeight / 2)
    }

    // Separator line
    ctx.strokeStyle = 'rgba(255,255,255,0.03)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(PIANO_GUTTER_WIDTH, y)
    ctx.stroke()
  }
}

/** Draw vertical beat-based grid lines */
function drawTimeGrid(
  ctx: CanvasRenderingContext2D,
  bpm: number,
  scrollOffset: number,
  timeRange: number,
  noteAreaWidth: number,
  height: number,
  gutterWidth: number,
) {
  const secPerBeat = 60 / bpm
  const startBeat = Math.floor(scrollOffset / secPerBeat)
  const endBeat = Math.ceil((scrollOffset + timeRange) / secPerBeat)

  for (let beat = startBeat; beat <= endBeat; beat++) {
    const x = gutterWidth + ((beat * secPerBeat - scrollOffset) / timeRange) * noteAreaWidth

    // Bar lines (every 4 beats) are brighter
    if (beat % 4 === 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.025)'
      ctx.lineWidth = 0.5
    }

    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }
}

/** Draw subtle alternating row backgrounds */
function drawPitchRows(
  ctx: CanvasRenderingContext2D,
  _pitchMin: number,
  pitchMax: number,
  pitchSpan: number,
  rowHeight: number,
  noteAreaWidth: number,
  gutterWidth: number,
) {
  for (let i = 0; i < pitchSpan; i++) {
    const pitch = pitchMax - i
    const y = i * rowHeight

    if (!isBlackKey(pitch)) {
      ctx.fillStyle = 'rgba(255,255,255,0.015)'
      ctx.fillRect(gutterWidth, y, noteAreaWidth, rowHeight)
    }
  }
}

/** Draw notes from a single track as filled rectangles, with optional highlight outline */
function drawPianoRollNotes(
  ctx: CanvasRenderingContext2D,
  notes: Note[],
  _pitchMin: number,
  pitchMax: number,
  pitchSpan: number,
  rowHeight: number,
  noteAreaWidth: number,
  timeRange: number,
  scrollOffset: number,
  color: string,
  gutterWidth: number,
  isHighlighted = false,
) {
  ctx.fillStyle = color

  for (const note of notes) {
    // Convert pitch to y (higher pitch = higher on screen = smaller y)
    const pitchIndex = pitchMax - note.pitch
    const y = pitchIndex * rowHeight
    const noteH = Math.max(2, rowHeight - 1)

    // Convert time to x
    const x = gutterWidth + ((note.time - scrollOffset) / timeRange) * noteAreaWidth
    const w = Math.max(2, (note.duration / timeRange) * noteAreaWidth)

    // Clipping: only draw if visible
    if (x + w > gutterWidth && x < gutterWidth + noteAreaWidth) {
      const alpha = 0.4 + (note.velocity / 127) * 0.6
      ctx.globalAlpha = alpha

      // Rounded note rectangles
      const r = Math.min(3, noteH / 2)
      roundRect(ctx, x, y + 1, w, noteH - 2, r)
      ctx.fill()

      // Subtle outline for highlighted notes
      if (isHighlighted) {
        ctx.globalAlpha = 0.55
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 1.2
        roundRect(ctx, x - 0.5, y + 0.5, w + 1, noteH - 1, r)
        ctx.stroke()
      }
    }
  }

  ctx.globalAlpha = 1
}

/** Draw a rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

/** Figure out a sensible pitch range from a set of tracks */
export function computePitchRange(tracks: Track[]): { min: number; max: number } {
  if (tracks.length === 0) return { min: 21, max: 108 }

  let min = 127
  let max = 0
  for (const track of tracks) {
    for (const note of track.notes) {
      if (note.pitch < min) min = note.pitch
      if (note.pitch > max) max = note.pitch
    }
  }

  // Add some padding (at least one octave above/below)
  min = Math.max(0, min - 4)
  max = Math.min(127, max + 4)

  // Ensure at least 2 octaves
  if (max - min < 24) {
    const mid = Math.round((min + max) / 2)
    min = Math.max(0, mid - 12)
    max = Math.min(127, mid + 12)
  }

  return { min, max }
}

/** Set up a canvas for high-DPI rendering */
export function setupPianoCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  const ctx = canvas.getContext('2d')!
  ctx.scale(dpr, dpr)
  return ctx
}
