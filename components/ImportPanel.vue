<template>
  <div class="card">
    <h2 class="text-xl sm:text-2xl font-bold mb-4 text-yellow-400">CSV Import</h2>

    <!-- Info Section -->
    <div class="mb-4 p-3 bg-gray-700 rounded-lg text-sm">
      <p class="mb-2 font-semibold text-gray-200">
        📊 Importiere deine Roulette-Permanenzen
      </p>
      <p class="mb-3 text-gray-300">
        Lade eine CSV-Vorlage herunter, trage deine Permanenzen ein und importiere sie ins Dashboard.
        Das Format funktioniert für alle Casinos und Spielbanken weltweit.
      </p>
      <div class="bg-gray-800 p-2 rounded text-xs font-mono text-gray-400">
        <div class="mb-1">Format: number,timestamp,session,location,table,notes</div>
        <div class="text-gray-500">Beispiel: 17,2026-01-14 16:30:00,Session 1,Casino X,Table 2,</div>
      </div>
    </div>

    <!-- Template Download -->
    <div class="mb-4">
      <button
        @click="downloadTemplate"
        class="btn-secondary w-full text-sm sm:text-base"
      >
        📥 CSV-Vorlage herunterladen
      </button>
    </div>

    <!-- File Upload -->
    <div class="mb-4">
      <label
        for="csv-upload"
        class="block w-full p-8 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-yellow-400 transition-colors text-center"
        :class="{ 'border-yellow-400 bg-gray-700': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          class="hidden"
          @change="handleFileSelect"
        />
        <div class="text-gray-400">
          <div class="text-4xl mb-2">📂</div>
          <p class="text-sm sm:text-base">
            CSV-Datei hier ablegen oder klicken zum Auswählen
          </p>
        </div>
      </label>
    </div>

    <!-- Preview Section -->
    <div v-if="preview" class="mb-4">
      <h3 class="text-sm font-semibold text-gray-400 mb-2">Vorschau:</h3>
      <div class="bg-gray-700 p-3 rounded-lg max-h-48 overflow-y-auto">
        <div v-if="preview.metadata && (preview.metadata.location || preview.metadata.table || preview.metadata.dateRange)" class="mb-3 pb-3 border-b border-gray-600">
          <div class="flex flex-wrap gap-3 text-xs">
            <span v-if="preview.metadata.location" class="px-2 py-1 bg-gray-800 rounded text-gray-300">
              🏛️ {{ preview.metadata.location }}
            </span>
            <span v-if="preview.metadata.table" class="px-2 py-1 bg-gray-800 rounded text-gray-300">
              🎲 {{ preview.metadata.table }}
            </span>
            <span v-if="preview.metadata.dateRange" class="px-2 py-1 bg-gray-800 rounded text-gray-300">
              📅 {{ preview.metadata.dateRange }}
            </span>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(entry, idx) in preview.entries.slice(0, 50)"
            :key="idx"
            :class="[
              'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold',
              getNumberClass(entry.number)
            ]"
            :title="entry.timestamp"
          >
            {{ entry.number }}
          </span>
          <span
            v-if="preview.entries.length > 50"
            class="w-8 h-8 flex items-center justify-center text-xs text-gray-400"
          >
            +{{ preview.entries.length - 50 }}
          </span>
        </div>
        <p class="mt-3 text-sm text-gray-300">
          📊 {{ preview.entries.length }} Zahlen gefunden
        </p>
      </div>

      <!-- Import Button -->
      <div class="mt-4 flex gap-2">
        <button
          @click="importData(true)"
          class="btn-primary flex-1 text-sm sm:text-base"
        >
          ✨ Neu starten & Importieren
        </button>
        <button
          @click="importData(false)"
          class="btn-secondary flex-1 text-sm sm:text-base"
        >
          ➕ Anhängen
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="p-3 bg-red-900/50 border border-red-600 rounded-lg text-sm text-red-200">
      ❌ {{ errorMessage }}
    </div>

    <!-- Success Message -->
    <div v-if="successMessage" class="p-3 bg-green-900/50 border border-green-600 rounded-lg text-sm text-green-200">
      ✅ {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '~/stores/game';
import type { RouletteNumber } from '~/types';
import { getNumberColor } from '~/utils/roulette-constants';
import { parseRouletteCSV, generateTemplateCSV, type ParsedRouletteData } from '~/utils/csv-parser';

const gameStore = useGameStore();

const isDragOver = ref(false);
const preview = ref<ParsedRouletteData | null>(null);
const errorMessage = ref('');
const successMessage = ref('');

function getNumberClass(num: RouletteNumber): string {
  const color = getNumberColor(num);
  if (color === 'red') return 'bg-red-600 text-white';
  if (color === 'green') return 'bg-green-600 text-white';
  return 'bg-gray-900 text-white border border-gray-600';
}

function downloadTemplate() {
  const csv = generateTemplateCSV();
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'roulette-permanenzen-vorlage.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    processFile(input.files[0]);
  }
}

function handleDrop(event: DragEvent) {
  isDragOver.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
}

async function processFile(file: File) {
  errorMessage.value = '';
  successMessage.value = '';
  preview.value = null;

  if (!file.name.endsWith('.csv')) {
    errorMessage.value = 'Bitte eine CSV-Datei auswählen';
    return;
  }

  try {
    const content = await file.text();
    const parsed = parseRouletteCSV(content);

    if (parsed.entries.length === 0) {
      errorMessage.value = 'Keine gültigen Zahlen in der CSV-Datei gefunden';
      return;
    }

    preview.value = parsed;
  } catch (error) {
    errorMessage.value = `Fehler beim Parsen der CSV: ${error}`;
  }
}

function importData(resetFirst: boolean) {
  if (!preview.value) return;

  try {
    const numbers = preview.value.entries.map(e => e.number);
    gameStore.importSpins(numbers, resetFirst);

    successMessage.value = `${numbers.length} Zahlen erfolgreich importiert!`;
    setTimeout(() => {
      successMessage.value = '';
      preview.value = null;
    }, 3000);
  } catch (error) {
    errorMessage.value = `Fehler beim Importieren: ${error}`;
  }
}
</script>
