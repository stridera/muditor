import * as Blockly from 'blockly';
import { registerEffectBlocks } from './effect-blocks';

let blocksRegistered = false;

/**
 * Register all custom blocks for the effect editor
 * This should be called once before the workspace is initialized
 */
export function registerAllBlocks(): void {
  if (blocksRegistered) {
    console.log('Blocks already registered, skipping');
    return;
  }

  try {
    // Register effect blocks
    registerEffectBlocks();

    blocksRegistered = true;
    console.log('All effect editor blocks registered successfully');
  } catch (error) {
    console.error('Failed to register blocks:', error);
    throw error;
  }
}

/**
 * Check if blocks have been registered
 */
export function areBlocksRegistered(): boolean {
  return blocksRegistered;
}

/**
 * Reset block registration (useful for testing)
 */
export function resetBlockRegistration(): void {
  blocksRegistered = false;
}

/**
 * Get category color for effect types
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    damage: '#e53935',
    healing: '#e53935',
    status: '#8e24aa',
    stats: '#1e88e5',
    protection: '#43a047',
    detection: '#5e35b1',
    movement: '#00897b',
    area: '#f4511e',
    special: '#6d4c41',
    gates: '#00acc1',
  };

  return colors[category] || '#757575';
}

export { registerEffectBlocks };
