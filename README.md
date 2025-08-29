# Block Collision Simulator - Pi Phenomenon

A physics simulation demonstrating the fascinating connection between elastic collisions and the mathematical constant π.

## About

This interactive simulator demonstrates the "Pi Phenomenon" - an example of how mathematical constants emerge from simple physical systems. When a large block collides with a smaller block against a wall, the total number of collisions approximates the digits of π.

## The Pi Phenomenon

When a large block of mass **M** collides with a smaller block of mass **m** (initially stationary against a wall), the total number of collisions follows this pattern:

- If **M/m = 100<sup>d</sup>**, the number of collisions equals the first **d+1** digits of π
- **M/m = 100** → 3 collisions (3.14)
- **M/m = 10,000** → 31 collisions (3.1415926535...)
- **M/m = 1,000,000** → 314 collisions (3.14159265358979...)

This phenomenon occurs due to the conservation of momentum and energy in perfectly elastic collisions.

## Features

- **Interactive Physics Simulation**: Real-time collision dynamics with accurate physics
- **Adjustable Parameters**: 
  - Mass of both blocks (1 kg to 1,000,000,000,000 kg)
  - Dimensions of blocks (width and height)
  - Pi Phenomenon presets for mass ratios
- **Visual Feedback**:
  - Gradient-styled blue blocks
  - White boundary walls
  - Real-time collision counter
  - Impact force calculations
- **Audio Feedback**: Collision sounds with pitch and volume based on impact force
- **Scientific Explanation**: Dynamic physics explanations based on your inputs
- **Responsive Design**: Clean, minimalist dark theme interface

## How to Use

1. **Clone or download the repository**
2. **Open `index.html` in any modern web browser**
3. **Configure the simulation**:
   - Adjust mass and dimensions of blocks
   - Select a Pi Phenomenon preset or use custom values
4. **Click "Start Simulation"** to begin
5. **Watch the physics** and observe the collision count
6. **Read the explanation** below to understand the science



## Physics Implementation

The simulation implements:
- Conservation of momentum: `v₁' = ((m₁ - m₂)v₁ + 2m₂v₂) / (m₁ + m₂)`
- Conservation of kinetic energy (perfectly elastic collisions)
- Impact force calculation: `F = μ × Δv` where `μ = (m₁ × m₂) / (m₁ + m₂)`
- Sub-stepping physics to prevent tunneling at high velocities




Developed by **tb6**


