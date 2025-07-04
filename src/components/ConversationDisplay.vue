<template>
  <div class="terminal-window" :class="[themeClasses, windowStyleClasses]">
    <!-- Terminal Window Header -->
    <div class="window-header">
      <div class="window-controls">
        <div class="control-button close" @click="$emit('reset')"></div>
        <div class="control-button minimize"></div>
        <div class="control-button maximize"></div>
      </div>
      <div class="window-title">LLM Conversation Replay</div>
      <div class="terminal-controls">
        <!-- Remove individual controls - they're now in the footer -->
      </div>
    </div>

    <!-- Terminal Content -->
    <div 
      class="terminal" 
      :style="terminalThemeStyles"
    >
      <div class="terminal-content" ref="terminalContent">
        <div class="conversation-metadata">
          <div class="metadata-line">
            <span class="prompt">$</span>
            <span class="command">replay_conversation</span>
            <span class="args"
              >"{{ conversationData.metadata.title || "Untitled" }}"</span
            >
          </div>
          <div class="metadata-info">
            Format: {{ conversationData.metadata.format }} |
            {{ formatDate(conversationData.metadata.timestamp) }}
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="(message, index) in visibleMessages"
            :key="message.id"
            class="message-wrapper"
            :class="{ 'has-context': hasContextForMessage(index) }"
          >
            <MessageRenderer
              :message="message"
              :is-current="index === currentMessageIndex && (
                (conversationState === 'agent_typing' && message.type !== 'human') ||
                (conversationState === 'user_typing' && message.type === 'human')
              )"
              :settings="settings"
              :paused="!isPlaying"
              :context-count="getContextForMessage(index).length"
              @animation-complete="onMessageComplete"
            />
            
          </div>

          <!-- Ghost preview of next user message -->
          <div v-if="showGhostMessage" class="ghost-preview">
            <span class="ghost-prefix">{{ getMessagePrefix(nextMessage.type) }}</span>
            <span class="ghost-content">
              <span class="terminal-cursor" v-if="cursorAtStart ">█</span><span class="ghost-text">{{ nextMessage.content}}</span>
            </span>
          </div>

          <!-- Completed user message with cursor at end -->
          <div v-if="showCompletedUserMessage" class="completed-message">
            <span class="ghost-prefix">{{ getMessagePrefix(nextMessage.type) }}</span><span class="message-content">{{ nextMessage.content }}<span class="terminal-cursor" v-if="shouldShowCursor">█</span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import MessageRenderer from "./MessageRenderer.vue";
import { useTheme } from '../composables/useTheme'
import { useOSStyle } from '../composables/useOSStyle'
import type { ConversationData, Settings, ContextItem, TerminalThemeDefinition } from "../types";

// Terminal theme definitions - local to this component
const terminalThemes: Record<string, TerminalThemeDefinition> = {
  matrix: {
    name: 'matrix',
    colors: {
      background: '#0d1117',
      text: '#00ff41',
      accent: '#00cc33',
      dim: '#008822',
      cursor: '#00ff41'
    }
  },
  'high-contrast': {
    name: 'high-contrast',
    colors: {
      background: '#000000',
      text: '#ffffff',
      accent: '#ffffff',
      dim: '#cccccc',
      cursor: '#ffffff'
    }
  }
}

const props = defineProps<{
  conversationData: ConversationData;
  settings: Settings;
  contextItems?: any[];
  contextLoading?: boolean;
}>();

const emit = defineEmits<{
  reset: [];
  messageComplete: [messageIndex: number];
  messageHasContext: [data: { messageIndex: number; contextItems: any[] }];
}>();

// Use theme composables
const { themeClasses } = useTheme()

// Make window style reactive to settings changes
const windowStyleClasses = computed(() => {
  const { windowStyleClasses: classes } = useOSStyle(props.settings.windowStyle)
  return classes.value
})

