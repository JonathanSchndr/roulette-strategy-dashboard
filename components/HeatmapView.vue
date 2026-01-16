<template>
  <div class="card">
    <h2 class="text-2xl font-bold mb-4 text-yellow-400">🔥 Heatmap (Häufigkeit)</h2>

    <p class="text-sm text-gray-400 mb-4">
      Grün = oft gefallen | Rot = selten gefallen | Größe = wie lange her
    </p>

    <!-- Heatmap Grid -->
    <div class="grid grid-cols-6 md:grid-cols-13 gap-2">
      <div
        v-for="data in heatmapData"
        :key="data.number"
        class="heatmap-cell"
        :style="{
          backgroundColor: data.color,
          transform: `scale(${getScaleForRecency(data.lastSeenRoundsAgo)})`,
        }"
        :title="`${data.number}: ${data.hitCount}x getroffen, vor ${data.lastSeenRoundsAgo} Runden`"
      >
        <div class="heatmap-number">{{ data.number }}</div>
        <div class="heatmap-count">{{ data.hitCount }}</div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-6 flex justify-between text-xs text-gray-400">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" style="background: hsl(0, 70%, 50%)"></div>
        <span>Selten</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" style="background: hsl(60, 70%, 50%)"></div>
        <span>Mittel</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded" style="background: hsl(120, 70%, 50%)"></div>
        <span>Häufig</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HeatmapData } from '~/types';

interface Props {
  heatmapData: HeatmapData[];
}

defineProps<Props>();

/**
 * Scale cells based on how recently they appeared
 * Recent = larger, Old = smaller
 */
function getScaleForRecency(roundsAgo: number): number {
  if (roundsAgo === 0) return 1.0; // Never appeared
  if (roundsAgo <= 5) return 1.2;  // Very recent
  if (roundsAgo <= 10) return 1.1; // Recent
  if (roundsAgo <= 20) return 1.0; // Normal
  return 0.9; // Long ago
}
</script>

<style scoped>
.heatmap-cell {
  @apply relative flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer;
  min-height: 60px;
}

.heatmap-number {
  @apply text-white font-bold text-lg;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}

.heatmap-count {
  @apply text-xs text-white font-semibold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}
</style>
