# NEURAL NEXUS: AI Multi-Agent Development Hub — Complete Build Specification

## Document Purpose

This document is the **single source of truth** for building the Neural Nexus dashboard. It contains every visual element, every animation curve, every interaction state, every color value, every layout measurement, and every motion choreography needed to reproduce the dashboard **pixel-for-pixel** from the reference image. The developer (Claude Code) should read this document end-to-end before writing a single line of code, then implement section by section.

**Target output:** A single-page React application using the R3F (React Three Fiber) technology stack.

---

## TABLE OF CONTENTS

1. [Technology Stack & Dependencies](#1-technology-stack--dependencies)
2. [Global Design System](#2-global-design-system)
3. [Application Shell & 3D Scene Architecture](#3-application-shell--3d-scene-architecture)
4. [Layout Grid & Spatial Organization](#4-layout-grid--spatial-organization)
5. [Component 1 — Header Module](#5-component-1--header-module)
6. [Component 2 — Development Pipeline (The Centerpiece)](#6-component-2--development-pipeline-the-centerpiece)
7. [Component 3 — Pipeline Engine Nodes (7 Hubs)](#7-component-3--pipeline-engine-nodes-7-hubs)
8. [Component 4 — Data Stream Particles](#8-component-4--data-stream-particles)
9. [Component 5 — Bottom Agent Telemetry Cards](#9-component-5--bottom-agent-telemetry-cards)
10. [Component 6 — Right Sidebar: Voice Interaction Module](#10-component-6--right-sidebar-voice-interaction-module)
11. [Component 7 — Right Sidebar: Real-Time Interaction Panel](#11-component-7--right-sidebar-real-time-interaction-panel)
12. [Component 8 — Right Sidebar: System Overview Analytics](#12-component-8--right-sidebar-system-overview-analytics)
13. [Component 9 — Right Sidebar: Agent Status & Project Milestones](#13-component-9--right-sidebar-agent-status--project-milestones)
14. [Component 10 — Right Sidebar: System Logs Terminal](#14-component-10--right-sidebar-system-logs-terminal)
15. [Component 11 — Tab Navigation ("Agent Status / Phases / Agent")](#15-component-11--tab-navigation)
16. [Component 12 — Pipeline Chart Overlay (Bar/Line Graph)](#16-component-12--pipeline-chart-overlay)
17. [Boot-Up Initialization Sequence](#17-boot-up-initialization-sequence)
18. [Continuous Ambient Animations](#18-continuous-ambient-animations)
19. [Post-Processing & Shader Effects](#19-post-processing--shader-effects)
20. [Responsive Considerations](#20-responsive-considerations)
21. [Performance Budget & Optimization](#21-performance-budget--optimization)
22. [Data Model & Mock Data Structure](#22-data-model--mock-data-structure)
23. [File & Folder Structure](#23-file--folder-structure)

---

## 1. Technology Stack & Dependencies

### Core 3D Engine

| Layer | Package | Purpose |
|---|---|---|
| 3D Renderer | `@react-three/fiber` (R3F) | React renderer over Three.js — all 3D content lives inside a single `<Canvas>` |
| 3D Helpers | `@react-three/drei` | `ScrollControls`, `Float`, `Text`, `Environment`, `MeshTransmissionMaterial` (glass), `Html`, `Line`, `Points`, `Sparkles`, `MeshDistortMaterial`, `OrbitControls` (dev only) |
| 3D Animation | `framer-motion-3d` | Declarative `<motion.mesh>`, `<motion.group>` with variants, gestures, spring physics on 3D objects |
| Timeline / Scroll | `Theatre.js` (`@theatre/core`, `@theatre/r3f`) | Precise keyframe timeline control for the boot-up sequence and scroll-driven 3D transitions |
| Physics (optional) | `@react-three/rapier` | Gravity, collisions, springs — used sparingly for floating card physics if desired |
| Post-processing | `@react-three/postprocessing` | Bloom, depth-of-field, chromatic aberration, vignette, noise |
| Shaders | Custom GLSL via `shaderMaterial` from Drei | Perlin noise wave, data stream glow, wireframe gradient coloring |

### Supporting Libraries

| Library | Purpose |
|---|---|
| `three` | Underlying Three.js engine (peer dependency of R3F) |
| `gsap` + `ScrollTrigger` | Fallback timeline animation for any HTML overlay elements outside the canvas |
| `leva` | Dev-only GUI for tweaking shader uniforms, colors, speeds in real-time |
| `zustand` | Lightweight global state store for dashboard data (agent statuses, metrics, logs, voice state) |
| `simplex-noise` or `glsl-noise` | Perlin/Simplex noise for the voice waveform mesh and data stream undulation |
| `@fontsource/space-grotesk` | Primary display font |
| `@fontsource/jetbrains-mono` | Monospace font for metrics, logs, code |

### Installation Command

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing framer-motion framer-motion-3d @theatre/core @theatre/r3f @react-three/rapier gsap zustand simplex-noise leva @fontsource/space-grotesk @fontsource/jetbrains-mono
```

---

## 2. Global Design System

### 2.1 Color Palette

Every color in the dashboard maps to one of these tokens. No ad-hoc hex values anywhere in the codebase.

| Token Name | Hex Value | RGB/RGBA | Usage |
|---|---|---|---|
| `--space-void` | `#030712` | `rgb(3, 7, 18)` | Deepest background, the "void" behind everything |
| `--bg-primary` | `#050B14` | `rgb(5, 11, 20)` | Canvas clear color, main stage background |
| `--panel-bg` | — | `rgba(10, 20, 35, 0.4)` | Translucent panel fill (glassmorphism base) |
| `--panel-bg-hover` | — | `rgba(10, 15, 30, 0.7)` | Panel fill on hover (increased opacity) |
| `--panel-border` | — | `rgba(0, 229, 255, 0.15)` | Default border for all glass panels |
| `--panel-border-hover` | — | `rgba(0, 229, 255, 0.6)` | Border on hover or active state |
| `--cyan-primary` | `#00E5FF` | `rgb(0, 229, 255)` | Primary accent: borders, headers, active text, pipeline top lines |
| `--cyan-glow` | — | `rgba(0, 229, 255, 0.4)` | Glow/shadow for cyan elements |
| `--cyan-deep` | `#0097A7` | `rgb(0, 151, 167)` | Darker cyan for secondary elements, chart area fills |
| `--orange-energy` | `#FF9100` | `rgb(255, 145, 0)` | Secondary accent: backend flow lines, warnings, highlights, metric bars |
| `--orange-glow` | — | `rgba(255, 145, 0, 0.4)` | Glow/shadow for orange elements |
| `--purple-neural` | `#9D4EDD` | `rgb(157, 78, 221)` | Tertiary accent: voice waveform, AI avatar, neural connections |
| `--purple-glow` | — | `rgba(157, 78, 221, 0.4)` | Glow for purple elements |
| `--green-active` | `#00E676` | `rgb(0, 230, 118)` | Status badges, "ACTIVE" indicators |
| `--green-glow` | — | `rgba(0, 230, 118, 0.4)` | Pulse glow on green dots |
| `--red-alert` | `#FF1744` | `rgb(255, 23, 68)` | Error states, critical alerts (not seen in current image but needed) |
| `--text-primary` | `#FFFFFF` | `rgb(255, 255, 255)` | Primary text (headings, large metrics) |
| `--text-secondary` | — | `rgba(255, 255, 255, 0.7)` | Body text, descriptions |
| `--text-muted` | — | `rgba(255, 255, 255, 0.4)` | Timestamps, labels, inactive text |
| `--text-cyan` | `#00E5FF` | Same as cyan-primary | Colored text highlights |

### 2.2 Typography

| Role | Font Family | Weight | Size | Letter Spacing | Transform |
|---|---|---|---|---|---|
| Dashboard Title | Space Grotesk | 700 (Bold) | 18px | 3px | uppercase |
| Subtitle | JetBrains Mono | 400 | 10px | 1.5px | uppercase |
| Section Headers | Space Grotesk | 600 (SemiBold) | 14px | 2px | uppercase |
| Card Titles | Space Grotesk | 600 | 12px | 1.5px | uppercase |
| Card Subtitles / Descriptions | JetBrains Mono | 400 | 10px | 0.5px | none |
| Large Metrics (e.g., "94%", "89%") | Space Grotesk | 700 | 28px | 0 | none |
| Medium Metrics (e.g., "96% Uptime") | Space Grotesk | 600 | 18px | 0 | none |
| Small Metrics / Values | JetBrains Mono | 500 | 11px | 0 | none |
| Status Badges ("ACTIVE") | JetBrains Mono | 700 | 8px | 1px | uppercase |
| Log Text | JetBrains Mono | 400 | 9px | 0 | none |
| Timestamps | JetBrains Mono | 400 | 8px | 0 | none |

### 2.3 Glassmorphism Specification

Every panel (cards, sidebar sections, header) shares this exact glassmorphism recipe:

```
background: var(--panel-bg);                         /* rgba(10, 20, 35, 0.4) */
backdrop-filter: blur(16px) saturate(180%);
-webkit-backdrop-filter: blur(16px) saturate(180%);
border: 1px solid var(--panel-border);               /* rgba(0, 229, 255, 0.15) */
border-radius: 8px;
box-shadow:
  0 4px 30px rgba(0, 0, 0, 0.3),                    /* Depth shadow */
  inset 0 1px 0 rgba(255, 255, 255, 0.05);          /* Top highlight edge */
```

### 2.4 Global Glow Effects

- **Cyan glow (default active):** `box-shadow: 0 0 15px rgba(0, 229, 255, 0.3), 0 0 30px rgba(0, 229, 255, 0.1);`
- **Orange glow:** `box-shadow: 0 0 15px rgba(255, 145, 0, 0.3), 0 0 30px rgba(255, 145, 0, 0.1);`
- **Purple glow:** `box-shadow: 0 0 15px rgba(157, 78, 221, 0.3), 0 0 30px rgba(157, 78, 221, 0.1);`
- **Green pulse glow:** `box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7)` animating to `box-shadow: 0 0 0 8px rgba(0, 230, 118, 0)` over 1.5s infinite.

### 2.5 Perspective & 3D Curvature

The entire dashboard has a subtle command-center curvature to make it feel like a wraparound screen.

- Apply `perspective: 1500px` on the outermost `<div>` wrapping the HTML overlay layer.
- The main wrapper gets: `transform: rotateY(-2deg) rotateX(1deg) scale(0.98);`
- This gives the left edge a slight "coming toward the viewer" feel and the right edge "receding."
- The 3D canvas itself (R3F `<Canvas>`) does NOT get this CSS transform — it occupies the full viewport behind the HTML layer. The camera angle within the canvas provides its own depth.

### 2.6 Vignette Overlay

A purely decorative CSS overlay that darkens the edges of the screen:

```
position: fixed;
top: 0; left: 0; right: 0; bottom: 0;
pointer-events: none;
z-index: 9999;
background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.7) 100%);
```

---

## 3. Application Shell & 3D Scene Architecture

### 3.1 Layer Stack (Bottom to Top)

The application is composed of **three visual layers** stacked with CSS:

1. **Layer 0 — R3F Canvas (z-index: 0):** Full-viewport Three.js canvas. Contains the 3D pipeline visualization, data stream particles, voice waveform mesh, floating elements, post-processing. This is `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;`

2. **Layer 1 — HTML Overlay (z-index: 10):** Positioned absolutely on top of the canvas. Contains all text, cards, metrics, logs, charts rendered as standard React DOM via Drei's `<Html>` component or as a separate DOM tree. This layer uses `pointer-events: none` on the container but `pointer-events: auto` on interactive children (cards, buttons).

3. **Layer 2 — Vignette & Scanline Overlay (z-index: 9999):** The vignette gradient and optional CRT scanline effect. Purely decorative, `pointer-events: none`.

### 3.2 R3F Canvas Configuration

```jsx
<Canvas
  camera={{ position: [0, 0, 10], fov: 50, near: 0.1, far: 1000 }}
  dpr={[1, 2]}                    // Responsive pixel ratio
  gl={{
    antialias: true,
    alpha: true,                  // Transparent background so CSS bg shows through
    powerPreference: 'high-performance',
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.2
  }}
  style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
>
```

### 3.3 Scene Contents (Inside `<Canvas>`)

The 3D scene contains these groups, listed by their role:

| Group | Y Position (approx.) | Contents |
|---|---|---|
| `<PipelineFlowGroup>` | y: 1.5 to 2.5 | The sinusoidal data stream splines and flowing particles |
| `<EngineNodesGroup>` | y: 1.0 to 3.0 | The 7 concentric-ring engine nodes positioned along the pipeline arc |
| `<VoiceWaveformGroup>` | y: 0 to 2.0, x: 4.5 | The 3D wireframe plane with Perlin noise displacement (top-right quadrant in screen space) |
| `<AmbientParticles>` | Spread everywhere | Thousands of tiny faint dots drifting slowly for atmosphere |
| `<PostProcessing>` | N/A | Bloom, vignette, noise, chromatic aberration |
| `<Lighting>` | N/A | Ambient + point lights for glow sourcing |

### 3.4 Lighting Setup

- **Ambient Light:** `intensity: 0.15`, color `#0a1628` — very dim, just enough to see wireframes.
- **Point Light 1 (Cyan):** Position `[-5, 3, 5]`, color `#00E5FF`, intensity `0.8`, distance `20`. This bathes the left side of the pipeline in cyan.
- **Point Light 2 (Orange):** Position `[5, 2, 5]`, color `#FF9100`, intensity `0.6`, distance `20`. This gives the right/backend side a warm glow.
- **Point Light 3 (Purple):** Position `[6, 4, 3]`, color `#9D4EDD`, intensity `0.5`, distance `15`. Illuminates the voice waveform area.
- **Rect Area Light (optional):** Positioned behind the central pipeline to create a subtle backlight rim on the nodes.

---

## 4. Layout Grid & Spatial Organization

### 4.1 CSS Grid for the HTML Overlay

The HTML overlay layer uses CSS Grid to position all panels:

```css
.dashboard-grid {
  display: grid;
  width: 100vw;
  height: 100vh;
  grid-template-columns: 1fr 380px;
  grid-template-rows: 60px 1fr 260px;
  gap: 0;
  padding: 12px;
  box-sizing: border-box;
}
```

| Grid Area | Column | Row | Content |
|---|---|---|---|
| Header | 1 / span 2 | 1 | Logo, title, status, year badge, tab navigation |
| Main Stage | 1 | 2 | The pipeline visualization area (mostly transparent — canvas shows through) with the overlaid bar chart |
| Sidebar | 2 | 2 / span 2 | Voice module, transcript, system overview, agent status, milestones, logs |
| Bottom Cards | 1 | 3 | The 7 agent telemetry cards in a horizontal row |

### 4.2 Sidebar Internal Layout

The sidebar (380px wide) is a vertical flex column with these sections:

| Section | Approx Height | Content |
|---|---|---|
| Voice Waveform Display | 180px | 3D waveform canvas region (this part is rendered by the R3F scene, HTML just provides the bounding frame) |
| Real-Time Interaction | 120px | "HUMAN-AI VOICE CONVERSATION" header, waveform label, transcript of Dr. Chen & AI Nexus |
| System Overview | 140px | "SYSTEM OVERVIEW" header, graphs/charts, "12,345 Tasks" metric |
| Agent Status & Milestones | 100px | Agent status list with green dots + Project Milestones "84%" |
| Logs | remaining | Terminal-style scrolling log output |

---

## 5. Component 1 — Header Module

### 5.1 Visual Layout

The header spans the full width of the dashboard (both columns of the grid). It is 60px tall with a flex row layout.

**Left cluster (flex: 0 0 auto):**
- **Logo icon:** A small (~28px) animated SVG depicting an atomic/neural orbital structure. Three concentric elliptical paths with a glowing dot at the center. Stroke color: `--cyan-primary`, stroke-width: 1.5px. The paths have different radii and tilts to create a 3D atom look.
- **Title text block** (immediately right of logo, 8px gap):
  - Line 1: The atom icon followed by "NEURAL NEXUS | MULTI-AGENT DEVELOPMENT HUB" — the "NEURAL NEXUS" part is white, bold, Space Grotesk 18px. The " | MULTI-AGENT DEVELOPMENT HUB" part is `--cyan-primary`, lighter weight, 12px.
  - Line 2: "Active Agents: 7 / Status: **OPTIMAL**" in JetBrains Mono, 10px, `--text-secondary`. The word "OPTIMAL" is `--green-active` color.

**Right cluster (flex: 0 0 auto, right-aligned):**
- **Year badge:** "2043" displayed in a bordered pill/box. Font: Space Grotesk, 14px, `--cyan-primary`. Border: 1px solid `--panel-border`. Padding: 2px 10px.
- **Tab row:** Three tab buttons labeled "AGENT STATUS", "PHASES: 7", "AGENT". These are small rectangular tab buttons sitting in a row. The active tab ("AGENT STATUS") has a solid `--cyan-primary` background with dark text. Inactive tabs have transparent backgrounds with `--cyan-primary` text and `--panel-border` borders.

**Bottom border:** The header has a bottom border of `1px solid var(--panel-border)`.

### 5.2 Header Animations

1. **Logo Rotation:**
   - The SVG orbital paths rotate continuously around the center dot.
   - Path 1: `rotate(0deg)` to `rotate(360deg)`, duration `20s`, linear, infinite.
   - Path 2: `rotate(0deg)` to `rotate(-360deg)`, duration `15s`, linear, infinite (counter-rotation).
   - Path 3: `rotate(0deg)` to `rotate(360deg)`, duration `25s`, linear, infinite.
   - The center dot pulses: `opacity: 0.7` to `1.0` to `0.7`, duration `2s`, ease-in-out, infinite.

2. **"OPTIMAL" Neon Flicker:**
   - Every 4.5 seconds, execute this rapid flicker sequence:
     - `0ms`: opacity 1.0
     - `0ms → 50ms`: opacity drops to 0.4
     - `50ms → 100ms`: opacity returns to 1.0
     - `100ms → 150ms`: opacity drops to 0.7
     - `150ms → 200ms`: opacity returns to 1.0
   - Between flickers (4.5s gap), the text has a constant subtle `text-shadow: 0 0 8px rgba(0, 230, 118, 0.6)`.

3. **Header Scanner Line:**
   - A pseudo-element on the header bottom border: a 120px wide gradient bar (`transparent → cyan → transparent`) that slides from left edge to right edge and back.
   - Duration: 8s, ease-in-out, infinite, alternating direction.

---

## 6. Component 2 — Development Pipeline (The Centerpiece)

### 6.1 Overview

The Development Pipeline is the visual heart of the dashboard. It occupies the entire main stage area (Grid Row 2, Col 1). It shows the flow of data/work across 7 AI engine stages, from "Insighting Engine" on the far left to "QA Engine" on the far right.

The pipeline consists of:
- **5-7 sinusoidal spline curves** connecting left to right (the "data streams")
- **7 Engine Node hubs** positioned along these curves
- **Glowing data particles** flowing along the curves
- **A semi-transparent bar/line chart overlay** sitting behind/above the pipeline

### 6.2 Data Stream Splines — Visual Specification

**Geometry:** Each spline is a `CatmullRomCurve3` or `CubicBezierCurve3` in Three.js, rendered as a `<Line>` (from Drei) or a custom `TubeGeometry` with a very small radius (0.02 units).

**Count:** 5 primary splines with slightly different paths creating an intertwined helix/braid effect.

**Color Mapping:**
- Spline 1 (topmost): `--cyan-primary` (#00E5FF) — represents frontend/design data flow
- Spline 2: Gradient from `--cyan-primary` to `--cyan-deep`
- Spline 3 (middle): Transitions from cyan to white to orange at midpoint
- Spline 4: Gradient from `--orange-energy` light to full
- Spline 5 (bottommost): `--orange-energy` (#FF9100) — represents backend/database data flow

**Path Shape:** Each spline follows a sinusoidal wave across the X-axis:
- X range: -6 to +6 (world units)
- Y offset: each spline is offset by ~0.3 units vertically from its neighbor
- Z: slight depth variation (-0.5 to +0.5) to create a 3D braid
- The sine wave: `y = baseY + amplitude * sin(frequency * x + phase + time * speed)`
  - Amplitude: 0.4 to 0.8 (varies per spline)
  - Frequency: 1.2 to 2.0 (varies per spline)
  - Phase: offset per spline so they don't overlap exactly
  - Speed: 0.3 (slow undulation over time)

**Material:**
- Use `MeshBasicMaterial` or a custom `ShaderMaterial` for the glow.
- The lines should have a soft bloom glow (achieved via the post-processing Bloom pass rather than on the material itself).
- Line opacity: 0.6 base, with brighter sections (opacity 1.0) where a data particle is currently traveling.

### 6.3 Data Stream Splines — Animation

- The sine wave `time` parameter increments every frame via `useFrame((state) => { time.current = state.clock.elapsedTime })`.
- The splines visibly breathe and undulate, creating a "living data highway" effect.
- The curves never stop moving — they shift like gentle waves in slow motion.
- Where splines converge at an Engine Node, they briefly merge and then separate again, creating a visual "nexus point."

---

## 7. Component 3 — Pipeline Engine Nodes (7 Hubs)

### 7.1 The 7 Engines (Left to Right)

| # | Name | Icon Description | Key Metric | Sub-Metric |
|---|---|---|---|---|
| 1 | Insighting Engine | Magnifying glass / brain scan | "Market Trends 89% optimized" | "89%" large |
| 2 | Product Engine | Document / roadmap | "Roadmap v3.1, Features: 14" | "Feature 14 Active" |
| 3 | Design Engine | Pencil / 3D mockup | "3D Mockups, Webframes" | "94% complete" |
| 4 | Frontend Engine | Code brackets `< />` | "Code generation React/Next.js" | "118 Deployments" |
| 5 | Backend Engine | Server / API icon | "API status GraphQL" | "96% Uptime" |
| 6 | DB Engine | Database cylinder stack | "Schema optimized, SQL" | "4,278 Data" |
| 7 | QA Engine | Checkmark / bug icon | "Test codes, R3 Q4 Coverage" | "59%" |

### 7.2 Node Visual Structure

Each engine node is a `<group>` in the R3F scene containing these nested meshes:

1. **Outer Dashed Ring:**
   - Geometry: `RingGeometry(innerRadius: 0.55, outerRadius: 0.6, segments: 64)`
   - Material: Custom shader or dashed line circle. Visually, this is a dashed border ring (like CSS `border-style: dashed` but in 3D).
   - Color: `--cyan-primary` at 40% opacity.
   - Size: ~1.2 units diameter.

2. **Middle Glow Ring:**
   - Geometry: `RingGeometry(innerRadius: 0.4, outerRadius: 0.45, segments: 64)`
   - Material: `MeshBasicMaterial`, color `--cyan-primary`, opacity 0.2, transparent.
   - This creates a soft inner border.

3. **Inner Core Circle:**
   - Geometry: `CircleGeometry(radius: 0.35, segments: 32)`
   - Material: The glassmorphism effect in 3D — use `MeshPhysicalMaterial` or Drei's `MeshTransmissionMaterial` with:
     - `transmission: 0.6` (glass-like translucency)
     - `roughness: 0.3`
     - `color: #0a1628`
     - `thickness: 0.5`
   - Alternatively, a simple `MeshBasicMaterial` with `color: #0a142d`, `opacity: 0.7`, `transparent: true`.

4. **Icon:**
   - Rendered as a small SVG icon or a Drei `<Text>` character/emoji centered inside the core.
   - Color: `--cyan-primary`.
   - Scale: 0.15 units.

5. **Label Text (Above Node):**
   - Drei `<Text>` component floating ~0.8 units above the node center.
   - Font: Space Grotesk Bold, size 0.12 units.
   - Color: white.
   - Content: e.g., "FRONTEND ENGINE"

6. **Metric Text (Below Node):**
   - Drei `<Text>` positioned ~0.6 units below.
   - Font: JetBrains Mono, size 0.08 units.
   - Color: `--cyan-primary`.
   - Content: e.g., "Code generation" / "React/Next.js"

7. **Large Percentage Badge:**
   - Some nodes (like Design Engine showing "94%") have a large floating percentage near them.
   - Drei `<Text>`, size 0.3 units, color white, bold.
   - Positioned slightly above and to the side of the node, with a subtle `<Float>` wrapper for gentle bobbing.

### 7.3 Node Layout & Positioning

The 7 nodes are positioned along a gentle arc (not a straight line). Looking at the image:

- The arc curves upward slightly in the center (nodes 3-5 are higher than 1 and 7).
- X positions spread from approximately -5.5 to +5.5 world units.
- Y positions follow a shallow parabola: `y = -0.15 * (x - 0)^2 + 2.5` (peak at center).
- Z: All at z = 0, but with slight random jitter of ±0.1 for depth.

Approximate positions (in world units, origin at center of viewport):

| Node | X | Y | Z |
|---|---|---|---|
| 1 - Insighting | -5.0 | 0.8 | 0.0 |
| 2 - Product | -3.3 | 1.4 | 0.05 |
| 3 - Design | -1.6 | 1.8 | -0.05 |
| 4 - Frontend | 0.0 | 2.0 | 0.0 |
| 5 - Backend | 1.7 | 1.8 | 0.05 |
| 6 - DB | 3.3 | 1.3 | -0.05 |
| 7 - QA | 5.0 | 0.7 | 0.0 |

### 7.4 Node Animations

**Idle State (Continuous):**

1. **Outer Ring Rotation:**
   - Odd-numbered nodes (1, 3, 5, 7): rotate clockwise at 0.5 RPM → `rotation.z -= 0.00052` per frame (at 60fps).
   - Even-numbered nodes (2, 4, 6): rotate counter-clockwise → `rotation.z += 0.00052` per frame.

2. **Subtle Float:**
   - Wrap each node group in a Drei `<Float>` with: `speed: 2`, `rotationIntensity: 0`, `floatIntensity: 0.3`, `floatingRange: [-0.05, 0.05]`.
   - This gives each node a gentle vertical hover.

3. **Core Pulse:**
   - The inner core opacity oscillates: `0.5 + 0.2 * sin(time * 1.5)`.
   - The glow ring opacity oscillates in antiphase: `0.3 + 0.1 * sin(time * 1.5 + PI)`.

**Processing State (Triggered when a data particle reaches the node):**

1. **Scale Pop:**
   - framer-motion-3d: `animate={{ scale: [1, 1.15, 1] }}` with `transition: { duration: 0.3, ease: [0.175, 0.885, 0.32, 1.275] }` (elastic).
   - Reset to idle after animation completes.

2. **Flash Brighten:**
   - The inner core material emissive property spikes: `emissiveIntensity` goes from 0 to 1.5 over 100ms, then back to 0 over 200ms.
   - Color of the emissive flash: `--cyan-primary`.

3. **Ripple Ring Emission:**
   - Spawn a temporary mesh: `RingGeometry(0.4, 0.42)`, `MeshBasicMaterial({ color: '#00E5FF', transparent: true, opacity: 0.8 })`.
   - Animate over 600ms: `scale: [1, 2.5]`, `opacity: [0.8, 0]`.
   - Remove mesh from scene after animation completes.
   - Use `useFrame` or framer-motion-3d for this.

---

## 8. Component 4 — Data Stream Particles

### 8.1 Particle Visual

Each data particle is a small glowing sphere traveling along one of the pipeline splines.

- **Geometry:** `SphereGeometry(radius: 0.04, widthSegments: 8, heightSegments: 8)` — low poly for performance.
- **Material:** `MeshBasicMaterial({ color: '#FFFFFF' })` with a strong bloom making it appear as a bright white-core, cyan-haloed orb.
- **Trail:** Each particle can optionally leave a fading trail. Implement by spawning 3-5 smaller trailing spheres at previous positions, each with decreasing opacity (0.6, 0.4, 0.2, 0.1) and slightly smaller scale.

### 8.2 Particle Motion

- Each particle is assigned to one of the 5-7 spline curves.
- It travels from `t=0` (leftmost point) to `t=1` (rightmost point) using `curve.getPointAt(t)`.
- `t` increments each frame: `t += delta * speed`.
- **Speed variation:**
  - Fast particles (Frontend data): duration ~3 seconds (speed ≈ 0.0055 per frame at 60fps).
  - Medium particles: ~4.5 seconds.
  - Slow particles (DB data): ~6 seconds.
- **Easing:** Linear (constant speed along the path).
- **Spawning:** New particles spawn at random intervals: every 0.5 to 2.0 seconds, a new particle appears at `t=0` on a randomly chosen spline.
- **Despawning:** When `t >= 1`, the particle is removed from the scene.

### 8.3 Node Interaction

When a particle's position is within 0.5 units of an Engine Node center:
1. Trigger the node's **Processing State** animation (Section 7.4).
2. The particle briefly brightens (emissive intensity doubles for 200ms).
3. A tiny burst of 5-8 micro-particles radiates outward from the node (starburst), each traveling 0.3 units in a random direction before fading out over 300ms.

---

## 9. Component 5 — Bottom Agent Telemetry Cards

### 9.1 Layout

Seven cards in a horizontal row at the bottom of the main stage (Grid Row 3, Col 1).

- Container: CSS Grid, `grid-template-columns: repeat(7, 1fr)`, `gap: 12px`, `padding: 16px 20px`.
- Each card: `min-width: 0`, `padding: 14px 12px`, glassmorphism styling (Section 2.3).

### 9.2 Individual Card Structure (Top to Bottom)

Each card contains these elements in a vertical flex layout:

1. **Agent Title (top):**
   - Text: e.g., "INSIGHTING ENGINE"
   - Style: Space Grotesk, 11px, 600 weight, white, letter-spacing 1px, uppercase.

2. **Task Description:**
   - Text: e.g., "Market Trends" or "Code generation React/Next.js"
   - Style: JetBrains Mono, 9px, `--text-cyan`, opacity 0.8.

3. **Primary Metric:**
   - Text: e.g., "89% optimized" or "110 Deployments" or "96% Uptime"
   - Style: Space Grotesk, 16px, 700 weight, white. The number portion is larger/bolder.

4. **Segmented LED Progress Bar:**
   - Visual: A horizontal row of 15 tiny rectangular blocks (`width: 100% / 15`, `height: 4px`, `border-radius: 1px`).
   - Filled segments: Colored `--cyan-primary` (or `--orange-energy` for backend cards).
   - Empty segments: `rgba(255, 255, 255, 0.08)`.
   - The fill level corresponds to the metric percentage (e.g., 89% → 13 of 15 segments filled).

5. **Status Badge:**
   - A small pill at the bottom-left reading "ACTIVE".
   - Style: `background: rgba(0, 230, 118, 0.15)`, `border: 1px solid var(--green-active)`, `color: var(--green-active)`, `font-size: 8px`, `padding: 1px 6px`, `border-radius: 3px`.

6. **Activity Breakdown (fine print):**
   - Below the status badge, 4-5 lines of tiny text:
     - "Activity activity: ..." with small percentage values
     - "Activity optimization: ..."
     - "Activity connections: ..."
     - "Activity recovery: ..."
     - "Activity comprehensive: ..."
   - Style: JetBrains Mono, 7px, `--text-muted`.

### 9.3 The 7 Cards Data

| Card | Title | Task | Metric | Progress |
|---|---|---|---|---|
| 1 | INSIGHTING ENGINE | Market Trends | 89% optimized | 89% |
| 2 | PRODUCT ENGINE | Roadmap v3.1, Features: 14 | Feature 14 Active | 78% |
| 3 | DESIGN ENGINE | 3D Mockups, Webframes | 94% complete | 94% |
| 4 | FRONTEND ENGINE | Code generation React/Next.js | 110 Deployments | 85% |
| 5 | BACKEND ENGINE | API status GraphQL | 96% Uptime | 96% |
| 6 | DB ENGINE | Schema optimized, SQL | 4,278 Data | 72% |
| 7 | QA ENGINE | Test codes, R3 Q4 Coverage | 59% | 59% |

### 9.4 Card Hover Animation

When the user hovers over a card:

- **Lift:** `transform: translateY(-8px)` over `0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- **Border Glow:** Border color transitions from `--panel-border` (0.15 opacity) to `--panel-border-hover` (0.6 opacity).
- **Shadow:** `box-shadow` transitions to `0 12px 24px rgba(0, 0, 0, 0.5), 0 0 20px var(--cyan-glow)`.
- **Background:** Opacity increases from 0.4 to 0.7.
- **On mouse-leave:** All properties transition back over `0.3s`.

### 9.5 Card Data Animation

**Metric Number Ticking:**
- Every 3-7 seconds (random interval per card), the primary metric number updates.
- Old number: animates `translateY(-12px)` + `opacity: 0` over 150ms.
- New number: starts at `translateY(12px)` + `opacity: 0`, animates to `translateY(0)` + `opacity: 1` over 150ms.
- This creates a vertical "slot machine" scroll effect.

**LED Progress Bar Shimmer:**
- Every 400-600ms, 1-3 random LED segments in the bar "blink":
  - Filled segment: brightness flares to 150% for 200ms, then returns.
  - Occasionally, an empty segment flashes on and off (simulating a processing spike).
- This creates a twinkling, alive feel on the progress bars.

---

## 10. Component 6 — Right Sidebar: Voice Interaction Module

### 10.1 Overview

This is the 3D audio-reactive waveform mesh occupying the top ~180px of the right sidebar. It is the most visually complex element after the pipeline. It is rendered INSIDE the R3F canvas at coordinates corresponding to the top-right of the screen.

### 10.2 3D Wireframe Wave Mesh

**Geometry:**
- `PlaneGeometry(width: 4, height: 2, widthSegments: 80, heightSegments: 30)`.
- The plane is oriented facing the camera (XY plane) and positioned at approximately `[5.5, 3.5, -1]` in world space (top-right).

**Vertex Displacement (Shader):**
- Each vertex's Z position is displaced using a combination of:
  - **Primary wave:** `sin(x * 2.0 + time * 0.8) * 0.3`
  - **Perlin noise:** `noise3D(x * 0.5, y * 0.5, time * 0.2) * 0.5`
  - **Audio amplitude multiplier** (simulated): A uniform `u_amplitude` that defaults to `0.4` (idle), increases to `0.8` (human speaking), and `1.2` (AI speaking).

**Material — Custom ShaderMaterial:**
- `wireframe: true`
- The wire color is NOT uniform — it maps to the vertex displacement height:
  - Troughs (z < -0.2): `--cyan-primary` (#00E5FF)
  - Mid (z ≈ 0): `--purple-neural` (#9D4EDD)
  - Peaks (z > 0.3): `--orange-energy` (#FF9100) blending to bright yellow (#FFB300)
- This is implemented in the fragment shader using `mix()` based on the displaced Z value passed from the vertex shader as a varying.
- Base opacity: 0.6, with peaks at full opacity.

**Fluid Ribbons (Overlay):**
- On top of the wireframe mesh, 2-3 ribbon-like `TubeGeometry` curves weave through the mesh.
- These ribbons are smooth (not wireframe), with high emissive values.
- Ribbon 1: `--purple-neural`, snaking through the top half.
- Ribbon 2: `--orange-energy` / yellow, snaking through the bottom half.
- Ribbon 3: `--cyan-primary`, cutting through the center.
- Each ribbon follows a path defined by `CatmullRomCurve3` with ~10 control points that shift positions over time (slowly orbiting their base positions).
- TubeGeometry radius: 0.015 units. Material: `MeshBasicMaterial` with high opacity and bloom.

### 10.3 Constellation Nodes & Connections

**Vertex Stars:**
- Select ~30-40 random vertices from the plane geometry.
- At each, place a tiny `Points` sprite or small sphere (`radius: 0.02`).
- Material: `PointsMaterial({ color: '#FFFFFF', size: 0.03, sizeAttenuation: true })` or individual `MeshBasicMaterial({ color: '#FFFFFF' })`.
- These represent "neural nodes" in the waveform.

**Twinkle Animation:**
- Each star's opacity oscillates independently: `opacity = 0.2 + 0.8 * abs(sin(time * (1 + random_offset)))`.
- The `random_offset` per star ensures they don't sync.
- Period: 1-3 seconds per twinkle.

**Constellation Lines:**
- Between adjacent stars (within 0.5 units of each other), draw thin lines using Drei `<Line>` or `BufferGeometry` with `LineBasicMaterial`.
- Line color: `rgba(255, 255, 255, 0.15)`.
- These lines **fade in and out** as the wave moves — when two connected stars are both at high opacity, the line between them becomes visible (opacity 0.3). When either star dims, the line fades.
- Update every frame.

### 10.4 Audio-Reactive States

Since this is a mock dashboard (no real microphone), simulate these states on a loop:

**Idle State (Default, ~60% of time):**
- Wave amplitude: 0.4 (gentle undulation).
- Wave speed: `time * 0.8`.
- Constellation lines: ~30% visible at any time.
- Colors: Balanced mix of cyan, purple, orange.

**Human Speaking State (~20% of time, triggered by simulated Dr. Chen input):**
- Wave amplitude decreases slightly to 0.3 BUT sharp transient spikes appear (simulating voice formants).
- Implement spikes by adding `0.4 * sin(x * 8.0 + time * 4.0) * step(sin(time * 3.0), 0.5)` to the displacement — this creates intermittent sharp ridges.
- Cyan-dominant coloring.
- Constellation activity increases (more lines visible).

**AI Speaking State (~20% of time, triggered by simulated AI Nexus response):**
- Wave amplitude increases to 1.2.
- Wave speed doubles: `time * 1.6`.
- Purple and orange colors dominate (the emissive intensity on those ranges increases by 200%).
- Constellation lines rapidly connect and disconnect — "neural firing" effect. Lines flash on for 100ms and off for 50ms in rapid succession.
- The fluid ribbons pulse brighter, their radius oscillates between 0.01 and 0.025.

**Transition Timing:**
- Use a state machine in Zustand:
  - `idle` → (after 4-6s random) → `humanSpeaking` for 2-3s → `idle` for 1s → `aiSpeaking` for 3-5s → `idle` → repeat.
- State transitions should LERP the amplitude/speed uniforms over 500ms (not snap).

### 10.5 AKINFORMS Visualization (Small Sub-Panel)

In the reference image, there is a small rectangular sub-panel labeled "AKINFORMS" on the right side of the main stage, near the pipeline. It shows small horizontal bar charts.

- **Position:** HTML overlay, positioned at approximately the right edge of the main stage, vertically centered.
- **Content:**
  - Title: "AKINFORMS" in JetBrains Mono, 9px, white.
  - 5 small horizontal progress bars, each ~80px wide, 3px tall.
  - Labels next to each: "Semantics", "Context", "Communication", "Authority", "Skill" — in JetBrains Mono, 7px, `--text-muted`.
  - Bar fills: gradient from `--cyan-primary` (left) to `--purple-neural` (right).
  - Each bar is at a different fill level (60%, 80%, 45%, 70%, 55%).
- **Animation:** Bar fills slowly oscillate ±5% over 5 seconds.

---

## 11. Component 7 — Right Sidebar: Real-Time Interaction Panel

### 11.1 Panel Header

- Title: "REAL-TIME INTERACTION" in Space Grotesk, 13px, white, letter-spacing 2px.
- Subtitle: "HUMAN-AI VOICE CONVERSATION" in JetBrains Mono, 9px, `--cyan-primary`.
- Below subtitle: "VOICE WAVEFORM" label in 8px, `--text-muted`.

### 11.2 Conversation Transcript

Below the voice waveform display, a conversation transcript panel shows the human-AI dialogue.

**Layout:**
- Container: `height: 100px`, `overflow: hidden`.
- A gradient mask at the top: `mask-image: linear-gradient(to bottom, transparent 0%, black 20%, black 100%)` — this fades out older messages at the top.

**Message Format:**
- Each message is a row:
  - Speaker tag: "DR. CHEN:" or "AI NEXUS:" — JetBrains Mono, 9px, bold. Dr. Chen in `--cyan-primary`, AI Nexus in `--purple-neural`.
  - Message text: JetBrains Mono, 9px, `--text-secondary`.
  - Wrapped in a `<div>` with `margin-bottom: 8px`.

**Sample Conversation Loop:**
```
DR. CHEN: "Optimize the user login flow on Backend..."
AI NEXUS: "Understood. Optimizing Backend & Frontend, generating QA tests."
DR. CHEN: "Run full regression on the updated modules."
AI NEXUS: "Regression initiated. Estimated completion: 4 minutes."
```

**Animation:**
- **AI text typewriter:** When an AI NEXUS message appears, it types out character by character at 12ms per character. A blinking cursor (`|`) follows the text during typing, then disappears.
- **Message scroll:** When a new message is added, the entire message list slides upward by the height of the new message. Transition: `transform: translateY(-Npx)` with `0.4s ease-out`.
- **Cycle:** The conversation loops every 30 seconds with slight variations in the text.

---

## 12. Component 8 — Right Sidebar: System Overview Analytics

### 12.1 Layout

Below the transcript, a panel titled "SYSTEM OVERVIEW" with:
- Header: "SYSTEM OVERVIEW" — Space Grotesk, 12px, white, uppercase.
- Bullet items (to the right of the chart):
  - "Graphs"
  - "Performance Metrics"
  - "CPU/Memory Usage"
  Each in JetBrains Mono, 8px, `--text-secondary`, with a small `--cyan-primary` dot prefix.

### 12.2 Live Line Chart

- **Type:** Multi-line SVG chart showing 2-3 data series (Performance, CPU, Memory).
- **Dimensions:** ~200px wide, ~80px tall.
- **X-axis:** Time (rolling window of last 30 data points). Subtle tick marks at bottom, no labels.
- **Y-axis:** 0 to 100 (implied by grid lines). Subtle horizontal grid lines at 25%, 50%, 75%, color `rgba(255, 255, 255, 0.05)`.
- **Line 1 (Performance):** `stroke: #00E5FF`, `stroke-width: 1.5px`. Area fill: linear gradient from `rgba(0, 229, 255, 0.2)` at the line to `transparent` at the bottom.
- **Line 2 (CPU):** `stroke: #FF9100`, `stroke-width: 1px`, dashed.
- **Line 3 (Memory):** `stroke: #9D4EDD`, `stroke-width: 1px`, dotted.

**Rolling Animation:**
- Every 1.5 seconds, a new data point is generated (random value 40-90 for Performance, 20-70 for CPU, 30-60 for Memory).
- The entire chart shifts left by one data point width.
- New point animates in from the right edge.
- The path `d` attribute is recalculated each update with a smooth `transition: d 0.5s ease`.

### 12.3 Task Counter

- Large text: "12,345" in Space Grotesk, 22px, white, bold.
- Label: "Tasks" in JetBrains Mono, 10px, `--text-muted`.
- **Animation:** The number occasionally ticks up by 1-5, using the same slot-machine scroll effect described in Section 9.5.

---

## 13. Component 9 — Right Sidebar: Agent Status & Project Milestones

### 13.1 Agent Status List

A vertical list of 4-5 named agents, each with a status indicator:

| Agent | Status |
|---|---|
| Dr. Chen Status | ACTIVE (green) |
| Backend Status | ACTIVE (green) |
| Augment Status | ACTIVE (green) |
| AI Flights | ACTIVE (green) |

**Per item:**
- A small circle dot (`8px` diameter) colored `--green-active`.
- Agent name: JetBrains Mono, 9px, white.
- "ACTIVE" badge: same styling as card badges (Section 9.2 item 5).

**Animation — Radar Ping on Green Dots:**
```css
@keyframes radar-ping {
  0% { box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(0, 230, 118, 0); }
  100% { box-shadow: 0 0 0 6px rgba(0, 230, 118, 0); }
}
```
- Duration: 1.5s, infinite, staggered start per dot (0ms, 375ms, 750ms, 1125ms).

### 13.2 Project Milestones

- Large circular progress indicator or just a large number: "84%" in Space Grotesk, 28px, white.
- Label: "PROJECT MILESTONES" in 9px, `--text-muted`.
- Sub-label: "84% complete" in 8px, `--text-cyan`.
- Optionally, a small circular SVG progress ring around the percentage.
- **Animation:** The ring fills from 0% to 84% on initial load (during boot sequence), using a `stroke-dashoffset` animation over 2 seconds.

---

## 14. Component 10 — Right Sidebar: System Logs Terminal

### 14.1 Visual

The very bottom section of the sidebar. Styled to look like a terminal/console output.

- **Background:** Slightly darker than panels: `rgba(5, 10, 20, 0.6)`.
- **Border:** Same glassmorphism border but with reduced opacity: `rgba(0, 229, 255, 0.08)`.
- **Font:** JetBrains Mono, 8px, line-height 1.4.
- **Text color:** `rgba(255, 255, 255, 0.5)` for most text. Timestamps in `--cyan-primary`. Severity keywords ("ERROR" in `--red-alert`, "CODE" in `--green-active`).
- **Scrollbar:** Hidden (`overflow: hidden` — auto-scrolls only).

### 14.2 Log Entry Format

Each log line:
```
[YYYY-MM-DD HH:MM:SS] "Log message content here..."
```

**Sample log entries (loop through these):**
```
20-09-24 12:00:03  "Optimize the user login flow on Backend..."
20-09-24 12:00:04  "Optimize State Merging select task query based..."
20-09-24 12:00:05  "Optimize the chat engine for Bottleneck..."
20-09-24 12:00:06  "Optimize Infrastructure Management setup..."
20-09-24 12:00:07  "Frontend/Optimizing User Login UI & Backend & Frontend..."
20-09-24 12:00:08  "Machine learning Execution Shutdown stress test..."
20-09-24 12:00:09  [CODE] Frontend AI-ED training on the test...
20-09-24 12:00:10  Frontend Hybrid testing request: Frontend Application...
```

### 14.3 Log Animation

- **New entry appearance:** Each new log line fades in from the bottom:
  - Start: `opacity: 0`, `transform: translateX(-10px)`.
  - End: `opacity: 1`, `transform: translateX(0)`.
  - Duration: `150ms`, `ease-out`.
- **Scroll:** As new lines appear (every 1.5-2.5 seconds, random), the log container auto-scrolls to show the latest entry. Older entries slide up and eventually are removed from the DOM (keep max 20 lines).
- **Timestamp blink:** The newest log entry's timestamp blinks once (opacity 1 → 0.3 → 1) over 500ms right after appearing.

---

## 15. Component 11 — Tab Navigation

### 15.1 Visual

In the upper-right area of the main stage (visible in the image between the pipeline and sidebar), there are three tab buttons in a row:

| Tab | Label | Default State |
|---|---|---|
| Tab 1 | "AGENT STATUS" | **Active** (filled background) |
| Tab 2 | "PHASES: 7" | Inactive (outline only) |
| Tab 3 | "AGENT" | Inactive (outline only) |

**Active tab styling:**
- Background: `--cyan-primary`.
- Text: `#030712` (dark), JetBrains Mono 9px, bold.
- Border-radius: 4px.
- Padding: 4px 12px.

**Inactive tab styling:**
- Background: transparent.
- Text: `--cyan-primary`, JetBrains Mono 9px.
- Border: 1px solid `--panel-border`.
- Padding: 4px 12px.

### 15.2 Tab Hover & Click

- **Hover (inactive):** Border color transitions to `--cyan-primary` at 0.5 opacity, background gets a subtle `rgba(0, 229, 255, 0.05)`.
- **Click:** The clicked tab becomes active (background fills), previously active tab becomes inactive. Transition: 200ms ease.
- Note: In this mock, tabs don't change content — they are visual indicators only. However, clicking them could toggle which data set the pipeline chart overlay shows.

---

## 16. Component 12 — Pipeline Chart Overlay (Bar/Line Graph)

### 16.1 Overview

Behind (or above) the pipeline flow, there is a semi-transparent bar chart / line graph. This is visible in the image as vertical bars and a superimposed line chart in the main stage area, providing a data backdrop to the pipeline.

### 16.2 Chart Specification

**Type:** Combined bar chart + line overlay.

**Dimensions:** Spans the full width of the main stage, from x=-5.5 to x=+5.5. Height range corresponds to the y-axis labels on the left: scale from -20 to 150 (visible grid markings at -20, 0, 10, 20, 30, 40, 150).

**Y-axis labels (left side):**
- Positioned as Drei `<Text>` elements or HTML overlays at the left edge.
- Values: "150", "40", "30", "20", "10", "0", "-20".
- Style: JetBrains Mono, 8px, `--text-muted`.
- Horizontal grid lines (very faint): `rgba(255, 255, 255, 0.03)`.

**Bars:**
- Approximately 20-30 vertical bars evenly spaced across the width.
- Bar width: thin (~0.15 units or ~8px in screen space).
- Bar color: Gradient from `--cyan-deep` at the base to `--cyan-primary` at the top. Some bars may be `--orange-energy` if they represent backend metrics.
- Bar heights vary (random data: 10-120 range mapped to the y-axis).
- Opacity: 0.3 (semi-transparent so the pipeline flows are visible through them).

**Line overlay:**
- A smooth line connecting the top of each bar (like a moving average).
- Stroke: `--cyan-primary`, 1.5px, opacity 0.5.

**Labels scattered above bars:**
- Small text labels like "DATA", "SYNC", "READ", "PRODUCT", "NOVEL EDITS", "MODEL STATS", "INDUSTRY", "HOSPITAL", "PROJECT", etc.
- Style: JetBrains Mono, 7px, `--text-muted`, rotated 0deg (horizontal).
- These give context to what each bar/region represents.

### 16.3 Chart Animations

- **Bar height breathing:** Each bar's height oscillates ±3% of its value over 4-6 seconds (sine wave, random phase per bar). This makes the chart feel alive.
- **Line re-draw:** Every 5 seconds, the line smoothly transitions to new data points (bars change height, line follows). Transition: `1s ease-in-out`.
- **Fade from background:** During boot-up, bars grow from height 0 to their target height over 1.5s with staggered delays (50ms per bar from left to right).

---

## 17. Boot-Up Initialization Sequence

This is the choreographed animation that plays when the dashboard first loads. It should use **Theatre.js** for precise timeline control, or GSAP with a master timeline.

### Timeline

| Time | Element | Action | Easing |
|---|---|---|---|
| **T=0.0s** | Entire screen | Everything invisible. `opacity: 0` on all elements. Screen is pure `--space-void` black. | — |
| **T=0.2s** | Cyan scanner line | A horizontal line (2px tall, `--cyan-primary`, full-width glow) sweeps from top to center of screen over 0.5s, then fades. | `ease-out` |
| **T=0.3s** | Header | Header container fades in. `opacity: 0 → 1` over 0.8s. Logo starts spinning. | `ease-out` |
| **T=0.5s** | Pipeline splines | SVG/mesh draw-in: `stroke-dasharray` set to total length, `stroke-dashoffset` animates from full length to `0`. Lines draw themselves left-to-right over 2.0s. | `cubic-bezier(0.25, 1, 0.5, 1)` |
| **T=0.8s** | Engine Node 1 | `scale(0) → scale(1.2) → scale(1.0)`, elastic bounce. Duration: 0.6s. | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` |
| **T=0.9s** | Engine Node 2 | Same elastic bounce, 100ms after Node 1. | Same |
| **T=1.0s** | Engine Node 3 | Same, staggered. | Same |
| **T=1.1s** | Engine Node 4 | Same. | Same |
| **T=1.2s** | Engine Node 5 | Same. | Same |
| **T=1.3s** | Engine Node 6 | Same. | Same |
| **T=1.4s** | Engine Node 7 | Same. | Same |
| **T=1.5s** | Bottom cards | All 7 cards slide up simultaneously from below: `translateY(40px), opacity: 0 → translateY(0), opacity: 1`. Staggered 60ms per card (Card 1 at T=1.5, Card 2 at T=1.56, etc.). Duration per card: 0.5s. | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| **T=1.5s** | Chart bars | Bars grow from height 0 to target. Staggered 40ms per bar from left to right. Duration: 1.0s per bar. | `ease-out` |
| **T=1.8s** | Voice waveform mesh | Canvas fades in: `opacity: 0 → 1` over 1.5s. The mesh amplitude starts at `0` and grows to `0.4` (idle) over 2.5s. | `ease-in-out` |
| **T=2.0s** | Sidebar panels | All sidebar panels (transcript, system overview, agent status, milestones) fade in. `opacity: 0 → 1` over 0.8s. | `ease-out` |
| **T=2.2s** | System logs | Log terminal appears. Rapidly prints 5 "System Initializing..." lines at 80ms intervals, then transitions to normal slow log output speed. | — |
| **T=2.5s** | Project Milestones ring | The circular progress ring fills from 0% to 84% over 2.0s. | `ease-in-out` |
| **T=3.0s** | Data particles | First data packet spawns and begins flowing along spline 1. Additional particles spawn at increasing frequency over the next 2 seconds until reaching steady-state (1 new particle every 0.5-2.0s). | Linear |
| **T=3.5s** | Vignette overlay | Vignette fades in over 1.0s. System is fully live. | `ease-in` |

---

## 18. Continuous Ambient Animations

These animations run **forever** after boot-up and never stop:

1. **Pipeline spline undulation:** Sine wave time parameter increments continuously (Section 6.3).
2. **Engine node outer ring rotation:** Continuous clockwise/counter-clockwise per node (Section 7.4).
3. **Engine node float:** Gentle vertical bobbing via `<Float>` (Section 7.4).
4. **Engine node core pulse:** Opacity oscillation (Section 7.4).
5. **Data particle flow:** Continuous spawning, traveling, and despawning (Section 8).
6. **Voice waveform:** Perlin noise displacement, constellation twinkle, state cycling (Section 10).
7. **Fluid ribbons:** Slow path shifting and brightness oscillation (Section 10.2).
8. **Card LED shimmer:** Random LED segment blinks (Section 9.5).
9. **Agent status radar pings:** Green dot pulse (Section 13.1).
10. **Log auto-scroll:** New lines appear every 1.5-2.5s (Section 14.3).
11. **System chart rolling:** New data point every 1.5s (Section 12.2).
12. **Task counter ticking:** Occasional increment (Section 12.3).
13. **Header logo spin:** Continuous orbital rotation (Section 5.2).
14. **Header scanner line:** Border scan animation (Section 5.2).
15. **"OPTIMAL" flicker:** Every 4.5 seconds (Section 5.2).
16. **Chart bar breathing:** ±3% height oscillation (Section 16.3).
17. **Ambient background particles:** Thousands of tiny dots drifting slowly across the 3D scene (Drei `<Sparkles>` or `<Stars>` with very low speed).

---

## 19. Post-Processing & Shader Effects

Applied via `@react-three/postprocessing` `<EffectComposer>`:

### 19.1 Bloom

```jsx
<Bloom
  intensity={0.8}
  luminanceThreshold={0.6}
  luminanceSmoothing={0.9}
  mipmapBlur={true}
  radius={0.4}
/>
```
- This makes all bright elements (particles, node flashes, waveform peaks) emit a soft glow halo.
- Critical for the "neon" look.

### 19.2 Vignette (3D Layer)

```jsx
<Vignette offset={0.3} darkness={0.7} />
```
- Complements the CSS vignette overlay to darken the extreme corners of the 3D scene.

### 19.3 Chromatic Aberration

```jsx
<ChromaticAberration offset={[0.0005, 0.0005]} />
```
- Very subtle RGB split at the edges of the screen. Gives a lens/holographic quality.
- Keep this minimal — too much looks broken.

### 19.4 Noise (Film Grain)

```jsx
<Noise opacity={0.03} />
```
- Nearly invisible film grain that adds texture and prevents the digital flatness.

### 19.5 Depth of Field (Optional)

```jsx
<DepthOfField
  focusDistance={0.01}
  focalLength={0.02}
  bokehScale={2}
/>
```
- Slightly blurs elements far from the camera focal plane. Only enable if performance allows.

---

## 20. Responsive Considerations

This dashboard is designed for **widescreen displays (16:9, 1920x1080 minimum)**. However:

- For screens below 1600px wide: The sidebar width shrinks from 380px to 320px. Card font sizes decrease by 1px.
- For screens below 1400px wide: The bottom cards switch from 7 columns to a horizontal scroll container. The chart overlay hides.
- For screens below 1200px wide: The sidebar stacks below the main stage instead of beside it.
- Mobile is not a primary target but the layout should not break — use `min-width: 1200px` as the practical minimum.

---

## 21. Performance Budget & Optimization

### Target: 60fps on mid-range GPU (e.g., GTX 1660, M1 MacBook)

**Optimization strategies:**

1. **Instanced Meshes:** All data particles should use `InstancedMesh` rather than individual meshes. Max 200 particle instances.
2. **Level of Detail:** Engine node dashed rings use low segment counts (32 instead of 128).
3. **Shader Uniforms:** All time-driven animations use shader uniforms updated in `useFrame`, not React state (which would cause re-renders).
4. **Geometry Reuse:** All 7 engine nodes share the same geometry instances; only transforms differ.
5. **Dispose on Unmount:** All geometries, materials, and textures must be disposed in cleanup functions.
6. **Drei Optimizations:** Use `<Preload all />` at the end of the Canvas to preload all assets.
7. **HTML Layer:** Use `React.memo` on all card components. Use `will-change: transform` on animated elements.
8. **Throttle Log Updates:** Log DOM manipulations every 1.5s minimum. Keep max 20 lines in DOM.
9. **Canvas DPR:** Cap at `2` even on high-DPI screens via `dpr={[1, 2]}`.

---

## 22. Data Model & Mock Data Structure

Use **Zustand** for the global store. Here is the shape:

```typescript
interface DashboardState {
  // Boot sequence
  isBooting: boolean;
  bootProgress: number; // 0.0 to 1.0

  // Voice interaction state machine
  voiceState: 'idle' | 'humanSpeaking' | 'aiSpeaking';
  voiceAmplitude: number;

  // Agents (array of 7)
  agents: Agent[];

  // Conversation transcript
  messages: Message[];

  // System metrics (rolling arrays of last 30 values)
  performanceData: number[];
  cpuData: number[];
  memoryData: number[];

  // Logs
  logs: LogEntry[];

  // Global metrics
  totalTasks: number;
  projectMilestonePercent: number;

  // Pipeline particles
  activeParticles: Particle[];
}

interface Agent {
  id: number;
  name: string;
  task: string;
  metric: string;
  metricValue: number;
  progressPercent: number;
  status: 'active' | 'idle' | 'error';
  activities: string[];
}

interface Message {
  speaker: 'DR. CHEN' | 'AI NEXUS';
  text: string;
  timestamp: number;
}

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'code' | 'warning' | 'error';
}

interface Particle {
  id: string;
  splineIndex: number;
  t: number; // 0 to 1 position along spline
  speed: number;
}
```

---

## 23. File & Folder Structure

```
src/
├── App.tsx                          # Root: mounts Canvas + HTML overlay
├── store/
│   └── useDashboardStore.ts         # Zustand store
├── canvas/
│   ├── Scene.tsx                    # Main R3F scene composition
│   ├── pipeline/
│   │   ├── DataSplines.tsx          # The 5-7 sinusoidal flowing curves
│   │   ├── EngineNode.tsx           # Single engine node (reusable x7)
│   │   ├── EngineNodesGroup.tsx     # Positions all 7 nodes
│   │   ├── DataParticles.tsx        # Instanced mesh particle system
│   │   └── PipelineChartBars.tsx    # The 3D bar chart overlay
│   ├── voice/
│   │   ├── VoiceWaveform.tsx        # The Perlin noise plane mesh
│   │   ├── FluidRibbons.tsx         # The emissive tube ribbons
│   │   ├── ConstellationNodes.tsx   # Stars + connecting lines
│   │   └── waveShader.glsl         # Custom vertex/fragment shader
│   ├── environment/
│   │   ├── AmbientParticles.tsx     # Background floating sparkles
│   │   ├── Lighting.tsx             # All light sources
│   │   └── PostProcessing.tsx       # EffectComposer setup
│   └── shaders/
│       ├── splineGlow.glsl          # Glow shader for data streams
│       └── noiseDisplacement.glsl   # Perlin noise for waveform
├── overlay/
│   ├── DashboardGrid.tsx            # CSS Grid layout container
│   ├── Header.tsx                   # Header module
│   ├── header/
│   │   ├── Logo.tsx                 # Animated SVG atom logo
│   │   ├── StatusIndicator.tsx      # "OPTIMAL" with flicker
│   │   └── TabNav.tsx               # Agent Status / Phases / Agent tabs
│   ├── cards/
│   │   ├── CardRow.tsx              # Container for 7 cards
│   │   ├── AgentCard.tsx            # Single agent telemetry card
│   │   ├── LEDProgressBar.tsx       # The segmented progress bar
│   │   └── MetricTicker.tsx         # Slot-machine number component
│   ├── sidebar/
│   │   ├── Sidebar.tsx              # Sidebar container
│   │   ├── VoicePanel.tsx           # Voice interaction frame + transcript
│   │   ├── Transcript.tsx           # Scrolling conversation messages
│   │   ├── TypewriterText.tsx       # Character-by-character text reveal
│   │   ├── SystemOverview.tsx       # Charts + task counter
│   │   ├── RollingChart.tsx         # The SVG rolling line chart
│   │   ├── AgentStatusList.tsx      # Green dot status items
│   │   ├── ProjectMilestones.tsx    # 84% progress ring
│   │   ├── AkinformsPanel.tsx       # Small bar chart sub-panel
│   │   └── LogTerminal.tsx          # Auto-scrolling log output
│   └── effects/
│       ├── Vignette.tsx             # CSS vignette overlay
│       ├── ScannerLine.tsx          # Header border scanner
│       └── BootSequence.tsx         # Orchestrates the load animation
├── hooks/
│   ├── useBootSequence.ts           # Theatre.js / GSAP timeline hook
│   ├── useParticleSystem.ts         # Manages particle lifecycle
│   ├── useVoiceStateMachine.ts      # Cycles through voice states
│   ├── useMetricUpdater.ts          # Random metric ticking logic
│   └── useLogGenerator.ts           # Generates fake log entries
├── utils/
│   ├── colors.ts                    # All color tokens exported
│   ├── splinePaths.ts               # CatmullRom curve definitions
│   └── mockData.ts                  # Initial agent data, log messages
├── styles/
│   └── global.css                   # CSS variables, glassmorphism, fonts
└── index.tsx                        # Entry point
```

---

## APPENDIX A: Quick Reference — What Goes Where

| Visual Element | Rendered In | Tech |
|---|---|---|
| Pipeline spline curves | R3F Canvas | Three.js CatmullRomCurve3 + custom ShaderMaterial |
| Engine nodes (circles, rings) | R3F Canvas | Three.js RingGeometry + CircleGeometry + framer-motion-3d |
| Data particles | R3F Canvas | Three.js InstancedMesh |
| Voice waveform mesh | R3F Canvas | Custom GLSL ShaderMaterial on PlaneGeometry |
| Fluid ribbons | R3F Canvas | TubeGeometry + MeshBasicMaterial |
| Constellation stars/lines | R3F Canvas | Points + LineSegments |
| Bar chart (behind pipeline) | R3F Canvas | BoxGeometry instances or HTML overlay |
| Bloom, vignette, noise | R3F Canvas | @react-three/postprocessing |
| Header, title, tabs | HTML Overlay | React DOM + CSS |
| Agent telemetry cards | HTML Overlay | React DOM + CSS + framer-motion |
| Sidebar panels | HTML Overlay | React DOM + CSS |
| Transcript / typewriter | HTML Overlay | React DOM + JS interval |
| System chart (SVG) | HTML Overlay | SVG in React |
| Logs terminal | HTML Overlay | React DOM + CSS animations |
| Vignette gradient | HTML Overlay | CSS radial-gradient |

---

## APPENDIX B: Animation Timing Cheat Sheet

| Animation | Duration | Easing | Loop |
|---|---|---|---|
| Logo orbit spin | 15-25s per path | linear | infinite |
| "OPTIMAL" flicker | 200ms burst every 4.5s | step | infinite |
| Header scanner line | 8s | ease-in-out alternate | infinite |
| Spline undulation | continuous (time-driven) | sine wave | infinite |
| Node outer ring rotation | 10s full revolution | linear | infinite |
| Node float bob | ~3s | sine | infinite |
| Node processing pop | 300ms | elastic (cubic-bezier 0.175, 0.885, 0.32, 1.275) | on trigger |
| Node ripple ring | 600ms | ease-out | on trigger |
| Particle travel (fast) | 3s | linear | per particle |
| Particle travel (slow) | 6s | linear | per particle |
| Card hover lift | 300ms | cubic-bezier(0.25, 0.46, 0.45, 0.94) | on hover |
| Metric tick (slot machine) | 200ms (150ms out + 150ms in) | ease-out | on data change |
| LED segment blink | 200ms | step | every 400-600ms |
| Voice state cycle | 4-6s idle, 2-3s human, 3-5s AI | lerp over 500ms | infinite loop |
| Constellation twinkle | 1-3s | sine | infinite per star |
| AI typewriter | 12ms per character | linear | per message |
| Message scroll | 400ms | ease-out | per new message |
| Chart data roll | 500ms transition per point | ease | every 1.5s |
| Green dot radar ping | 1.5s | ease-out | infinite |
| Log line entry | 150ms | ease-out | per new line |
| Bar height breathing | 4-6s | sine | infinite per bar |
| Milestone ring fill | 2s | ease-in-out | once on boot |
| Boot sequence total | 0s → 3.5s | choreographed | once |

---

## APPENDIX C: Critical Implementation Notes

1. **Do NOT use React state for per-frame animations.** All continuous animations (spline movement, particle positions, waveform displacement) must use `useFrame` with refs or shader uniforms. React re-renders at 60fps will destroy performance.

2. **The HTML overlay and 3D canvas are separate layers.** They do not interact via React props in real-time. Use Zustand as the bridge — the 3D scene writes particle positions and voice state; the HTML layer reads agent data and metrics.

3. **The voice waveform shader is the most complex piece.** Prioritize getting a PlaneGeometry with wireframe + Perlin noise displacement working first, then add the color gradient, then the constellation overlay, then the fluid ribbons. Build it incrementally.

4. **Glassmorphism requires `backdrop-filter` which does NOT work inside R3F `<Html>`.** All glassmorphic panels must be in the HTML overlay layer (Layer 1), not rendered via Drei's `<Html>` inside the canvas. The exception is if you use the `portal` prop on `<Html>` to render into a DOM node outside the canvas.

5. **Theatre.js is optional but recommended for the boot sequence.** If Theatre.js adds too much complexity, fall back to a simple GSAP timeline with `gsap.timeline()` and sequential `.to()` calls.

6. **Test the bloom intensity carefully.** Too much bloom makes text unreadable. Too little loses the neon aesthetic. Start with `intensity: 0.6` and tune up.

7. **The perspective/curvature CSS transform on the HTML layer must match the camera angle of the 3D layer.** If they don't align, the cards will appear to float disconnectedly from the 3D pipeline. Tune both together.

8. **Font loading matters.** Both Space Grotesk and JetBrains Mono must be loaded before the boot sequence starts. Use `document.fonts.ready` promise or `@fontsource` imports to ensure this.

---

*End of specification. This document contains everything needed to build the Neural Nexus dashboard. Build it section by section, test each component in isolation, then compose them together following the layout grid and boot sequence.*
