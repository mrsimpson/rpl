<template>
  <div class="context-viewer">
    <!-- Error State -->
    <div v-if="error" class="viewer-error">
      <AlertCircleIcon class="error-icon" />
      <p>Failed to load {{ item?.filename }}</p>
      <small>{{ error }}</small>
      <button @click="retry" class="retry-btn">Retry</button>
    </div>

    <!-- Content Viewers -->
    <div v-else-if="item" class="viewer-content" :key="item.id">
      <!-- Image Viewer -->
      <ImageViewer
        v-if="item.type === 'image'"
        :item="item"
        @load-start="handleLoadStart"
        @load-complete="handleLoadComplete"
        @load-error="handleLoadError"
      />

      <!-- Video Viewer -->
      <VideoViewer
        v-else-if="item.type === 'video'"
        :item="item"
        @load-start="handleLoadStart"
        @load-complete="handleLoadComplete"
        @load-error="handleLoadError"
      />

      <!-- Code Viewer -->
      <CodeViewer
        v-else-if="item.type === 'code'"
        :item="item"
        @load-start="handleLoadStart"
        @load-complete="handleLoadComplete"
        @load-error="handleLoadError"
      />

      <!-- Document Viewer -->
      <DocumentViewer
        v-else-if="item.type === 'document'"
        :item="item"
        @load-start="handleLoadStart"
        @load-complete="handleLoadComplete"
        @load-error="handleLoadError"
      />

      <!-- Audio Viewer -->
      <AudioViewer
        v-else-if="item.type === 'audio'"
        :item="item"
        @load-start="handleLoadStart"
        @load-complete="handleLoadComplete"
        @load-error="handleLoadError"
      />

      <!-- Generic/Other Viewer -->
      <GenericViewer
        v-else
        :item="item"
        @load-start="handleLoadStart"
        @load-complete="handleLoadComplete"
        @load-error="handleLoadError"
      />
    </div>

    <!-- No Item State -->
    <div v-else class="viewer-empty">
      <FileIcon class="empty-icon" />
      <p>No context item selected</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { AlertCircleIcon, FileIcon } from 'lucide-vue-next'
import type { ContextItem } from '../types'
import ImageViewer from './viewers/ImageViewer.vue'
import VideoViewer from './viewers/VideoViewer.vue'
import CodeViewer from './viewers/CodeViewer.vue'
import DocumentViewer from './viewers/DocumentViewer.vue'
import AudioViewer from './viewers/AudioViewer.vue'
import GenericViewer from './viewers/GenericViewer.vue'

interface Props {
  item: ContextItem | null
}

interface Emits {
  loadStart: []
  loadComplete: []
  loadError: [error: string]
}

const props = defineProps<Props>()

const emit = defineEmits<Emits>()

// Local state
const error = ref<string | null>(null)

// Methods
const handleLoadStart = () => {
  error.value = null
  emit('loadStart')
}

const handleLoadComplete = () => {
  error.value = null
  emit('loadComplete')
}

const handleLoadError = (errorMessage: string) => {
  error.value = errorMessage
  emit('loadError', errorMessage)
}

const retry = () => {
  error.value = null
  // Force re-render by updating a key or triggering reload
  // The specific viewer components will handle the retry logic
}

// Reset error when item changes
watch(() => props.item, () => {
  error.value = null
}, { immediate: true })
</script>

<style scoped>
.context-viewer {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background: var(--terminal-bg);
}

.viewer-loading,
.viewer-error,
.viewer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  flex: 1;
  color: var(--terminal-text);
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
  font-family: var(--font-mono);
}

.retry-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.viewer-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.viewer-error small {
  margin-top: 0.5rem;
  opacity: 0.7;
  font-size: 0.8rem;
}
</style>
