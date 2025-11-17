// Editor grid & layout constants extracted for modularity
export const GRID_SIZE = 180; // Grid cell size in pixels (matches room size)
export const GRID_SCALE = 10; // Scale factor: 1 grid unit = 10 pixels
export const ROOM_SPACING_MULTIPLIER = 1.5; // Reduced from original to bring rooms closer

// Helper conversion functions
export const snapToGrid = (value: number): number =>
  Math.round(value / GRID_SIZE) * GRID_SIZE;
export const pixelsToGrid = (pixels: number): number =>
  Math.round(pixels / (GRID_SIZE * ROOM_SPACING_MULTIPLIER));
export const gridToPixels = (grid: number): number =>
  grid * GRID_SIZE * ROOM_SPACING_MULTIPLIER;
export const pixelsToGridY = (pixels: number): number => -pixelsToGrid(pixels); // Negate screen Y back to world Y
export const gridToPixelsY = (grid: number): number => gridToPixels(-grid); // Negate world Y to get screen Y
