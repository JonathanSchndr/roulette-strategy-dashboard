/**
 * Roulette Wheel and Table Constants
 *
 * This file contains all the mathematical mappings for the European Roulette wheel,
 * including sector definitions, color mappings, and overlap calculations.
 */

import { TransversaleId, CoverageBetType } from '~/types';
import type { RouletteNumber } from '~/types';

/**
 * Red numbers on European Roulette wheel
 */
export const RED_NUMBERS: RouletteNumber[] = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
];

/**
 * Black numbers on European Roulette wheel
 */
export const BLACK_NUMBERS: RouletteNumber[] = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
];

/**
 * Get color of a roulette number
 */
export function getNumberColor(num: RouletteNumber): 'red' | 'black' | 'green' {
  if (num === 0) return 'green';
  if (RED_NUMBERS.includes(num)) return 'red';
  return 'black';
}

/**
 * Transversale Simple (Six Line) Mappings
 * Each line covers 6 consecutive numbers
 */
export const TRANSVERSALE_MAP: Record<TransversaleId, RouletteNumber[]> = {
  [TransversaleId.LINE_1_6]: [1, 2, 3, 4, 5, 6],
  [TransversaleId.LINE_7_12]: [7, 8, 9, 10, 11, 12],
  [TransversaleId.LINE_13_18]: [13, 14, 15, 16, 17, 18],
  [TransversaleId.LINE_19_24]: [19, 20, 21, 22, 23, 24],
  [TransversaleId.LINE_25_30]: [25, 26, 27, 28, 29, 30],
  [TransversaleId.LINE_31_36]: [31, 32, 33, 34, 35, 36]
};

/**
 * Zero Spiel (Jeu 0) - Racetrack bet covering zero neighbors
 * Covers: 12, 35, 3, 26, 0, 32, 15
 *
 * Physical wheel order around zero:
 * ... 26 - 0 - 32 - 15 - 19 - 4 - 21 - 2 - 25 - 17 - 34 - 6 - 27 - 13 - 36 - 11 - 30 - 8 - 23 - 10 - 5 - 24 - 16 - 33 - 1 - 20 - 14 - 31 - 9 - 22 - 18 - 29 - 7 - 28 - 12 - 35 - 3 ...
 */
export const ZERO_SPIEL_NUMBERS: RouletteNumber[] = [12, 35, 3, 26, 0, 32, 15];

/**
 * Orphelins (Orphans) - Numbers not covered by Voisins or Tiers
 * Two separate groups:
 * - Orphelins à cheval: 1, 20, 14, 31, 9
 * - Orphelins en plein: 17, 34, 6
 */
export const ORPHELINS_NUMBERS: RouletteNumber[] = [1, 20, 14, 31, 9, 17, 34, 6];

/**
 * Coverage bet mappings
 */
export const COVERAGE_MAP: Record<CoverageBetType, RouletteNumber[]> = {
  [CoverageBetType.ZERO_SPIEL]: ZERO_SPIEL_NUMBERS,
  [CoverageBetType.ORPHELINS]: ORPHELINS_NUMBERS
};

/**
 * Find which Transversale contains a given number
 * Returns null for 0 (zero is not in any Transversale)
 */
export function getTransversaleForNumber(num: RouletteNumber): TransversaleId | null {
  if (num === 0) return null;

  for (const [id, numbers] of Object.entries(TRANSVERSALE_MAP)) {
    if (numbers.includes(num)) {
      return id as TransversaleId;
    }
  }

  return null;
}

/**
 * CRITICAL: Overlap Detection
 *
 * Some numbers appear in BOTH Transversales AND Coverage bets.
 * Example: Number 32
 *   - Is in Transversale 31-36
 *   - Is in Zero Spiel
 *
 * When such a number hits, BOTH bets win!
 * This function returns all coverage bets that also cover this number.
 */
export function getCoverageOverlaps(num: RouletteNumber, activeCoverage: CoverageBetType[]): CoverageBetType[] {
  return activeCoverage.filter(coverageType => {
    return COVERAGE_MAP[coverageType].includes(num);
  });
}

/**
 * Check if a number is covered by a specific coverage bet
 */
export function isNumberInCoverage(num: RouletteNumber, coverage: CoverageBetType): boolean {
  return COVERAGE_MAP[coverage].includes(num);
}

/**
 * Payout multipliers for different bet types
 */
export const PAYOUT_MULTIPLIERS = {
  TRANSVERSALE: 5,    // Six Line pays 5:1 (you get back 6x your stake including original bet)
  COVERAGE: 17,       // Coverage bets vary, but we simplify to approximate average
  STRAIGHT_UP: 35     // Single number (if we add this later)
} as const;

/**
 * Default Fibonacci sequence
 * Used for progressive betting on Transversales
 */
export const DEFAULT_FIBONACCI_SEQUENCE = [
  1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597
];

/**
 * Calculate total coverage of active bets
 * Returns the count of unique numbers covered
 */
export function calculateTotalCoverage(
  activeTransversales: TransversaleId[],
  activeCoverage: CoverageBetType[]
): {
  coveredNumbers: Set<RouletteNumber>,
  coveragePercentage: number,
  overlaps: RouletteNumber[]
} {
  const covered = new Set<RouletteNumber>();
  const overlaps: RouletteNumber[] = [];

  // Add Transversale numbers
  const transNumbers = new Set<RouletteNumber>();
  activeTransversales.forEach(transId => {
    TRANSVERSALE_MAP[transId].forEach(num => {
      transNumbers.add(num);
      covered.add(num);
    });
  });

  // Add Coverage numbers and detect overlaps
  activeCoverage.forEach(coverageType => {
    COVERAGE_MAP[coverageType].forEach(num => {
      if (transNumbers.has(num)) {
        overlaps.push(num);
      }
      covered.add(num);
    });
  });

  // European Roulette has 37 numbers (0-36)
  const coveragePercentage = (covered.size / 37) * 100;

  return {
    coveredNumbers: covered,
    coveragePercentage,
    overlaps
  };
}

/**
 * Human-readable labels for Transversales
 */
export const TRANSVERSALE_LABELS: Record<TransversaleId, string> = {
  [TransversaleId.LINE_1_6]: '1-6',
  [TransversaleId.LINE_7_12]: '7-12',
  [TransversaleId.LINE_13_18]: '13-18',
  [TransversaleId.LINE_19_24]: '19-24',
  [TransversaleId.LINE_25_30]: '25-30',
  [TransversaleId.LINE_31_36]: '31-36'
};

/**
 * Human-readable labels for Coverage bets
 */
export const COVERAGE_LABELS: Record<CoverageBetType, string> = {
  [CoverageBetType.ZERO_SPIEL]: 'Zero Spiel (Jeu 0)',
  [CoverageBetType.ORPHELINS]: 'Orphelins'
};
