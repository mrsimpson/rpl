<template>
  <Transition name="context-slide" appear>
    <ApplicationWindow
      v-if="visible"
      title="Context"
      :window-style="settings?.windowStyle || 'macos'"
      :close-button-title="isMobile ? 'Close' : 'Hide panel'"
      class="context-panel"
      :class="{ 
        'context-panel--mobile': isMobile,
        'context-panel--desktop': !isMobile 
      }"
      @close="$emit('close')"
    >
      <template #actions>
        <span v-if="contextItems.length > 0" class="context-count">
          {{ contextItems.length }} item{{ contextItems.length !== 1 ? 's' : '' }}
        </span>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="context-loading">
        <div class="loading-spinner"></div>
      <p>Loading context...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="context-error">
      <AlertCircleIcon class="error-icon" />
      <p>{{ error }}</p>
      <button @click="$emit('retry')" class="retry-btn">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="contextItems.length === 0" class="context-empty">
      <FileIcon class="empty-icon" />
      <p>No context items found</p>
      <small>Context items will appear here when available for the current message</small>
    </div>

    <!-- Context Content -->
    <div v-else class="context-content">
      <!-- Context Tabs (if multiple items) -->
      <ContextTabs
        v-if="contextItems.length > 1"
        :items="contextItems"
        :active-index="activeTabIndex"
        @tab-change="handleTabChange"
      />

      <!-- Context Viewer -->
      <ContextViewer
        :item="activeContextItem"
        @load-start="itemLoading = true"
        @load-complete="itemLoading = false"
        @load-error="handleItemError"
      />
    </div>

      <!-- Mobile Overlay Background -->
      <div 
        v-if="isMobile" 
        class="context-overlay" 
        @click="$emit('close')"
      ></div>
    </ApplicationWindow>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AlertCircleIcon, FileIcon } from 'lucide-vue-next'
import type { ContextItem, Settings } from '../types'
import ContextTabs from './ContextTabs.vue'
import ContextViewer from './ContextViewer.vue'
import ApplicationWindow from './ApplicationWindow.vue'

interface Props {
  visible: boolean
  contextItems: ContextItem[]
  loading?: boolean
  error?: string | null
  isMobile?: boolean
  settings?: Settings
}

interface Emits {
  close: []
  retry: []
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  isMobile: false,
  settings: undefined
})

defineEmits<Emits>()

// Local state
const activeTabIndex = ref(0)
const itemLoading = ref(false)

// Computed
const activeContextItem = computed(() => {
  return props.contextItems[activeTabIndex.value] || null
})

// Watch for context item changes and reset loading state
watch(() => activeContextItem.value, (newItem, oldItem) => {
  if (newItem && newItem !== oldItem) {
    // Only set loading to true for the initial load, not for every item change
    // The individual viewers will handle their own loading states
    itemLoading.value = false
  }
}, { immediate: true })

// Methods
const handleTabChange = (index: number) => {
  activeTabIndex.value = index
}

const handleItemError = (error: string) => {
  console.error('Context item load error:', error)
  // Could emit error to parent or show local error state
}

// Reset active tab when context items change
watch(() => props.contextItems, () => {
  activeTabIndex.value = 0
}, { immediate: true })
</script>

<style scoped>
/* Sliding Animation */
.context-slide-enter-active,
.context-slide-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.context-slide-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.context-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.context-panel {
  display: flex;
  flex-direction: column;
  color: var(--terminal-text);
  font-family: var(--font-mono);
  position: relative;
  height: 100%;
}

.context-panel--desktop {
  height: 100%;
  min-width: 320px;
}

.context-panel--mobile {
  position: fixed;
  top: var(--spacing-4);
  left: var(--spacing-4);
  right: var(--spacing-4);
  bottom: var(--spacing-4);
  z-index: 1000;
  border-radius: 8px;
  max-height: calc(100vh - 2rem);
}

.context-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  z-index: -1;
}

.context-count {
  font-size: 0.8rem;
  opacity: 0.7;
  color: var(--terminal-text, #fff);
  margin-right: 8px;
}

.context-loading,
.context-error,
.context-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  flex: 1;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-top: 2px solid var(--terminal-text);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.retry-btn {
  background: transparent;
  border: 1px solid var(--terminal-text);
  color: var(--terminal-text);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.context-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

/* Mobile specific styles */
.context-panel--mobile .context-content {
  max-height: calc(100vh - 8rem);
  overflow: hidden;
}
</style>
