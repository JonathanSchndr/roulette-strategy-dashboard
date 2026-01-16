<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">📊 Statistiken</h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <!-- Balance -->
      <div class="stat-box" :class="stats.netProfit >= 0 ? 'stat-positive' : 'stat-negative'">
        <div class="stat-label">Kontostand</div>
        <div class="stat-value">{{ formatCurrency(balance) }}</div>
        <div class="stat-change">{{ stats.netProfit >= 0 ? '+' : '' }}{{ formatCurrency(stats.netProfit) }}</div>
      </div>

      <!-- Total Spins -->
      <div class="stat-box">
        <div class="stat-label">Runden</div>
        <div class="stat-value">{{ stats.totalSpins }}</div>
      </div>

      <!-- ROI -->
      <div class="stat-box" :class="stats.roi >= 0 ? 'stat-positive' : 'stat-negative'">
        <div class="stat-label">ROI</div>
        <div class="stat-value">{{ stats.roi.toFixed(1) }}%</div>
      </div>

      <!-- Highest Bet -->
      <div class="stat-box">
        <div class="stat-label">Höchster Einsatz</div>
        <div class="stat-value text-lg">{{ formatCurrency(stats.highestBet) }}</div>
      </div>

      <!-- Total Wagered -->
      <div class="stat-box">
        <div class="stat-label">Gesamt eingesetzt</div>
        <div class="stat-value text-lg">{{ formatCurrency(stats.totalWagered) }}</div>
      </div>

      <!-- Total Won -->
      <div class="stat-box stat-positive">
        <div class="stat-label">Gesamt gewonnen</div>
        <div class="stat-value text-lg">{{ formatCurrency(stats.totalWon) }}</div>
      </div>

      <!-- Longest Losing Streak -->
      <div class="stat-box stat-negative">
        <div class="stat-label">Längste Pechsträhne</div>
        <div class="stat-value">{{ stats.longestLosingStreak }}</div>
      </div>

      <!-- Current Streak -->
      <div class="stat-box">
        <div class="stat-label">Aktuelle Serie</div>
        <div class="stat-value">{{ stats.currentStreak }}</div>
      </div>
    </div>

    <!-- Transversale Performance -->
    <div class="mt-6">
      <h3 class="text-lg font-semibold mb-3 text-gray-300">Transversalen-Performance:</h3>
      <div class="space-y-2">
        <div
          v-for="state in transversaleStates"
          :key="state.id"
          class="flex justify-between items-center p-2 bg-gray-700 rounded"
        >
          <span class="font-medium text-sm">{{ getTransversaleLabel(state.id) }}</span>
          <div class="flex gap-4 text-sm">
            <span class="text-green-400">✓ {{ state.totalWins }}</span>
            <span class="text-red-400">✗ {{ state.totalLosses }}</span>
            <span class="text-yellow-400">Fib: {{ state.fibonacciIndex }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SessionStats, TransversaleState, TransversaleId } from '~/types';
import { TRANSVERSALE_LABELS } from '~/utils/roulette-constants';

interface Props {
  stats: SessionStats;
  balance: number;
  transversaleStates: TransversaleState[];
}

defineProps<Props>();

function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

function getTransversaleLabel(id: TransversaleId): string {
  return TRANSVERSALE_LABELS[id];
}
</script>

<style scoped>
.stat-box {
  @apply p-4 bg-gray-700 rounded-lg;
}

.stat-label {
  @apply text-xs text-gray-400 uppercase tracking-wide mb-1;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-change {
  @apply text-sm font-semibold mt-1;
}

.stat-positive {
  @apply bg-green-900 bg-opacity-30 border border-green-700;
}

.stat-positive .stat-value {
  @apply text-green-400;
}

.stat-positive .stat-change {
  @apply text-green-400;
}

.stat-negative {
  @apply bg-red-900 bg-opacity-30 border border-red-700;
}

.stat-negative .stat-value {
  @apply text-red-400;
}

.stat-negative .stat-change {
  @apply text-red-400;
}
</style>
