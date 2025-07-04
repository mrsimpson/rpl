<template>
  <div class="conversation-view">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-message">
        <div class="spinner"></div>
        <p>Loading conversation...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h3>Error Loading Conversation</h3>
        <p>{{ error }}</p>
        <p class="redirect-message">Redirecting to home in a few seconds...</p>
      </div>
    </div>

    <!-- Conversation display -->
    <div v-else-if="conversationData" class="conversation-container">
      <!-- Main conversation display -->
      <div 
        class="terminal-panel"
        :style="{ width: showContextPanel && !isMobile ? `${terminalWidth}px` : '100%' }"
      >
        <ConversationDisplay
          :conversation-data="conversationData as ConversationData"
          :context-items="contextItems as any[]"
          :context-loading="contextLoading"
          :settings="props.settings"
          @reset="handleReset"
          @message-complete="handleMessageComplete"
          @message-has-context="handleMessageHasContext"
        />
      </div>
      
      <!-- Draggable Divider (desktop only) -->
      <DraggableDivider
        v-if="showContextPanel && !isMobile"
        :min-width="300"
        :max-width="windowWidth - 400"
        @resize="handleDividerResize"
      />
      
      <!-- Context Panel -->
      <ContextPanel
        :visible="showContextPanel"
        :context-items="currentMessageContext as ContextItem[]"
        :loading="contextLoading"
        :error="contextError"
        :is-mobile="isMobile"
        :settings="props.settings"
        :style="{ width: showContextPanel && !isMobile ? `${contextPanelWidth}px` : 'auto' }"
        @close="handleCloseContextPanel"
        @retry="handleRetryContext"
      />
    </div>

    <!-- No data state -->
    <div v-else class="no-data-container">
      <div class="no-data-message">
        <h3>No Conversation Data</h3>
        <p>No conversation data available. Please load a conversation first.</p>
        <button @click="goHome" class="home-btn">Go to Home</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed, ref, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConversationDisplay from '../components/ConversationDisplay.vue'
import ContextPanel from '../components/ContextPanel.vue'
import DraggableDivider from '../components/DraggableDivider.vue'
import { useConversationState } from '../composables/useConversationState'
import type { Settings, ConversationData, ContextItem } from '../types'

const props = defineProps<{
  settings: Settings
}>()

const route = useRoute()
const router = useRouter()

const {
  conversationData,
  loading,
  error,
  contextItems,
  contextLoading,
  contextError,
  currentMessageContext,
  showContextPanel,
  loadFromUrl,
  clearData,
  updateCurrentMessageContext,
  toggleContextPanel,
  discoverContext
} = useConversationState()

// Draggable divider state
const windowWidth = ref(window.innerWidth)
const contextPanelWidth = ref(props.settings.contextPanelWidth || 400)
const terminalWidth = computed(() => windowWidth.value - contextPanelWidth.value - 8) // 8px for divider

// Update window width on resize
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

// Computed
const isMobile = computed(() => window.innerWidth < 1024)

// Event handlers
const handleReset = () => {
  clearData()
  router.push('/')
}

const goHome = () => {
  router.push('/')
}

const handleMessageComplete = (messageIndex: number) => {
  // Update context for the completed message
  updateCurrentMessageContext(messageIndex)
}

const handleMessageHasContext = ({ messageIndex, contextItems }: { messageIndex: number, contextItems: ContextItem[] }) => {
  // This event is emitted when a message with context becomes visible
  console.log(`Message ${messageIndex} has ${contextItems.length} context items`)
  updateCurrentMessageContext(messageIndex)
}

const handleCloseContextPanel = () => {
  toggleContextPanel()
}

const handleDividerResize = (newTerminalWidth: number) => {
  // Update the context panel width based on the new terminal width
  const newContextPanelWidth = windowWidth.value - newTerminalWidth - 8 // 8px for divider
  contextPanelWidth.value = Math.max(300, Math.min(800, newContextPanelWidth))
  
  // Update settings to persist the change
  props.settings.contextPanelWidth = contextPanelWidth.value
  
  // Save to localStorage
  localStorage.setItem('settings', JSON.stringify(props.settings))
}

const handleRetryContext = async () => {
  // Retry context discovery
  const urlParam = route.query.url as string
  if (urlParam) {
    await discoverContext(urlParam)
  }
}

// Handle URL parameter loading
onMounted(async () => {
  const urlParam = route.query.url as string
  
  if (urlParam && !conversationData.value) {
    // Load from URL if we have a URL parameter and no existing data
    await loadFromUrl(urlParam)
  } else if (!urlParam && !conversationData.value) {
    // No URL parameter and no existing data - redirect to home
    setTimeout(() => {
      router.push('/')
    }, 100)
  }
  // If we have existing data (from local file), just display it
})

// Handle error state redirect
watch(error, (newError) => {
  if (newError) {
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
})
</script>

<style scoped>
.conversation-view {
  height: calc(100vh - var(--footer-height));
  width: 100vw;
}

.loading-container,
.error-container,
.no-data-container {
  height: calc(100vh - var(--footer-height));
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--terminal-bg, #000);
  color: var(--terminal-text, #00ff00);
}

.loading-message,
.error-message,
.no-data-message {
  text-align: center;
  padding: 2rem;
  border: 1px solid var(--terminal-text, #00ff00);
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.8);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid transparent;
  border-top: 3px solid var(--terminal-text, #00ff00);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.redirect-message {
  font-size: 0.9em;
  opacity: 0.7;
  margin-top: 1rem;
}

.home-btn {
  background: var(--terminal-text, #00ff00);
  color: var(--terminal-bg, #000);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: inherit;
}

.home-btn:hover {
  opacity: 0.8;
}

.conversation-container {
  height: calc(100vh - var(--footer-height));
  width: 100vw;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

.terminal-panel {
  flex: 1;
  min-width: 300px;
  overflow: hidden;
}

/* Desktop layout with context panel */
@media (min-width: 1024px) {
  .conversation-container {
    display: flex;
    flex-direction: row;
  }
  
  .terminal-panel {
    flex: none; /* Don't flex when we have explicit width */
  }
}

/* Mobile layout - stack vertically */
@media (max-width: 1023px) {
  .conversation-container {
    flex-direction: column;
  }
  
  .terminal-panel {
    width: 100% !important;
    flex: 1;
  }
}
</style>
