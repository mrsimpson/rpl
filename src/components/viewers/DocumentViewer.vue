<template>
  <div class="document-viewer">
    <div class="document-container">
      <!-- PDF Viewer -->
      <iframe
        v-if="isPdf"
        :src="item.url"
        class="pdf-frame"
        @load="$emit('loadComplete')"
        @error="handleError"
      ></iframe>
      
      <!-- Text Content -->
      <div v-else class="text-content">
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading document...</p>
        </div>
        <pre v-else class="text-pre">{{ textContent }}</pre>
      </div>
    </div>
    
    <div class="document-info">
      <span class="filename">{{ item.filename }}</span>
      <span class="type">{{ item.type.toUpperCase() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ContextItem } from '../../types'
import { contextPrefetcher } from '../../services/ContextPrefetcher'

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

const isLoading = ref(false)
const textContent = ref('')

const isPdf = computed(() => {
  return props.item.filename.toLowerCase().endsWith('.pdf') ||
         props.item.metadata?.mimeType === 'application/pdf'
})

const loadTextContent = async () => {
  if (isPdf.value) return
  
  try {
    isLoading.value = true
    emit('loadStart')
    
    // Check if content is already cached
    const cachedContent = contextPrefetcher.getCachedContent(props.item)
    if (cachedContent) {
      console.log(`[DocumentViewer] Using cached content for ${props.item.filename}`)
      textContent.value = cachedContent
      emit('loadComplete')
      return
    }
    
    // Check if content is currently being loaded by prefetcher
    const loadingPromise = contextPrefetcher.getLoadingPromise(props.item)
    if (loadingPromise) {
      console.log(`[DocumentViewer] Waiting for prefetch to complete for ${props.item.filename}`)
      textContent.value = await loadingPromise
      emit('loadComplete')
      return
    }
    
    // Fallback to direct fetch if not cached or being prefetched
    console.log(`[DocumentViewer] Direct fetch for ${props.item.filename}`)
    const response = await fetch(props.item.url)
    if (!response.ok) {
      throw new Error(`Failed to load document: ${response.status}`)
    }
    
    textContent.value = await response.text()
    emit('loadComplete')
  } catch (error) {
    emit('loadError', error instanceof Error ? error.message : 'Failed to load document')
  } finally {
    isLoading.value = false
  }
}

const handleError = () => {
  emit('loadError', 'Failed to load PDF')
}

onMounted(() => {
  if (!isPdf.value) {
    loadTextContent()
  }
})
</script>

<style scoped>
.document-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.document-container {
  flex: 1;
  display: flex;
  background: rgba(0, 0, 0, 0.1);
}

.pdf-frame {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
}

.text-content {
  flex: 1;
  overflow: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
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

.text-pre {
  padding: 1rem;
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--terminal-text);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.document-info {
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

.type {
  opacity: 0.7;
  font-size: 0.7rem;
}
</style>
