# 🎹 MIDI Visualizer

Drag & drop MIDI files and watch them come to life with real-time visualizations.

![MIDI Visualizer](./public/screenshot.png)

## Features

- **Drag & drop** — drop `.mid` or `.midi` files from anywhere
- **Multi-file support** — load many files side by side
- **Piano roll visualization** — color-coded notes by velocity and channel
- **Toggle tracks** — show/hide individual files
- **Playback controls** — play/pause with automatic scrolling
- **Zoom slider** — adjust the visible time window (5–120s)
- **Dark theme** — easy on the eyes for long sessions

## Built with

| Layer | Technology |
|---|---|
| Framework | [Nuxt 4](https://nuxt.com/) |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| MIDI parsing | [Tone.js](https://tonejs.github.io/) |
| Utilities | [VueUse](https://vueuse.org/) |
| Rendering | HTML5 Canvas |
| Package manager | [pnpm](https://pnpm.io/) |

## Architecture

The codebase follows clean architecture principles:

```
app/
├── composables/
│   ├── domain/          # Pure domain types & interfaces
│   │   ├── types.ts     # Note, Track, MidiData, MidiFileEntry
│   │   └── midi-parser.ts  # MidiParserPort contract
│   ├── useMidiFiles.ts      # Multi-file state management
│   └── useVisualization.ts  # Canvas rendering orchestration
├── utils/               # Infrastructure
│   ├── midi.ts          # Tone.js adapter (implements MidiParserPort)
│   └── canvas.ts        # Canvas drawing primitives
├── components/          # Vue components
│   ├── DropZone.vue     # Drag-and-drop file input
│   ├── FileSidebar.vue  # Track list with visibility controls
│   ├── VizCanvas.vue    # Resize-aware canvas wrapper
│   └── PlaybackBar.vue  # Play/pause & zoom controls
├── assets/css/
│   └── main.css         # Tailwind v4 theme & global styles
├── app.vue              # Root layout
└── pages/               # (reserved for future routing)
```

### Principles

- **Domain knows nothing** about Vue, Canvas, or external libraries
- **Application layer** bridges reactive state and rendering
- **Infrastructure** implements ports defined by the domain (Tone.js adapter, Canvas drawing)

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/)

### Install

```bash
pnpm install
```

### Dev

```bash
pnpm dev
```

Open [http://localhost:8510](http://localhost:8510).

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## License

[MIT](./LICENSE)
