<template>
  <div class="source-input" :class="themeClasses">
    <div class="input-header">
      <h2>Load Conversation</h2>
      <p>Choose how you want to load your conversation data</p>
    </div>

    <!-- Remote Sources Section -->
    <section class="source-section">
      <h3 class="section-title">
        <GlobeIcon class="section-icon" />
        Remote Sources
      </h3>
      <p class="section-description">Load conversations from online sources</p>
      
      <form @submit.prevent="loadSource" class="remote-form">
        <div class="input-group">
          <label for="source-url">URL</label>
          <input
            id="source-url"
            v-model="sourceUrl"
            type="url"
            placeholder="GitHub repository, gist, or file URL"
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

        <button type="submit" :disabled="!sourceUrl || loading" class="load-btn primary">
          <LoaderIcon v-if="loading" class="icon animate-spin" />
          <DownloadIcon v-else class="icon" />
          {{ loading ? 'Loading...' : 'Load from URL' }}
        </button>
      </form>
    </section>

    <!-- Local Files Section -->
    <section class="source-section">
      <h3 class="section-title">
        <HardDriveIcon class="section-icon" />
        Local Files
      </h3>
      <p class="section-description">Load conversations from your computer</p>
      
      <div class="local-options">
        <!-- Single File Option -->
        <div class="local-option">
          <div class="option-header">
            <FileTextIcon class="option-icon" />
            <div class="option-info">
              <h4>Single Conversation File</h4>
              <p>Load a single conversation file (.txt or .json)</p>
            </div>
          </div>
          <button @click="handleFileUpload" class="load-btn secondary">
            <UploadIcon class="icon" />
            Choose File
          </button>
        </div>

        <!-- Folder Option -->
        <div class="local-option">
          <div class="option-header">
            <FolderIcon class="option-icon" />
            <div class="option-info">
              <h4>Conversation + Context</h4>
              <p>Select a folder with conversation.txt and context files (images, videos, etc.)</p>
            </div>
          </div>
          <button @click="handleFolderSelection" :disabled="!supportsFolderSelection" class="load-btn secondary">
            <FolderIcon class="icon" />
            {{ supportsFolderSelection ? 'Select Folder' : 'Not Supported' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Demo Section (Less Prominent) -->
    <section class="source-section demo-section">
      <details class="demo-details">
        <summary class="demo-summary">
          <PlayIcon class="section-icon" />
          Try Demo
        </summary>
        <div class="demo-content">
          <p>Load a sample conversation to explore the features</p>
          <button @click="loadDemo" class="load-btn demo">
            <PlayIcon class="icon" />
            Load Demo Conversation
          </button>
        </div>
      </details>
    </section>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept=".txt,.json"
      style="display: none"
      @change="handleFileSelected"
    />

    <!-- Toast notifications -->
    <ToastNotification
      v-if="showToast"
      :message="toastMessage"
      :type="toastType"
      @close="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { LoaderIcon, DownloadIcon, PlayIcon, FolderIcon, GlobeIcon, HardDriveIcon, FileTextIcon, UploadIcon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
import { TextFormatParser } from '../parsers/TextFormatParser'
import { JsonFormatParser } from '../parsers/JsonFormatParser'
import { createContextItem } from '../utils/contextUtils'
import ToastNotification from './ToastNotification.vue'
import type { ConversationData, ContextItem } from '../types'

// Use theme composable
const { themeClasses } = useTheme()

const emit = defineEmits<{
  loadConversation: [event: {
    data: ConversationData;
    source: string;
    contextItems?: ContextItem[];
  }]
}>()

const sourceUrl = ref('')
const selectedFormat = ref('auto')
const loading = ref(false)
const error = ref('')

// New reactive variables for redesigned UI
const fileInput = ref<HTMLInputElement>()
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error' | 'info'>('info')

// Check if browser supports folder selection
const supportsFolderSelection = computed(() => {
  return 'showDirectoryPicker' in window
})


const loadSource = async () => {
  if (!sourceUrl.value) return

  // Emit URL-based loading event
  emit('loadConversation', {
    data: {} as ConversationData, // Will be loaded by ConversationView
    source: sourceUrl.value
  })
}

const loadDemo = () => {
  // Emit demo loading event
  emit('loadConversation', {
    data: {} as ConversationData, // Will be loaded by ConversationView
    source: 'demo'
  })
}

// New methods for redesigned UI
const handleFileUpload = () => {
  fileInput.value?.click()
}

const handleFileSelected = async (event: Event) => {
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
    
    // Show success toast
    showToastMessage(`Successfully loaded ${file.name}`, 'success')
    
    // Emit local file loading event
    emit('loadConversation', {
      data: conversationData,
      source: 'local-file',
      contextItems: [] // No context items for single file upload
    })

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to parse file'
    showToastMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

const handleFolderSelection = async () => {
  if (!supportsFolderSelection.value) {
    showToastMessage('Folder selection is not supported in this browser', 'error')
    return
  }

  try {
    loading.value = true
    error.value = ''

    // Use the existing folder selection logic
    const directoryHandle = await (window as any).showDirectoryPicker()
    
    // Find conversation.txt file
    let conversationFile = null
    const contextItems: ContextItem[] = []

    for await (const [name, handle] of directoryHandle.entries()) {
      if (handle.kind === 'file') {
        if (name === 'conversation.txt') {
          conversationFile = await handle.getFile()
        } else {
          // Check if it's a context file (image, video, code, etc.)
          const file = await handle.getFile()
          const contextItem = createContextItem(file, name)
          if (contextItem) {
            contextItems.push(contextItem)
          }
        }
      }
    }

    if (!conversationFile) {
      throw new Error('No conversation.txt file found in the selected folder')
    }

    // Parse the conversation file
    const content = await conversationFile.text()
    const parser = new TextFormatParser() // Assume text format for folder-based conversations
    const conversationData = await parser.parse(content)

    // Show success toast
    showToastMessage(`Successfully loaded conversation with ${contextItems.length} context items`, 'success')

    // Emit folder loading event
    emit('loadConversation', {
      data: conversationData,
      source: 'local-folder',
      contextItems
    })

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load folder'
    showToastMessage(errorMessage, 'error')
  } finally {
    loading.value = false
  }
}

const showToastMessage = (message: string, type: 'success' | 'error' | 'info') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}
</script>

<style scoped>
.source-input {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.input-header {
  text-align: center;
  margin-bottom: 3rem;
}

.input-header h2 {
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.input-header p {
  opacity: 0.8;
  font-size: 1rem;
}

/* Source Sections */
.source-section {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  border: 1px solid;
  border-radius: 8px;
  transition: all 0.2s ease;
}

/* Light theme for sections */
.light .source-section {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.light .source-section:hover {
  border-color: #007acc;
  box-shadow: 0 2px 8px rgba(0, 122, 204, 0.1);
}

/* Dark theme for sections */
.dark .source-section {
  background: #2d2d2d;
  border-color: #404040;
}

.dark .source-section:hover {
  border-color: #66ccff;
  box-shadow: 0 2px 8px rgba(102, 204, 255, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  font-weight: 600;
}

.section-icon {
  width: 20px;
  height: 20px;
}

.section-description {
  margin-bottom: 1.5rem;
  opacity: 0.8;
  font-size: 0.9rem;
}

/* Remote Form */
.remote-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 500;
  font-size: 0.9rem;
}

.source-url-input {
  padding: 0.75rem;
  border: 1px solid;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

/* Light theme for inputs */
.light .source-url-input {
  background: #ffffff;
  color: #000000;
  border-color: #e0e0e0;
}

.light .source-url-input:focus {
  outline: none;
  border-color: #007acc;
  box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.light .source-url-input:disabled {
  background: #f8f9fa;
  color: #6c757d;
}

/* Dark theme for inputs */
.dark .source-url-input {
  background: #1a1a1a;
  color: #ffffff;
  border-color: #404040;
}

.dark .source-url-input:focus {
  outline: none;
  border-color: #66ccff;
  box-shadow: 0 0 0 2px rgba(102, 204, 255, 0.2);
}

.dark .source-url-input:disabled {
  background: #2d2d2d;
  color: #6c757d;
}

.format-selection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.format-selection > label {
  font-weight: 500;
  font-size: 0.9rem;
}

.format-options {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.format-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.format-option input[type="radio"] {
  margin: 0;
}

/* Local Options */
.local-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.local-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid;
  border-radius: 6px;
  transition: all 0.2s ease;
}

/* Light theme for local options */
.light .local-option {
  background: #ffffff;
  border-color: #e0e0e0;
}

.light .local-option:hover {
  border-color: #007acc;
  box-shadow: 0 1px 4px rgba(0, 122, 204, 0.1);
}

/* Dark theme for local options */
.dark .local-option {
  background: #1a1a1a;
  border-color: #404040;
}

.dark .local-option:hover {
  border-color: #66ccff;
  box-shadow: 0 1px 4px rgba(102, 204, 255, 0.1);
}

.option-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.option-icon {
  width: 24px;
  height: 24px;
  opacity: 0.7;
}

.option-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.option-info p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.8;
}

/* Buttons */
.load-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

/* Primary button (URL loading) */
.light .load-btn.primary {
  background: #007acc;
  color: #ffffff;
  border-color: #007acc;
}

.light .load-btn.primary:hover:not(:disabled) {
  background: #005a9e;
  border-color: #005a9e;
}

.dark .load-btn.primary {
  background: #0d6efd;
  color: #ffffff;
  border-color: #0d6efd;
}

.dark .load-btn.primary:hover:not(:disabled) {
  background: #0b5ed7;
  border-color: #0b5ed7;
}

/* Secondary button (local files) */
.light .load-btn.secondary {
  background: #6f42c1;
  color: #ffffff;
  border-color: #6f42c1;
}

.light .load-btn.secondary:hover:not(:disabled) {
  background: #5a32a3;
  border-color: #5a32a3;
}

.dark .load-btn.secondary {
  background: #6f42c1;
  color: #ffffff;
  border-color: #6f42c1;
}

.dark .load-btn.secondary:hover:not(:disabled) {
  background: #5a32a3;
  border-color: #5a32a3;
}

/* Demo button */
.light .load-btn.demo {
  background: #28a745;
  color: #ffffff;
  border-color: #28a745;
}

.light .load-btn.demo:hover {
  background: #218838;
  border-color: #218838;
}

.dark .load-btn.demo {
  background: #198754;
  color: #ffffff;
  border-color: #198754;
}

.dark .load-btn.demo:hover {
  background: #157347;
  border-color: #157347;
}

/* Disabled buttons */
.load-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.light .load-btn:disabled {
  background: #e9ecef;
  color: #6c757d;
  border-color: #dee2e6;
}

.dark .load-btn:disabled {
  background: #495057;
  color: #6c757d;
  border-color: #495057;
}

.icon {
  width: 16px;
  height: 16px;
}

/* Demo Section */
.demo-section {
  margin-top: 2rem;
}

.demo-details {
  border: none;
  background: none;
}

.demo-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 0;
  list-style: none;
}

.demo-summary::-webkit-details-marker {
  display: none;
}

.demo-content {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.demo-content p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.9rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive design */
@media (max-width: 768px) {
  .source-input {
    padding: 1rem;
  }
  
  .source-section {
    padding: 1rem;
  }
  
  .local-option {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .option-header {
    justify-content: center;
    text-align: center;
  }
  
  .format-options {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .load-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>