<template>
  <div class="default-tool">
    <div class="tool-header">
      <span class="tool-icon">🛠️</span>
      <span class="tool-title">{{ getToolName() }}</span>
    </div>

    <div class="tool-content">
      <pre class="yaml-content">{{ formatAsYaml() }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  toolData: any;
}>();

const getToolName = (): string => {
  return props.toolData.name || "Unknown Tool";
};

const formatAsYaml = (): string => {
  const data = { ...props.toolData };

  // Remove the name from the data since it's in the header
  delete data.name;

  return convertToYaml(data, 0);
};

const convertToYaml = (obj: any, indent: number = 0): string => {
  const spaces = "  ".repeat(indent);

  if (obj === null || obj === undefined) {
    return "null";
  }

  if (typeof obj === "string") {
    // Handle multiline strings
    if (obj.includes("\n")) {
      return (
        "|\n" +
        obj
          .split("\n")
          .map((line) => spaces + "  " + line)
          .join("\n")
      );
    }
    return `"${obj.replace(/"/g, '\\"')}"`;
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return (
      "\n" +
      obj
        .map(
          (item) =>
            spaces + "- " + convertToYaml(item, indent + 1).replace(/^\n/, "")
        )
        .join("\n")
    );
  }

  if (typeof obj === "object") {
    const entries = Object.entries(obj);
    if (entries.length === 0) return "{}";

    return entries
      .map(([key, value]) => {
        const yamlValue = convertToYaml(value, indent + 1);
        if (yamlValue.startsWith("\n")) {
          return `${spaces}${key}:${yamlValue}`;
        } else {
          return `${spaces}${key}: ${yamlValue}`;
        }
      })
      .join("\n");
  }

  return String(obj);
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

.tool-content {
  padding: var(--spacing-1) 0;
}

.yaml-content {
  margin: 0;
  margin-left: 2rem;
  padding: var(--spacing-1) 0;
  color: var(--terminal-text);
  font-family: var(--font-mono);
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 300px;
  overflow-y: auto;
}
</style>
