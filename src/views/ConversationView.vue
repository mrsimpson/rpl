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
      <ConversationDisplay
        :conversation-data="conversationData as ConversationData"
        :context-items="contextItems as any[]"
        :context-loading="contextLoading"
        :settings="props.settings"
        @reset="handleReset"
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
import { onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ConversationDisplay from '../components/ConversationDisplay.vue'
import { useConversationState } from '../composables/useConversationState'
import type { Settings, ConversationData } from '../types'

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
  loadFromUrl,
  clearData
} = useConversationState()

const handleReset = () => {
  clearData()
  router.push('/')
}

const goHome = () => {
  router.push('/')
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
  height: 100vh;
  width: 100vw;
}

.loading-container,
.error-container,
.no-data-container {
  height: 100vh;
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
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}
</style>
