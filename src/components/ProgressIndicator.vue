<template>
  <div class="progress-indicator">
    <div class="progress-bar">
      <div 
        class="progress-fill" 
        :style="{ width: `${(current / total) * 100}%` }"
      ></div>
    </div>
    <div class="progress-text">
      {{ current }} / {{ total }} messages
      <PlayIcon v-if="isPlaying" class="playing-indicator icon" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon } from 'lucide-vue-next'

defineProps<{
  current: number
  total: number
  isPlaying: boolean
}>()
</script>

<style scoped>
.icon {
  width: 14px;
  height: 14px;
}
</style>