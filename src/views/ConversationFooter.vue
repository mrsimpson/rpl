<template>
  <PlaybackControls
    :is-playing="isPlaying"
    @toggle-playback="handleTogglePlayback"
    @restart="handleRestart"
    @reset="handleReset"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PlaybackControls from '../components/PlaybackControls.vue'

// This component acts as a bridge between the footer and the conversation display
// In a real implementation, you'd want to use a global state or event bus
// For now, we'll use refs and emit events that the parent can listen to

const isPlaying = ref(false)

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

// Listen for playback state changes from the conversation display
window.addEventListener('playback-state-change', (event: any) => {
  isPlaying.value = event.detail.isPlaying
})
</script>

<style scoped>
/* No additional styles needed */
</style>
