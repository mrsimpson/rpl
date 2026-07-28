<template>
  <div
    class="message"
    :class="[`message-${message.type}`, { 'is-current': isCurrent, 'is-steering': message.metadata?.isSteering, 'is-compaction': message.metadata?.isCompaction }]"
  >
    <!-- Compaction message: same structure as a tool_use block -->
    <div v-if="message.metadata?.isCompaction" class="compaction-block">
      <div class="compaction-wrapper">
        <div class="compaction-header">
          <span class="compaction-tool-icon">📋</span>
          <span class="compaction-tool-name">Context Compaction</span>
        </div>
        <button
          class="compaction-toggle"
          :class="{ 'expanded': compactionExpanded }"
          @click="compactionExpanded = !compactionExpanded"
        >
          <span class="toggle-icon">{{ compactionExpanded ? '▼' : '▶' }}</span>
        </button>
      </div>
      <div v-if="compactionExpanded" class="compaction-body">
        <pre class="compaction-content">{{ message.content }}</pre>
      </div>
    </div>

    <!-- All other message types -->
    <div v-else class="message-line">
      <span v-if="!!messagePrefix" class="message-prefix">{{
        messagePrefix
      }}</span>
      <span class="message-content">
        <ToolCallRenderer
          v-if="message.type === 'tool_call'"
          :content="message.content"
          :tool-response="toolResponse"
        />
        <TypewriterText
          v-else-if="isCurrent"
          :text="message.content"
          :speed="getAnimationSpeed()"
          :paused="paused"
          @complete="$emit('animationComplete')"
          @typing="$emit('characterTyped', $event)"
        />
        <span v-else class="static-content">{{ message.content }}</span>
      </span>
      <span class="message-meta">
        <span> {{ message.id }} | </span>
        {{ message.type }}{{ contextIndicator }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import TypewriterText from "./TypewriterText.vue";
import ToolCallRenderer from "./ToolCallRenderer.vue";
import type { Message, Settings } from "../types";

const props = defineProps<{
  message: Message;
  isCurrent: boolean;
  settings: Settings;
  paused?: boolean;
  contextCount?: number;
  toolResponse?: Message | null;
}>();

defineEmits<{
  animationComplete: [];
  characterTyped: [character: string];
}>();

const compactionExpanded = ref(false);

const messagePrefix = computed(() => {
  if (props.message.metadata?.isSteering) return '⤷'
  switch (props.message.type) {
    case "human":
      return ">";
    case "agent":
      return "<";
    case "tool_call":
      return "";
    case "system":
      return "#";
    default:
      return "?";
  }
});

const contextIndicator = computed(() => {
  if (!props.contextCount || props.contextCount === 0) {
    return "";
  }

  const indicator = " | [*]";
  return props.contextCount > 1 ? ` | [*${props.contextCount}]` : indicator;
});

const getAnimationSpeed = () => {
  return props.message.type === "human"
    ? props.settings.humanAnimationSpeed
    : props.settings.agentAnimationSpeed;
};
</script>

<style scoped>
/* Message Styles */
.message {
  margin-bottom: var(--spacing-3);
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: var(--font-size-base); /* Standardized base font size */
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-1);
  font-size: var(--font-size-sm);
}

.message-prefix {
  font-weight: bold;
  color: var(--terminal-accent);
  font-size: var(--font-size-base); /* Same as message content */
}

.message-meta {
  color: var(--terminal-dim);
  font-size: var(--font-size-xs); /* Smaller for metadata */
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  width: 100%;
  max-width: 100%;
  font-size: var(--font-size-base); /* Consistent content font size */
  line-height: 1.4;
}

.message-line {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-1);
}

.message-prefix {
  color: var(--terminal-accent);
  font-weight: bold;
  flex-shrink: 0;
}

.message-content {
  flex: 1;
  color: var(--terminal-text);
}

.message-tool_call .message-line {
  flex-direction: column;
  align-items: flex-start;
}

.message-tool_call .message-content {
  width: 100%;
}

.message-meta {
  color: var(--terminal-dim);
  font-size: var(--font-size-xs); /* Consistently smaller for metadata */
  flex-shrink: 0;
  margin-left: auto;
}

.message-tool_call .message-meta {
  display: none; /* Hide metadata for tool calls since they have their own styling */
}

.static-content {
  display: inline;
  font-size: var(--font-size-base); /* Consistent with other content */
}

/* Message type specific styling */
.message-system {
  opacity: 0.8;
  font-style: italic;
}

/* Steering messages — user input sent mid-agent-turn */
.message-human.is-steering .message-prefix {
  color: var(--terminal-dim);
}

.message-human.is-steering .message-content {
  opacity: 0.75;
  font-style: italic;
}

/* Compaction block — mirrors .tool-call / .tool-call-tool_use from ToolCallRenderer */
.compaction-block {
  font-family: var(--font-mono);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #4caf50; /* same as .tool-call-tool_use */
  border-radius: 6px;
  padding: var(--spacing-2);
  margin: var(--spacing-1) 0;
}

/* mirrors .tool-wrapper */
.compaction-wrapper {
  position: relative;
}

/* mirrors .tool-header inside DefaultToolRenderer */
.compaction-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) 0;
  font-weight: bold;
}

/* mirrors .tool-icon */
.compaction-tool-icon {
  font-size: 14px;
}

/* mirrors .tool-name with tool_use color */
.compaction-tool-name {
  color: #4caf50;
  flex: 1;
}

/* mirrors .response-toggle-header from ToolCallRenderer */
.compaction-toggle {
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
}

.compaction-toggle:hover {
  background: rgba(0, 255, 65, 0.1);
}

.compaction-toggle.expanded {
  background: rgba(0, 255, 65, 0.2);
}

.toggle-icon {
  font-size: 10px;
}

.compaction-body {
  margin-top: var(--spacing-2);
  animation: slideDown 0.2s ease-out;
}

.compaction-content {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
  font-size: var(--font-size-sm);
  color: var(--terminal-text);
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}

@keyframes slideDown {
  from { opacity: 0; max-height: 0; overflow: hidden; }
  to   { opacity: 1; max-height: 2000px; }
}
</style>
