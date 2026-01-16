<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">⚙️ Einstellungen</h2>

    <!-- Base Units -->
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Basis-Einsatz Transversale (€):
        </label>
        <input
          v-model.number="localSettings.baseUnitTransversale"
          type="number"
          step="0.5"
          min="0.5"
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Basis-Einsatz Absicherung (€):
        </label>
        <input
          v-model.number="localSettings.baseUnitCoverage"
          type="number"
          step="0.25"
          min="0.25"
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Tischlimit Transversale (€):
        </label>
        <input
          v-model.number="localSettings.tableLimitTransversale"
          type="number"
          step="50"
          min="50"
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-300 mb-2">
          Max. Fibonacci-Stufe (Sicherheit):
        </label>
        <input
          v-model.number="localSettings.maxFibonacciStep"
          type="number"
          min="5"
          max="15"
          class="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
        />
        <p class="text-xs text-gray-400 mt-1">
          Verhindert extreme Progressionen (Standard: 10)
        </p>
      </div>

      <!-- Coverage Toggles -->
      <div class="p-4 bg-gray-700 rounded-lg">
        <h3 class="font-semibold text-gray-200 mb-3">Absicherungs-Wetten:</h3>

        <label class="flex items-center gap-3 mb-2 cursor-pointer">
          <input
            v-model="localSettings.activeCoverage.zeroSpiel"
            type="checkbox"
            class="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
          />
          <span class="text-gray-200">Zero Spiel (Jeu 0)</span>
        </label>

        <label class="flex items-center gap-3 cursor-pointer">
          <input
            v-model="localSettings.activeCoverage.orphelins"
            type="checkbox"
            class="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
          />
          <span class="text-gray-200">Orphelins</span>
        </label>
      </div>

      <!-- Save Button -->
      <button
        @click="saveSettings"
        class="btn-primary w-full"
      >
        💾 Einstellungen speichern
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GameSettings } from '~/types';

interface Props {
  settings: GameSettings;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  update: [settings: GameSettings];
}>();

const localSettings = ref<GameSettings>({ ...props.settings });

// Watch for external changes
watch(() => props.settings, (newSettings) => {
  localSettings.value = { ...newSettings };
}, { deep: true });

function saveSettings() {
  emit('update', { ...localSettings.value });
}
</script>
