<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">⚠️ Worst-Case Rechner</h2>

    <p class="text-sm text-gray-400 mb-4">
      Berechne den maximalen Verlust bei X aufeinanderfolgenden Pechsträhnen-Runden.
    </p>

    <!-- Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-300 mb-2">
        Anzahl aufeinanderfolgende Verluste:
      </label>
      <input
        v-model.number="consecutiveLosses"
        type="range"
        min="1"
        max="20"
        class="w-full"
      />
      <div class="text-center text-2xl font-bold text-yellow-400 mt-2">
        {{ consecutiveLosses }} Runden
      </div>
    </div>

    <!-- Results -->
    <div v-if="scenario" class="space-y-4">
      <!-- Total Loss -->
      <div class="p-4 bg-red-900 bg-opacity-30 border-2 border-red-700 rounded-lg">
        <div class="text-sm text-gray-300 mb-1">Gesamtverlust:</div>
        <div class="text-3xl font-bold text-red-400">{{ formatCurrency(scenario.totalLoss) }}</div>
      </div>

      <!-- Details Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div class="p-3 bg-gray-700 rounded-lg">
          <div class="text-xs text-gray-400">Höchster Einzeleinsatz:</div>
          <div class="text-xl font-bold text-white">{{ formatCurrency(scenario.finalBet) }}</div>
        </div>

        <div class="p-3 bg-gray-700 rounded-lg">
          <div class="text-xs text-gray-400">Fibonacci-Stufe:</div>
          <div class="text-xl font-bold text-yellow-400">{{ scenario.fibonacciStepReached }}</div>
        </div>
      </div>

      <!-- Warnings -->
      <div v-if="scenario.wouldExceedTableLimit || scenario.wouldExceedBankroll"
           class="p-4 bg-red-900 border-2 border-red-600 rounded-lg">
        <p class="font-bold text-red-400 mb-2">🚨 KRITISCHE WARNUNGEN:</p>
        <ul class="space-y-1 text-sm text-red-300">
          <li v-if="scenario.wouldExceedTableLimit">
            ⛔ Einsatz würde Tischlimit ({{ formatCurrency(tableLimit) }}) überschreiten!
          </li>
          <li v-if="scenario.wouldExceedBankroll">
            💸 Verlust würde dein aktuelles Guthaben ({{ formatCurrency(currentBalance) }}) übersteigen!
          </li>
        </ul>
      </div>

      <!-- Safety Info -->
      <div v-else class="p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
        <p class="text-green-400 text-sm">
          ✅ Dein Guthaben ({{ formatCurrency(currentBalance) }}) würde {{ consecutiveLosses }} aufeinanderfolgende Verluste überstehen.
        </p>
      </div>

      <!-- Probability Info -->
      <div class="p-3 bg-blue-900 bg-opacity-30 border border-blue-700 rounded-lg">
        <p class="text-xs text-blue-300">
          💡 <strong>Wahrscheinlichkeit:</strong> {{ consecutiveLosses }} Verluste hintereinander
          = ca. {{ (Math.pow(31/37, consecutiveLosses) * 100).toFixed(2) }}%
          (bei ~16% Gewinnchance pro Runde mit 6 Transversalen)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WorstCaseScenario } from '~/types';

interface Props {
  currentBalance: number;
  tableLimit: number;
  calculateScenario: (losses: number) => WorstCaseScenario;
}

const props = defineProps<Props>();

const consecutiveLosses = ref(5);

const scenario = computed(() => {
  return props.calculateScenario(consecutiveLosses.value);
});

function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`;
}
</script>

<style scoped>
input[type="range"] {
  @apply appearance-none bg-gray-700 h-2 rounded-lg outline-none;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-6 h-6 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-600;
}

input[type="range"]::-moz-range-thumb {
  @apply w-6 h-6 bg-yellow-500 rounded-full cursor-pointer hover:bg-yellow-600 border-0;
}
</style>
