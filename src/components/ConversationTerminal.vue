<template>
  <div class="terminal-window" :class="`window-style-${settings.windowStyle}`">
    <!-- Terminal Window Header -->
    <div class="window-header">
      <div class="window-controls">
        <div class="control-button close"></div>
        <div class="control-button minimize"></div>
        <div class="control-button maximize"></div>
      </div>
      <div class="window-title">LLM Conversation Replay</div>
      <div class="terminal-controls">
        <button @click="togglePlayback" class="control-btn">
          <PlayIcon v-if="!isPlaying" class="icon" />
          <PauseIcon v-else class="icon" />
        </button>
        <button @click="restart" class="control-btn">
          <RotateCcwIcon class="icon" />
        </button>
        <button @click="$emit('reset')" class="control-btn">
          <XIcon class="icon" />
        </button>
      </div>
    </div>

    <!-- Terminal Content -->
    <div class="terminal" :class="`theme-${settings.theme}`">
      <div class="terminal-content" ref="terminalContent">
        <div class="conversation-metadata">
          <div class="metadata-line">
            <span class="prompt">$</span>
            <span class="command">replay_conversation</span>
            <span class="args">"{{ conversationData.metadata.title || 'Untitled' }}"</span>
          </div>
          <div class="metadata-info">
            Messages: {{ conversationData.messages.length }} | 
            Format: {{ conversationData.metadata.format }} |
            {{ formatDate(conversationData.metadata.timestamp) }}
          </div>
        </div>

        <div class="messages-container">
          <MessageRenderer
            v-for="(message, index) in visibleMessages"
            :key="message.id"
            :message="message"
            :is-current="index === currentMessageIndex"
            :settings="settings"
            @animation-complete="onMessageComplete"
          />
          
          <div v-if="settings.showGhostPreview && nextMessage" class="ghost-preview">
            <span class="ghost-prefix">{{ getMessagePrefix(nextMessage.type) }}</span>
            <span class="ghost-content">{{ nextMessage.content.substring(0, 50) }}...</span>
          </div>
        </div>

        <div class="terminal-cursor" v-if="showCursor">█</div>
      </div>
    </div>

    <!-- Fixed Progress Indicator -->
    <div class="progress-container">
      <ProgressIndicator
        v-if="settings.showProgress"
        :current="currentMessageIndex + 1"
        :total="conversationData.messages.length"
        :is-playing="isPlaying"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { PlayIcon, PauseIcon, RotateCcwIcon, XIcon } from 'lucide-vue-next'
import MessageRenderer from './MessageRenderer.vue'
import ProgressIndicator from './ProgressIndicator.vue'
import type { ConversationData, Settings } from '../types'

const props = defineProps<{
  conversationData: ConversationData
  settings: Settings
}>()

const emit = defineEmits<{
  reset: []
}>()

const terminalContent = ref<HTMLElement>()
const currentMessageIndex = ref(-1)
const isPlaying = ref(false)
const showCursor = ref(true)

const visibleMessages = computed(() => 
  props.conversationData.messages.slice(0, currentMessageIndex.value + 1)
)

const nextMessage = computed(() => 
  props.conversationData.messages[currentMessageIndex.value + 1]
)

const togglePlayback = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value && currentMessageIndex.value < props.conversationData.messages.length - 1) {
    advanceMessage()
  }
}

const advanceMessage = () => {
  if (currentMessageIndex.value < props.conversationData.messages.length - 1) {
    currentMessageIndex.value++
    scrollToBottom()
    
    // After advancing, check if we should continue auto-advancing
    const currentMessage = props.conversationData.messages[currentMessageIndex.value]
    const nextMessage = props.conversationData.messages[currentMessageIndex.value + 1]
    
    // If current message is not human and next message exists and is also not human,
    // we'll let onMessageComplete handle the auto-advance
    // This ensures consecutive agent messages flow smoothly
  }
}

const restart = () => {
  currentMessageIndex.value = -1
  isPlaying.value = false
}

const onMessageComplete = () => {
  const currentMessage = props.conversationData.messages[currentMessageIndex.value]
  const nextMessage = props.conversationData.messages[currentMessageIndex.value + 1]
  
  // Auto-advance if:
  // 1. We're in auto-play mode, OR
  // 2. Current message is agent/system/tool_call AND next message is also agent/system/tool_call
  const shouldAutoAdvance = isPlaying.value || 
    (currentMessage && nextMessage && 
     currentMessage.type !== 'human' && nextMessage.type !== 'human')
  
  if (shouldAutoAdvance) {
    setTimeout(() => {
      advanceMessage()
    }, 1000) // Brief pause between messages
  }
}

