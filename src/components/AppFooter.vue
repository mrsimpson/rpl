<template>
  <footer class="app-footer">
    <div class="footer-content">
      <!-- Slot for page-specific content (playback controls, etc.) -->
      <div class="footer-main">
        <slot name="main"></slot>
      </div>
      
      <!-- Always present global controls -->
      <div class="footer-controls">
        <button
          @click="$emit('toggleSettings')"
          class="settings-btn"
          :class="{ active: showSettings }"
        >
          <SettingsIcon class="icon" />
          Settings
        </button>
        <button @click="$emit('toggleTheme')" class="theme-btn">
          <SunIcon v-if="isDarkMode" class="icon" />
          <MoonIcon v-else class="icon" />
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { SettingsIcon, SunIcon, MoonIcon } from "lucide-vue-next";

defineProps<{
  showSettings: boolean;
  isDarkMode: boolean;
}>();

defineEmits<{
  toggleSettings: [];
  toggleTheme: [];
}>();
</script>

<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--terminal-text);
  padding: 0.5rem 1rem;
  z-index: 1000;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--terminal-text);
}

.footer-main {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.footer-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.settings-btn,
.theme-btn {
  background: transparent;
  border: 1px solid var(--terminal-text);
  color: var(--terminal-text);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  transition: all 0.2s ease;
}

.settings-btn:hover,
.theme-btn:hover,
.settings-btn.active {
  background: var(--terminal-text);
  color: var(--terminal-bg);
}

.settings-btn .icon,
.theme-btn .icon {
  width: 12px;
  height: 12px;
}
</style>
