<template>
  <div 
    class="draggable-divider"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
    <div class="divider-handle">
      <div class="divider-grip"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'

interface Props {
  minWidth?: number
  maxWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  minWidth: 200,
  maxWidth: 800
})

const emit = defineEmits<{
  resize: [width: number]
}>()

const isDragging = ref(false)
const startX = ref(0)
const startWidth = ref(0)

const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  startX.value = clientX
  
  // Get the current width of the left panel (terminal)
  const container = document.querySelector('.conversation-container')
  if (container) {
    const containerRect = container.getBoundingClientRect()
    const dividerRect = (event.target as HTMLElement).getBoundingClientRect()
    startWidth.value = dividerRect.left - containerRect.left
  }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', handleDrag)
  document.addEventListener('touchend', stopDrag)
  
  // Prevent text selection during drag
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'col-resize'
  
  event.preventDefault()
}

const handleDrag = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const deltaX = clientX - startX.value
  const newWidth = startWidth.value + deltaX
  
  // Constrain within min/max bounds
  const constrainedWidth = Math.max(props.minWidth, Math.min(props.maxWidth, newWidth))
  
  emit('resize', constrainedWidth)
}

const stopDrag = () => {
  isDragging.value = false
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
  
  // Restore normal cursor and text selection
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

onUnmounted(() => {
  // Clean up event listeners if component is unmounted during drag
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.draggable-divider {
  width: 8px;
  height: 100%;
  background: var(--terminal-bg);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 10;
  transition: background-color 0.2s ease;
}

.draggable-divider:hover {
  background: var(--terminal-text);
  opacity: 0.1;
}

.divider-handle {
  width: 4px;
  height: 40px;
  background: var(--terminal-text);
  opacity: 0.3;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
}

.draggable-divider:hover .divider-handle {
  opacity: 0.6;
}

.divider-grip {
  width: 2px;
  height: 20px;
  background: var(--terminal-text);
  opacity: 0.5;
  border-radius: 1px;
}

/* Active dragging state */
.draggable-divider:active,
.draggable-divider:active .divider-handle {
  opacity: 0.8;
}

/* Mobile touch targets */
@media (max-width: 768px) {
  .draggable-divider {
    width: 12px;
  }
  
  .divider-handle {
    width: 6px;
    height: 60px;
  }
}
</style>
