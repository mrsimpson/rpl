<template>
  <div class="fs-write-tool">
    <div class="tool-header">
        <span class="tool-icon">🛠️</span>
      <span class="tool-title">Write file</span>
      <span class="file-path">{{ getFilePath() }}</span>
    </div>
    
    <div v-if="isStringReplace()" class="tool-content">
      <div class="diff-container">
        <div class="diff-header">String replacement:</div>
        <div class="diff-content">
          <div class="diff-viewer">
            <div 
              v-for="(line, index) in getDiffLines()" 
              :key="index"
              :class="getDiffLineClass(line)"
              class="diff-line"
            >
              {{ line }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  toolData: any
}>()

const getFilePath = (): string => {
  if (props.toolData.args?.path) {
    return props.toolData.args.path
  }
  return 'unknown path'
}

const isStringReplace = (): boolean => {
  return props.toolData.args?.command === 'str_replace' &&
         props.toolData.args?.old_str &&
         props.toolData.args?.new_str
}

const getDiffLines = (): string[] => {
  const oldStr = props.toolData.args.old_str || ''
  const newStr = props.toolData.args.new_str || ''
  
  const oldLines = oldStr.split('\n')
  const newLines = newStr.split('\n')
  
  const diff: string[] = []
  
  // Add removed lines (prefixed with -)
  oldLines.forEach((line: string) => {
    diff.push(`- ${line}`)
  })
  
  // Add added lines (prefixed with +)
  newLines.forEach((line: string) => {
    diff.push(`+ ${line}`)
  })
  
  return diff
}

const getDiffLineClass = (line: string): string => {
  if (line.startsWith('- ')) return 'diff-removed'
  if (line.startsWith('+ ')) return 'diff-added'
  if (line === '---') return 'diff-separator'
  return 'diff-context'
}
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

.tool-content {
  padding: var(--spacing-1) 0;
}

.diff-header {
  padding: var(--spacing-1) 0;
  font-weight: bold;
  color: var(--terminal-text);
  font-size: var(--font-size-sm);
}

.diff-content {
  background-color: rgba(255, 255, 255, 0.03);
}

.diff-viewer {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.4;
}

.diff-line {
  padding: 2px var(--spacing-1);
  white-space: pre;
  color: var(--terminal-text);
}

.diff-removed {
  background-color: rgba(255, 0, 0, 0.15);
  color: #ff6b6b;
}

.diff-added {
  background-color: rgba(0, 255, 0, 0.15);
  color: #51cf66;
}

.diff-separator {
  background-color: rgba(128, 128, 128, 0.1);
  color: var(--terminal-dim);
  text-align: center;
  font-weight: bold;
}

.diff-context {
  color: var(--terminal-text);
}

/* Theme-specific overrides for better contrast */
[data-theme="light"] .diff-removed {
  background-color: rgba(255, 0, 0, 0.1);
  color: #d63031;
}

[data-theme="light"] .diff-added {
  background-color: rgba(0, 255, 0, 0.1);
  color: #00b894;
}

[data-theme="matrix"] .diff-removed {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff7675;
}

[data-theme="matrix"] .diff-added {
  background-color: rgba(0, 255, 0, 0.2);
  color: #00ff00;
}

[data-theme="amber"] .diff-removed {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff6348;
}

[data-theme="amber"] .diff-added {
  background-color: rgba(0, 255, 0, 0.2);
  color: #2ed573;
}

[data-theme="blue"] .diff-removed {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff6b9d;
}

[data-theme="blue"] .diff-added {
  background-color: rgba(0, 255, 0, 0.2);
  color: #7bed9f;
}

[data-theme="hacker"] .diff-removed {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff4757;
}

[data-theme="hacker"] .diff-added {
  background-color: rgba(0, 255, 0, 0.2);
  color: #2ed573;
}
</style>
