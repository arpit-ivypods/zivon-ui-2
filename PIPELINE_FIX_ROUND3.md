# NEURAL NEXUS — Pipeline Fix: Round 3 — COMPLETE RETHINK

## The Core Mistake in Previous Rounds

The previous instructions used the wrong mental model. I kept saying "ribbons" and "lines" — flat, 2D glowing strokes with additive blending. **That is fundamentally wrong.**

The reference image shows **3D physical pipes** — solid cylindrical tubes that exist in 3D space with proper lighting, shading, specular highlights, and volumetric presence. They look like glowing fiber-optic cables or neon tubes you could reach out and grab. They are **lit objects**, not flat glowing strokes.

This round takes a completely different approach.

---

## WHAT TO DELETE FIRST

Before building anything new, remove these elements entirely:

```
DELETE:
  ✗ All existing ribbon/spline TubeGeometry with AdditiveBlending flat materials
  ✗ The triple-layer ribbon system (outer glow tube + color body + white core)
  ✗ ALL bar chart geometry — every vertical bar, bar label, and bar material
    (The reference has NO bar chart at all — zero vertical bars)
  ✗ The Y-axis labels (150, 40, 30, 20, 10, 0, -20) — these were for the bar chart
  ✗ Bar chart bottom labels (CACHE, DEPLOY, PIPELINE, SCHEMA, etc.)

KEEP:
  ✓ Engine node positions (the 7 node locations are correct)
  ✓ Engine name labels ("FRONTEND ENGINE", etc.)
  ✓ "ACTIVE" badges
  ✓ Percentage metrics (89%, 78%, 94%, 118, 96%, 4,278, 59%)
  ✓ Node icons (keep the icons but the ring structure will change)
  ✓ Dark background
  ✓ Post-processing setup (bloom at ~0.45, no chromatic aberration)
  ✓ Ambient particles / stars in background
```

---

## THE NEW APPROACH: 3D LIT PIPES

### What Are We Building?

Study the reference image. The data flows are **solid 3D tubes** with these characteristics:

1. **They are 3D objects with shading** — brighter where light hits the top surface, darker on the underside. They cast subtle shadows. They have specular highlights (bright reflection streaks along their length). They look like physical neon glass tubes.

2. **They glow from within** — the pipe surface itself emits colored light (cyan or orange), but it also responds to scene lighting. This is NOT the same as a flat `MeshBasicMaterial` with additive blending. This requires a **lit material** like `MeshStandardMaterial` or `MeshPhysicalMaterial` with an emissive component.

3. **They have real diameter** — each pipe is visibly cylindrical. You can see the curvature of the tube surface. They are not flat strokes; they are round tubes approximately 0.04-0.06 world units in radius.

4. **They converge into nodes** — the pipes physically funnel into the center of each node hub, like plumbing connecting to a manifold. Multiple pipes merge into a single thick trunk entering the node, then branch back out on the other side.

5. **They travel in bundles** — 3-5 pipes run parallel to each other between nodes, spaced closely (like a cable bundle). At nodes, they converge to a single point, then fan out again.

---

## SECTION 1: PIPE GEOMETRY & MATERIAL

### 1.1 Individual Pipe Construction

Each pipe is a `TubeGeometry` with a **lit material** — this is the critical change from previous rounds.

```
Geometry per pipe:
  TubeGeometry(
    path:             CatmullRomCurve3 (see Section 3 for paths)
    tubularSegments:  120        (smooth along length)
    radius:           0.04       (visible 3D tube diameter)
    radialSegments:   8          (enough for visible roundness)
    closed:           false
  )
```

### 1.2 MATERIAL — The Critical Difference

**DO NOT USE** `MeshBasicMaterial`. Basic materials are unlit — they look flat and don't respond to light. This is what made previous rounds look like flat neon paint instead of 3D objects.

**USE** `MeshStandardMaterial` or `MeshPhysicalMaterial`:

