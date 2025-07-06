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
      <button
        @click="handlePlayPause"
        class="playback-btn play-btn"
        :class="{
          'context-pause': pauseReason === 'context',
          'user-pause': pauseReason === 'user',
        }"
        :title="playButtonTooltip"
      >
        <PlayIcon v-if="!isPlaying" class="icon" />
        <PauseIcon v-else class="icon" />
        <span class="button-text">
          {{ playButtonText }}
          <span
            v-if="!isPlaying && pauseReason === 'context'"
            class="context-info"
          />
        </span>
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
import { computed } from "vue";
import { PlayIcon, PauseIcon, RotateCcwIcon, XIcon } from "lucide-vue-next";

const props = defineProps<{
  isPlaying: boolean;
  pauseReason?: "user" | "context" | null;
}>();

const emit = defineEmits<{
  togglePlayback: [];
  resumeFromContext: [];
  restart: [];
  reset: [];
}>();

const playButtonText = computed(() => {
  if (props.isPlaying) return "Pause";

  if (props.pauseReason === "context") {
    return "Resume";
  }

  return "Play";
});

const playButtonTooltip = computed(() => {
  if (props.isPlaying) return "Pause playback";

  if (props.pauseReason === "context") {
    return `Paused for context item. Click to resume playback.`;
  }

  if (props.pauseReason === "user") {
    return "Paused by user. Click to resume playback.";
  }

  return "Start playback";
});

const handlePlayPause = () => {
  if (props.pauseReason === "context" && !props.isPlaying) {
    emit("resumeFromContext");
  } else {
    emit("togglePlayback");
  }
};
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
  font-size: 0.7rem;
}

.keyboard-hints kbd {
  background: var(--terminal-text);
  color: var(--terminal-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-weight: bold;
}

.playback-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 3rem;
}

.playback-btn {
  background: transparent;
  border: 1px solid #e0e0e0;
  color: var(--terminal-text);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.playback-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.playback-btn .icon {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.button-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}

.context-info {
  font-size: 0.6rem;
  opacity: 0.8;
  font-weight: normal;
}

/* Play button green styling */
.play-btn:hover {
  border-color: #22c55e; /* Green border for all themes */
  color: #22c55e; /* Green text for all themes */
}

.play-btn {
  background: #22c55e; /* Green background on hover */
  color: white; /* White text on green background */
}

/* Context pause special styling */
.play-btn.context-pause:hover {
  border-color: #f59e0b; /* Amber border when paused for context */
  color: #f59e0b;
  animation: contextPulse 2s ease-in-out infinite;
}

.play-btn.context-pause {
  background: #f59e0b;
  color: white;
}

/* Light mode - higher contrast colors */
[data-theme="light"] .play-btn:hover {
  border-color: #16a34a; /* Darker green for better contrast on light background */
  color: #16a34a;
}

[data-theme="light"] .play-btn {
  background: #16a34a;
  color: white;
}

[data-theme="light"] .play-btn.context-pause:hover {
  border-color: #d97706;
  color: #d97706;
}

[data-theme="light"] .play-btn.context-pause {
  background: #d97706;
  color: white;
}

/* Animations */
@keyframes contextPulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}
</style>
