<template>
  <div class="source-input">
    <div class="input-header">
      <h2>Load Conversation Source</h2>
      <p>Enter a URL to a conversation file or GitHub Gist</p>
    </div>

    <form @submit.prevent="loadSource" class="source-form">
      <div class="input-group">
        <label for="source-url">Source URL</label>
        <input
          id="source-url"
          v-model="sourceUrl"
          type="url"
          placeholder="https://gist.github.com/... or file URL"
          class="source-url-input"
          :disabled="loading"
        />
      </div>

      <div class="format-selection">
        <label>Expected Format</label>
        <div class="format-options">
          <label class="format-option">
            <input type="radio" v-model="selectedFormat" value="auto" />
            <span>Auto-detect</span>
          </label>
          <label class="format-option">
            <input type="radio" v-model="selectedFormat" value="text" />
            <span>Text (Shell format)</span>
          </label>
          <label class="format-option">
            <input type="radio" v-model="selectedFormat" value="json" />
            <span>JSON (Q-Developer)</span>
          </label>
        </div>
      </div>

      <div class="actions">
        <button type="submit" :disabled="!sourceUrl || loading" class="load-btn">
          <LoaderIcon v-if="loading" class="icon animate-spin" />
          <DownloadIcon v-else class="icon" />
          {{ loading ? 'Loading...' : 'Load Conversation' }}
        </button>
        <button type="button" @click="loadDemo" class="demo-btn">
          <PlayIcon class="icon" />
          Load Demo
        </button>
      </div>
    </form>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="file-upload">
      <label for="file-input" class="file-upload-label">
        Or upload a file directly
      </label>
      <input
        id="file-input"
        type="file"
        accept=".md,.txt,.json"
        @change="handleFileUpload"
        class="file-input"
      />
    </div>

    <div class="folder-selection" v-if="supportsFileSystemAccess">
      <button @click="selectFolder" class="folder-btn" :disabled="loading">
        <FolderIcon class="icon" />
        Select Local Folder
      </button>
      <p class="folder-help">Select a folder containing conversation.txt and context files</p>
    </div>
  </div>

  <!-- Toast notification for text format parsing -->
  <ToastNotification 
    v-if="showTextFormatToast" 
    @dismissed="showTextFormatToast = false"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LoaderIcon, DownloadIcon, PlayIcon, FolderIcon } from 'lucide-vue-next'
import { TextFormatParser } from '../parsers/TextFormatParser'
import { JsonFormatParser } from '../parsers/JsonFormatParser'
import ToastNotification from './ToastNotification.vue'
import type { ConversationData } from '../types'

const emit = defineEmits<{
  loadConversation: [event: {
    data: ConversationData;
    source: string;
    contextItems?: any[];
  }]
}>()

const sourceUrl = ref('')
const selectedFormat = ref('auto')
const loading = ref(false)
const error = ref('')
const showTextFormatToast = ref(false)

// Check if File System Access API is supported
const supportsFileSystemAccess = computed(() => {
  return 'showDirectoryPicker' in window
})

const selectFolder = async () => {
  if (!supportsFileSystemAccess.value) {
    error.value = 'File System Access API not supported in this browser'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Use File System Access API to select folder
    const dirHandle = await (window as any).showDirectoryPicker()
    
    // Simple folder processing - look for conversation file
    let conversationData: ConversationData | null = null
    const contextItems: any[] = []
    
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'file') {
        if (name === 'conversation.txt' || name === 'conversation.json') {
          // Found conversation file
          const file = await handle.getFile()
          const content = await file.text()
          
          const parser = name.endsWith('.json') ? new JsonFormatParser() : new TextFormatParser()
          conversationData = await parser.parse(content)
        } else if (name.match(/\.(jpg|jpeg|png|gif|mp4|mov|txt|js|py|md)$/i)) {
          // Found potential context file
          const file = await handle.getFile()
          const url = URL.createObjectURL(file)
          contextItems.push({
            name,
            url,
            type: file.type || 'application/octet-stream',
            size: file.size
          })
        }
      }
    }
    
    if (conversationData) {
      // Emit local folder loading event
      emit('loadConversation', {
        data: conversationData,
        source: 'local',
        contextItems
      })
    } else {
      error.value = 'No conversation file (conversation.txt or conversation.json) found in selected folder'
    }

  } catch (err) {
    if ((err as Error).name !== 'AbortError') {
      console.error('Folder selection error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to process folder'
    }
  } finally {
    loading.value = false
  }
}

const loadSource = async () => {
  if (!sourceUrl.value) return

  // Emit URL-based loading event
  emit('loadConversation', {
    data: {} as ConversationData, // Will be loaded by ConversationView
    source: sourceUrl.value
  })
}

const handleFileUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  loading.value = true
  error.value = ''

  try {
    const content = await file.text()
    
    // Auto-detect format based on file extension or content
    const format = file.name.endsWith('.json') ? 'json' : 'text'
    const parser = format === 'json' ? new JsonFormatParser() : new TextFormatParser()
    
    const conversationData = await parser.parse(content)
    
    // Emit local file loading event
    emit('loadConversation', {
      data: conversationData,
      source: 'local',
      contextItems: [] // No context items for direct file upload
    })

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to parse file'
  } finally {
    loading.value = false
  }
}

const loadDemo = () => {
  // Emit demo loading event
  emit('loadConversation', {
    data: {} as ConversationData, // Will be loaded by ConversationView
    source: 'demo'
  })
}
</script>

<style scoped>
.icon {
  width: 16px;
  height: 16px;
}

.folder-selection {
  margin-top: 1.5rem;
  text-align: center;
}

.folder-btn {
  background: var(--terminal-text);
  color: var(--terminal-bg);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  font-weight: 500;
  transition: all 0.2s ease;
}

.folder-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.folder-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.folder-help {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  opacity: 0.7;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>