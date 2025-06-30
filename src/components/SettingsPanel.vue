<template>
  <div class="settings-panel">
    <h3>Settings</h3>
    
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
      <select :value="settings.theme" @change="updateSetting('theme', ($event.target as HTMLSelectElement).value)">
        <option value="matrix">Matrix Green</option>
        <option value="amber">Amber Monochrome</option>
        <option value="blue">Blue Terminal</option>
        <option value="hacker">Hacker Dark</option>
        <option value="light">Light Mode</option>
      </select>
    </div>

    <div class="setting-group">
      <label>Window Style</label>
      <select :value="settings.windowStyle" @change="updateSetting('windowStyle', ($event.target as HTMLSelectElement).value)">
        <option value="macos">macOS</option>
        <option value="linux">Linux</option>
        <option value="windows">Windows</option>
      </select>
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
          <span>Enable typing sounds</span>
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
import type { Settings } from '../types'

defineProps<{
  settings: Settings
}>()

const emit = defineEmits<{
  updateSettings: [settings: Partial<Settings>]
}>()

const updateSetting = (key: keyof Settings, value: any) => {
  emit('updateSettings', { [key]: value })
}

const resetSettings = () => {
  emit('updateSettings', {
    humanAnimationSpeed: 50,
    agentAnimationSpeed: 30,
    theme: 'matrix',
    windowStyle: 'macos',
    showProgress: true,
    showGhostPreview: true,
    enableSounds: false
  })
}
</script>