// Terminal theme styling - now responsive to app light/dark mode
const terminalThemeStyles = computed(() => {
  const baseTheme = terminalThemes[props.settings.terminalTheme] || terminalThemes.matrix
  const { isDark } = useTheme()
  
  // Adapt terminal theme colors based on app light/dark mode
  let colors = { ...baseTheme.colors }
  
  if (props.settings.terminalTheme === 'high-contrast') {
    // High contrast theme adapts to light/dark mode
    if (isDark.value) {
      colors = {
        background: '#000000',
        text: '#ffffff',
        accent: '#ffffff',
        dim: '#cccccc',
        cursor: '#ffffff'
      }
    } else {
      colors = {
        background: '#ffffff',
        text: '#000000',
        accent: '#000000',
        dim: '#666666',
        cursor: '#000000'
      }
    }
  } else if (props.settings.terminalTheme === 'matrix') {
    // Matrix theme gets slightly different shades for light mode
    if (!isDark.value) {
      colors = {
        background: '#f0f8f0', // Very light green background
        text: '#006600',       // Darker green text
        accent: '#004400',     // Even darker green accent
        dim: '#008800',        // Medium green for dim text
        cursor: '#006600'      // Dark green cursor
      }
    }
  }
  
  return {
    '--terminal-bg': colors.background,
    '--terminal-text': colors.text,
    '--terminal-accent': colors.accent,
    '--terminal-dim': colors.dim,
    '--terminal-cursor': colors.cursor,
  }
})

const terminalContent = ref<HTMLElement>();
const messagesContainer = ref<HTMLElement>();
const currentMessageIndex = ref(-1);
const showCursor = ref(true);
const isPlaying = ref(false);

// Context functionality
const contextMap = computed(() => {
  const map = new Map<number, ContextItem[]>()
  
  if (props.contextItems) {
    props.contextItems.forEach((item: ContextItem) => {
      if (item.messageRange && Array.isArray(item.messageRange)) {
        item.messageRange.forEach(messageIndex => {
          if (typeof messageIndex === 'number' && messageIndex > 0) {
            if (!map.has(messageIndex)) {
              map.set(messageIndex, [])
            }
            map.get(messageIndex)!.push(item)
          }
        })
      }
    })
  }
  
  return map
})

const getContextForMessage = (messageIndex: number): ContextItem[] => {
  // Convert 0-based message array index to 1-based context file numbering
  return contextMap.value.get(messageIndex + 1) || []
}

const hasContextForMessage = (messageIndex: number): boolean => {
  return getContextForMessage(messageIndex).length > 0
}

const checkAndEmitContext = (messageIndex: number) => {
  const contextItems = getContextForMessage(messageIndex)
  if (contextItems.length > 0) {
    emit('messageHasContext', { messageIndex, contextItems })
  }
}

// State machine for conversation flow
type ConversationState = 'waiting_for_user' | 'user_typing' | 'agent_typing';
const conversationState = ref<ConversationState>('waiting_for_user');

const visibleMessages = computed(() =>
  props.conversationData.messages.slice(0, currentMessageIndex.value + 1)
);

const nextMessage = computed(
  () => props.conversationData.messages[currentMessageIndex.value + 1]
);


// State-based computed properties
const showGhostMessage = computed(() => {
  return conversationState.value === 'waiting_for_user' && 
         nextMessage.value && 
         nextMessage.value.type === 'human';
});

const showCompletedUserMessage = computed(() => {
  return conversationState.value === 'user_typing' && 
         nextMessage.value && 
         nextMessage.value.type === 'human';
});

const shouldShowCursor = computed(() => {
  return conversationState.value === 'waiting_for_user' || 
         conversationState.value === 'user_typing';
});

const cursorAtStart = computed(() => 
  conversationState.value === 'waiting_for_user' && showGhostMessage.value
);


