<template>
  <div class="code-viewer">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading code...</p>
    </div>

    <!-- Code Content -->
    <div v-else class="code-container">
      <!-- Code Header -->
      <div class="code-header">
        <div class="file-info">
          <span class="filename">{{ item.filename }}</span>
          <span class="language">{{ language }}</span>
        </div>
        <div class="code-actions">
          <button @click="copyCode" class="action-btn" title="Copy code">
            <CopyIcon class="icon" />
          </button>
          <button @click="downloadCode" class="action-btn" title="Download">
            <DownloadIcon class="icon" />
          </button>
        </div>
      </div>

      <!-- Code Content -->
      <div class="code-content" ref="codeRef">
        <pre class="code-pre"><code :class="`language-${language}`" v-html="highlightedCode"></code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { CopyIcon, DownloadIcon } from 'lucide-vue-next'
import type { ContextItem } from '../../types'
import { getLanguageFromExtension } from '../../utils/contextUtils'

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
const codeContent = ref('')
const codeRef = ref<HTMLElement>()

// Computed
const language = computed(() => {
  return props.item.metadata?.language || getLanguageFromExtension(props.item.filename)
})

const highlightedCode = computed(() => {
  // For now, return plain text
  // In a real implementation, you'd use a syntax highlighting library like Prism.js or highlight.js
  return escapeHtml(codeContent.value)
})

// Methods
const loadCode = async () => {
  try {
    emit('loadStart')
    const response = await fetch(props.item.url)
    
    if (!response.ok) {
      throw new Error(`Failed to load code: ${response.status} ${response.statusText}`)
    }
    
    codeContent.value = await response.text()
    isLoading.value = false
    emit('loadComplete')
  } catch (error) {
    isLoading.value = false
    emit('loadError', error instanceof Error ? error.message : 'Failed to load code')
  }
}

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(codeContent.value)
    // Could show a toast notification here
  } catch (error) {
    console.error('Failed to copy code:', error)
  }
}

const downloadCode = () => {
  const blob = new Blob([codeContent.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.item.filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const escapeHtml = (text: string): string => {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// Lifecycle
onMounted(() => {
  loadCode()
})
</script>

<style scoped>
.code-viewer {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--terminal-bg);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
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

.code-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--terminal-text);
  background: rgba(0, 0, 0, 0.2);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filename {
  font-weight: bold;
  color: var(--terminal-text);
  font-size: 0.9rem;
}

.language {
  font-size: 0.7rem;
  opacity: 0.7;
  text-transform: uppercase;
  color: var(--terminal-accent, var(--terminal-text));
}

.code-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
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

.action-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.action-btn .icon {
  width: 16px;
  height: 16px;
}

.code-content {
  flex: 1;
  overflow: auto;
  background: rgba(0, 0, 0, 0.3);
}

.code-pre {
  margin: 0;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--terminal-text);
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.code-pre code {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
}

/* Scrollbar styling */
.code-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.code-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

.code-content::-webkit-scrollbar-thumb {
  background: var(--terminal-text);
  border-radius: 4px;
}

.code-content::-webkit-scrollbar-thumb:hover {
  background: var(--terminal-accent, var(--terminal-text));
}

/* Mobile responsive */
@media (max-width: 768px) {
  .code-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .code-actions {
    width: 100%;
    justify-content: center;
  }
  
  .code-pre {
    font-size: 0.7rem;
    padding: 0.75rem;
  }
}
</style>