```javascript
// CYAN PIPE MATERIAL
const cyanPipeMaterial = new THREE.MeshStandardMaterial({
  color: '#0088aa',              // Base color (darker than emissive — lighting will brighten it)
  emissive: '#00E5FF',           // Self-illumination color
  emissiveIntensity: 0.7,        // How strongly it glows (bloom amplifies this)
  metalness: 0.3,                // Slight metallic sheen
  roughness: 0.25,               // Smooth surface = visible specular highlights
  transparent: false,            // SOLID — not transparent
  side: THREE.FrontSide,         // Normal solid rendering
  // NO additive blending — these are solid 3D objects
});

// ORANGE PIPE MATERIAL
const orangePipeMaterial = new THREE.MeshStandardMaterial({
  color: '#996600',
  emissive: '#FFB800',
  emissiveIntensity: 0.6,
  metalness: 0.3,
  roughness: 0.25,
  transparent: false,
  side: THREE.FrontSide,
});

// WHITE/SILVER CENTER PIPE (one per bundle, runs through the middle)
const whitePipeMaterial = new THREE.MeshStandardMaterial({
  color: '#aaaaaa',
  emissive: '#FFFFFF',
  emissiveIntensity: 0.5,
  metalness: 0.5,
  roughness: 0.2,
  transparent: false,
  side: THREE.FrontSide,
});
```

### 1.3 Why MeshStandardMaterial Changes Everything

With `MeshStandardMaterial`:
- **The top of the pipe** catches the scene's point lights and ambient light → appears brighter
- **The bottom of the pipe** is in self-shadow → appears darker
- **Specular highlights** create bright streaks along the tube length where light reflects
- **The emissive component** makes the pipe glow from within, even in dark areas
- **Bloom post-processing** picks up the emissive glow and adds a soft halo
- **The result:** A pipe that looks like a physical, glowing glass/metal tube in 3D space

This is EXACTLY what the reference shows — 3D lit cylinders with visible surface curvature and light interaction.

### 1.4 Pipe Glow Halo (Supplementary)

In ADDITION to the lit pipe, you can add a thin outer glow tube for atmosphere:

```
Glow halo tube (per bundle, not per pipe):
  Same curve path as the center pipe of the bundle
  Radius: 0.12 (wider than the pipes)
  Material:
    MeshBasicMaterial({
      color: '#00E5FF' (or '#FFB800' for orange),
      opacity: 0.04,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
      side: DoubleSide,
    })

This creates a VERY faint colored atmosphere around the pipe bundle.
It should be barely visible — just enough to tint the air around the pipes.
Bloom will amplify the emissive pipes themselves into the main glow.
```

---

## SECTION 2: PIPE BUNDLES

### 2.1 Bundle Structure

In the reference, between any two nodes, you can see **3-5 parallel pipes** running together. They are spaced closely but each individual pipe is distinguishable.

```
Bundle composition:
  Each bundle contains 3-4 individual pipes running in parallel:
    Pipe 1: Offset +0.06 in local Y (top of bundle)
    Pipe 2: Offset +0.02 in local Y
    Pipe 3: Offset -0.02 in local Y
    Pipe 4: Offset -0.06 in local Y (bottom of bundle)

  Plus 1 glow halo tube encompassing the whole bundle (Section 1.4)

Total width of a bundle: ~0.12 world units (sum of pipe diameters + spacing)
```

### 2.2 Color Assignment Within Bundles

Not all pipes in a bundle are the same color:

```
Cyan-dominant bundle:
  Pipe 1: Cyan material
  Pipe 2: Cyan material
  Pipe 3: White/silver material (center accent)
  Pipe 4: Cyan material
  Glow halo: Cyan

Orange-dominant bundle:
  Pipe 1: Orange material
  Pipe 2: Orange material
  Pipe 3: White/silver material (center accent)
  Glow halo: Orange
```

### 2.3 Total Pipe Count

```
Total bundles: 4-5 across the pipeline

  Bundle A (Cyan, upper path):    4 pipes + 1 glow = top of the visual
  Bundle B (Cyan, middle path):   3 pipes + 1 glow = crosses through center
  Bundle C (Orange, lower-mid):   3 pipes + 1 glow = interweaves with cyan
  Bundle D (Cyan, lower path):    3 pipes + 1 glow = bottom of visual
  Bundle E (Orange, accent):      2 pipes + 1 glow = thin accent weaving through

Total individual pipe meshes: ~15-17
Total glow halos: 4-5
Total TubeGeometry instances: ~20-22
```

---

## SECTION 3: PIPE PATHS — CONVERGENCE INTO NODES

### 3.1 The Funnel Pattern

This is the most important structural change. The pipes must **converge into each node** and **diverge after each node**, like tributaries meeting at a junction.

