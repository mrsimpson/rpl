<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-notification">
      <div class="toast-content">
        <div class="toast-icon">ℹ️</div>
        <div class="toast-message">
          <strong>Text Format Parsing</strong><br>
          Empty lines separate messages. User messages start with <code>&gt;</code> or <code>[prefix]&gt;</code>.<br>
          <small>Some messages might be mislabeled - remove empty lines or use invisible characters to fix.</small>
        </div>
        <button @click="dismiss" class="toast-close" aria-label="Close notification">×</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Props {
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  duration: 7000 // 7 seconds default
})

const visible = ref(true)

const emit = defineEmits<{
  dismissed: []
}>()

const dismiss = () => {
  visible.value = false
  emit('dismissed')
}

onMounted(() => {
  // Auto-dismiss after duration
  setTimeout(() => {
    if (visible.value) {
      dismiss()
    }
  }, props.duration)
})
</script>

<style scoped>
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 380px;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-text);
  border-radius: 4px;
  padding: 16px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--terminal-text);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.toast-icon {
  font-size: 16px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-message strong {
  color: var(--terminal-prompt, var(--terminal-text));
}

.toast-message code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 4px;
  border-radius: 2px;
  font-family: inherit;
  font-size: 12px;
}

.toast-message small {
  opacity: 0.8;
  font-size: 11px;
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
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Transition animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toast-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
    font-size: 12px;
  }
  
  .toast-content {
    gap: 8px;
  }
  
  .toast-message code {
    font-size: 11px;
  }
  
  .toast-message small {
    font-size: 10px;
  }
}
</style>
