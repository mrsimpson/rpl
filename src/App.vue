<template>
  <div class="app" :class="themeClasses">
    <main class="main-container">
      <!-- Router view for different pages -->
      <router-view :settings="settings" />

      <!-- Settings Dialog -->
      <div
        v-if="showSettings"
        class="settings-dialog-overlay"
        @click="closeSettings"
      >
        <div
          class="settings-dialog"
          :class="[themeClasses, windowStyleClasses]"
          @click.stop
        >
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
        @toggle-settings="toggleSettings"
        @toggle-theme="toggleTheme"
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
import { useTheme, ensureThemeInitialized } from "./composables/useTheme";
import { useOSStyle, ensureOSStyleInitialized } from "./composables/useOSStyle";
import type { Settings } from "./types";

// Initialize theme and OS detection systems
ensureThemeInitialized();
ensureOSStyleInitialized();

// Use theme and OS style composables
const { themeClasses, toggleTheme } = useTheme();
const { windowStyleClasses } = useOSStyle();

const showSettings = ref(false);

const settings = reactive<Settings>({
  humanAnimationSpeed: 50,
  agentAnimationSpeed: 30,
  terminalTheme: "matrix", // NEW: Simplified terminal theme
  windowStyle: "auto", // NEW: Auto-detect OS style
  showProgress: true,
  showGhostPreview: true,
  enableSounds: false,
  contextPanelWidth: 400,
});

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
      // Only apply valid settings, ignore old 'theme' field
      const validSettings: Partial<Settings> = {
        humanAnimationSpeed: parsed.humanAnimationSpeed,
        agentAnimationSpeed: parsed.agentAnimationSpeed,
        terminalTheme: parsed.terminalTheme || "matrix",
        windowStyle: parsed.windowStyle || "auto",
        showProgress: parsed.showProgress,
        showGhostPreview: parsed.showGhostPreview,
        enableSounds: parsed.enableSounds,
        contextPanelWidth: parsed.contextPanelWidth,
        showContextPanel: parsed.showContextPanel,
        pauseOnContext: parsed.pauseOnContext,
        autoShowContext: parsed.autoShowContext,
      };
      Object.assign(settings, validSettings);
    } catch (e) {
      console.warn("Failed to parse saved settings:", e);
    }
  }
});
</script>

<style>
/* Minimal global styles - theme-aware components handle their own styling */
.app {
  min-height: 100vh;
  font-family: "Fira Code", "Monaco", "Cascadia Code", "Ubuntu Mono", monospace;
  transition: all 0.3s ease;
}

/* Light theme for app */
.app.light {
  background: #ffffff;
  color: #000000;
}

/* Dark theme for app */
.app.dark {
  background: #1a1a1a;
  color: #ffffff;
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
  border: 2px solid;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Light theme for settings dialog */
.settings-dialog.light {
  background: #ffffff;
  border-color: #e0e0e0;
}

/* Dark theme for settings dialog */
.settings-dialog.dark {
  background: #1a1a1a;
  border-color: #404040;
}

/* OS-specific styling for settings dialog */
.settings-dialog.macos {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.settings-dialog.windows {
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.settings-dialog.linux {
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid;
}

.settings-header.light {
  background: #f8f9fa;
  border-bottom-color: #e0e0e0;
}

.settings-header.dark {
  background: #2d2d2d;
  border-bottom-color: #404040;
}

.settings-header h3 {
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.light .close-btn {
  color: #000000;
}

.dark .close-btn {
  color: #ffffff;
}

.close-btn:hover {
  transform: scale(1.1);
}

.light .close-btn:hover {
  background: #e0e0e0;
}

.dark .close-btn:hover {
  background: #404040;
}

.settings-content {
  padding: 1rem;
  overflow-y: auto;
}
</style>
