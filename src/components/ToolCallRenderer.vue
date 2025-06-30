<template>
  <div class="tool-call" :class="`tool-call-${toolData.type}`">
    <div v-if="toolData.type === 'tool_use'" class="tool-use">
      <component 
        :is="getToolRenderer(toolData.name)"
        :tool-data="toolData"
      />
    </div>
    
    <div v-else-if="toolData.type === 'tool_result'" class="tool-result">
      <div class="tool-header">
        <span class="tool-icon">📋</span>
        <span class="tool-name">Tool Result</span>
        <span class="tool-status" v-if="toolData.status">{{ toolData.status }}</span>
      </div>
      <div class="result-content">
        <pre v-if="isTextContent(toolData.content)">{{ formatTextContent(toolData.content) }}</pre>
        <div v-else class="structured-content">{{ JSON.stringify(toolData.content, null, 2) }}</div>
      </div>
    </div>
    
    <div v-else-if="toolData.type === 'tool_cancelled'" class="tool-cancelled">
      <div class="tool-header">
        <span class="tool-icon">❌</span>
        <span class="tool-name">Tool Cancelled</span>
      </div>
      <div class="tool-content">
        <div class="cancellation-reason">{{ toolData.prompt }}</div>
        <div v-if="toolData.tool_use_results" class="partial-results">
          <div class="partial-results-header">Partial Results:</div>
          <pre>{{ formatPartialResults(toolData.tool_use_results) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toolRendererRegistry } from './tool-renderers/ToolRendererRegistry'

const props = defineProps<{
  content: string
}>()

const toolData = computed(() => {
  try {
    return JSON.parse(props.content)
  } catch {
    return { type: 'unknown', content: props.content }
  }
})

const getToolRenderer = (toolName: string) => {
  return toolRendererRegistry.getRenderer(toolName)
}

const isTextContent = (content: any): boolean => {
  return Array.isArray(content) && 
         content.length > 0 && 
         content[0]?.Text
}

const formatTextContent = (content: any): string => {
  if (isTextContent(content)) {
    return content[0].Text
  }
  return JSON.stringify(content, null, 2)
}

const formatPartialResults = (results: any): string => {
  if (!results || !Array.isArray(results)) return ''
  
  return results
    .map(result => {
      if (result.content && isTextContent(result.content)) {
        return result.content[0].Text
      }
      return JSON.stringify(result, null, 2)
    })
    .join('\n---\n')
}
</script>

<style scoped>
.tool-call {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}

.tool-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) 0;
  font-weight: bold;
}

.tool-icon {
  font-size: 14px;
}

.tool-name {
  color: var(--terminal-text);
  flex: 1;
}

.tool-status {
  color: var(--terminal-dim);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
}

.tool-content {
  padding: var(--spacing-1) 0;
}

.result-content {
  padding: var(--spacing-1) 0;
}

.result-content pre {
  margin: 0;
  color: var(--terminal-text);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.structured-content {
  color: var(--terminal-text);
  white-space: pre-wrap;
  font-family: var(--font-mono);
}

.cancellation-reason {
  color: var(--terminal-text);
  font-style: italic;
  margin-bottom: var(--spacing-2);
}

.partial-results-header {
  color: var(--terminal-text);
  font-weight: bold;
  margin-bottom: var(--spacing-1);
}

.partial-results pre {
  padding: var(--spacing-1) 0;
  color: var(--terminal-text);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
  margin: 0;
}
</style>