const togglePlayback = () => {
  isPlaying.value = !isPlaying.value;
  console.log('Toggle playback - isPlaying:', isPlaying.value);
  
  if (isPlaying.value) {
    // Play pressed - scroll to bottom and start/continue playback
    scrollToBottom();
    startPlaybackUntilNextUser();
  }
  // If pausing, the paused prop change will pause the animation
};

const startPlaybackUntilNextUser = () => {
  if (conversationState.value === 'waiting_for_user') {
    // Start the next message
    const nextMsg = props.conversationData.messages[currentMessageIndex.value + 1];
    if (nextMsg) {
      if (nextMsg.type === 'human') {
        // Next message is user message - start typing it
        currentMessageIndex.value++;
        conversationState.value = 'user_typing';
        scrollToBottom();
      } else {
        // Next message is agent/tool - start agent sequence
        processAgentMessages();
      }
    }
  } else if (conversationState.value === 'agent_typing' || conversationState.value === 'user_typing') {
    // Already in a typing state - the paused prop change will resume the current animation
    // The playback flow will continue after this message completes
  }
  // The paused prop change will resume any active typing animation
};


const completeUserMessage = () => {
  // TAB pressed - show completed user message
  conversationState.value = 'user_typing';
};

const submitUserMessage = () => {
  // ENTER pressed - submit user message and start agent responses
  if (nextMessage.value && nextMessage.value.type === 'human') {
    // Add user message to visible messages
    currentMessageIndex.value++;
    conversationState.value = 'agent_typing';
    
    // Set playing to true and start play-until-next-user behavior
    isPlaying.value = true;
    
    // Start agent response sequence
    setTimeout(() => {
      processAgentMessages();
    }, 500);
  }
};

const processAgentMessages = () => {
  const nextMsg = props.conversationData.messages[currentMessageIndex.value + 1];
  
  if (nextMsg && nextMsg.type !== 'human') {
    // Show next non-human message
    currentMessageIndex.value++;
    conversationState.value = 'agent_typing';
    scrollToBottom();
    
    // If it's a tool_call, continue immediately since it doesn't animate
    if (nextMsg.type === 'tool_call') {
      setTimeout(() => {
        if (isPlaying.value) {
          continuePlayback();
        } else {
          conversationState.value = 'waiting_for_user';
        }
      }, 1000); // Brief delay to show the tool call
    }
    // For agent messages, onMessageComplete will handle continuation when animation finishes
  } else {
    // No more agent messages, or next is human message
    conversationState.value = 'waiting_for_user';
  }
};

const restart = () => {
  currentMessageIndex.value = -1;
  conversationState.value = 'waiting_for_user';
  
  // Clear current message context and hide context panel
  emit('messageHasContext', { messageIndex: -1, contextItems: [] });
  
  initializeConversation();
};

const initializeConversation = () => {
  // Check if we have messages and what the first message type is
  if (props.conversationData.messages.length > 0) {
    const firstMessage = props.conversationData.messages[0];
    
    if (firstMessage.type === 'human') {
      // First message is user message - show it as ghost
      currentMessageIndex.value = -1; // Position before first message
      conversationState.value = 'waiting_for_user';
    } else {
      // First message is agent message - this is unusual but handle it
      currentMessageIndex.value = -1;
      conversationState.value = 'agent_typing';
      setTimeout(() => {
        processAgentMessages();
      }, 500);
    }
  }
};

const onMessageComplete = () => {
  console.log('Message animation complete, state:', conversationState.value, 'isPlaying:', isPlaying.value);
  
  // Emit message completion event for context system
  emit('messageComplete', currentMessageIndex.value);
  
  // Check and emit context for the completed message
  checkAndEmitContext(currentMessageIndex.value);
  
  if (conversationState.value === 'agent_typing') {
    if (isPlaying.value) {
      // Continue to next message if playing
      setTimeout(() => {
        continuePlayback();
      }, 1000);
    } else {
      // If paused, wait for user interaction
      conversationState.value = 'waiting_for_user';
    }
  } else if (conversationState.value === 'user_typing') {
    // User message completed - continue playback if playing
    if (isPlaying.value) {
      setTimeout(() => {
        continuePlayback();
      }, 1000);
    } else {
      conversationState.value = 'waiting_for_user';
    }
  }
};

