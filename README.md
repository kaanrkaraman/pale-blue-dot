# Kepler Engine

Interactive 2D solar system simulation with real Keplerian orbital mechanics. Built with React, TypeScript, and HTML5 Canvas.

Uses Newton-Raphson iteration to solve Kepler's equation with true J2000 epoch orbital elements from NASA JPL. Supports both elliptical and hyperbolic (escape) trajectories.

## What's in it

- **27 celestial bodies** — Sun, 8 planets, Pluto, 17 major moons (Galilean, Titan, Triton, Charon, etc.)
- **5 space probes** — Voyager 1/2, Pioneer 10/11, New Horizons on hyperbolic escape orbits
- **Heliosphere boundaries** — termination shock and heliopause visualization
- **Live telemetry** — real-time position, velocity, orbital parameters, moon distances
- **Time control** — from 0.01 days/s to 100 years/s, pause, reverse
- **Interactive camera** — click to select, scroll to zoom, keyboard shortcuts, minimap

## Controls

| Key | Action |
|-----|--------|
| `0`-`9` | Select Sun through Pluto |
| `Space` | Pause / Resume |
| `+` / `-` | Speed up / Slow down |
| `M` | Toggle minimum display sizes |
| `I` | Toggle immersive background |
| `P` | Toggle space probes |
| `H` | Toggle heliosphere |
| Scroll | Zoom |
| Click | Select body |

## Getting Started

```bash
bun install
bun dev
```

## Build

```bash
bun run build
bun preview
```

## Architecture

```
src/
  core/        Pure orbital mechanics (Kepler solver, data, simulation)
  rendering/   Canvas rendering (camera, orbits, trails, labels, heliosphere)
  components/  React UI (canvas, panels, controls, minimap)
  store/       Zustand state management
  utils/       Formatting utilities
```

The simulation engine in `core/` has zero UI dependencies — designed for future 3D migration.
