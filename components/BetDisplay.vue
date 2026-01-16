<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">
      💰 Nächste Wetten ({{ formatCurrency(totalStake) }})
    </h2>

    <!-- Coverage Overview -->
    <div class="mb-4 p-3 bg-gray-700 rounded-lg">
      <div class="flex justify-between text-sm">
        <span class="text-gray-300">Abdeckung:</span>
        <span class="font-bold text-green-400">{{ coverage.coveragePercentage.toFixed(1) }}%</span>
      </div>
      <div class="flex justify-between text-sm mt-1">
        <span class="text-gray-300">Zahlen:</span>
        <span class="font-bold">{{ coverage.coveredNumbers.size }} / 37</span>
      </div>
      <div v-if="coverage.overlaps.length > 0" class="mt-2 text-xs text-yellow-400">
        ⚠️ Überlappungen bei: {{ coverage.overlaps.join(', ') }}
      </div>
    </div>

    <!-- Transversale Bets -->
    <div class="mb-4">
      <h3 class="text-lg font-semibold mb-2 text-gray-300">Transversalen (6er-Linien):</h3>
      <div class="space-y-2">
        <div
          v-for="bet in transversaleBets"
          :key="bet.target"
          class="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
        >
          <div>
            <span class="font-bold text-white">{{ getTransversaleLabel(bet.target as TransversaleId) }}</span>
            <span class="text-xs text-gray-400 ml-2">{{ bet.numbers.join(', ') }}</span>
          </div>
          <div class="text-right">
            <div class="font-bold text-yellow-400">{{ formatCurrency(bet.amount) }}</div>
            <div class="text-xs text-gray-400">Fibonacci: Stufe {{ getFibonacciLevel(bet.target as TransversaleId) }}</div>
          </div>
        </div>

        <div v-if="transversaleBets.length === 0" class="text-gray-500 text-center py-4">
          Keine aktiven Transversalen-Wetten
        </div>
      </div>
    </div>

    <!-- Coverage Bets -->
    <div v-if="coverageBets.length > 0">
      <h3 class="text-lg font-semibold mb-2 text-gray-300">Absicherung (Kessel-Sektoren):</h3>
      <div class="space-y-2">
        <div
          v-for="bet in coverageBets"
          :key="bet.target"
          class="flex justify-between items-center p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-700"
        >
          <div>
            <span class="font-bold text-green-300">{{ getCoverageLabel(bet.target as CoverageBetType) }}</span>
            <span class="text-xs text-gray-400 ml-2">{{ bet.numbers.join(', ') }}</span>
          </div>
          <div class="font-bold text-green-400">{{ formatCurrency(bet.amount) }}</div>
        </div>
      </div>
    </div>

    <!-- Warning if approaching limits -->
    <div v-if="hasWarnings" class="mt-4 p-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
      <p class="text-red-400 font-semibold">⚠️ Warnungen:</p>
      <ul class="text-sm text-red-300 mt-2 space-y-1">
        <li v-if="isNearTableLimit">• Einige Wetten nähern sich dem Tischlimit ({{ formatCurrency(tableLimit) }})</li>
        <li v-if="isLowBankroll">• Kontostand niedrig ({{ formatCurrency(balance) }})</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BetPlacement, TransversaleId, CoverageBetType } from '~/types';
import { TRANSVERSALE_LABELS, COVERAGE_LABELS } from '~/utils/roulette-constants';

interface Props {
  bets: BetPlacement[];
  totalStake: number;
  balance: number;
  tableLimit: number;
  coverage: {
    coveredNumbers: Set<number>;
    coveragePercentage: number;
    overlaps: number[];
  };
  fibonacciLevels: Record<TransversaleId, number>;
}

const props = defineProps<Props>();

const transversaleBets = computed(() =>
  props.bets.filter(b => b.type === 'transversale')
);

const coverageBets = computed(() =>
  props.bets.filter(b => b.type === 'coverage')
);

const isNearTableLimit = computed(() =>
  transversaleBets.value.some(b => b.amount > props.tableLimit * 0.7)
);

const isLowBankroll = computed(() =>
  props.balance < props.totalStake * 5
);

const hasWarnings = computed(() =>
  isNearTableLimit.value || isLowBankroll.value
);

function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

function getTransversaleLabel(id: TransversaleId): string {
  return TRANSVERSALE_LABELS[id];
}

function getCoverageLabel(type: CoverageBetType): string {
  return COVERAGE_LABELS[type];
}

function getFibonacciLevel(id: TransversaleId): number {
  return props.fibonacciLevels[id];
}
</script>
