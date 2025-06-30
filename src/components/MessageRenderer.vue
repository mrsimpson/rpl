<template>
  <div class="message" :class="[`message-${message.type}`, { 'is-current': isCurrent }]">
    <div class="message-line">
      <span class="message-prefix">{{ messagePrefix }} &nbsp;</span>
      <span class="message-content">
        <TypewriterText
          v-if="isCurrent"
          :text="message.content"
          :speed="getAnimationSpeed()"
          @complete="$emit('animationComplete')"
        />
        <span v-else class="static-content">{{ message.content }}</span>
      </span>
      <span class="message-meta">
        {{ formatTime(message.timestamp) }} | {{ message.type }}
      </span>
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

<style scoped>
.message {
  margin-bottom: var(--spacing-2);
}

.message-line {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-1);
}

.message-prefix {
  color: var(--terminal-accent);
  font-weight: bold;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  color: var(--terminal-text);
}

.message-meta {
  color: var(--terminal-dim);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  margin-left: auto;
}

.static-content {
  display: inline;
}
</style>