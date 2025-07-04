<template>
  <div class="conversation-footer">
    <div class="message-counter">
      {{ currentMessage }} / {{ totalMessages }} messages
    </div>
    <PlaybackControls
      :is-playing="isPlaying"
      @toggle-playback="handleTogglePlayback"
      @restart="handleRestart"
      @reset="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import PlaybackControls from '../components/PlaybackControls.vue'

// This component acts as a bridge between the footer and the conversation display
// In a real implementation, you'd want to use a global state or event bus
// For now, we'll use refs and emit events that the parent can listen to

const isPlaying = ref(false)
const currentMessage = ref(0)
const totalMessages = ref(0)

const handleTogglePlayback = () => {
  // Emit event to parent or use global state
  window.dispatchEvent(new CustomEvent('playback-toggle'))
}

const handleRestart = () => {
  window.dispatchEvent(new CustomEvent('playback-restart'))
}

const handleReset = () => {
  window.dispatchEvent(new CustomEvent('playback-reset'))
}

// Listen for message counter updates
const handleMessageCounterUpdate = (event: CustomEvent) => {
  currentMessage.value = event.detail.current
  totalMessages.value = event.detail.total
}

// Listen for playback state changes
const handlePlaybackStateChange = (event: CustomEvent) => {
  isPlaying.value = event.detail.isPlaying
}

onMounted(() => {
  window.addEventListener('message-counter-update', handleMessageCounterUpdate as EventListener)
  window.addEventListener('playback-state-change', handlePlaybackStateChange as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('message-counter-update', handleMessageCounterUpdate as EventListener)
  window.removeEventListener('playback-state-change', handlePlaybackStateChange as EventListener)
})
</script>

<style scoped>
.conversation-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
}

.message-counter {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .conversation-footer {
    flex-direction: column;
    gap: var(--spacing-2);
  }
  
  .message-counter {
    order: -1;
  }
}
</style>
