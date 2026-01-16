/**
 * Core Type Definitions for Roulette Strategy Dashboard
 */

// Roulette number type (0-36)
export type RouletteNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 | 33 | 34 | 35 | 36;

// Transversale Simple (Six Line) - Each covers 6 numbers
export enum TransversaleId {
  LINE_1_6 = 'LINE_1_6',     // 1-6
  LINE_7_12 = 'LINE_7_12',   // 7-12
  LINE_13_18 = 'LINE_13_18', // 13-18
  LINE_19_24 = 'LINE_19_24', // 19-24
  LINE_25_30 = 'LINE_25_30', // 25-30
  LINE_31_36 = 'LINE_31_36'  // 31-36
}

// Coverage bet types
export enum CoverageBetType {
  ZERO_SPIEL = 'ZERO_SPIEL',
  ORPHELINS = 'ORPHELINS'
}

// Fibonacci progression state for each Transversale
export interface TransversaleState {
  id: TransversaleId;
  fibonacciIndex: number;      // Current position in Fibonacci sequence
  currentStake: number;         // Calculated stake based on fibonacci_index
  isActive: boolean;            // Whether we're currently betting on this line
  consecutiveLosses: number;    // Track losing streak
  totalWins: number;            // Statistics
  totalLosses: number;          // Statistics
}

// A single bet placement
export interface BetPlacement {
  type: 'transversale' | 'coverage';
  target: TransversaleId | CoverageBetType;
  amount: number;
  numbers: RouletteNumber[];    // Which numbers this bet covers
}

// Result of a spin
export interface SpinResult {
  number: RouletteNumber;
  winningBets: BetPlacement[];
  losingBets: BetPlacement[];
  totalWon: number;
  totalLost: number;
  netResult: number;            // totalWon - totalLost
  balance: number;              // New balance after this spin
}

// Session statistics
export interface SessionStats {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  netProfit: number;
  highestBet: number;
  longestLosingStreak: number;
  currentStreak: number;
  roi: number;                  // Return on Investment percentage
}

// Export format for CSV/JSON
export interface SessionExport {
  sessionId: string;
  startTime: Date;
  endTime: Date;
  settings: GameSettings;
  history: SpinResult[];
  finalStats: SessionStats;
}

// User-configurable game settings
export interface GameSettings {
  baseUnitTransversale: number;     // Base chip value for Transversale bets (e.g., 1€)
  baseUnitCoverage: number;         // Base chip value for coverage bets (e.g., 0.5€)
  fibonacciSequence: number[];      // The Fibonacci sequence to use
  sleepingThreshold: number;        // How many rounds without hit before betting (0 = always bet)
  maxFibonacciStep: number;         // Safety limit: max index in Fibonacci array
  tableLimitTransversale: number;   // Casino table limit for Transversale
  activeCoverage: {
    zeroSpiel: boolean;
    orphelins: boolean;
  };
  initialBankroll: number;          // Starting balance
}

// Worst-case scenario calculation
export interface WorstCaseScenario {
  consecutiveLosses: number;
  totalLoss: number;
  finalBet: number;
  fibonacciStepReached: number;
  wouldExceedTableLimit: boolean;
  wouldExceedBankroll: boolean;
}

// Heatmap data for visualization
export interface HeatmapData {
  number: RouletteNumber;
  hitCount: number;
  lastSeenRoundsAgo: number;
  color: string;                   // CSS color for visualization
}