```
BETWEEN nodes:  Pipes are spread apart (full bundle width ~0.12)
APPROACHING a node: Pipes gradually narrow toward the node center
AT the node: All pipes in the bundle merge to a single point (the node center)
LEAVING the node: Pipes gradually spread back out to full bundle width

Visual: It looks like a funnel or hourglass at each node position.
```

### 3.2 How to Implement Path Convergence

For each pipe in a bundle, the CatmullRomCurve3 control points must be carefully designed:

```
Example: Bundle A (4 cyan pipes), passing through Node 2 (Product Engine at [-3.3, 1.4, 0])

PIPE 1 (top of bundle) control points near Node 2:
  ... [-4.0, 2.0, 0]           ← approaching, at full offset (+0.06 from center)
      [-3.6, 1.55, 0]          ← narrowing toward node center
      [-3.3, 1.4, 0]           ← AT NODE CENTER (same point for all 4 pipes!)
      [-3.0, 1.55, 0]          ← diverging back out
      [-2.6, 2.0, 0] ...       ← back to full offset

PIPE 2 (upper-mid) control points near Node 2:
  ... [-4.0, 1.8, 0]
      [-3.6, 1.48, 0]
      [-3.3, 1.4, 0]           ← SAME CONVERGENCE POINT
      [-3.0, 1.48, 0]
      [-2.6, 1.8, 0] ...

PIPE 3 (lower-mid) control points near Node 2:
  ... [-4.0, 1.6, 0]
      [-3.6, 1.42, 0]
      [-3.3, 1.4, 0]           ← SAME CONVERGENCE POINT
      [-3.0, 1.42, 0]
      [-2.6, 1.6, 0] ...

PIPE 4 (bottom) control points near Node 2:
  ... [-4.0, 1.4, 0]
      [-3.6, 1.38, 0]
      [-3.3, 1.4, 0]           ← SAME CONVERGENCE POINT
      [-3.0, 1.38, 0]
      [-2.6, 1.4, 0] ...
```

**The critical rule:** At every node's position, ALL pipes in a bundle that pass through that node converge to the EXACT SAME 3D POINT (the node center). This creates the visual of pipes merging into the hub.

### 3.3 Not Every Bundle Goes Through Every Node

Different bundles connect to different nodes (like a circuit where different wires go to different components):

```
Bundle A (cyan upper):    Passes through nodes: 1 → 3 → 5 → 7
                          Arcs ABOVE nodes: 2, 4, 6
Bundle B (cyan mid):      Passes through nodes: 2 → 4 → 6
                          Arcs ABOVE nodes: 1, 3, 5, 7
Bundle C (orange lower):  Passes through nodes: 1 → 4 → 7
                          Arcs BELOW nodes: 2, 3, 5, 6
Bundle D (cyan lower):    Passes through nodes: 3 → 5
                          Lower path, arcs below most nodes
Bundle E (orange accent): Passes through nodes: 2 → 6
                          Thin accent path
```

