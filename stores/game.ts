/**
 * Pinia Store: Game State Management
 *
 * This store handles ALL game logic including:
 * - Fibonacci progression PER Transversale
 * - Coverage bet management (Zero Spiel, Orphelins)
 * - Overlap calculation (when numbers hit multiple bet zones)
 * - Bankroll tracking
 * - Session statistics
 * - Export functionality
 */

import { defineStore } from 'pinia';
import {
  TransversaleId,
  CoverageBetType
} from '~/types';
import type {
  RouletteNumber,
  TransversaleState,
  BetPlacement,
  SpinResult,
  GameSettings,
  SessionStats,
  SessionExport,
  WorstCaseScenario,
  HeatmapData
} from '~/types';
import {
  TRANSVERSALE_MAP,
  COVERAGE_MAP,
  getTransversaleForNumber,
  getCoverageOverlaps,
  PAYOUT_MULTIPLIERS,
  DEFAULT_FIBONACCI_SEQUENCE,
  calculateTotalCoverage
} from '~/utils/roulette-constants';

export const useGameStore = defineStore('game', {
  state: () => ({
    // Core game state
    history: [] as RouletteNumber[],
    spinResults: [] as SpinResult[],
    balance: 1000 as number, // Starting bankroll

    // Settings (user-configurable)
    settings: {
      baseUnitTransversale: 1,
      baseUnitCoverage: 0.5,
      fibonacciSequence: [...DEFAULT_FIBONACCI_SEQUENCE],
      sleepingThreshold: 0, // 0 = always bet on all non-hit Transversales
      maxFibonacciStep: 10,
      tableLimitTransversale: 500,
      activeCoverage: {
        zeroSpiel: true,
        orphelins: false
      },
      initialBankroll: 1000
    } as GameSettings,

    // Transversale states (Fibonacci progression tracking)
    transversaleStates: {
      [TransversaleId.LINE_1_6]: {
        id: TransversaleId.LINE_1_6,
        fibonacciIndex: 0,
        currentStake: 1,
        isActive: true,
        consecutiveLosses: 0,
        totalWins: 0,
        totalLosses: 0
      },
      [TransversaleId.LINE_7_12]: {
        id: TransversaleId.LINE_7_12,
        fibonacciIndex: 0,
        currentStake: 1,
        isActive: true,
        consecutiveLosses: 0,
        totalWins: 0,
        totalLosses: 0
      },
      [TransversaleId.LINE_13_18]: {
        id: TransversaleId.LINE_13_18,
        fibonacciIndex: 0,
        currentStake: 1,
        isActive: true,
        consecutiveLosses: 0,
        totalWins: 0,
        totalLosses: 0
      },
      [TransversaleId.LINE_19_24]: {
        id: TransversaleId.LINE_19_24,
        fibonacciIndex: 0,
        currentStake: 1,
        isActive: true,
        consecutiveLosses: 0,
        totalWins: 0,
        totalLosses: 0
      },
      [TransversaleId.LINE_25_30]: {
        id: TransversaleId.LINE_25_30,
        fibonacciIndex: 0,
        currentStake: 1,
        isActive: true,
        consecutiveLosses: 0,
        totalWins: 0,
        totalLosses: 0
      },
      [TransversaleId.LINE_31_36]: {
        id: TransversaleId.LINE_31_36,
        fibonacciIndex: 0,
        currentStake: 1,
        isActive: true,
        consecutiveLosses: 0,
        totalWins: 0,
        totalLosses: 0
      }
    } as Record<TransversaleId, TransversaleState>,

    // Session metadata
    sessionId: crypto.randomUUID(),
    sessionStartTime: new Date()
  }),

  getters: {
    /**
     * Get current bet suggestions for NEXT spin
     * This is what the user should place based on current state
     */
    nextBetSuggestions(): BetPlacement[] {
      const bets: BetPlacement[] = [];

      // 1. Calculate Transversale bets
      Object.values(this.transversaleStates).forEach(state => {
        if (state.isActive) {
          const stake = this.settings.baseUnitTransversale *
                        this.settings.fibonacciSequence[state.fibonacciIndex];

          // Safety check: don't exceed table limit
          if (stake <= this.settings.tableLimitTransversale) {
            bets.push({
              type: 'transversale',
              target: state.id,
              amount: stake,
              numbers: TRANSVERSALE_MAP[state.id]
            });
          }
        }
      });

      // 2. Add coverage bets
      if (this.settings.activeCoverage.zeroSpiel) {
        bets.push({
          type: 'coverage',
          target: CoverageBetType.ZERO_SPIEL,
          amount: this.settings.baseUnitCoverage,
          numbers: COVERAGE_MAP[CoverageBetType.ZERO_SPIEL]
        });
      }

      if (this.settings.activeCoverage.orphelins) {
        bets.push({
          type: 'coverage',
          target: CoverageBetType.ORPHELINS,
          amount: this.settings.baseUnitCoverage,
          numbers: COVERAGE_MAP[CoverageBetType.ORPHELINS]
        });
      }

      return bets;
    },

    /**
     * Calculate total stake for next spin
     */
    nextTotalStake(): number {
      return this.nextBetSuggestions.reduce((sum, bet) => sum + bet.amount, 0);
    },

    /**
     * Session statistics
     */
    sessionStats(): SessionStats {
      const totalWagered = this.spinResults.reduce((sum, r) => sum + Math.abs(r.totalLost), 0);
      const totalWon = this.spinResults.reduce((sum, r) => sum + r.totalWon, 0);
      const totalLost = totalWagered;
      const netProfit = this.balance - this.settings.initialBankroll;

      let highestBet = 0;
      this.spinResults.forEach(result => {
        const spinTotal = result.winningBets.reduce((sum, b) => sum + b.amount, 0) +
                         result.losingBets.reduce((sum, b) => sum + b.amount, 0);
        highestBet = Math.max(highestBet, spinTotal);
      });

      // Calculate longest losing streak
      let currentStreak = 0;
      let longestStreak = 0;
      this.spinResults.forEach(result => {
        if (result.netResult < 0) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });

      const roi = totalWagered > 0 ? ((netProfit / totalWagered) * 100) : 0;

      return {
        totalSpins: this.history.length,
        totalWagered,
        totalWon,
        totalLost,
        netProfit,
        highestBet,
        longestLosingStreak: longestStreak,
        currentStreak,
        roi
      };
    },

    /**
     * Heatmap data for visualization
     */
    heatmapData(): HeatmapData[] {
      const data: HeatmapData[] = [];
      const hitCounts = new Map<RouletteNumber, number>();
      const lastSeen = new Map<RouletteNumber, number>();

      // Count hits
      this.history.forEach((num, index) => {
        hitCounts.set(num, (hitCounts.get(num) || 0) + 1);
        lastSeen.set(num, this.history.length - index);
      });

      // Generate heatmap for all numbers
      for (let num = 0; num <= 36; num++) {
        const count = hitCounts.get(num as RouletteNumber) || 0;
        const lastSeenAgo = lastSeen.get(num as RouletteNumber) || this.history.length + 1;

        // Color intensity based on frequency
        const maxCount = Math.max(...Array.from(hitCounts.values()));
        const intensity = maxCount > 0 ? count / maxCount : 0;
        const hue = intensity * 120; // 0 (red) to 120 (green)

        data.push({
          number: num as RouletteNumber,
          hitCount: count,
          lastSeenRoundsAgo: lastSeenAgo,
          color: `hsl(${hue}, 70%, 50%)`
        });
      }

      return data;
    },

    /**
     * Coverage information for current strategy
     */
    currentCoverage(): ReturnType<typeof calculateTotalCoverage> {
      const activeTransIds = Object.values(this.transversaleStates as Record<TransversaleId, TransversaleState>)
        .filter((s: TransversaleState) => s.isActive)
        .map((s: TransversaleState) => s.id);

      const activeCoverageTypes: CoverageBetType[] = [];
      if (this.settings.activeCoverage.zeroSpiel) {
        activeCoverageTypes.push(CoverageBetType.ZERO_SPIEL);
      }
      if (this.settings.activeCoverage.orphelins) {
        activeCoverageTypes.push(CoverageBetType.ORPHELINS);
      }

      return calculateTotalCoverage(activeTransIds, activeCoverageTypes);
    }
  },

  actions: {
    /**
     * MAIN ACTION: Process a new roulette spin
     *
     * This is called when user enters a number.
     * It calculates wins/losses, updates Fibonacci states, and adjusts bankroll.
     */
    addSpin(number: RouletteNumber) {
      // Prepare current bets (what we had placed BEFORE this spin)
      const currentBets = this.nextBetSuggestions;

      const winningBets: BetPlacement[] = [];
      const losingBets: BetPlacement[] = [];

      let totalWon = 0;
      let totalLost = 0;

      // === 1. EVALUATE TRANSVERSALE BETS ===
      const hitTransversale = getTransversaleForNumber(number);

      currentBets.forEach(bet => {
        if (bet.type === 'transversale') {
          if (bet.target === hitTransversale) {
            // WIN! Transversale hit
            const payout = bet.amount * (PAYOUT_MULTIPLIERS.TRANSVERSALE + 1); // +1 for original stake
            totalWon += payout;
            winningBets.push(bet);

            // Reset this Transversale's Fibonacci progression
            this.transversaleStates[bet.target as TransversaleId].fibonacciIndex = 0;
            this.transversaleStates[bet.target as TransversaleId].consecutiveLosses = 0;
            this.transversaleStates[bet.target as TransversaleId].totalWins++;
          } else {
            // LOSS - Increment Fibonacci for this specific line
            totalLost += bet.amount;
            losingBets.push(bet);

            const state = this.transversaleStates[bet.target as TransversaleId];
            state.consecutiveLosses++;
            state.totalLosses++;

            // Move to next Fibonacci step (with safety limit)
            if (state.fibonacciIndex < this.settings.maxFibonacciStep) {
              state.fibonacciIndex++;
            }
          }
        }
      });

      // === 2. EVALUATE COVERAGE BETS (Zero Spiel, Orphelins) ===
      const activeCoverageTypes: CoverageBetType[] = [];
      if (this.settings.activeCoverage.zeroSpiel) {
        activeCoverageTypes.push(CoverageBetType.ZERO_SPIEL);
      }
      if (this.settings.activeCoverage.orphelins) {
        activeCoverageTypes.push(CoverageBetType.ORPHELINS);
      }

      const coverageOverlaps = getCoverageOverlaps(number, activeCoverageTypes);

      currentBets.forEach(bet => {
        if (bet.type === 'coverage') {
          if (coverageOverlaps.includes(bet.target as CoverageBetType)) {
            // WIN! Coverage bet hit
            // Note: Coverage payout is simplified here (real casinos have complex chip placements)
            const payout = bet.amount * (PAYOUT_MULTIPLIERS.COVERAGE + 1);
            totalWon += payout;
            winningBets.push(bet);
          } else {
            // LOSS
            totalLost += bet.amount;
            losingBets.push(bet);
          }
        }
      });

      // === 3. UPDATE BANKROLL ===
      const netResult = totalWon - totalLost;
      this.balance += netResult;

      // === 4. RECORD RESULTS ===
      const spinResult: SpinResult = {
        number,
        winningBets,
        losingBets,
        totalWon,
        totalLost,
        netResult,
        balance: this.balance
      };

      this.history.push(number);
      this.spinResults.push(spinResult);

      // === 5. CONSOLE LOG for debugging (can be removed in production) ===
      console.log(`
🎰 SPIN RESULT: ${number}
💰 Won: €${totalWon.toFixed(2)} | Lost: €${totalLost.toFixed(2)} | Net: €${netResult.toFixed(2)}
💵 Balance: €${this.balance.toFixed(2)}
      `);
    },

    /**
     * Calculate worst-case scenario for X consecutive losses
     */
    calculateWorstCase(consecutiveLosses: number): WorstCaseScenario {
      let totalLoss = 0;
      let fibIndex = 0;
      let finalBet = 0;

      const activeTransCount = Object.values(this.transversaleStates)
        .filter(s => s.isActive).length;

      for (let i = 0; i < consecutiveLosses; i++) {
        // Calculate bet for this round
        const betPerTrans = this.settings.baseUnitTransversale *
                           this.settings.fibonacciSequence[Math.min(fibIndex, this.settings.maxFibonacciStep)];
        const transBet = betPerTrans * activeTransCount;

        let coverageBet = 0;
        if (this.settings.activeCoverage.zeroSpiel) coverageBet += this.settings.baseUnitCoverage;
        if (this.settings.activeCoverage.orphelins) coverageBet += this.settings.baseUnitCoverage;

        const roundBet = transBet + coverageBet;
        totalLoss += roundBet;
        finalBet = betPerTrans;
        fibIndex++;
      }

      return {
        consecutiveLosses,
        totalLoss,
        finalBet,
        fibonacciStepReached: Math.min(fibIndex - 1, this.settings.maxFibonacciStep),
        wouldExceedTableLimit: finalBet > this.settings.tableLimitTransversale,
        wouldExceedBankroll: totalLoss > this.balance
      };
    },

    /**
     * Export session data as JSON
     */
    exportSessionJSON(): SessionExport {
      return {
        sessionId: this.sessionId,
        startTime: this.sessionStartTime,
        endTime: new Date(),
        settings: { ...this.settings },
        history: this.spinResults,
        finalStats: this.sessionStats
      };
    },

    /**
     * Export session as CSV string
     */
    exportSessionCSV(): string {
      const headers = ['Spin', 'Number', 'Total Bet', 'Total Won', 'Net Result', 'Balance'];
      const rows = this.spinResults.map((result, index) => {
        const totalBet = result.totalLost;
        return [
          index + 1,
          result.number,
          totalBet.toFixed(2),
          result.totalWon.toFixed(2),
          result.netResult.toFixed(2),
          result.balance.toFixed(2)
        ].join(',');
      });

      return [headers.join(','), ...rows].join('\n');
    },

    /**
     * Reset game to initial state
     */
    resetGame() {
      this.history = [];
      this.spinResults = [];
      this.balance = this.settings.initialBankroll;
      this.sessionId = crypto.randomUUID();
      this.sessionStartTime = new Date();

      // Reset all Transversale states
      Object.values(this.transversaleStates).forEach(state => {
        state.fibonacciIndex = 0;
        state.currentStake = this.settings.baseUnitTransversale;
        state.isActive = true;
        state.consecutiveLosses = 0;
        state.totalWins = 0;
        state.totalLosses = 0;
      });
    },

    /**
     * Update settings
     */
    updateSettings(newSettings: Partial<GameSettings>) {
      this.settings = { ...this.settings, ...newSettings };
    },

    /**
     * Undo last spin (useful for mistakes)
     */
    undoLastSpin() {
      if (this.history.length === 0) return;

      this.history.pop();
      const lastResult = this.spinResults.pop();

      if (lastResult) {
        this.balance = lastResult.balance - lastResult.netResult;

        // Reverse Fibonacci changes
        // This is simplified - in production you'd want to store previous states
        Object.values(this.transversaleStates).forEach(state => {
          if (state.fibonacciIndex > 0) {
            state.fibonacciIndex = Math.max(0, state.fibonacciIndex - 1);
          }
        });
      }
    }
  }
});
