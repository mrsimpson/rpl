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
  </div>

  <!-- Toast notification for text format parsing -->
  <ToastNotification 
    v-if="showTextFormatToast" 
    @dismissed="showTextFormatToast = false"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { LoaderIcon, DownloadIcon, PlayIcon } from 'lucide-vue-next'
import { TextFormatParser } from '../parsers/TextFormatParser'
import { JsonFormatParser } from '../parsers/JsonFormatParser'
import { FileSourceAdapter } from '../adapters/FileSourceAdapter'
import { GistSourceAdapter } from '../adapters/GistSourceAdapter'
import ToastNotification from './ToastNotification.vue'
import type { ConversationData } from '../types'

const emit = defineEmits<{
  loadConversation: [data: ConversationData]
}>()

const sourceUrl = ref('')
const selectedFormat = ref('auto')
const loading = ref(false)
const error = ref('')
const showTextFormatToast = ref(false)

const loadSource = async () => {
  if (!sourceUrl.value) return

  loading.value = true
  error.value = ''

  try {
    // Determine source adapter
    const adapter = sourceUrl.value.includes('gist.github.com')
      ? new GistSourceAdapter()
      : new FileSourceAdapter()

    // Fetch content
    const content = await adapter.fetchContent(sourceUrl.value)

    // Parse content
    const isTextFormat = selectedFormat.value === 'text' || 
      (selectedFormat.value === 'auto' && detectFormat(content) !== 'json')
    
    const parser = selectedFormat.value === 'json' 
      ? new JsonFormatParser()
      : selectedFormat.value === 'text'
      ? new TextFormatParser()
      : detectFormat(content) === 'json'
      ? new JsonFormatParser()
      : new TextFormatParser()

    const conversationData = await parser.parse(content)
    
    // Show toast notification for text format parsing
    if (isTextFormat) {
      showTextFormatToast.value = true
    }
    
    emit('loadConversation', conversationData)

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load conversation'
  } finally {
    loading.value = false
  }
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
    emit('loadConversation', conversationData)

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to parse file'
  } finally {
    loading.value = false
  }
}

const loadDemo = () => {
  // Create a demo conversation
  const demoData: ConversationData = {
    metadata: {
      title: 'Demo Conversation',
      timestamp: new Date().toISOString(),
      format: 'demo'
    },
    messages: [
      {
        id: '1',
        type: 'human',
        content: 'Hello! Can you help me understand how neural networks work?',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'agent',
        content: 'I\'d be happy to explain neural networks! Neural networks are computational models inspired by biological neural networks. They consist of interconnected nodes (neurons) organized in layers.',
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'tool_call',
        content: 'generate_diagram(type="neural_network", layers=3)',
        timestamp: new Date().toISOString()
      },
      {
        id: '4',
        type: 'human', 
        content: 'That\'s helpful! How do they learn from data?',
        timestamp: new Date().toISOString()
      },
      {
        id: '5',
        type: 'agent',
        content: 'Neural networks learn through a process called backpropagation. During training, the network makes predictions, compares them to expected outputs, and adjusts weights to minimize errors.',
        timestamp: new Date().toISOString()
      }
    ]
  }
  
  emit('loadConversation', demoData)
}

const detectFormat = (content: string): 'json' | 'text' => {
  try {
    JSON.parse(content)
    return 'json'
  } catch {
    return 'text'
  }
}
</script>

<style scoped>
.icon {
  width: 16px;
  height: 16px;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>