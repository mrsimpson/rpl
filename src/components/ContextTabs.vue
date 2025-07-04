<template>
  <div class="context-tabs">
    <div class="tabs-header">
      <button
        v-for="(item, index) in items"
        :key="item.id"
        @click="$emit('tabChange', index)"
        class="tab-button"
        :class="{ 'tab-button--active': index === activeIndex }"
        :title="item.filename"
      >
        <component :is="getIconForType(item.type)" class="tab-icon" />
        <span class="tab-label">{{ getTabLabel(item) }}</span>
        <span class="tab-range">{{ formatMessageRange(item.messageRange) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  ImageIcon, 
  VideoIcon, 
  FileTextIcon, 
  CodeIcon, 
  VolumeXIcon,
  FileIcon 
} from 'lucide-vue-next'
import type { ContextItem } from '../types'

interface Props {
  items: ContextItem[]
  activeIndex: number
}

interface Emits {
  tabChange: [index: number]
}

defineProps<Props>()
defineEmits<Emits>()

// Methods
const getIconForType = (type: ContextItem['type']) => {
  switch (type) {
    case 'image': return ImageIcon
    case 'video': return VideoIcon
    case 'document': return FileTextIcon
    case 'code': return CodeIcon
    case 'audio': return VolumeXIcon
    default: return FileIcon
  }
}

const getTabLabel = (item: ContextItem): string => {
  // Extract meaningful name from filename
  const name = item.filename.split('.')[0]
  
  // Remove message range prefix if it exists
  const cleanName = name.replace(/^\d+(-\d+)?-?/, '')
  
  if (cleanName) {
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1)
  }
  
  // Fallback to type
  return item.type.charAt(0).toUpperCase() + item.type.slice(1)
}

const formatMessageRange = (range: number[]): string => {
  if (range.length === 1) {
    return `#${range[0]}`
  }
  
  if (range.length === 2 && range[1] === range[0] + 1) {
    return `#${range[0]}-${range[1]}`
  }
  
  const min = Math.min(...range)
  const max = Math.max(...range)
  
  if (max === min) {
    return `#${min}`
  }
  
  return `#${min}-${max}`
}
</script>

<style scoped>
.context-tabs {
  border-bottom: 1px solid var(--terminal-text);
  background: rgba(0, 0, 0, 0.1);
}

.tabs-header {
  display: flex;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--terminal-text) transparent;
}

.tabs-header::-webkit-scrollbar {
  height: 4px;
}

.tabs-header::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-header::-webkit-scrollbar-thumb {
  background: var(--terminal-text);
  border-radius: 2px;
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--terminal-text);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 0;
  font-family: var(--font-mono);
  font-size: 0.8rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.05);
  border-bottom-color: var(--terminal-text);
}

.tab-button--active {
  background: rgba(255, 255, 255, 0.1);
  border-bottom-color: var(--terminal-accent, var(--terminal-text));
  color: var(--terminal-accent, var(--terminal-text));
}

.tab-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.tab-label {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.tab-range {
  font-size: 0.7rem;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  flex-shrink: 0;
}

.tab-button--active .tab-range {
  background: var(--terminal-accent, var(--terminal-text));
  color: var(--terminal-bg);
  opacity: 1;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .tab-button {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .tab-label {
    max-width: 80px;
  }
  
  .tab-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