When a bundle "arcs above/below" a node (doesn't connect to it), its pipes just sweep past at a distance — no convergence occurs.

### 3.4 Sweeping Arc Shape Between Nodes

Between two nodes, the pipes follow smooth S-curves with generous arc radii:

```
The path between any two connected nodes should form a SMOOTH ARC:
  - The pipes exit one node going horizontally
  - They swing upward (or downward) in a wide arc
  - They swing back to approach the next node horizontally
  - The arc amplitude between nodes: 1.0 - 2.0 world units above/below the node centers
  - The curvature should be SMOOTH — no sharp kinks, no tight zigzags

Think of it like highway overpasses: gradual curves with wide turn radii.
Not like a sine wave: avoid repetitive equal oscillation.
Each inter-node arc can have a different amplitude and direction.
```

---

## SECTION 4: NODE REDESIGN — 3D LAYERED HUBS

### 4.1 Reference Node Structure

Looking at the reference image closely, each node is a sophisticated 3D hub:

```
OUTER ZONE — Multiple thin cyan rings with slight 3D depth
  - 3-4 concentric thin cyan rings
  - These rings are slightly separated in Z-depth (stacked at z = 0, 0.02, 0.04)
  - This gives them a layered, holographic depth feel
  - The outermost ring is the largest and faintest
  - Moving inward, rings get brighter
  - At least one ring appears segmented/dashed
  - Outer ring diameter: ~1.4 world units

DARK GAP — Visible empty space
  - Between the cyan outer rings and the orange inner core
  - The black void shows through
  - This separation is essential for the dual-color visual

INNER CORE — Orange/amber hub
  - A solid circle with a warm orange/amber ring border
  - Border color: #FFB800 (warm gold/amber)
  - Border is thick enough to be clearly visible (~0.03 world units ring width)
  - Inside the orange border: dark navy fill (#0a1628)
  - The icon sits inside this dark core

ICON — Large, clear, centered
  - White or light cyan color
  - Large enough to immediately identify
  - See Section 5 for per-node icons
```

### 4.2 Implementation

```javascript
function createNode(position) {
  const group = new THREE.Group();
  group.position.set(...position);

  // === OUTER CYAN RINGS (3 rings, stacked in Z for depth) ===

  // Ring 1 — Outermost, largest, faintest
  const ring1Geo = new THREE.RingGeometry(0.65, 0.67, 64);
  const ring1Mat = new THREE.MeshBasicMaterial({
    color: '#00E5FF',
    opacity: 0.2,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  ring1.position.z = 0.04;  // Slightly forward in Z

  // Ring 2 — Middle ring, brighter
  const ring2Geo = new THREE.RingGeometry(0.55, 0.57, 64);
  const ring2Mat = new THREE.MeshBasicMaterial({
    color: '#00E5FF',
    opacity: 0.35,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.position.z = 0.02;  // Middle depth

  // Ring 3 — Inner cyan ring, brightest of the outer zone
  const ring3Geo = new THREE.RingGeometry(0.45, 0.47, 64);
  const ring3Mat = new THREE.MeshBasicMaterial({
    color: '#00E5FF',
    opacity: 0.45,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.position.z = 0.0;   // Base depth

  // === ORANGE INNER RING ===
  const orangeRingGeo = new THREE.RingGeometry(0.28, 0.32, 64);
  const orangeRingMat = new THREE.MeshStandardMaterial({
    color: '#996600',
    emissive: '#FFB800',
    emissiveIntensity: 0.8,
    metalness: 0.4,
    roughness: 0.3,
    side: THREE.DoubleSide,
  });
  const orangeRing = new THREE.Mesh(orangeRingGeo, orangeRingMat);

  // === DARK CORE FILL ===
  const coreGeo = new THREE.CircleGeometry(0.28, 32);
  const coreMat = new THREE.MeshBasicMaterial({
    color: '#0a1628',
    opacity: 0.92,
    transparent: true,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);

  // === ADD TO GROUP ===
  group.add(ring1, ring2, ring3, orangeRing, core);
  // Icon added separately (see Section 5)

  return group;
}
```

### 4.3 Node Animations

```
Ring 1 (outermost): rotation.z += 0.0004 per frame (slow clockwise)
Ring 2 (middle):    rotation.z -= 0.0003 per frame (slow counter-clockwise)
Ring 3 (inner):     rotation.z += 0.0005 per frame (clockwise, slightly faster)
Orange ring:        NO rotation — stays static
                    emissiveIntensity oscillates: 0.6 to 0.9 over 3s (subtle pulse)

Processing trigger (when particle arrives):
  All cyan rings: opacity spikes +0.3 for 200ms, then eases back
  Orange ring: emissiveIntensity spikes to 1.5 for 200ms
  Entire group: scale 1.0 → 1.06 → 1.0 over 300ms (elastic)
  Spawn ripple: expanding ring from center, opacity 0.5 → 0, scale 1 → 2.5, 500ms
```

### 4.4 Pipe-Node Junction Glow

Where the converging pipes meet the node, add a bright spot:

```
Junction glow sphere (at each node center):
  SphereGeometry(radius: 0.12, segments: 16)
  MeshBasicMaterial({
    color: '#FFFFFF',
    opacity: 0.15,
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
  })

This makes the convergence point slightly brighter, simulating the
energy concentration where all pipes merge into the hub.
```

---

## SECTION 5: NODE ICONS

Each node's icon should match the reference. The icons are **white or light-colored**, clearly visible against the dark core fill, and large enough to be immediately identifiable.

```
Node 1 — INSIGHTING ENGINE
  Icon: Network/connection graph (nodes and edges forming a small network)
  Reference shows: An atom-like or branching connection symbol
  Color: #FFFFFF
  Implementation: SVG sprite or Drei <Text> with a symbol character

Node 2 — PRODUCT ENGINE
  Icon: Grid/spreadsheet (small 3x3 or 4x4 grid of squares)
  Reference shows: A structured grid/table icon
  Color: #FFB800 (amber, matching the inner ring)
  Implementation: Small grid of rectangles

Node 3 — DESIGN ENGINE
  Icon: Paintbrush/pen/creative tool
  Reference shows: A swoosh or brush stroke symbol
  Color: #FFFFFF
  Implementation: SVG sprite

Node 4 — FRONTEND ENGINE
  Icon: Code brackets </>
  Reference shows: Clear </> code symbol (this is already correct in current output)
  Color: #00E5FF
  Scale: Slightly larger than other icons (this is the central hub)

Node 5 — BACKEND ENGINE
  Icon: Molecular/hexagonal/API structure
  Reference shows: A complex interconnected node pattern (like a molecular diagram)
  Color: #FFB800
  Implementation: SVG or simplified hex pattern

Node 6 — DB ENGINE
  Icon: Database cylinder (stacked disks)
  Reference shows: Classic database icon
  Color: #FFFFFF
  Implementation: SVG sprite

Node 7 — QA ENGINE
  Icon: Magnifying glass / search / check
  Reference shows: A circular search or verification symbol
  Color: #FFB800
```

---

## SECTION 6: LIGHTING SETUP FOR 3D PIPES

The lighting needs to support the 3D pipe materials. Since we're now using `MeshStandardMaterial`, the lights actually matter.

```
Ambient Light:
  intensity: 0.08              (low — pipes should be mostly self-illuminated)
  color:     #0a1628

Directional Light (top-down, for specular highlights):
  position:  [0, 10, 5]
  color:     #FFFFFF
  intensity: 0.3
  This creates the bright specular streak along the top of each pipe.
  Without this, the pipes will look uniformly glowing with no surface definition.

Point Light 1 (cyan tint, left side):
  position:  [-4, 3, 3]
  color:     #00E5FF
  intensity: 0.4
  distance:  15

Point Light 2 (orange tint, right side):
  position:  [4, 2, 3]
  color:     #FFB800
  intensity: 0.3
  distance:  15

Point Light 3 (fill, center):
  position:  [0, 0, 5]
  color:     #FFFFFF
  intensity: 0.15
  distance:  20
```

**Important:** The directional light from above is what creates the 3D illusion on the pipes. The top surface catches the light and appears bright; the bottom surface is in shadow. Without this, `MeshStandardMaterial` pipes will look uniformly bright and lose their 3D character.

---

## SECTION 7: POST-PROCESSING ADJUSTMENTS FOR 3D PIPES

```
Bloom:
  intensity:           0.5
  luminanceThreshold:  0.7        (lower than before — let the emissive pipes bloom)
  luminanceSmoothing:  0.5
  mipmapBlur:          true
  radius:              0.3

  The bloom should create a soft glow AROUND the pipes (like neon tubes glowing in air).
  It should NOT wash out the 3D shading on the pipe surface.
  If the bloom makes the pipes look flat again, REDUCE intensity to 0.35.

Vignette:
  offset:   0.3
  darkness: 0.5

NO chromatic aberration (keep removed)
NO depth of field (would blur the pipes)

Film grain / noise:
  opacity: 0.02 (very subtle)
```

---

## SECTION 8: HUD LABELS & ANNOTATIONS

### 8.1 Technical Labels (Scattered Around Pipeline)

The reference shows small technical text labels scattered around the pipeline connected by thin lead lines. These labels exist in the current output and are correct. Maintain them, but:

```
Label adjustments:
  - Remove any labels that were for the bar chart (CACHE, DEPLOY, PIPELINE, SCHEMA, etc.)
  - REPLACE with labels matching the reference:
    Near Node 1: "NORSE EMTS", "KGM15 DSW5"
    Near Node 2: "RSDAR", "NENDDXX"
    Near Node 3: "DE3", "DEAJTCN"
    Near Node 4: "SOAADOUCE"
    Near Node 5: "PROCESS1", "DOSSTAKION"
    Near Node 6: "SCREDIZKON", "S2CR"
    Near Node 7: "AUTO", "AUTH", "ENGINS", "GUDPFEND"

  Style: JetBrains Mono, 7-8px, rgba(255, 255, 255, 0.3)
  Lead lines: 1px, rgba(0, 229, 255, 0.15), L-shaped connectors ending in a small dot
```

### 8.2 "ACTIVE" Badges

Keep as-is — they look correct in the current output.

### 8.3 Metric Numbers

Keep as-is — 89%, 78%, 94%, 118, 96%, 4,278, 59% are correctly positioned and styled.

### 8.4 AKINFORMS Sub-Panel

The reference shows a small panel on the right side with horizontal progress bars:

```
Small panel, positioned near the right edge of the main stage:
  Title: "AKINFORMS" (or similar)
  5 small horizontal bars with labels:
    "Semantics"     ████████░░  80%
    "Context"       ██████░░░░  60%
    "Communication" ████████░░  80%
    "Authority"     █████░░░░░  50%
    "Skill"         ███████░░░  70%

  Bar width: ~80px
  Bar height: 3px
  Bar color: gradient from #00E5FF to #9D4EDD
  Label font: JetBrains Mono, 7px, rgba(255, 255, 255, 0.4)
```

---

## SECTION 9: DATA PARTICLES

Same spec as Round 2 but ensure they travel along the new pipe paths:

```
Particle geometry:  SphereGeometry(0.018, 8, 8)
Material:           MeshBasicMaterial({ color: '#FFFFFF', emissive: '#FFFFFF', emissiveIntensity: 1.0 })
Position:           Use the CENTER pipe's curve of each bundle for the particle path
                    (particles travel inside/along the pipe, not outside it)
Speed:              4-7 second traversal from left to right
Spawn rate:         1 particle per bundle every 1.5-3 seconds
Max total:          15-20 on screen
Trail:              2 trailing dots (size 60%, 30%; opacity 0.5, 0.2)
Node interaction:   Trigger node processing animation when within 0.4 units of node center
```

---

## SECTION 10: BACKGROUND

```
Background:
  Clear color: #050B14 (deep dark blue-black)

Subtle grid (optional):
  A very faint grid of thin lines in the background
  Color: rgba(255, 255, 255, 0.02)
  Grid spacing: 1.0 world units
  Positioned at z = -2.0 (far behind everything)
  DO NOT make this prominent — it should be barely perceptible

Ambient particles:
  Use Drei <Stars> or <Sparkles>:
    count: 500
    size: 0.5-1.0
    opacity: 0.15
    speed: 0.1
  These create subtle atmosphere without distracting from the pipes
```

---

## IMPLEMENTATION ORDER

```
PHASE 1: CLEAN SLATE
━━━━━━━━━━━━━━━━━━━━
  1.1  Delete ALL existing spline/ribbon geometry and materials
  1.2  Delete ALL bar chart geometry, materials, and labels
  1.3  Delete Y-axis labels
  1.4  Keep: nodes (positions), text labels, "ACTIVE" badges, metrics
  ► CHECKPOINT: Scene shows only nodes floating in dark void with labels

PHASE 2: LIGHTING
━━━━━━━━━━━━━━━━━
  2.1  Add directional light from above (crucial for 3D pipe shading)
  2.2  Adjust point lights per Section 6
  2.3  Set ambient light to 0.08
  ► CHECKPOINT: Existing nodes are subtly lit from above

PHASE 3: BUILD ONE PIPE BUNDLE (PROTOTYPE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  3.1  Create ONE CatmullRomCurve3 from Node 1 through Node 3 to Node 5 to Node 7
       Make it converge at each node position (Section 3.2)
  3.2  Create ONE TubeGeometry along this curve with MeshStandardMaterial (cyan)
       Use the exact material from Section 1.2
  3.3  Verify the pipe looks 3D:
         - Is the top brighter than the bottom? (Directional light working)
         - Can you see the cylindrical shape? (Roughness/metalness correct)
         - Does it glow? (Emissive + bloom working together)
       If YES → proceed. If NO → fix lighting/material before adding more pipes.
  3.4  Duplicate the pipe 3 more times with Y offsets to form a bundle of 4
  3.5  Add the convergence pinch at node positions (all 4 pipes meet at same point)
  3.6  Add the outer glow halo tube (faint additive blending)
  ► CHECKPOINT: One complete pipe bundle with 3D appearance threading through 4 nodes

PHASE 4: BUILD ALL BUNDLES
━━━━━━━━━━━━━━━━━━━━━━━━━
  4.1  Create Bundle B (cyan, passes through nodes 2, 4, 6)
  4.2  Create Bundle C (orange, passes through nodes 1, 4, 7)
  4.3  Create Bundle D (cyan, lower path through nodes 3, 5)
  4.4  Create Bundle E (orange accent, thin, through nodes 2, 6)
  4.5  Ensure interweaving: orange and cyan bundles cross over each other at 2-3 points
  ► CHECKPOINT: Full pipe network with visible cyan/orange interweaving

PHASE 5: NODE REFINEMENT
━━━━━━━━━━━━━━━━━━━━━━━━
  5.1  Simplify nodes to: 3 cyan rings (stacked Z) + orange inner ring + dark core
  5.2  Ensure dark gap between cyan rings and orange core
  5.3  Ensure icons are visible and correctly assigned
  5.4  Add junction glow spheres at convergence points
  5.5  Add idle animations (ring rotation, orange pulse)
  ► CHECKPOINT: Clean dual-color nodes with pipes feeding into them

PHASE 6: PARTICLES & POLISH
━━━━━━━━━━━━━━━━━━━━━━━━━━
  6.1  Add data particles traveling along pipe center curves
  6.2  Add particle-node interaction animations
  6.3  Add HUD text labels with lead lines
  6.4  Fine-tune bloom (increase/decrease if pipes are too washed or too dim)
  6.5  Add background grid and ambient particles
  ► CHECKPOINT: Complete pipeline matching reference

PHASE 7: VERIFY AGAINST REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Compare output to reference image point by point (Section 11 checklist)
```

---

## SECTION 11: FINAL QUALITY CHECKLIST

```
□ PIPES ARE 3D OBJECTS:
  You can see the cylindrical surface of each pipe.
  The top is brighter than the bottom (directional light).
  Specular highlights are visible as bright streaks.
  The pipes look like you could reach in and touch them.

□ PIPES CONVERGE INTO NODES:
  At each node, multiple pipes visibly funnel into the node center.
  The bundle narrows as it approaches the node.
  The bundle expands again after leaving the node.

□ PIPE BUNDLES ARE VISIBLE:
  Between nodes, you can see 3-4 parallel pipes running together.
  Individual pipes within a bundle are distinguishable.

□ TWO COLOR FAMILIES:
  Cyan pipes and orange pipes are clearly different colors.
  They interweave — crossing over each other at 2-3 points.

□ NO BAR CHART:
  Zero vertical bars. No Y-axis scale. No bar labels.
  The bottom of the scene is empty (dark void) with scattered HUD labels.

□ NODES ARE DUAL-COLOR:
  Outer zone: thin cyan concentric rings.
  Inner zone: warm orange/amber ring around dark core.
  Visible dark gap between cyan and orange zones.

□ ICONS ARE CLEAR:
  Each node's icon is immediately identifiable.
  Icons are white or light-colored against the dark core.

□ GLOW IS CONTROLLED:
  Pipes have a soft halo but are not washed out.
  The 3D surface shading on pipes is still visible through the glow.
  Background remains deep black.

□ DATA PARTICLES:
  Tiny white dots traveling left-to-right along pipe paths.
  Visible but not dominant.

□ ALL TEXT READABLE:
  Engine names, "ACTIVE" badges, percentages all crisp and legible.
```

---

## PARAMETER QUICK REFERENCE

| Element | Key Value |
|---|---|
| Pipe material | `MeshStandardMaterial` (NOT MeshBasicMaterial) |
| Pipe emissive color (cyan) | `#00E5FF` |
| Pipe emissive color (orange) | `#FFB800` |
| Pipe emissiveIntensity | `0.6-0.7` |
| Pipe metalness | `0.3` |
| Pipe roughness | `0.25` |
| Pipe tube radius | `0.04` |
| Pipes per bundle | `3-4` |
| Bundle glow halo radius | `0.12` |
| Bundle glow opacity | `0.04` |
| Directional light intensity | `0.3` (from above) |
| Bloom intensity | `0.5` |
| Bloom threshold | `0.7` |
| Node outer ring count | `3` (cyan, stacked Z) |
| Node orange ring | `1` (inner) |
| Node core fill | `#0a1628` at `0.92` opacity |
| Bar chart | **DELETED — does not exist** |
| Particle radius | `0.018` |

---

*End of Round 3. The fundamental shift: from flat additive-blended ribbon strokes → solid 3D lit pipe geometry with MeshStandardMaterial. This single material change will transform the entire visual quality.*
