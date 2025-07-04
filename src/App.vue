<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <main class="main-container">
      <!-- Router view for different pages -->
      <router-view :settings="settings" />

      <!-- Settings Dialog -->
      <div
        v-if="showSettings"
        class="settings-dialog-overlay"
        @click="closeSettings"
      >
        <div class="settings-dialog" @click.stop>
          <div class="settings-header">
            <h3>Settings</h3>
            <button @click="closeSettings" class="close-btn">×</button>
          </div>
          <div class="settings-content">
            <SettingsPanel
              :settings="settings"
              @update-settings="updateSettings"
            />
          </div>
        </div>
      </div>

      <!-- App Footer with slot for page-specific content -->
      <AppFooter
        :show-settings="showSettings"
        :is-dark-mode="isDarkMode"
        @toggle-settings="toggleSettings"
        @toggle-theme="toggleDarkMode"
      >
        <template #main>
          <router-view name="footer" :settings="settings" />
        </template>
      </AppFooter>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import AppFooter from "./components/AppFooter.vue";
import type { Settings } from "./types";

const isDarkMode = ref(true);
const showSettings = ref(false);

const settings = reactive<Settings>({
  humanAnimationSpeed: 50,
  agentAnimationSpeed: 30,
  theme: "matrix",
  windowStyle: "macos",
  showProgress: true,
  showGhostPreview: true,
  enableSounds: false,
  contextPanelWidth: 400, // Default context panel width in pixels
});

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", String(isDarkMode.value));
};

const toggleSettings = () => {
  showSettings.value = !showSettings.value;
};

const closeSettings = () => {
  showSettings.value = false;
};

const updateSettings = (newSettings: Partial<Settings>) => {
  Object.assign(settings, newSettings);
  localStorage.setItem("replaySettings", JSON.stringify(settings));
};

// Load settings from localStorage on mount
onMounted(() => {
  const savedSettings = localStorage.getItem("replaySettings");
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings);
      Object.assign(settings, parsed);
    } catch (e) {
      console.warn("Failed to parse saved settings:", e);
    }
  }

  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === "true";
  }
});
</script>

<style>
/* Global styles remain the same */
.app {
  min-height: 100vh;
  background: var(--terminal-bg);
  color: var(--terminal-text);
  font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Ubuntu Mono', monospace;
  transition: all 0.3s ease;
}

.main-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.settings-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.settings-dialog {
  background: var(--terminal-bg);
  border: 2px solid var(--terminal-text);
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--terminal-text);
}

.settings-header h3 {
  margin: 0;
  color: var(--terminal-text);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--terminal-text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--terminal-text);
  color: var(--terminal-bg);
  border-radius: 50%;
}

.settings-content {
  padding: 1rem;
  max-height: 60vh;
  overflow-y: auto;
}

/* Dark mode styles */
.dark-mode {
  --terminal-bg: #000000;
  --terminal-text: #00ff00;
}

/* Theme variables are set in style.css */
</style>
