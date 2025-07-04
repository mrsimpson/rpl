<template>
  <div class="image-viewer">
    <!-- Image Container -->
    <div class="image-container" ref="containerRef">
      <img
        :src="item.url"
        :alt="item.filename"
        @load="handleLoad"
        @error="handleError"
        @click="toggleZoom"
        class="image"
        :class="{ 
          'image--zoomed': isZoomed,
          'image--loading': isLoading 
        }"
        :style="imageStyle"
      />
      
      <!-- Loading Overlay -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- Image Controls -->
    <div class="image-controls">
      <div class="image-info">
        <span class="filename">{{ item.filename }}</span>
        <span v-if="dimensions" class="dimensions">
          {{ dimensions.width }} × {{ dimensions.height }}
        </span>
        <span v-if="item.metadata?.size" class="file-size">
          {{ formatFileSize(item.metadata.size) }}
        </span>
      </div>
      
      <div class="zoom-controls">
        <button 
          @click="zoomOut" 
          :disabled="zoomLevel <= 0.25"
          class="zoom-btn"
          title="Zoom out"
        >
          <ZoomOutIcon class="icon" />
        </button>
        
        <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
        
        <button 
          @click="zoomIn" 
          :disabled="zoomLevel >= 3"
          class="zoom-btn"
          title="Zoom in"
        >
          <ZoomInIcon class="icon" />
        </button>
        
        <button 
          @click="resetZoom" 
          class="zoom-btn"
          title="Reset zoom"
        >
          <RotateCcwIcon class="icon" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ZoomInIcon, ZoomOutIcon, RotateCcwIcon } from 'lucide-vue-next'
import type { ContextItem } from '../../types'

interface Props {
  item: ContextItem
}

interface Emits {
  loadStart: []
  loadComplete: []
  loadError: [error: string]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isLoading = ref(true)
const isZoomed = ref(false)
const zoomLevel = ref(1)
const dimensions = ref<{ width: number; height: number } | null>(null)
const containerRef = ref<HTMLElement>()

// Computed
const imageStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  cursor: isZoomed.value ? 'zoom-out' : 'zoom-in'
}))

// Methods
const handleLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  dimensions.value = {
    width: img.naturalWidth,
    height: img.naturalHeight
  }
  isLoading.value = false
  emit('loadComplete')
}

const handleError = (event: Event) => {
  isLoading.value = false
  const img = event.target as HTMLImageElement
  emit('loadError', `Failed to load image: ${img.src}`)
}

const toggleZoom = () => {
  if (isZoomed.value) {
    resetZoom()
  } else {
    zoomLevel.value = 2
    isZoomed.value = true
  }
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.25, 3)
  isZoomed.value = zoomLevel.value > 1
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value * 0.8, 0.25)
  isZoomed.value = zoomLevel.value > 1
}

const resetZoom = () => {
  zoomLevel.value = 1
  isZoomed.value = false
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Lifecycle
onMounted(() => {
  emit('loadStart')
  // Ensure props is recognized as used
  console.debug('Loading image:', props.item.filename)
})

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    zoomIn()
  } else if (event.key === '-') {
    event.preventDefault()
    zoomOut()
  } else if (event.key === '0') {
    event.preventDefault()
    resetZoom()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.image-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--terminal-bg);
}

.image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  position: relative;
  background: rgba(0, 0, 0, 0.1);
  min-height: 200px;
}

.image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  border-radius: 4px;
}

.image--loading {
  opacity: 0.5;
}

.image--zoomed {
  cursor: zoom-out;
}

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-top: 2px solid var(--terminal-text);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.image-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid var(--terminal-text);
  background: rgba(0, 0, 0, 0.2);
  gap: 1rem;
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--terminal-text);
  min-width: 0;
  flex: 1;
}

.filename {
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dimensions,
.file-size {
  opacity: 0.7;
  font-size: 0.7rem;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.zoom-btn {
  background: transparent;
  border: 1px solid var(--terminal-text);
  color: var(--terminal-text);
  padding: 0.25rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.zoom-btn:hover:not(:disabled) {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.zoom-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.zoom-btn .icon {
  width: 16px;
  height: 16px;
}

.zoom-level {
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
  color: var(--terminal-text);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .image-controls {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .zoom-controls {
    width: 100%;
    justify-content: center;
  }
  
  .image-info {
    text-align: center;
  }
}
</style>
