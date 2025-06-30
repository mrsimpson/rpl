<template>
  <div class="message" :class="[`message-${message.type}`, { 'is-current': isCurrent }]">
    <div class="message-header">
      <span class="message-prefix">{{ messagePrefix }}</span>
      <span class="message-meta">
        {{ formatTime(message.timestamp) }} | {{ message.type }}
      </span>
    </div>
    
    <div class="message-content">
      <TypewriterText
        v-if="isCurrent"
        :text="message.content"
        :speed="getAnimationSpeed()"
        @complete="$emit('animationComplete')"
      />
      <div v-else class="static-content">{{ message.content }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TypewriterText from './TypewriterText.vue'
import type { Message, Settings } from '../types'

const props = defineProps<{
  message: Message
  isCurrent: boolean
  settings: Settings
}>()

const emit = defineEmits<{
  animationComplete: []
}>()

const messagePrefix = computed(() => {
  switch (props.message.type) {
    case 'human': return '>'
    case 'agent': return '<'
    case 'tool_call': return '!'
    case 'system': return '#'
    default: return '?'
  }
})

const getAnimationSpeed = () => {
  return props.message.type === 'human' 
    ? props.settings.humanAnimationSpeed
    : props.settings.agentAnimationSpeed
}

const formatTime = (timestamp: string): string => {
  return new Date(timestamp).toLocaleTimeString()
}
</script>