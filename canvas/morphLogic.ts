import { PortfolioState } from "../types";
import { portfolioData } from "../data/portfolioData";

export const PARTICLE_COUNT = 8000;

// Helper: Seeded random (simple linear congruential generator for reproducibility)
let seed = 1234;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Helper: 3D Noise approximation
function noise(x: number, y: number, z: number) {
    return Math.sin(x * 0.5) * Math.cos(y * 0.3) * Math.sin(z * 0.7);
}

// Generate geometry (positions and colors) for a specific state
export function generateGeometry(state: PortfolioState): { positions: Float32Array, colors: Float32Array } {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const projectsCount = portfolioData.projects.length;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;
    // Default base color (Blue)
    let r = 0.23, g = 0.51, b = 0.96;
    const idx = i * 3;

    switch (state) {
      case PortfolioState.HERO:
        const phi = Math.acos(1 - 2 * (i + 0.5) / PARTICLE_COUNT);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
        const rad = 4;
        x = rad * Math.sin(phi) * Math.cos(theta);
        y = rad * Math.sin(phi) * Math.sin(theta);
        z = rad * Math.cos(phi);
        
        // Slight gradient based on height
        r = 0.23 + y * 0.05;
        g = 0.51 + y * 0.05;
        break;

      case PortfolioState.ABOUT:
        const dnaLength = 14;
        const dnaRadius = 1.8;
        const turns = 3.0 * Math.PI * 2;
        const isRung = (i % 5 === 0);
        
        if (!isRung) {
          const pct = i / PARTICLE_COUNT;
          const px = (pct * dnaLength) - (dnaLength / 2);
          const angle = px * (turns / dnaLength);
          const isStrandA = (i % 2 === 0);
          const phase = isStrandA ? 0 : Math.PI;
          
          x = px;
          y = Math.sin(angle + phase) * dnaRadius;
          z = Math.cos(angle + phase) * dnaRadius;
          
          if (isStrandA) {
             r = 0.0; g = 0.8; b = 1.0; // Cyan
          } else {
             r = 0.6; g = 0.2; b = 1.0; // Purple
          }
        } else {
          const numRungs = 30;
          const rungIdx = i % numRungs;
          const px = (rungIdx / (numRungs - 1)) * dnaLength - (dnaLength / 2);
          const angle = px * (turns / dnaLength);
          const ptAy = Math.sin(angle) * dnaRadius;
          const ptAz = Math.cos(angle) * dnaRadius;
          const t = (random() * 2) - 1;
          x = px; y = t * ptAy; z = t * ptAz;
          
          r = 0.9; g = 0.9; b = 1.0; // Rungs are white-ish
        }
        
        const jitter = 0.15;
        x += (random() - 0.5) * jitter;
        y += (random() - 0.5) * jitter;
        z += (random() - 0.5) * jitter;
        break;

      case PortfolioState.EXPERIENCE:
        const expAngle = i * 0.1;
        const expRadius = 3 + Math.random() * 2;
        const expLength = 25;
        z = (i / PARTICLE_COUNT) * expLength - expLength / 2;
        x = Math.cos(expAngle) * expRadius;
        y = Math.sin(expAngle) * expRadius;
        x += (random() - 0.5) * 1;
        y += (random() - 0.5) * 1;
        
        // Depth gradient
        const depth = z / expLength;
        r = 0.23 + depth * 0.5;
        g = 0.51;
        b = 0.96 - depth * 0.5;
        break;

      case PortfolioState.PROJECTS:
        const clusterIndex = i % projectsCount;
        const cAngle = (clusterIndex / projectsCount) * Math.PI * 2;
        const cRadius = 5;
        const cx = Math.cos(cAngle) * cRadius;
        const cy = Math.sin(cAngle) * cRadius;
        const cz = 0;
        const pr = 1.5;
        const pPhi = Math.acos(1 - 2 * random());
        const pTheta = Math.PI * 2 * random();
        x = cx + pr * Math.sin(pPhi) * Math.cos(pTheta);
        y = cy + pr * Math.sin(pPhi) * Math.sin(pTheta);
        z = cz + pr * Math.cos(pPhi);
        
        // Cluster color
        r = 0.2 + (clusterIndex / projectsCount) * 0.8;
        g = 0.5 + (clusterIndex % 3) * 0.2;
        b = 0.8;
        break;

      case PortfolioState.KNOWLEDGE:
        const gridSize = Math.sqrt(PARTICLE_COUNT);
        const spacing = 0.5;
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        x = (col - gridSize / 2) * spacing;
        z = (row - gridSize / 2) * spacing;
        y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.5;
        
        // Heatmap color based on wave height
        r = 0.2 + (y + 1.5) * 0.2; // higher = redder
        g = 0.8 - Math.abs(y) * 0.3; // middle = greener
        b = 1.0 - (y + 1.5) * 0.2; // lower = bluer
        break;

      case PortfolioState.WRITING:
        const barGridSize = Math.floor(Math.sqrt(PARTICLE_COUNT));
        const bRow = Math.floor(i / barGridSize);
        const bCol = i % barGridSize;
        const bSpacing = 0.4;
        x = (bCol - barGridSize / 2) * bSpacing;
        z = (bRow - barGridSize / 2) * bSpacing;
        y = (i % 20) * 0.4 - 4;
        if (y < -2) y = -2;
        
        // Cityscape height color
        r = 0.9;
        g = 0.3 + ((y + 4) / 4) * 0.5;
        b = 0.2;
        break;

      case PortfolioState.PERSONAL:
        const scatter = 12;
        x = (random() - 0.5) * scatter;
        y = (random() - 0.5) * scatter;
        z = (random() - 0.5) * scatter;
        
        // Organic random colors
        r = 0.2 + random() * 0.8;
        g = 0.2 + random() * 0.8;
        b = 0.5 + random() * 0.5;
        break;

      case PortfolioState.SIGNAL:
        const core = 0.05; 
        x = (random() - 0.5) * core;
        y = (random() - 0.5) * core;
        z = (random() - 0.5) * core;
        
        // Pure bright white/cyan
        r = 0.8; g = 1.0; b = 1.0;
        break;
    }

    positions[idx] = x;
    positions[idx + 1] = y;
    positions[idx + 2] = z;
    
    colors[idx] = r;
    colors[idx + 1] = g;
    colors[idx + 2] = b;
  }

  return { positions, colors };
}