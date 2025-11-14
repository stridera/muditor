import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a race type for display (e.g., "halfelf" → "Half-Elf")
 */
export function formatRace(raceType?: string | null): string {
  if (!raceType) return '';

  // Handle special cases
  const raceMap: Record<string, string> = {
    halfelf: 'Half-Elf',
    halforc: 'Half-Orc',
    darkknight: 'Dark Knight',
    // Add more special cases as needed
  };

  const normalizedRace = raceType.toLowerCase().trim();

  // Check if it's a special case
  if (raceMap[normalizedRace]) {
    return raceMap[normalizedRace];
  }

  // Default: capitalize first letter
  return raceType.charAt(0).toUpperCase() + raceType.slice(1).toLowerCase();
}

/**
 * Formats a player class for display (e.g., "SORCERER" → "Sorcerer")
 */
export function formatClass(playerClass?: string | null): string {
  if (!playerClass) return '';

  // Handle special cases
  const classMap: Record<string, string> = {
    darkknight: 'Dark Knight',
    // Add more special cases as needed
  };

  const normalizedClass = playerClass.toLowerCase().trim();

  // Check if it's a special case
  if (classMap[normalizedClass]) {
    return classMap[normalizedClass];
  }

  // Default: capitalize first letter, lowercase rest
  return playerClass.charAt(0).toUpperCase() + playerClass.slice(1).toLowerCase();
}
