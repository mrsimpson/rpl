<template>
  <!-- Mobile backdrop -->
  <div 
    v-if="isMobile && visible && mobileState === 'expanded'" 
    class="context-backdrop"
    @click="handleBackdropClick"
  ></div>

  <!-- Context Panel -->
  <Transition :name="transitionName" appear>
    <ApplicationWindow
      v-if="visible"
      title="Context"
      :window-style="settings?.windowStyle || 'macos'"
      :close-button-title="isMobile ? 'Close' : 'Hide panel'"
      class="context-panel"
      :class="{ 
        'context-panel--mobile': isMobile,
        'context-panel--desktop': !isMobile,
        'context-panel--expanded': isMobile && mobileState === 'expanded',
        'context-panel--minimized': isMobile && mobileState === 'minimized'
      }"
      @close="handleClose"
    >
      <template #actions>
        <!-- Mobile minimize/expand button -->
        <button 
          v-if="isMobile && contextItems.length > 0"
          @click="toggleMobileState"
          class="mobile-toggle-btn"
          :title="mobileState === 'expanded' ? 'Minimize' : 'Expand'"
        >
          <ChevronDownIcon v-if="mobileState === 'expanded'" class="icon" />
          <ChevronUpIcon v-else class="icon" />
        </button>
        
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
      <div v-else class="context-content" :class="{ 'content--minimized': isMobile && mobileState === 'minimized' }">
        <!-- Context Tabs (if multiple items) -->
        <ContextTabs
          v-if="contextItems.length > 1 && (!isMobile || mobileState === 'expanded')"
          :items="contextItems"
          :active-index="activeTabIndex"
          @tab-change="handleTabChange"
        />

        <!-- Context Viewer -->
        <ContextViewer
          v-if="!isMobile || mobileState === 'expanded'"
          :item="activeContextItem"
          @load-start="itemLoading = true"
          @load-complete="itemLoading = false"
          @load-error="handleItemError"
        />
        
        <!-- Minimized preview -->
        <div v-else-if="isMobile && mobileState === 'minimized'" class="minimized-preview">
          <span class="preview-text">{{ activeContextItem?.name || 'Context available' }}</span>
          <span class="tap-hint">Tap to expand</span>
        </div>
      </div>
    </ApplicationWindow>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AlertCircleIcon, FileIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-vue-next'
import type { ContextItem, Settings } from '../types'
import ContextTabs from './ContextTabs.vue'
import ContextViewer from './ContextViewer.vue'
import ApplicationWindow from './ApplicationWindow.vue'
import { useResponsive } from '../composables/useResponsive'

type MobileState = 'expanded' | 'minimized'

interface Props {
  visible: boolean
  contextItems: ContextItem[]
  loading?: boolean
  error?: string | null
  isMobile?: boolean
  settings?: Settings
  mobileState?: MobileState
}

interface Emits {
  close: []
  retry: []
  'mobile-state-change': [state: MobileState]
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  isMobile: false,
  settings: undefined,
  mobileState: 'expanded'
})

const emit = defineEmits<Emits>()

// Use responsive composable for consistent detection
const { isMobile: responsiveIsMobile } = useResponsive()
const isMobile = computed(() => props.isMobile || responsiveIsMobile.value)

// Local state
const activeTabIndex = ref(0)
const itemLoading = ref(false)
const mobileState = ref<MobileState>(props.mobileState)

// Computed
const activeContextItem = computed(() => {
  return props.contextItems[activeTabIndex.value] || null
})

// Transition name based on device type
const transitionName = computed(() => {
  return isMobile.value ? 'context-slide-mobile' : 'context-slide'
})

// Watch for context item changes and reset loading state
watch(() => activeContextItem.value, (newItem, oldItem) => {
  if (newItem && newItem !== oldItem) {
    itemLoading.value = false
  }
}, { immediate: true })

// Watch for mobile state prop changes
watch(() => props.mobileState, (newState) => {
  mobileState.value = newState
})

// Methods
const handleTabChange = (index: number) => {
  activeTabIndex.value = index
}

const handleItemError = (error: string) => {
  console.error('Context item load error:', error)
}

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  if (isMobile.value && mobileState.value === 'expanded') {
    toggleMobileState()
  }
}

const toggleMobileState = () => {
  const newState = mobileState.value === 'expanded' ? 'minimized' : 'expanded'
  mobileState.value = newState
  emit('mobile-state-change', newState)
}

// Reset active tab when context items change
watch(() => props.contextItems, () => {
  activeTabIndex.value = 0
}, { immediate: true })

// Auto-expand when new context arrives on mobile
watch(() => props.contextItems.length, (newLength, oldLength) => {
  if (isMobile.value && newLength > 0 && newLength !== oldLength) {
    // New context detected - expand if not already visible
    if (!props.visible || mobileState.value === 'minimized') {
      mobileState.value = 'expanded'
      emit('mobile-state-change', 'expanded')
    }
  }
})
</script>

<style scoped>
/* Mobile backdrop */
.context-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  transition: opacity 0.3s ease;
}

/* Desktop sliding animation (existing) */
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

/* Mobile sliding animation (new) */
.context-slide-mobile-enter-active,
.context-slide-mobile-leave-active {
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;
}

.context-slide-mobile-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.context-slide-mobile-leave-to {
  transform: translateY(100%);
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
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-radius: 12px 12px 0 0;
  max-height: 70vh;
  transition: height 0.3s ease-out;
}

.context-panel--mobile.context-panel--expanded {
  height: 70vh;
}

.context-panel--mobile.context-panel--minimized {
  height: 60px;
  overflow: hidden;
}

.mobile-toggle-btn {
  background: transparent;
  border: none;
  color: var(--terminal-text);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.mobile-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.mobile-toggle-btn .icon {
  width: 16px;
  height: 16px;
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

.content--minimized {
  overflow: hidden;
}

.minimized-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.minimized-preview:hover {
  background: rgba(255, 255, 255, 0.05);
}

.preview-text {
  font-weight: 500;
  color: var(--terminal-text);
}

.tap-hint {
  font-size: 0.8rem;
  opacity: 0.6;
  color: var(--terminal-text);
}

/* Mobile specific styles */
.context-panel--mobile .context-content {
  max-height: calc(70vh - 4rem);
  overflow: hidden;
}

.context-panel--mobile.context-panel--expanded .context-content {
  overflow-y: auto;
}

.context-panel--mobile.context-panel--minimized .context-content {
  max-height: 60px;
  overflow: hidden;
}
</style>
