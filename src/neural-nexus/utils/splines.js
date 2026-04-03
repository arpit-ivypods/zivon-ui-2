import * as THREE from 'three'

// Spline configuration for the 5 pipeline curves
export const SPLINE_COUNT = 5

export const splineConfigs = [
  { baseY: 0.8, amplitude: 0.5, frequency: 1.4, phase: 0.0, speed: 0.3, z: 0.0 },
  { baseY: 1.05, amplitude: 0.6, frequency: 1.6, phase: 0.8, speed: 0.3, z: 0.05 },
  { baseY: 1.3, amplitude: 0.8, frequency: 1.2, phase: 1.6, speed: 0.3, z: -0.05 },
  { baseY: 1.55, amplitude: 0.7, frequency: 1.8, phase: 2.4, speed: 0.3, z: 0.03 },
  { baseY: 1.8, amplitude: 0.4, frequency: 2.0, phase: 3.2, speed: 0.3, z: -0.03 },
]

// Color stops for each spline (used for gradient coloring)
export const splineColors = [
  '#00E5FF', // cyan
  '#00C5D8', // cyan to cyan-deep
  '#FF9100', // transitions cyan to orange at midpoint (rendered as orange for simplicity, blended in shader)
  '#D97A00', // orange-light
  '#FF9100', // orange full
]

// Color pairs for gradient effect [start, end]
export const splineColorPairs = [
  ['#00E5FF', '#00E5FF'],
  ['#00E5FF', '#0097A7'],
  ['#00E5FF', '#FF9100'],
  ['#D97A00', '#FF9100'],
  ['#FF9100', '#FF9100'],
]

const POINTS_PER_SPLINE = 80
const X_MIN = -6
const X_MAX = 6

/**
 * Generate points for a single spline at a given time.
 * Returns an array of THREE.Vector3.
 */
export function generateSplinePoints(configIndex, time) {
  const config = splineConfigs[configIndex]
  const points = []
  for (let i = 0; i < POINTS_PER_SPLINE; i++) {
    const t = i / (POINTS_PER_SPLINE - 1)
    const x = X_MIN + (X_MAX - X_MIN) * t
    const y =
      config.baseY +
      config.amplitude * Math.sin(config.frequency * x + config.phase + time * config.speed)
    const z = config.z
    points.push(new THREE.Vector3(x, y, z))
  }
  return points
}

/**
 * Get a position on a spline at parametric value t [0..1] at a given time.
 */
export function getSplinePosition(configIndex, t, time) {
  const config = splineConfigs[configIndex]
  const x = X_MIN + (X_MAX - X_MIN) * t
  const y =
    config.baseY +
    config.amplitude * Math.sin(config.frequency * x + config.phase + time * config.speed)
  const z = config.z
  return new THREE.Vector3(x, y, z)
}

/**
 * Generate all spline points at once (for batch operations).
 */
export function generateAllSplinePoints(time) {
  const all = []
  for (let i = 0; i < SPLINE_COUNT; i++) {
    all.push(generateSplinePoints(i, time))
  }
  return all
}
