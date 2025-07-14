<template>
  <ApplicationWindow
    title="LLM Conversation Replay"
    :window-style="settings.windowStyle"
    close-button-title="Reset conversation"
    content-class="terminal-content-wrapper no-padding"
    @close="$emit('reset')"
  >
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
            v-show="!shouldHideMessage(message)"
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
              :tool-response="getToolResponseForMessage(message)"
              @animation-complete="onMessageComplete"
              @character-typed="onCharacterTyped"
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
  </ApplicationWindow>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch, readonly } from "vue";
import ApplicationWindow from "./ApplicationWindow.vue";
import MessageRenderer from "./MessageRenderer.vue";
import { useTheme } from '../composables/useTheme'
import type { ConversationData, Settings, ContextItem, TerminalThemeDefinition, Message } from "../types";

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
  pausedForContext: [data: { contextItems: any[] }];
}>();

// Use theme composables for terminal theming only
const { isDark } = useTheme()

// Terminal theme styling - now responsive to app light/dark mode
const terminalThemeStyles = computed(() => {
  const baseTheme = terminalThemes[props.settings.terminalTheme] || terminalThemes.matrix
  
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

// Tool response mapping functionality
const toolResponseMap = computed(() => {
  const map = new Map<string, Message>()
  
  // Build map of tool_use_id -> tool_result message
  props.conversationData.messages.forEach(message => {
    if (message.type === 'tool_call' && message.metadata?.toolType === 'result') {
      const toolId = message.metadata.toolId
      if (toolId) {
        map.set(toolId, message)
      }
    }
  })
  
  return map
})

const getToolResponseForMessage = (message: Message): Message | null => {
  if (message.type === 'tool_call' && message.metadata?.toolType === 'use') {
    const toolId = message.metadata.toolId
    if (toolId) {
      return toolResponseMap.value.get(toolId) || null
    }
  }
  return null
}

const shouldHideMessage = (message: Message): boolean => {
  // Hide standalone tool_result messages if they have a corresponding tool_use
  if (message.type === 'tool_call' && message.metadata?.toolType === 'result') {
    const toolId = message.metadata.toolId
    if (toolId) {
      // Check if there's a tool_use message with this ID
      return props.conversationData.messages.some(msg => 
        msg.type === 'tool_call' && 
        msg.metadata?.toolType === 'use' && 
        msg.metadata?.toolId === toolId
      )
    }
  }
  return false
}

// Pause reason tracking
type PauseReason = 'user' | 'context' | null;
const pauseReason = ref<PauseReason>(null);
const contextPauseDebounce = ref<number | null>(null);
const pauseContextItems = ref<ContextItem[]>([]);

// Track seen context documents to only pause for NEW context
const seenContextIds = ref<Set<string>>(new Set());

const checkAndEmitContext = (messageIndex: number) => {
  const contextItems = getContextForMessage(messageIndex)
  if (contextItems.length > 0) {
    emit('messageHasContext', { messageIndex, contextItems })
    
    // Auto-pause logic - only for NEW context documents
    if (props.settings.pauseOnContext && isPlaying.value) {
      const newContextItems = contextItems.filter(item => {
        const contextId = getContextItemId(item);
        return !seenContextIds.value.has(contextId);
      });
      
      if (newContextItems.length > 0) {
        // Mark these context items as seen
        newContextItems.forEach(item => {
          seenContextIds.value.add(getContextItemId(item));
        });
        
        pauseForContext(newContextItems);
      }
    }
  }
}

// Generate a unique ID for a context item to track if we've seen it before
const getContextItemId = (item: ContextItem): string => {
  // Use a combination of properties to create a unique identifier
  return `${item.type}-${item.filename}-${item.url}`;
}

const pauseForContext = (contextItems: ContextItem[]) => {
  // Prevent multiple context pauses
  if (pauseReason.value === 'context') return
  
  // Clear any pending pause
  if (contextPauseDebounce.value) {
    clearTimeout(contextPauseDebounce.value)
  }
  
  // Debounced pause to handle rapid context changes
  contextPauseDebounce.value = setTimeout(() => {
    if (isPlaying.value && props.settings.pauseOnContext) {
      isPlaying.value = false
      pauseReason.value = 'context'
      pauseContextItems.value = contextItems
      emit('pausedForContext', { contextItems })
    }
  }, 100)
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
    // Play pressed - clear pause reason and start/continue playback
    pauseReason.value = null;
    scrollToBottom();
    startPlaybackUntilNextUser();
  } else {
    // Manual pause - set pause reason to user
    pauseReason.value = 'user';
  }
};

const resumeFromContext = () => {
  if (pauseReason.value === 'context') {
    pauseReason.value = null;
    pauseContextItems.value = [];
    isPlaying.value = true;
    startPlaybackUntilNextUser();
  }
};

// Expose functions and state for parent components
defineExpose({
  resumeFromContext,
  pauseReason: readonly(pauseReason)
});

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
        
        // Check for context immediately when user message becomes visible
        checkAndEmitContext(currentMessageIndex.value);
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


const completeCurrentMessage = () => {
  // Force complete the current typing message by triggering the complete event
  // This will be handled by the MessageRenderer/TypewriterText components
  if (conversationState.value === 'agent_typing') {
    // The message will complete and onMessageComplete will be called
    // We can trigger this by emitting a custom event that TypewriterText can listen for
    window.dispatchEvent(new CustomEvent('force-complete-typing'));
  }
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
    
    // Check for context immediately when user message becomes visible
    checkAndEmitContext(currentMessageIndex.value);
    
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
    // Check if we should skip this message because it's hidden
    if (shouldHideMessage(nextMsg)) {
      // Skip hidden message and continue to the next one
      currentMessageIndex.value++;
      processAgentMessages();
      return;
    }
    
    // Show next non-human message
    currentMessageIndex.value++;
    conversationState.value = 'agent_typing';
    scrollToBottom();
    
    // Check for context immediately when message becomes visible
    checkAndEmitContext(currentMessageIndex.value);
    
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
  
  // Reset seen context tracking
  seenContextIds.value.clear();
  pauseReason.value = null;
  pauseContextItems.value = [];
  
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

const onCharacterTyped = (character: string) => {
  // Scroll to bottom when characters are typed, especially for newlines
  // Use a small delay to ensure DOM has updated
  nextTick(() => {
    scrollToBottom();
  });
};

const onMessageComplete = () => {
  console.log('Message animation complete, state:', conversationState.value, 'isPlaying:', isPlaying.value);
  
  // Emit message completion event for context system
  emit('messageComplete', currentMessageIndex.value);
  
  // Always scroll to bottom when a message completes to ensure visibility
  scrollToBottom();
  
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
    // Check if we should skip this message because it's hidden
    if (shouldHideMessage(nextMsg)) {
      // Skip hidden message and continue to the next one
      currentMessageIndex.value++;
      continuePlayback();
      return;
    }
    
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
      } else if (conversationState.value === 'agent_typing') {
        completeCurrentMessage();
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
  // Reset seen context tracking when conversation changes
  seenContextIds.value.clear();
  pauseReason.value = null;
  pauseContextItems.value = [];
  
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
  window.addEventListener('playback-resume-from-context', resumeFromContext)
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
  
  // Clean up context pause debounce timeout
  if (contextPauseDebounce.value) {
    clearTimeout(contextPauseDebounce.value);
  }

  // Clean up footer event listeners
  window.removeEventListener('playback-toggle', togglePlayback)
  window.removeEventListener('playback-restart', restart)
  window.removeEventListener('playback-reset', () => emit('reset'))
  window.removeEventListener('playback-resume-from-context', resumeFromContext)
});

// Emit playback state changes for footer
watch([isPlaying, pauseReason], ([newIsPlaying, newPauseReason]) => {
  window.dispatchEvent(new CustomEvent('playback-state-change', {
    detail: { 
      isPlaying: newIsPlaying,
      pauseReason: newPauseReason,
      contextCount: newPauseReason === 'context' ? pauseContextItems.value?.length || 0 : 0
    }
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
/* Terminal-specific styling only - window styling handled by ApplicationWindow */
.terminal-content-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--terminal-bg); /* Ensure wrapper has terminal background */
}

.terminal {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--terminal-bg);
  color: var(--terminal-text);
  font-family: var(--font-mono);
  min-height: 100%;
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

.ghost-preview,
.completed-message {
  margin-top: var(--spacing-2);
  display: flex;
  align-items: baseline;
  white-space: pre-wrap;
  min-height: 1.4em; /* Ensure consistent height */
}

.ghost-preview {
  font-style: italic;
  color: var(--terminal-dim);
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
  flex-shrink: 0;
}

.ghost-content {
  margin-left: var(--spacing-1);
  flex: 1;
}

/* Context indicators */
.message-wrapper {
  position: relative;
}

.message-wrapper.has-context {
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
