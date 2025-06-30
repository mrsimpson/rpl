<template>
  <span class="typewriter-text">
    {{ displayText }}<span v-if="isTyping" class="typing-cursor">█</span>
  </span>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  text: string
  speed: number
}>()

const emit = defineEmits<{
  complete: []
}>()

const displayText = ref('')
const isTyping = ref(false)
let currentIndex = 0
let typingTimer: number

const typeNextCharacter = () => {
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

onMounted(() => {
  startTyping()
})

onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
})
</script>