const continuePlayback = () => {
  const nextMsg = props.conversationData.messages[currentMessageIndex.value + 1];
  
  if (nextMsg) {
    if (nextMsg.type === 'human') {
      // Next is user message - don't advance index, go back to waiting state
      // This will show the ghost preview and wait for Tab or Play
      conversationState.value = 'waiting_for_user';
      isPlaying.value = false; // Auto-pause when reaching user message
      console.log('Reached user message - showing ghost preview, waiting for Tab or Play');
    } else {
      // Next is agent/tool message - continue
      processAgentMessages();
    }
  } else {
    // No more messages
    conversationState.value = 'waiting_for_user';
    isPlaying.value = false;
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (terminalContent.value) {
    terminalContent.value.scrollTop = terminalContent.value.scrollHeight;
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case "Enter":
      event.preventDefault();
      if (conversationState.value === 'user_typing') {
        submitUserMessage();
      }
      break;
    case "Tab":
      event.preventDefault();
      if (conversationState.value === 'waiting_for_user') {
        completeUserMessage();
      }
      break;
    case "Escape":
      event.preventDefault();
      restart();
      break;
    case " ":
      event.preventDefault();
      togglePlayback();
      break;
  }
};

const getMessagePrefix = (type: string): string => {
  switch (type) {
    case "human":
      return "> ";
    case "agent":
      return "< ";
    case "tool_call":
      return "! ";
    case "system":
      return "# ";
    default:
      return "? ";
  }
};

const formatDate = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

// Watch for conversation data changes and initialize
watch(() => props.conversationData, () => {
  initializeConversation();
}, { immediate: true });

// Scroll-to-pause functionality
let lastScrollTop = 0;
let scrollTimeout: number | null = null;

const handleScroll = () => {
  if (!terminalContent.value || !isPlaying.value) return;
  
  const container = terminalContent.value;
  const currentScrollTop = container.scrollTop;
  const scrollHeight = container.scrollHeight;
  const clientHeight = container.clientHeight;
  
  // Check if user scrolled up (away from bottom)
  const isScrollingUp = currentScrollTop < lastScrollTop;
  const isNearBottom = (scrollHeight - currentScrollTop - clientHeight) < 50; // 50px threshold
  
  if (isScrollingUp && !isNearBottom) {
    // User scrolled up during playback - auto-pause
    isPlaying.value = false;
    console.log('Auto-paused due to scroll up');
  }
  
  lastScrollTop = currentScrollTop;
  
  // Clear any existing timeout
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  
  // Update last scroll position after a brief delay
  scrollTimeout = setTimeout(() => {
    lastScrollTop = currentScrollTop;
  }, 100);
};

// Cursor blinking animation
let cursorInterval: number;
onMounted(() => {
  cursorInterval = setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 530);

  document.addEventListener("keydown", handleKeydown);
  
  // Add scroll event listener after DOM is ready
  nextTick(() => {
    if (terminalContent.value) {
      terminalContent.value.addEventListener("scroll", handleScroll);
    }
  });

  // Event listeners for footer controls
  window.addEventListener('playback-toggle', togglePlayback)
  window.addEventListener('playback-restart', restart)
  window.addEventListener('playback-reset', () => emit('reset'))
});

onUnmounted(() => {
  clearInterval(cursorInterval);
  document.removeEventListener("keydown", handleKeydown);
  
  // Clean up scroll event listener and timeout
  if (terminalContent.value) {
    terminalContent.value.removeEventListener("scroll", handleScroll);
  }
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  // Clean up footer event listeners
  window.removeEventListener('playback-toggle', togglePlayback)
  window.removeEventListener('playback-restart', restart)
  window.removeEventListener('playback-reset', () => emit('reset'))
});

