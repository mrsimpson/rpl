<template>
  <div class="tool-call" :class="`tool-call-${toolData.type}`">
    <div v-if="toolData.type === 'tool_use'" class="tool-use">
      <div class="tool-wrapper">
        <component :is="getToolRenderer(toolData.name)" :tool-data="toolData" />
        
        <!-- Response button positioned in tool header -->
        <button 
          v-if="hasStructuredResponse || (toolResponse && !hasContentResponse)"
          class="response-toggle-header" 
          @click="toggleResponse"
          :class="{ 'expanded': showResponse }"
        >
          <span class="toggle-icon">{{ showResponse ? '▼' : '▶' }}</span>
        </button>
      </div>
      
      <!-- Content response displayed as agent message -->
      <div v-if="hasContentResponse" class="tool-content-response">
        <div class="response-header">
          <span class="response-label">Response:</span>
        </div>
        <div class="response-content agent-message">
          {{ getContentResponse }}
        </div>
      </div>
      
      <!-- Expandable structured response section -->
      <div v-if="showResponse && (hasStructuredResponse || (toolResponse && !hasContentResponse))" class="tool-response-section">
        <div class="response-content">
          <div v-if="toolResponseData" class="structured-response">
            <div class="tool-header">
              <span class="tool-name">Tool Result</span>
              <span class="tool-status" v-if="toolResponseData.status">{{
                toolResponseData.status
              }}</span>
            </div>
            <div class="result-content">
              <pre v-if="isTextContent(toolResponseData.content)">{{
                formatTextContent(toolResponseData.content)
              }}</pre>
              <div v-else class="structured-content">
                {{ JSON.stringify(deepParseJson(toolResponseData.content), null, 2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="toolData.type === 'tool_result'" class="tool-result">
      <div class="tool-header">
        <span class="tool-icon">📋</span>
        <span class="tool-name">Tool Result</span>
        <span class="tool-status" v-if="toolData.status">{{
          toolData.status
        }}</span>
      </div>
      <div class="result-content">
        <pre v-if="isTextContent(toolData.content)">{{
          formatTextContent(toolData.content)
        }}</pre>
        <div v-else class="structured-content">
          {{ JSON.stringify(deepParseJson(toolData.content), null, 2) }}
        </div>
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

    <!-- Fallback for unknown tool types or simple string content -->
    <div v-else class="tool-unknown">
      <div class="tool-header">
        <span class="tool-icon">🔧</span>
        <span class="tool-name">Tool Call</span>
      </div>
      <div class="tool-content">
        <pre>{{ toolData.content || props.content }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { toolRendererRegistry } from "./tool-renderers/ToolRendererRegistry";
import type { Message } from "../types";

const props = defineProps<{
  content: string;
  toolResponse?: Message | null;
}>();

// State for expandable response section
const showResponse = ref(false);

const toolData = computed(() => {
  try {
    return JSON.parse(props.content);
  } catch {
    return { type: "unknown", content: props.content };
  }
});

// Parse tool response data
const toolResponseData = computed(() => {
  if (!props.toolResponse) return null;
  try {
    return JSON.parse(props.toolResponse.content);
  } catch {
    return null;
  }
});

// Check if response has content that should be displayed as agent message
const hasContentResponse = computed(() => {
  // For now, we want all tool responses to be in expandable sections by default
  // This can be refined later if we need to distinguish between different types
  return false;
});

// Check if response has structured data that should be shown as expandable
const hasStructuredResponse = computed(() => {
  if (!toolResponseData.value) return false;
  return !hasContentResponse.value && toolResponseData.value.content;
});

// Extract content for agent message display
const getContentResponse = computed(() => {
  if (!hasContentResponse.value) return '';
  return formatTextContent(toolResponseData.value.content);
});

const toggleResponse = () => {
  showResponse.value = !showResponse.value;
};

const getToolRenderer = (toolName: string) => {
  return toolRendererRegistry.getRenderer(toolName);
};

const isTextContent = (content: any): boolean => {
  return Array.isArray(content) && content.length > 0 && content[0]?.Text;
};

const formatTextContent = (content: any): string => {
  if (isTextContent(content)) {
    return content[0].Text;
  }
  return JSON.stringify(content, null, 2);
};

const formatPartialResults = (results: any): string => {
  if (!results || !Array.isArray(results)) return "";

  return results
    .map((result) => {
      if (result.content && isTextContent(result.content)) {
        return result.content[0].Text;
      }
      return JSON.stringify(deepParseJson(result), null, 2);
    })
    .join("\n---\n");
};

// Recursively parse stringified JSON within objects
const deepParseJson = (obj: any): any => {
  // Base case: if not an object or array, check if it's a stringified JSON
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      try {
        const parsed = JSON.parse(obj);
        // If successfully parsed and result is an object or array, recurse into it
        if (typeof parsed === 'object' && parsed !== null) {
          return deepParseJson(parsed);
        }
        return parsed;
      } catch {
        // Not valid JSON, return as is
        return obj;
      }
    }
    return obj;
  }
  
  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => deepParseJson(item));
  }
  
  // Handle objects
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepParseJson(obj[key]);
    }
  }
  return result;
};
</script>

