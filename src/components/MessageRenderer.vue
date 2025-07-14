<template>
  <div
    class="message"
    :class="[`message-${message.type}`, { 'is-current': isCurrent }]"
  >
    <div class="message-line">
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
import { computed } from "vue";
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

const messagePrefix = computed(() => {
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
</style>
