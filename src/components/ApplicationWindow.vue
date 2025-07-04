<template>
  <div class="application-window" :class="`window-style-${windowStyle}`">
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
interface Props {
  title: string
  windowStyle?: 'macos' | 'linux' | 'windows'
  showMinimize?: boolean
  showMaximize?: boolean
  closeButtonTitle?: string
  contentClass?: string
}

withDefaults(defineProps<Props>(), {
  windowStyle: 'macos',
  showMinimize: false,
  showMaximize: false,
  closeButtonTitle: 'Close',
  contentClass: ''
})

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.application-window {
  display: flex;
  flex-direction: column;
  background-color: var(--window-bg);
  border-radius: var(--window-border-radius);
  overflow: hidden;
  box-shadow: var(--window-shadow);
  height: 100%;
  border: 1px solid var(--window-border-color);
}

/* Window Styles */
.window-style-macos {
  --window-bg: #2d2d2d;
  --window-border-radius: 12px;
  --window-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  --window-border-color: rgba(255, 255, 255, 0.1);
  --control-size: 12px;
  --control-spacing: 8px;
}

.window-style-linux {
  --window-bg: #1e1e1e;
  --window-border-radius: 4px;
  --window-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  --window-border-color: rgba(255, 255, 255, 0.15);
  --control-size: 14px;
  --control-spacing: 4px;
}

.window-style-windows {
  --window-bg: #0c0c0c;
  --window-border-radius: 8px;
  --window-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  --window-border-color: rgba(255, 255, 255, 0.12);
  --control-size: 16px;
  --control-spacing: 2px;
}

.window-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 40px;
  flex-shrink: 0;
}

.window-controls {
  display: flex;
  gap: var(--control-spacing);
  align-items: center;
  min-width: 60px;
}

.control-button {
  width: var(--control-size);
  height: var(--control-size);
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  transform: scale(1.1);
}

/* macOS Style Controls */
.window-style-macos .control-button.close {
  background-color: #ff5f57;
}

.window-style-macos .control-button.close:hover {
  background-color: #ff3b30;
}

.window-style-macos .control-button.close::after {
  content: '×';
  color: #000;
  font-size: 10px;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.window-style-macos .control-button.close:hover::after {
  opacity: 1;
}

.window-style-macos .control-button.minimize {
  background-color: #ffbd2e;
}

.window-style-macos .control-button.minimize:hover {
  background-color: #ffaa00;
}

.window-style-macos .control-button.maximize {
  background-color: #28ca42;
}

.window-style-macos .control-button.maximize:hover {
  background-color: #20a034;
}

/* Linux Style Controls */
.window-style-linux .control-button {
  background-color: #666;
  border-radius: 2px;
}

.window-style-linux .control-button:hover {
  background-color: #777;
}

.window-style-linux .control-button.close {
  background-color: #cc4125;
}

.window-style-linux .control-button.close:hover {
  background-color: #d73502;
}

.window-style-linux .control-button.close::after {
  content: '×';
  color: #fff;
  font-size: 12px;
  font-weight: bold;
}

/* Windows Style Controls */
.window-style-windows .control-button {
  background-color: #666;
  border-radius: 0;
}

.window-style-windows .control-button:hover {
  background-color: #777;
}

.window-style-windows .control-button.close {
  background-color: #e81123;
}

.window-style-windows .control-button.close:hover {
  background-color: #f1707a;
}

.window-style-windows .control-button.close::after {
  content: '×';
  color: #fff;
  font-size: 14px;
  font-weight: bold;
}

.window-title {
  font-size: 14px;
  color: var(--terminal-text, #fff);
  font-weight: 500;
  flex: 1;
  text-align: center;
  user-select: none;
}

.window-actions {
  min-width: 60px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.window-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Theme-sensitive text color */
[data-theme="matrix"] .window-title {
  color: #00ff00;
}

[data-theme="amber"] .window-title {
  color: #ffb000;
}

[data-theme="blue"] .window-title {
  color: #00aaff;
}

[data-theme="hacker"] .window-title {
  color: #00ff41;
}

[data-theme="light"] .window-title {
  color: #24292e;
}

[data-theme="light"] .application-window {
  --window-bg: #ffffff;
  --window-border-color: rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .window-header {
  background-color: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
