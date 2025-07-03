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

      <footer class="app-footer">
        <div class="instructions">
          <span><kbd>Enter</kbd> Next message</span>
          <span><kbd>Tab</kbd> Complete current</span>
          <span><kbd>Esc</kbd> Reset</span>
          <button
            @click="toggleSettings"
            class="settings-btn"
            :class="{ active: showSettings }"
          >
            <SettingsIcon class="icon" />
            Settings
          </button>
          <button @click="toggleDarkMode" class="theme-btn">
            <SunIcon v-if="isDarkMode" class="icon" />
            <MoonIcon v-else class="icon" />
          </button>
        </div>
      </footer>
    </main>

    <!-- Hackathon Badge -->
    <HackathonBadge />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { SettingsIcon, SunIcon, MoonIcon } from "lucide-vue-next";
import SettingsPanel from "./components/SettingsPanel.vue";
import HackathonBadge from "./components/HackathonBadge.vue";
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

.instructions {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--terminal-text);
}

.instructions kbd {
  background: var(--terminal-text);
  color: var(--terminal-bg);
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.7rem;
  font-weight: bold;
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
  margin-left: auto;
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