const scrollToBottom = async () => {
  await nextTick()
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      event.preventDefault()
      advanceMessage()
      break
    case 'Tab':
      event.preventDefault()
      // Complete current message instantly by skipping to end
      if (currentMessageIndex.value < props.conversationData.messages.length - 1) {
        // Force complete current animation and advance
        advanceMessage()
      }
      break
    case 'Escape':
      event.preventDefault()
      restart()
      break
    case ' ':
      event.preventDefault()
      togglePlayback()
      break
  }
}

const getMessagePrefix = (type: string): string => {
  switch (type) {
    case 'human': return '> '
    case 'agent': return '< '
    case 'tool_call': return '! '
    case 'system': return '# '
    default: return '? '
  }
}

const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString()
}

// Cursor blinking animation
let cursorInterval: number
onMounted(() => {
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value
  }, 530)
  
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  clearInterval(cursorInterval)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.terminal-window {
  display: flex;
  flex-direction: column;
  background-color: var(--window-bg);
  border-radius: var(--window-border-radius);
  overflow: hidden;
  box-shadow: var(--window-shadow);
}

/* Window Styles */
.window-style-macos {
  --window-bg: #2d2d2d;
  --window-border-radius: 12px;
  --window-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  --control-size: 12px;
  --control-spacing: 8px;
}

.window-style-linux {
  --window-bg: #1e1e1e;
  --window-border-radius: 4px;
  --window-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  --control-size: 14px;
  --control-spacing: 4px;
}

.window-style-windows {
  --window-bg: #0c0c0c;
  --window-border-radius: 8px;
  --window-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  --control-size: 16px;
  --control-spacing: 2px;
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2);
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 40px;
}

.window-controls {
  display: flex;
  gap: var(--control-spacing);
  align-items: center;
}

.control-button {
  width: var(--control-size);
  height: var(--control-size);
  border-radius: 50%;
  border: none;
  cursor: pointer;
}

.window-style-macos .control-button.close {
  background-color: #ff5f57;
}

.window-style-macos .control-button.minimize {
  background-color: #ffbd2e;
}

.window-style-macos .control-button.maximize {
  background-color: #28ca42;
}

.window-style-linux .control-button {
  background-color: #666;
  border-radius: 2px;
}

.window-style-windows .control-button {
  background-color: #666;
  border-radius: 0;
}

.window-title {
  font-size: var(--font-size-sm);
  color: var(--terminal-text);
  font-weight: 500;
  flex: 1;
  text-align: center;
}

.terminal-controls {
  display: flex;
  gap: var(--spacing-1);
}

.control-btn {
  background: none;
  border: none;
  color: var(--terminal-text);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.icon {
  width: 16px;
  height: 16px;
}

.terminal {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--terminal-bg);
  color: var(--terminal-text);
  font-family: var(--font-mono);
  min-height: 0;
  width: 100%;
  max-width: 100%;
}

.terminal-content {
  flex: 1;
  padding: var(--spacing-2);
  overflow-y: auto;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
}

.conversation-metadata {
  margin-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--terminal-dim);
  padding-bottom: var(--spacing-2);
}

.metadata-line {
  margin-bottom: var(--spacing-1);
}

.prompt {
  color: var(--terminal-accent);
  font-weight: bold;
}

.command {
  color: var(--terminal-text);
  margin-left: var(--spacing-1);
}

.args {
  color: var(--terminal-dim);
  margin-left: var(--spacing-1);
}

.metadata-info {
  font-size: var(--font-size-sm);
  color: var(--terminal-dim);
}

.messages-container {
  margin-bottom: var(--spacing-2);
}

.terminal-cursor {
  color: var(--terminal-cursor);
  animation: blink 1s infinite;
  margin-top: var(--spacing-1);
}

.ghost-preview {
  opacity: 0.3;
  font-style: italic;
  color: var(--terminal-dim);
  margin-top: var(--spacing-2);
}

.ghost-prefix {
  color: var(--terminal-accent);
  font-weight: bold;
}

.ghost-content {
  margin-left: var(--spacing-1);
}

.progress-container {
  position: sticky;
  bottom: 0;
  background-color: var(--terminal-bg);
  border-top: 1px solid var(--terminal-dim);
  z-index: 10;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}
</style>