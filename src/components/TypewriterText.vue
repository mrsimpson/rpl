<template>
  <span class="typewriter-text">
    {{ displayText }}<span v-if="isTyping" class="typing-cursor">█</span>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{
  text: string
  speed: number
  paused?: boolean
}>()

const emit = defineEmits<{
  complete: []
  typing: [character: string]
}>()

const displayText = ref('')
const isTyping = ref(false)
let currentIndex = 0
let typingTimer: number | null = null

const typeNextCharacter = () => {
  if (props.paused) {
    // If paused, don't continue typing but keep the timer reference
    return
  }
  
  if (currentIndex < props.text.length) {
    const character = props.text[currentIndex]
    displayText.value += character
    currentIndex++
    
    // Emit typing event for each character
    emit('typing', character)
    
    typingTimer = setTimeout(typeNextCharacter, props.speed)
  } else {
    isTyping.value = false
    emit('complete')
  }
}

const forceComplete = () => {
  if (isTyping.value) {
    // Complete the text immediately
    displayText.value = props.text
    currentIndex = props.text.length
    isTyping.value = false
    
    // Clear any pending timer
    if (typingTimer) {
      clearTimeout(typingTimer)
      typingTimer = null
    }
    
    emit('complete')
  }
}

const startTyping = () => {
  isTyping.value = true
  currentIndex = 0
  displayText.value = ''
  typeNextCharacter()
}

const resumeTyping = () => {
  if (isTyping.value && !typingTimer) {
    typeNextCharacter()
  }
}

// Watch for pause state changes
watch(() => props.paused, (newPaused) => {
  if (newPaused) {
    // Pause: clear the timer but keep current state
    if (typingTimer) {
      clearTimeout(typingTimer)
      typingTimer = null
    }
  } else {
    // Resume: continue typing if we were in the middle of typing
    resumeTyping()
  }
})

onMounted(() => {
  startTyping()
  
  // Listen for force complete events
  window.addEventListener('force-complete-typing', forceComplete)
})

onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
  
  // Clean up event listener
  window.removeEventListener('force-complete-typing', forceComplete)
})
</script>