<template>
  <footer class="app-footer" :class="themeClasses">
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
          <SunIcon v-if="isDark" class="icon" />
          <MoonIcon v-else class="icon" />
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { SettingsIcon, SunIcon, MoonIcon } from "lucide-vue-next";
import { useTheme } from '../composables/useTheme'

interface Props {
  showSettings: boolean
}

interface Emits {
  (e: 'toggleSettings'): void
  (e: 'toggleTheme'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Use theme composable
const { themeClasses, isDark } = useTheme()
</script>

<style scoped>
.app-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid;
  min-height: 60px;
}

/* Light theme for footer */
.light.app-footer {
  background: #f8f9fa;
  border-top-color: #e0e0e0;
}

/* Dark theme for footer */
.dark.app-footer {
  background: #2d2d2d;
  border-top-color: #404040;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.footer-main {
  flex: 1;
  display: flex;
}

.footer-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.settings-btn,
.theme-btn {
  padding: 0.3rem 1rem;
  border: 1px solid;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
}

/* Light theme for buttons */
.light .settings-btn,
.light .theme-btn {
  color: #495057;
  border-color: #dee2e6;
}

.light .settings-btn:hover,
.light .theme-btn:hover,
.light .settings-btn.active {
  background: #e9ecef;
  color: #212529;
}

/* Dark theme for buttons */
.dark .settings-btn,
.dark .theme-btn {
  color: #adb5bd;
  border-color: #495057;
}

.dark .settings-btn:hover,
.dark .theme-btn:hover,
.dark .settings-btn.active {
  background: #495057;
  color: #f8f9fa;
}

.icon {
  width: 16px;
  height: 16px;
}

/* Responsive design */
@media (max-width: 768px) {
  .app-footer {
    padding: 0.75rem 1rem;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .footer-controls {
    justify-content: center;
  }
  
  .settings-btn,
  .theme-btn {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