<style scoped>
.tool-call {
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--terminal-accent, #00ff41);
  border-radius: 6px;
  padding: var(--spacing-2);
  margin: var(--spacing-1) 0;
}

.tool-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: 0 0 var(--spacing-1) 0;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: var(--spacing-1);
}

.tool-icon {
  font-size: 14px;
}

.tool-name {
  color: var(--terminal-accent, #00ff41);
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
  font-size: var(--font-size-sm);
}

.cancellation-reason {
  color: var(--terminal-text);
  font-style: italic;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
}

.partial-results-header {
  color: var(--terminal-accent, #00ff41);
  font-weight: bold;
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
}

.partial-results pre {
  padding: var(--spacing-1) 0;
  color: var(--terminal-text);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
  margin: 0;
  font-size: var(--font-size-sm);
}

/* Tool type specific styling */
.tool-call-tool_use {
  border-color: #4caf50;
}

.tool-call-tool_result {
  border-color: #2196f3;
}

.tool-call-tool_cancelled {
  border-color: #f44336;
}

.tool-call-tool_use .tool-name {
  color: #4caf50;
}

.tool-call-tool_result .tool-name {
  color: #2196f3;
}

.tool-call-tool_cancelled .tool-name {
  color: #f44336;
}

/* Tool wrapper for positioning response button */
.tool-wrapper {
  position: relative;
}

/* Response button positioned in tool header */
.response-toggle-header {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid var(--terminal-accent, #00ff41);
  color: var(--terminal-accent, #00ff41);
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 12px;
  transition: all 0.2s ease;
  z-index: 10;
}

.response-toggle-header:hover {
  background: rgba(0, 255, 65, 0.1);
}

.response-toggle-header.expanded {
  background: rgba(0, 255, 65, 0.2);
}

.response-toggle-header .toggle-icon {
  font-size: 10px;
  transition: transform 0.2s ease;
}

.response-toggle-header .response-indicator {
  font-size: 12px;
}

/* Tool response section styles */
.tool-content-response {
  margin-top: var(--spacing-2);
  padding-top: var(--spacing-2);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.response-header {
  margin-bottom: var(--spacing-1);
}

.response-label {
  color: var(--terminal-accent, #00ff41);
  font-weight: bold;
  font-size: var(--font-size-sm);
}

.agent-message {
  color: var(--terminal-text);
  white-space: pre-wrap;
  word-break: break-word;
  font-family: var(--font-mono);
  padding: var(--spacing-1);
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border-left: 3px solid var(--terminal-accent, #00ff41);
}

.tool-response-section {
  margin-top: var(--spacing-2);
}

.response-content {
  margin-top: var(--spacing-2);
  animation: slideDown 0.2s ease-out;
}

.structured-response {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--terminal-accent, #00ff41);
  border-radius: 6px;
  padding: var(--spacing-2);
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    overflow: hidden;
  }
  to {
    opacity: 1;
    max-height: 500px;
    overflow: visible;
  }
}
</style>
