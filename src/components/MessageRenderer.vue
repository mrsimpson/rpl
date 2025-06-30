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
        />
        <TypewriterText
          v-else-if="isCurrent"
          :text="message.content"
          :speed="getAnimationSpeed()"
          @complete="$emit('animationComplete')"
        />
        <span v-else class="static-content">{{ message.content }}</span>
      </span>
      <span class="message-meta">
        {{ message.type }}
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
}>();

defineEmits<{
  animationComplete: [];
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
  padding: var(--spacing-1) 0;
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  padding-left: var(--spacing-2);
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
}

.message-meta {
  color: var(--terminal-dim);
}

.message-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  width: 100%;
  max-width: 100%;
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
  font-size: var(--font-size-sm);
  flex-shrink: 0;
  margin-left: auto;
}

.message-tool_call .message-meta {
  display: none;
}

.static-content {
  display: inline;
}
</style>
