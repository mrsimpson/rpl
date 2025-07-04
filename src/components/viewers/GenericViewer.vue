<template>
  <div class="generic-viewer">
    <div class="generic-container">
      <div class="file-preview">
        <FileIcon class="file-icon" />
        <h3 class="filename">{{ item.filename }}</h3>
        <p class="file-type">{{ item.type.toUpperCase() }} File</p>
        <p v-if="item.metadata?.size" class="file-size">
          {{ formatFileSize(item.metadata.size) }}
        </p>
        
        <div class="file-actions">
          <a 
            :href="item.url" 
            target="_blank" 
            rel="noopener noreferrer"
            class="action-btn"
            @click="$emit('loadComplete')"
          >
            <ExternalLinkIcon class="icon" />
            Open in New Tab
          </a>
          
          <button @click="downloadFile" class="action-btn">
            <DownloadIcon class="icon" />
            Download
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { FileIcon, ExternalLinkIcon, DownloadIcon } from 'lucide-vue-next'
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

const downloadFile = () => {
  const a = document.createElement('a')
  a.href = props.item.url
  a.download = props.item.filename
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

onMounted(() => {
  emit('loadStart')
  // Immediately complete since there's nothing to load
  setTimeout(() => emit('loadComplete'), 100)
})
</script>

<style scoped>
.generic-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.generic-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.file-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: var(--terminal-text);
  max-width: 300px;
}

.file-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.filename {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: bold;
  word-break: break-all;
}

.file-type {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  opacity: 0.7;
  color: var(--terminal-accent, var(--terminal-text));
}

.file-size {
  margin: 0 0 2rem 0;
  font-size: 0.8rem;
  opacity: 0.7;
}

.file-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid var(--terminal-text);
  color: var(--terminal-text);
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.action-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.action-btn .icon {
  width: 16px;
  height: 16px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .generic-container {
    padding: 1rem;
  }
  
  .file-preview {
    max-width: 250px;
  }
  
  .file-icon {
    width: 48px;
    height: 48px;
  }
  
  .filename {
    font-size: 1rem;
  }
}
</style>
