<template>
  <div class="markdown-renderer">
    <div 
      v-if="renderedContent" 
      class="markdown-content"
      v-html="renderedContent"
    ></div>
    <div v-else-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Rendering markdown...</p>
    </div>
    <div v-else class="error-container">
      <p>Failed to render markdown content</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'
import { markedHighlight } from 'marked-highlight'

interface Props {
  content: string
  filename?: string
}

const props = defineProps<Props>()

const isLoading = ref(false)
const renderedContent = ref('')

// Configure marked with GFM support and basic syntax highlighting
const configureMarked = () => {
  marked.use(gfmHeadingId())
  marked.use(markedHighlight({
    langPrefix: 'language-',
    highlight(code, _lang) {
      // Simple syntax highlighting without Prism for now
      return code
    }
  }))

  // Configure marked options for GFM
  marked.setOptions({
    gfm: true,
    breaks: true
  })
}

// Check if content appears to be markdown
const isMarkdownContent = computed(() => {
  if (!props.content) return false
  
  // Check file extension
  if (props.filename) {
    const ext = props.filename.toLowerCase()
    if (ext.endsWith('.md') || ext.endsWith('.markdown') || ext.endsWith('.mdown')) {
      return true
    }
  }
  
  // Check content for markdown patterns
  const content = props.content.trim()
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m,           // Headers
    /^\*\s+.+$/m,              // Unordered lists
    /^\d+\.\s+.+$/m,           // Ordered lists
    /\*\*[^*]+\*\*/,           // Bold text
    /\*[^*]+\*/,               // Italic text
    /`[^`]+`/,                 // Inline code
    /^```[\s\S]*?```$/m,       // Code blocks
    /^\|.+\|$/m,               // Tables
    /^\[.+\]\(.+\)$/m,         // Links
    /^>\s+.+$/m                // Blockquotes
  ]
  
  return markdownPatterns.some(pattern => pattern.test(content))
})

// Render markdown content
const renderMarkdown = async () => {
  // Clear previous content immediately
  renderedContent.value = ''
  
  if (!props.content || !isMarkdownContent.value) {
    isLoading.value = false
    return
  }
  
  try {
    isLoading.value = true
    
    // Configure marked if not already done
    configureMarked()
    
    // Parse and render markdown
    const html = await marked.parse(props.content)
    
    // Only set content if this is still the current content
    // (prevents race conditions when switching between items quickly)
    if (props.content && isMarkdownContent.value) {
      renderedContent.value = html
    }
  } catch (error) {
    console.error('Failed to render markdown:', error)
    renderedContent.value = ''
  } finally {
    isLoading.value = false
  }
}

// Watch for content changes and clear previous content
watch(() => props.content, (newContent, oldContent) => {
  // Clear content immediately when it changes
  if (newContent !== oldContent) {
    renderedContent.value = ''
    isLoading.value = false
  }
  renderMarkdown()
}, { immediate: true })

watch(() => props.filename, (newFilename, oldFilename) => {
  // Clear content when filename changes
  if (newFilename !== oldFilename) {
    renderedContent.value = ''
    isLoading.value = false
  }
  renderMarkdown()
})

onMounted(() => {
  renderMarkdown()
})

// Cleanup on unmount
onUnmounted(() => {
  renderedContent.value = ''
  isLoading.value = false
})
</script>

<style scoped>
.markdown-renderer {
  height: 100%;
  overflow: auto;
}

.loading-container,
.error-container {
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

.markdown-content {
  padding: 1.5rem;
  color: var(--terminal-text);
  line-height: 1.6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

/* Markdown Styling */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
  color: var(--terminal-text);
}

.markdown-content :deep(h1) {
  font-size: 2em;
  border-bottom: 1px solid var(--terminal-text);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid var(--terminal-text);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
}

.markdown-content :deep(h4) {
  font-size: 1em;
}

.markdown-content :deep(h5) {
  font-size: 0.875em;
}

.markdown-content :deep(h6) {
  font-size: 0.85em;
  opacity: 0.8;
}

.markdown-content :deep(p) {
  margin-bottom: 1em;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25em;
}

.markdown-content :deep(blockquote) {
  margin: 1em 0;
  padding: 0 1em;
  border-left: 4px solid var(--terminal-text);
  opacity: 0.8;
  font-style: italic;
}

.markdown-content :deep(code) {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.markdown-content :deep(pre) {
  background: rgba(0, 0, 0, 0.4);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
  margin: 1em 0;
  font-family: var(--font-mono);
  font-size: 0.85em;
  line-height: 1.45;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--terminal-text);
  padding: 0.5em 1em;
  text-align: left;
}

.markdown-content :deep(th) {
  background: rgba(0, 0, 0, 0.3);
  font-weight: 600;
}

.markdown-content :deep(tr:nth-child(even)) {
  background: rgba(0, 0, 0, 0.1);
}

.markdown-content :deep(a) {
  color: var(--terminal-text);
  text-decoration: underline;
  opacity: 0.8;
}

.markdown-content :deep(a:hover) {
  opacity: 1;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 1em 0;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--terminal-text);
  margin: 2em 0;
  opacity: 0.3;
}
</style>
