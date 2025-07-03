<template>
  <div class="playback-controls">
    <!-- Keyboard hints -->
    <div class="keyboard-hints">
      <span><kbd>Enter</kbd> Next message</span>
      <span><kbd>Tab</kbd> Complete current</span>
      <span><kbd>Esc</kbd> Reset</span>
    </div>
    
    <!-- Playback buttons -->
    <div class="playback-buttons">
      <button @click="$emit('togglePlayback')" class="playback-btn">
        <PlayIcon v-if="!isPlaying" class="icon" />
        <PauseIcon v-else class="icon" />
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>
      <button @click="$emit('restart')" class="playback-btn">
        <RotateCcwIcon class="icon" />
        Restart
      </button>
      <button @click="$emit('reset')" class="playback-btn">
        <XIcon class="icon" />
        Reset
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, RotateCcwIcon, XIcon } from "lucide-vue-next";

defineProps<{
  isPlaying: boolean;
}>();

defineEmits<{
  togglePlayback: [];
  restart: [];
  reset: [];
}>();
</script>

<style scoped>
.playback-controls {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.keyboard-hints {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.keyboard-hints kbd {
  background: var(--terminal-text);
  color: var(--terminal-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
}

.playback-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.playback-btn {
  background: transparent;
  border: 1px solid var(--terminal-text);
  color: var(--terminal-text);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.playback-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.playback-btn .icon {
  width: 12px;
  height: 12px;
}
</style>
