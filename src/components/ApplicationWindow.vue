<template>
  <div class="application-window" :class="[themeClasses, windowStyleClasses]">
    <!-- Window Header -->
    <div class="window-header">
      <div class="window-controls">
        <div 
          class="control-button close" 
          @click="$emit('close')"
          :title="closeButtonTitle"
        ></div>
        <div class="control-button minimize" v-if="showMinimize"></div>
        <div class="control-button maximize" v-if="showMaximize"></div>
      </div>
      <div class="window-title">{{ title }}</div>
      <div class="window-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Window Content -->
    <div class="window-content" :class="contentClass">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import { useOSStyle } from '../composables/useOSStyle'
import type { WindowStyle } from '../types/theme'

interface Props {
  title: string
  windowStyle?: WindowStyle
  showMinimize?: boolean
  showMaximize?: boolean
  closeButtonTitle?: string
  contentClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  windowStyle: 'auto',
  showMinimize: false,
  showMaximize: false,
  closeButtonTitle: 'Close',
  contentClass: ''
})

// Use theme composables
const { themeClasses } = useTheme()
const { windowStyleClasses } = useOSStyle(props.windowStyle)

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.application-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* Light theme for window */
.light.application-window {
  background: #ffffff;
  border: 1px solid #e0e0e0;
}

/* Dark theme for window */
.dark.application-window {
  background: #1a1a1a;
  border: 1px solid #404040;
}

/* OS-specific window styling */
.macos.application-window {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.windows.application-window {
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.linux.application-window {
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.window-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid;
  min-height: 44px;
}

/* Light theme for window header */
.light .window-header {
  background: #f8f9fa;
  border-bottom-color: #e0e0e0;
  color: #000000;
}

/* Dark theme for window header */
.dark .window-header {
  background: #2d2d2d;
  border-bottom-color: #404040;
  color: #ffffff;
}

.window-controls {
  display: flex;
  gap: 8px;
  margin-right: 16px;
  align-items: center;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
}

/* macOS style controls */
.macos .control-button.close {
  background-color: #ff5f57;
}

.macos .control-button.close:hover {
  background-color: #ff3b30;
}

.macos .control-button.close::after {
  content: '×';
  color: #000;
}

.macos .control-button.minimize {
  background-color: #ffbd2e;
}

.macos .control-button.minimize::after {
  content: '−';
  color: #000;
}

.macos .control-button.maximize {
  background-color: #28ca42;
}

.macos .control-button.maximize::after {
  content: '+';
  color: #000;
}

/* Linux/Windows style controls */
.linux .control-button,
.windows .control-button {
  background-color: #666;
  color: #fff;
}

.linux .control-button {
  border-radius: 2px;
}

.windows .control-button {
  border-radius: 0;
}

.linux .control-button.close::after,
.windows .control-button.close::after {
  content: '×';
}

.linux .control-button.minimize::after,
.windows .control-button.minimize::after {
  content: '−';
}

.linux .control-button.maximize::after,
.windows .control-button.maximize::after {
  content: '□';
}

.window-title {
  flex: 1;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
}

.window-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.window-content {
  flex: 1;
  overflow: auto;
  padding: 16px;
}

/* Allow zero padding when content needs full area */
.window-content.no-padding {
  padding: 0;
}

/* Light theme for content */
.light .window-content {
  background: #ffffff;
  color: #000000;
}

/* Dark theme for content */
.dark .window-content {
  background: #1a1a1a;
  color: #ffffff;
}

/* Responsive design */
@media (max-width: 768px) {
  .application-window {
    border-radius: 0;
    height: 100vh;
  }
  
  .window-header {
    padding: 8px 12px;
    min-height: 40px;
  }
  
  .window-title {
    font-size: 13px;
  }
  
  .window-content {
    padding: 12px;
  }
}
</style>
