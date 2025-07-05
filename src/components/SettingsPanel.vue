<template>
  <div class="settings-panel" :class="themeClasses">
    <div class="setting-group">
      <label>Animation Speeds</label>
      <div class="speed-controls">
        <div class="speed-control">
          <label for="human-speed">Human messages (ms/char)</label>
          <input
            id="human-speed"
            type="range"
            min="10"
            max="200"
            :value="settings.humanAnimationSpeed"
            @input="updateSetting('humanAnimationSpeed', Number(($event.target as HTMLInputElement).value))"
          />
          <span>{{ settings.humanAnimationSpeed }}ms</span>
        </div>
        
        <div class="speed-control">
          <label for="agent-speed">Agent messages (ms/char)</label>
          <input
            id="agent-speed"
            type="range"
            min="1"
            max="200"
            :value="settings.agentAnimationSpeed"
            @input="updateSetting('agentAnimationSpeed', Number(($event.target as HTMLInputElement).value))"
          />
          <span>{{ settings.agentAnimationSpeed }}ms</span>
        </div>
      </div>
    </div>

    <div class="setting-group">
      <label>Terminal Theme</label>
      <select :value="settings.terminalTheme" @change="updateSetting('terminalTheme', ($event.target as HTMLSelectElement).value as TerminalTheme)">
        <option value="matrix">Matrix Green</option>
        <option value="high-contrast">High Contrast</option>
      </select>
    </div>

    <div class="setting-group">
      <label>Window Style</label>
      <select :value="settings.windowStyle" @change="updateSetting('windowStyle', ($event.target as HTMLSelectElement).value as WindowStyle)">
        <option value="auto">Auto-detect</option>
        <option value="macos">macOS</option>
        <option value="linux">Linux</option>
        <option value="windows">Windows</option>
      </select>
    </div>

    <div class="setting-group">
      <label>App Theme</label>
      <div class="theme-controls">
        <button @click="toggleTheme" class="theme-toggle-btn">
          {{ isDark ? '🌙 Dark Mode' : '☀️ Light Mode' }}
        </button>
        <span class="theme-info">
          {{ isDark ? 'Dark theme active' : 'Light theme active' }}
        </span>
      </div>
    </div>

    <div class="setting-group">
      <label>Visual Options</label>
      <div class="checkbox-options">
        <label class="checkbox-option">
          <input
            type="checkbox"
            :checked="settings.showProgress"
            @change="updateSetting('showProgress', ($event.target as HTMLInputElement).checked)"
          />
          <span>Show progress indicators</span>
        </label>
        
        <label class="checkbox-option">
          <input
            type="checkbox"
            :checked="settings.showGhostPreview"
            @change="updateSetting('showGhostPreview', ($event.target as HTMLInputElement).checked)"
          />
          <span>Ghost preview of next message</span>
        </label>
        
        <label class="checkbox-option">
          <input
            type="checkbox"
            :checked="settings.enableSounds"
            @change="updateSetting('enableSounds', ($event.target as HTMLInputElement).checked)"
          />
          <span>Enable sound effects</span>
        </label>
      </div>
    </div>

    <div class="setting-group">
      <button @click="resetSettings" class="reset-btn">
        Reset to Defaults
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import type { Settings, TerminalTheme, WindowStyle } from '../types'

interface Props {
  settings: Settings
}

interface Props {
  settings: Settings
}

interface Emits {
  (e: 'update-settings', settings: Partial<Settings>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Use theme composable
const { themeClasses, isDark, toggleTheme } = useTheme()
void props;
// Props and emit are used in template and methods

const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
  emit('update-settings', { [key]: value })
}

const resetSettings = () => {
  emit('update-settings', {
    humanAnimationSpeed: 50,
    agentAnimationSpeed: 30,
    terminalTheme: 'matrix',
    windowStyle: 'auto',
    showProgress: true,
    showGhostPreview: true,
    enableSounds: false,
    contextPanelWidth: 400,
  })
}
</script>

<style scoped>
.settings-panel {
  padding: 0;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group > label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.speed-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.speed-control label {
  font-size: 0.8rem;
  opacity: 0.8;
}

.speed-control input[type="range"] {
  width: 100%;
  margin: 0.25rem 0;
}

.speed-control span {
  font-size: 0.8rem;
  text-align: right;
  opacity: 0.8;
}

.setting-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
}

/* Light theme for form elements */
.light select {
  background: #ffffff;
  color: #000000;
  border-color: #e0e0e0;
}

.light select:focus {
  outline: none;
  border-color: #007acc;
}

/* Dark theme for form elements */
.dark select {
  background: #2d2d2d;
  color: #ffffff;
  border-color: #404040;
}

.dark select:focus {
  outline: none;
  border-color: #66ccff;
}

.theme-controls {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.theme-toggle-btn {
  padding: 0.75rem 1rem;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Light theme for theme toggle */
.light .theme-toggle-btn {
  background: #f8f9fa;
  color: #000000;
  border-color: #e0e0e0;
}

.light .theme-toggle-btn:hover {
  background: #e9ecef;
}

/* Dark theme for theme toggle */
.dark .theme-toggle-btn {
  background: #2d2d2d;
  color: #ffffff;
  border-color: #404040;
}

.dark .theme-toggle-btn:hover {
  background: #404040;
}

.theme-info {
  font-size: 0.8rem;
  opacity: 0.8;
  text-align: center;
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
}

.checkbox-option input[type="checkbox"] {
  margin: 0;
}

.reset-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.reset-btn:hover {
  background-color: #c82333;
}
</style>
