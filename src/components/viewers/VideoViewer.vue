<template>
  <div class="video-viewer">
    <div class="video-container">
      <video
        :src="item.url"
        controls
        preload="metadata"
        @loadstart="$emit('loadStart')"
        @loadeddata="$emit('loadComplete')"
        @error="handleError"
        class="video"
      >
        Your browser does not support the video tag.
      </video>
    </div>
    
    <div class="video-info">
      <span class="filename">{{ item.filename }}</span>
      <span v-if="item.metadata?.size" class="file-size">
        {{ formatFileSize(item.metadata.size) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ContextItem } from '../../types'

interface Props {
  item: ContextItem
}

interface Emits {
  loadStart: []
  loadComplete: []
  loadError: [error: string]
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleError = () => {
  emit('loadError', 'Failed to load video')
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}
</script>

<style scoped>
.video-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
}

.video {
  max-width: 100%;
  max-height: 100%;
  border-radius: 4px;
}

.video-info {
  padding: 1rem;
  border-top: 1px solid var(--terminal-text);
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--terminal-text);
}

.filename {
  font-weight: bold;
}

.file-size {
  opacity: 0.7;
}
</style>
