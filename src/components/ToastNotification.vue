<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-notification" :class="toastClasses" @click="handleClick">
      <div class="toast-content">
        <div v-if="icon" class="toast-icon">{{ icon }}</div>
        <div class="toast-message">
          <div v-if="title" class="toast-title">{{ title }}</div>
          <div class="toast-body">
            <slot>{{ message }}</slot>
          </div>
        </div>
        <div v-if="actions.length > 0" class="toast-actions">
          <button 
            v-for="action in actions" 
            :key="action.label"
            @click.stop="action.handler"
            :class="['toast-action', action.variant || 'default']"
          >
            <component v-if="action.icon" :is="action.icon" class="action-icon" />
            {{ action.label }}
          </button>
        </div>
        <button v-if="dismissible" @click.stop="dismiss" class="toast-close" aria-label="Close notification">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface ToastAction {
  label: string
  handler: () => void
  variant?: 'default' | 'primary' | 'secondary'
  icon?: any // Vue component
}

interface Props {
  visible?: boolean
  title?: string
  message?: string
  icon?: string
  variant?: 'info' | 'success' | 'warning' | 'error' | 'context'
  duration?: number
  autoDismiss?: boolean
  dismissible?: boolean
  clickable?: boolean
  showProgress?: boolean
  actions?: ToastAction[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: true,
  variant: 'info',
  duration: 7000,
  autoDismiss: true,
  dismissible: true,
  clickable: false,
  showProgress: false,
  actions: () => []
})

const emit = defineEmits<{
  dismissed: []
  clicked: []
}>()

const visible = ref(props.visible)
const progressWidth = ref(100)
const dismissTimer = ref<number | null>(null)
const progressTimer = ref<number | null>(null)

const toastClasses = computed(() => ({
  [`toast--${props.variant}`]: true,
  'toast--clickable': props.clickable
}))

const startAutoDismiss = () => {
  if (!props.autoDismiss) return
  
  if (props.showProgress) {
    // Start progress animation
    progressWidth.value = 100
    const startTime = Date.now()
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, props.duration - elapsed)
      progressWidth.value = (remaining / props.duration) * 100
      
      if (remaining > 0 && visible.value) {
        progressTimer.value = setTimeout(updateProgress, 50)
      }
    }
    
    updateProgress()
  }
  
  // Set dismiss timer
  dismissTimer.value = setTimeout(() => {
    if (visible.value) {
      dismiss()
    }
  }, props.duration)
}

const clearTimers = () => {
  if (dismissTimer.value) {
    clearTimeout(dismissTimer.value)
    dismissTimer.value = null
  }
  if (progressTimer.value) {
    clearTimeout(progressTimer.value)
    progressTimer.value = null
  }
}

const dismiss = () => {
  clearTimers()
  visible.value = false
  emit('dismissed')
}

const handleClick = () => {
  if (props.clickable) {
    emit('clicked')
  }
}

// Watch external visible prop
watch(() => props.visible, (newVisible) => {
  visible.value = newVisible
  if (newVisible) {
    startAutoDismiss()
  } else {
    clearTimers()
  }
})

onMounted(() => {
  if (visible.value) {
    startAutoDismiss()
  }
})

onUnmounted(() => {
  clearTimers()
})
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  min-width: 300px;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-text);
  border-radius: 8px;
  padding: 16px;
  font-family: var(--font-mono, 'Courier New', monospace);
  font-size: 13px;
  color: var(--terminal-text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.2s ease;
  /* Remove any transparency and ensure flexible height */
  opacity: 1;
  min-height: auto;
  height: auto;
}

.toast--clickable {
  cursor: pointer;
}

.toast--clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* Variant styles */
.toast--context {
  border: 2px solid var(--terminal-text);
  background: var(--terminal-bg);
  /* Ensure completely opaque background */
  opacity: 1;
}

.toast--success {
  border-color: #22c55e;
  background: var(--terminal-bg);
}

.toast--warning {
  border-color: #f59e0b;
  background: var(--terminal-bg);
}

.toast--error {
  border-color: #ef4444;
  background: var(--terminal-bg);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: auto;
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  min-height: auto;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--terminal-prompt, var(--terminal-text));
  word-wrap: break-word;
}

.toast-body {
  opacity: 0.9;
  word-wrap: break-word;
  white-space: pre-wrap;
}

.toast-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
  align-items: flex-start;
  margin-top: 2px;
}

.toast-action {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid var(--terminal-text);
  background: transparent;
  color: var(--terminal-text);
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.toast-action.primary {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.toast-action.secondary {
  opacity: 0.8;
}

.toast-action:hover {
  opacity: 0.9;
  transform: scale(1.05);
}

.action-icon {
  width: 12px;
  height: 12px;
}

.toast-close {
  background: none;
  border: none;
  color: var(--terminal-text);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

.progress-bar {
  height: 3px;
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
  border-radius: 0 0 6px 6px;
  margin: 12px -16px -16px -16px;
}

.progress-fill {
  height: 100%;
  background: var(--terminal-text);
  transition: width 0.05s linear;
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toast-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    min-width: auto;
    font-size: 12px;
    /* Ensure flexible height on mobile */
    height: auto;
    min-height: auto;
  }
  
  .toast-content {
    gap: 8px;
    min-height: auto;
  }
  
  .toast-message {
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .toast-actions {
    flex-direction: column;
    gap: 6px;
  }
  
  .toast-action {
    padding: 8px 12px;
    font-size: 0.75rem;
  }
  
  /* Mobile slide from top */
  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(-100%) scale(0.9);
  }
}
</style>