// Emit playback state changes for footer
watch(isPlaying, (newValue) => {
  window.dispatchEvent(new CustomEvent('playback-state-change', {
    detail: { isPlaying: newValue }
  }))
})

// Emit message counter updates for footer
watch(currentMessageIndex, (newValue) => {
  window.dispatchEvent(new CustomEvent('message-counter-update', {
    detail: { 
      current: newValue + 1, 
      total: props.conversationData.messages.length 
    }
  }))
}, { immediate: true })
</script>

<style scoped>
.terminal-window {
  display: flex;
  flex-direction: column;
  background-color: var(--window-bg);
  border-radius: var(--window-border-radius);
  overflow: hidden;
  box-shadow: var(--window-shadow);
  height: 100%;
  max-height: 100%;
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
  gap: 8px;
  margin-right: 16px;
  align-items: center;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* macOS style controls */
.macos .control-button.close {
  background-color: #ff5f57;
}

.macos .control-button.close:hover {
  background-color: #ff3b30;
}

.macos .control-button.close::after {
  content: '×';
  color: #000;
}

.macos .control-button.minimize {
  background-color: #ffbd2e;
}

.macos .control-button.minimize::after {
  content: '−';
  color: #000;
}

.macos .control-button.maximize {
  background-color: #28ca42;
}

.macos .control-button.maximize::after {
  content: '+';
  color: #000;
}

/* Linux/Windows style controls */
.linux .control-button,
.windows .control-button {
  background-color: #666;
  color: #fff;
}

.linux .control-button {
  border-radius: 2px;
}

.windows .control-button {
  border-radius: 0;
}

.linux .control-button.close::after,
.windows .control-button.close::after {
  content: '×';
}

.linux .control-button.minimize::after,
.windows .control-button.minimize::after {
  content: '−';
}

.linux .control-button.maximize::after,
.windows .control-button.maximize::after {
  content: '□';
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
  min-height: 0;
  max-height: calc(100vh - 120px); /* Account for header and footer */
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
}

.cursor-line {
  margin-top: var(--spacing-1);
}

.ghost-preview {
  opacity: 0.3;
  font-style: italic;
  color: var(--terminal-dim);
  margin-top: var(--spacing-2);
  display: flex;
  align-items: baseline;
}

.ghost-preview .terminal-cursor {
  opacity: 1;
  color: var(--terminal-cursor);
}

.ghost-content {
  display: inline;
}

.ghost-text {
  opacity: 0.3;
}

.completed-message {
  color: var(--terminal-text);
  margin-top: var(--spacing-2);
  display: flex;
  align-items: baseline;
  white-space: pre-wrap;
}

.completed-message .ghost-prefix {
  color: var(--terminal-accent);
  font-weight: bold;
}

.completed-message .message-content {
  color: var(--terminal-text);
}

.completed-message .terminal-cursor {
  color: var(--terminal-cursor);
}

.ghost-prefix {
  color: var(--terminal-accent);
  font-weight: bold;
}

.ghost-content {
  margin-left: var(--spacing-1);
}

/* Context indicators */
.message-wrapper {
  position: relative;
}

.message-wrapper.has-context {
  border-left: 2px solid var(--terminal-accent, #00ff41);
  padding-left: 8px;
  margin-left: -10px;
}

.context-indicator {
  position: absolute;
  top: 4px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-accent, #00ff41);
  border-radius: 12px;
  padding: 2px 6px;
  font-size: 0.75rem;
  color: var(--terminal-accent, #00ff41);
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.context-indicator:hover {
  opacity: 1;
}

.context-badge {
  font-weight: bold;
  min-width: 12px;
  text-align: center;
}

.context-icon {
  font-size: 0.7rem;
}

.progress-container {
  position: sticky;
  bottom: 0;
  background-color: var(--terminal-bg);
  border-top: 1px solid var(--terminal-dim);
  z-index: 10;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
</style>
