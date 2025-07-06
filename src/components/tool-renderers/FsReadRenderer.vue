<template>
  <div class="fs-read-tool">
    <div class="tool-header">
      <span class="tool-icon">🛠️</span>
      <span class="tool-title">Read file</span>
      <span class="file-path">{{ getFilePath() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  toolData: any;
}>();

const getFilePath = (): string => {
  if (props.toolData.args?.path) {
    return props.toolData.args.path;
  }
  return "unknown path";
};
</script>

<style scoped>
.tool-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) 0;
  font-weight: bold;
}

.tool-title {
  color: var(--terminal-text);
}

.file-path {
  color: var(--terminal-text);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
}
</style>
