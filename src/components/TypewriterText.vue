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
    displayText.value += props.text[currentIndex]
    currentIndex++
    typingTimer = setTimeout(typeNextCharacter, props.speed)
  } else {
    isTyping.value = false
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
})

onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
})
</script>