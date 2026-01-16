<template>
  <div class="card">
    <h2 class="text-xl sm:text-2xl font-bold mb-4 text-yellow-400">Nummer eingeben</h2>

    <!-- European Roulette Layout -->
    <div class="overflow-x-auto -mx-2 px-2 pb-2">
      <div class="grid grid-cols-13 gap-0.5 sm:gap-1 min-w-min">
      <!-- Zero at top -->
      <button
        @click="selectNumber(0)"
        class="roulette-number number-green col-span-1"
        :class="{ 'ring-4 ring-yellow-400': lastNumber === 0 }"
      >
        0
      </button>

      <!-- Fill remaining top row with empty space -->
      <div class="col-span-12"></div>

      <!-- Main grid: 3 rows x 12 columns -->
      <template v-for="row in 3" :key="row">
        <template v-for="col in 12" :key="col">
          <button
            @click="selectNumber(getNumberForPosition(row, col))"
            :class="[
              'roulette-number',
              getNumberColor(getNumberForPosition(row, col)) === 'red' ? 'number-red' : 'number-black',
              { 'ring-4 ring-yellow-400': lastNumber === getNumberForPosition(row, col) }
            ]"
          >
            {{ getNumberForPosition(row, col) }}
          </button>
        </template>
      </template>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="mt-4 flex flex-wrap sm:flex-nowrap gap-2">
      <button
        @click="selectRandomNumber"
        class="btn-primary flex-1 min-w-[100px] text-sm sm:text-base"
        title="Select a random roulette number (0-36)"
      >
        <span class="hidden sm:inline">🎲 Random</span>
        <span class="sm:hidden">🎲</span>
      </button>
      <button
        @click="$emit('undo')"
        class="btn-secondary flex-1 min-w-[100px] text-sm sm:text-base"
        :disabled="!canUndo"
      >
        <span class="hidden sm:inline">↶ Rückgängig</span>
        <span class="sm:hidden">↶</span>
      </button>
      <button
        @click="$emit('reset')"
        class="btn-danger flex-1 min-w-[100px] text-sm sm:text-base"
      >
        <span class="hidden sm:inline">⟲ Neu starten</span>
        <span class="sm:hidden">⟲</span>
      </button>
    </div>

    <!-- History Display -->
    <div v-if="history.length > 0" class="mt-4">
      <h3 class="text-xs sm:text-sm font-semibold text-gray-400 mb-2">Letzte 10 Zahlen:</h3>
      <div class="flex gap-1.5 sm:gap-2 flex-wrap">
        <span
          v-for="(num, idx) in recentHistory"
          :key="idx"
          :class="[
            'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0',
            getNumberColor(num) === 'red' ? 'bg-red-600' :
            getNumberColor(num) === 'green' ? 'bg-green-600' : 'bg-gray-900 border border-gray-600'
          ]"
        >
          {{ num }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RouletteNumber } from '~/types';
import { getNumberColor } from '~/utils/roulette-constants';

interface Props {
  history: RouletteNumber[];
  canUndo: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  select: [number: RouletteNumber];
  undo: [];
  reset: [];
}>();

const lastNumber = computed(() => {
  return props.history.length > 0 ? props.history[props.history.length - 1] : null;
});

const recentHistory = computed(() => {
  return props.history.slice(-10).reverse();
});

/**
 * European Roulette number layout
 * Numbers are arranged in 3 rows, 12 columns
 * Row 1: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36
 * Row 2: 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
 * Row 3: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
 */
function getNumberForPosition(row: number, col: number): RouletteNumber {
  // Formula: Starting from bottom row (row 3 = 1,4,7...)
  const baseNumber = (4 - row); // Row 3 -> 1, Row 2 -> 2, Row 1 -> 3
  return (baseNumber + ((col - 1) * 3)) as RouletteNumber;
}

function selectNumber(num: RouletteNumber) {
  emit('select', num);
}

/**
 * Select a random roulette number (0-36)
 * Simulates a real roulette spin with equal probability for all numbers
 */
function selectRandomNumber() {
  const randomNum = Math.floor(Math.random() * 37) as RouletteNumber;
  emit('select', randomNum);
}
</script>
