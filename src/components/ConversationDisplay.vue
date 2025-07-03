<template>
  <div class="terminal-window" :class="`window-style-${settings.windowStyle}`">
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
    <div class="terminal" :class="`theme-${settings.theme}`">
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
            Messages: {{ conversationData.messages.length }} | Format:
            {{ conversationData.metadata.format }} |
            {{ formatDate(conversationData.metadata.timestamp) }}
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <MessageRenderer
            v-for="(message, index) in visibleMessages"
            :key="message.id"
            :message="message"
            :is-current="index === currentMessageIndex && (
              (conversationState === 'agent_typing' && message.type !== 'human') ||
              (conversationState === 'user_typing' && message.type === 'human')
            )"
            :settings="settings"
            :paused="!isPlaying"
            @animation-complete="onMessageComplete"
          />

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
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from "vue";
import MessageRenderer from "./MessageRenderer.vue";
import ProgressIndicator from "./ProgressIndicator.vue";
import type { ConversationData, Settings } from "../types";

const props = defineProps<{
  conversationData: ConversationData;
  settings: Settings;
  contextItems?: any[];
  contextLoading?: boolean;
}>();

const emit = defineEmits<{
  reset: [];
}>();

const terminalContent = ref<HTMLElement>();
const messagesContainer = ref<HTMLElement>();
const currentMessageIndex = ref(-1);
const showCursor = ref(true);
const isPlaying = ref(false);

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
</script>

<style scoped>
.terminal-window {
  display: flex;
  flex-direction: column;
  background-color: var(--window-bg);
  border-radius: var(--window-border-radius);
  overflow: hidden;
  box-shadow: var(--window-shadow);
  height: 100vh;
  max-height: 100vh;
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
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.window-style-macos .control-button.close {
  background-color: #ff5f57;
}

.window-style-macos .control-button.close:hover {
  background-color: #ff3b30;
}

.window-style-macos .control-button.close::after {
  content: '×';
  color: #000;
  font-size: 10px;
  font-weight: bold;
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
