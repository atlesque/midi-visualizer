/**
 * Infrastructure: Canvas drawing primitives for MIDI visualization.
 */
import type { MidiMeta, Track } from "~/composables/domain/types";

export interface DrawConfig {
  /** Canvas width in CSS pixels */
  width: number;
  /** Canvas height in CSS pixels */
  height: number;
  /** Device pixel ratio */
  dpr: number;
  /** Time range visible (seconds) */
  timeRange: number;
  /** Scroll offset in seconds */
  scrollOffset: number;
  /** Colors per track index */
  trackColors: string[];
}

const DEFAULT_COLORS = [
  "#6c5ce7",
  "#00b894",
  "#fdcb6e",
  "#e17055",
  "#0984e3",
  "#fd79a8",
  "#00cec9",
  "#d63031",
  "#6c5ce7",
  "#00b894",
  "#fdcb6e",
  "#e17055",
  "#0984e3",
  "#fd79a8",
  "#00cec9",
  "#d63031",
];

/** Draw the entire visualization frame */
export function drawMidiVisualization(
  ctx: CanvasRenderingContext2D,
  tracks: Track[],
  meta: MidiMeta,
  config: DrawConfig,
) {
  const { width, height, dpr, timeRange, scrollOffset, trackColors } = config;
  const colors = trackColors.length ? trackColors : DEFAULT_COLORS;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const trackHeight =
    tracks.length > 0 ? Math.max(40, (height - 40) / tracks.length) : height;

  // Background grid
  drawGrid(
    ctx,
    width,
    height,
    meta.bpm,
    meta.timeSignatureUpper,
    scrollOffset,
    timeRange,
  );

  // Draw each track
  tracks.forEach((track, i) => {
    const y = i * trackHeight + 20;
    const color = colors[i % colors.length]!;
    drawTrackHeader(ctx, track, y, trackHeight, color, width);
    drawTrackNotes(ctx, track, y, trackHeight, timeRange, scrollOffset, color);
  });

  // Time cursor
  drawTimeCursor(ctx, width, height);
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bpm: number,
  _beatsPerBar: number,
  scrollOffset: number,
  timeRange: number,
) {
  const secPerBeat = 60 / bpm;
  const startBeat = Math.floor(scrollOffset / secPerBeat);
  const endBeat = Math.ceil((scrollOffset + timeRange) / secPerBeat);

  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;

  for (let beat = startBeat; beat <= endBeat; beat++) {
    const x = ((beat * secPerBeat - scrollOffset) / timeRange) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

function drawTrackHeader(
  ctx: CanvasRenderingContext2D,
  track: Track,
  y: number,
  trackHeight: number,
  color: string,
  _width: number,
) {
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, y - trackHeight / 2, 120, trackHeight);

  // Track name — truncate with ellipsis if it overflows the header area
  const maxTextWidth = 112; // 120px header - 8px padding on each side
  ctx.fillStyle = color;
  ctx.font = "bold 11px system-ui, sans-serif";
  const displayName = truncateText(ctx, track.name, maxTextWidth);
  ctx.fillText(displayName, 8, y + 4);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.fillText(`${track.notes.length} notes`, 8, y + 18);
}

/** Truncate text with an ellipsis if it exceeds maxWidth */
function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (
    truncated.length > 0 &&
    ctx.measureText(truncated + "…").width > maxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return truncated + "…";
}

function drawTrackNotes(
  ctx: CanvasRenderingContext2D,
  track: Track,
  y: number,
  trackHeight: number,
  timeRange: number,
  scrollOffset: number,
  color: string,
) {
  const noteRange = 127;
  const noteHeight = Math.max(2, trackHeight / noteRange);
  const xStart = 120;

  ctx.fillStyle = color;

  for (const note of track.notes) {
    const x =
      xStart +
      ((note.time - scrollOffset) / timeRange) *
        (ctx.canvas.width / devicePixelRatio - xStart);
    const w = Math.max(
      1,
      (note.duration / timeRange) *
        (ctx.canvas.width / devicePixelRatio - xStart),
    );
    const yPos = y + trackHeight / 2 - (note.pitch / noteRange) * trackHeight;

    if (x + w > xStart && x < ctx.canvas.width / devicePixelRatio) {
      const alpha = 0.3 + (note.velocity / 127) * 0.7;
      ctx.globalAlpha = alpha;
      ctx.fillRect(x, yPos - noteHeight / 2, w, noteHeight);
    }
  }

  ctx.globalAlpha = 1;
}

function drawTimeCursor(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(120, 0);
  ctx.lineTo(120, height);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** Get a canvas element sized for the device pixel ratio */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);
  return ctx;
}
