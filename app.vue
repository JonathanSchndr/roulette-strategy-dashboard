<template>
  <div class="min-h-screen bg-gray-900 p-4 md:p-8">
    <!-- Header -->
    <header class="mb-8 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-yellow-400 mb-2">
        🎰 Roulette Strategy Dashboard
      </h1>
      <p class="text-gray-400">
        Hybrid-Strategie: Transversalen (Fibonacci) + Zero Spiel & Orphelins
      </p>
    </header>

    <!-- Main Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Left Column: Input & Next Bets -->
      <div class="space-y-6">
        <NumberKeypad
          :history="gameStore.history"
          :can-undo="gameStore.history.length > 0"
          @select="handleNumberSelect"
          @undo="handleUndo"
          @reset="handleReset"
        />

        <BetDisplay
          :bets="gameStore.nextBetSuggestions"
          :total-stake="gameStore.nextTotalStake"
          :balance="gameStore.balance"
          :table-limit="gameStore.settings.tableLimitTransversale"
          :coverage="gameStore.currentCoverage"
          :fibonacci-levels="fibonacciLevels"
        />
      </div>

      <!-- Right Column: Stats & Visualization -->
      <div class="space-y-6">
        <StatsDashboard
          :stats="gameStore.sessionStats"
          :balance="gameStore.balance"
          :transversale-states="Object.values(gameStore.transversaleStates)"
        />

        <RouletteTable
          :covered-numbers="gameStore.currentCoverage.coveredNumbers"
          :overlap-numbers="gameStore.currentCoverage.overlaps"
          :last-number="lastNumber"
        />
      </div>
    </div>

    <!-- Tabs for Additional Features -->
    <div class="mt-8">
      <div class="flex flex-wrap gap-2 mb-4 border-b border-gray-700">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-6 py-3 font-semibold transition-colors',
            activeTab === tab.id
              ? 'bg-yellow-500 text-gray-900'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="mt-6">
        <HeatmapView
          v-if="activeTab === 'heatmap'"
          :heatmap-data="gameStore.heatmapData"
        />

        <WorstCaseCalculator
          v-if="activeTab === 'worst-case'"
          :current-balance="gameStore.balance"
          :table-limit="gameStore.settings.tableLimitTransversale"
          :calculate-scenario="gameStore.calculateWorstCase"
        />

        <SettingsPanel
          v-if="activeTab === 'settings'"
          :settings="gameStore.settings"
          @update="handleSettingsUpdate"
        />

        <ExportPanel
          v-if="activeTab === 'export'"
          :has-data="gameStore.history.length > 0"
          :on-export-c-s-v="() => gameStore.exportSessionCSV()"
          :on-export-j-s-o-n="() => gameStore.exportSessionJSON()"
        />
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-12 text-center text-gray-500 text-sm">
      <p>
        Session ID: {{ gameStore.sessionId.slice(0, 8) }} |
        Gestartet: {{ formatDate(gameStore.sessionStartTime) }}
      </p>
      <p class="mt-2">
        Made with ❤️ for responsible gaming analysis
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { RouletteNumber, TransversaleId, GameSettings } from '~/types';
import { useGameStore } from '~/stores/game';

const gameStore = useGameStore();

// Active tab management
const activeTab = ref<'heatmap' | 'worst-case' | 'settings' | 'export'>('heatmap');

const tabs = [
  { id: 'heatmap' as const, label: '🔥 Heatmap' },
  { id: 'worst-case' as const, label: '⚠️ Worst-Case' },
  { id: 'settings' as const, label: '⚙️ Einstellungen' },
  { id: 'export' as const, label: '📥 Export' }
];

// Computed properties
const lastNumber = computed(() => {
  return gameStore.history.length > 0
    ? gameStore.history[gameStore.history.length - 1]
    : null;
});

const fibonacciLevels = computed(() => {
  const levels: Record<TransversaleId, number> = {} as Record<TransversaleId, number>;
  Object.values(gameStore.transversaleStates).forEach(state => {
    levels[state.id] = state.fibonacciIndex;
  });
  return levels;
});

// Event handlers
function handleNumberSelect(number: RouletteNumber) {
  gameStore.addSpin(number);

  // Show notification for big wins/losses
  const lastResult = gameStore.spinResults[gameStore.spinResults.length - 1];
  if (lastResult) {
    if (lastResult.netResult > 50) {
      showNotification(`🎉 Großer Gewinn: €${lastResult.netResult.toFixed(2)}!`, 'success');
    } else if (lastResult.netResult < -50) {
      showNotification(`⚠️ Hoher Verlust: €${Math.abs(lastResult.netResult).toFixed(2)}`, 'warning');
    }
  }
}

function handleUndo() {
  if (confirm('Letzte Runde rückgängig machen?')) {
    gameStore.undoLastSpin();
  }
}

function handleReset() {
  if (confirm('⚠️ Wirklich neu starten? Alle Daten gehen verloren!')) {
    gameStore.resetGame();
    activeTab.value = 'heatmap';
  }
}

function handleSettingsUpdate(newSettings: GameSettings) {
  gameStore.updateSettings(newSettings);
  showNotification('✅ Einstellungen gespeichert!', 'success');
}

// Utility functions
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(date);
}

function showNotification(message: string, type: 'success' | 'warning' | 'error') {
  // Simple console notification (can be replaced with toast library)
  console.log(`[${type.toUpperCase()}] ${message}`);

  // You could integrate a toast library here, e.g., vue-toastification
  // For now, we'll use browser alert for critical messages
  if (type === 'error') {
    alert(message);
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('🎰 Roulette Strategy Dashboard loaded');
  console.log('📊 Current coverage:', gameStore.currentCoverage.coveragePercentage.toFixed(1) + '%');
});
</script>

<style>
/* Global styles are in assets/css/main.css */
</style>
