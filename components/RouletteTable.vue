<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">🎲 Roulette Tisch</h2>

    <div class="roulette-table">
      <!-- Zero Section -->
      <div class="zero-section">
        <div
          class="table-number zero"
          :class="{ 'active-bet': isNumberCovered(0) }"
        >
          0
        </div>
      </div>

      <!-- Main Table Grid -->
      <div class="table-grid">
        <template v-for="row in 3" :key="row">
          <template v-for="col in 12" :key="col">
            <div
              :class="[
                'table-number',
                getNumberColor(getNumberForPosition(row, col)),
                {
                  'active-bet': isNumberCovered(getNumberForPosition(row, col)),
                  'overlap-bet': isOverlap(getNumberForPosition(row, col)),
                  'last-hit': lastNumber === getNumberForPosition(row, col)
                }
              ]"
            >
              {{ getNumberForPosition(row, col) }}
            </div>
          </template>
        </template>
      </div>

      <!-- Legend -->
      <div class="legend">
        <div class="legend-item">
          <div class="legend-color active-bet"></div>
          <span>Aktive Wette</span>
        </div>
        <div class="legend-item">
          <div class="legend-color overlap-bet"></div>
          <span>Überlappung (Mehrfach-Treffer)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color last-hit"></div>
          <span>Letzte gefallene Zahl</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouletteNumber } from '~/types';
import { getNumberColor as getColor } from '~/utils/roulette-constants';

interface Props {
  coveredNumbers: Set<RouletteNumber>;
  overlapNumbers: RouletteNumber[];
  lastNumber: RouletteNumber | null;
}

const props = defineProps<Props>();

function getNumberForPosition(row: number, col: number): RouletteNumber {
  const baseNumber = (4 - row);
  return (baseNumber + ((col - 1) * 3)) as RouletteNumber;
}

function getNumberColor(num: RouletteNumber): string {
  const color = getColor(num);
  return color === 'red' ? 'red' : color === 'green' ? 'green' : 'black';
}

function isNumberCovered(num: RouletteNumber): boolean {
  return props.coveredNumbers.has(num);
}

function isOverlap(num: RouletteNumber): boolean {
  return props.overlapNumbers.includes(num);
}
</script>

<style scoped>
.roulette-table {
  @apply space-y-4;
}

.zero-section {
  @apply flex justify-center mb-2;
}

.table-grid {
  @apply grid grid-cols-12 gap-1;
}

.table-number {
  @apply w-full aspect-square flex items-center justify-center font-bold text-sm md:text-base rounded transition-all duration-200;
  min-height: 40px;
}

.table-number.red {
  @apply bg-red-600 text-white;
}

.table-number.black {
  @apply bg-gray-900 text-white border border-gray-700;
}

.table-number.green {
  @apply bg-green-600 text-white;
}

.table-number.zero {
  @apply w-20 h-20 text-2xl;
}

.table-number.active-bet {
  @apply ring-4 ring-yellow-400 ring-opacity-70;
}

.table-number.overlap-bet {
  @apply ring-4 ring-purple-500 ring-opacity-90 animate-pulse;
}

.table-number.last-hit {
  @apply ring-4 ring-blue-400 scale-110 shadow-lg shadow-blue-500;
}

.legend {
  @apply flex flex-wrap gap-4 justify-center mt-6 text-xs text-gray-400;
}

.legend-item {
  @apply flex items-center gap-2;
}

.legend-color {
  @apply w-4 h-4 rounded;
}

.legend-color.active-bet {
  @apply bg-yellow-400;
}

.legend-color.overlap-bet {
  @apply bg-purple-500;
}

.legend-color.last-hit {
  @apply bg-blue-400;
}
</style>
