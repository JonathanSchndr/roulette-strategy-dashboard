<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">📥 Daten exportieren</h2>

    <p class="text-sm text-gray-400 mb-4">
      Exportiere deine Session-Daten für weitere Analysen.
    </p>

    <div class="space-y-3">
      <!-- CSV Export -->
      <button
        @click="exportCSV"
        class="btn-primary w-full flex items-center justify-center gap-2"
        :disabled="!hasData"
      >
        <span>📊</span>
        <span>Als CSV exportieren</span>
      </button>

      <!-- JSON Export -->
      <button
        @click="exportJSON"
        class="btn-secondary w-full flex items-center justify-center gap-2"
        :disabled="!hasData"
      >
        <span>📋</span>
        <span>Als JSON exportieren</span>
      </button>

      <!-- Info -->
      <div v-if="!hasData" class="text-xs text-gray-500 text-center mt-2">
        Keine Daten zum Exportieren vorhanden
      </div>

      <div v-if="exported" class="p-3 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg text-green-400 text-sm">
        ✅ Erfolgreich exportiert!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hasData: boolean;
  onExportCSV: () => string;
  onExportJSON: () => object;
}

const props = defineProps<Props>();

const exported = ref(false);

function exportCSV() {
  const csvData = props.onExportCSV();
  downloadFile(csvData, 'roulette-session.csv', 'text/csv');
  showExportedMessage();
}

function exportJSON() {
  const jsonData = props.onExportJSON();
  const jsonString = JSON.stringify(jsonData, null, 2);
  downloadFile(jsonString, 'roulette-session.json', 'application/json');
  showExportedMessage();
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function showExportedMessage() {
  exported.value = true;
  setTimeout(() => {
    exported.value = false;
  }, 3000);
}
</script>
