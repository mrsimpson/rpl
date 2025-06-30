<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <main class="main-container">

      <div class="content-area">
        <section class="conversation-area">
          <div v-if="!conversationData" class="source-input">
            <SourceInput @load-conversation="loadConversation" />
          </div>

          <div v-else class="terminal-container">
            <ConversationTerminal
              :conversation-data="conversationData"
              :settings="settings"
              @reset="resetConversation"
            />
          </div>
        </section>
      </div>

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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { SettingsIcon, SunIcon, MoonIcon } from "lucide-vue-next";
import SourceInput from "./components/SourceInput.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import ConversationTerminal from "./components/ConversationTerminal.vue";
import type { ConversationData, Settings } from "./types";

const isDarkMode = ref(true);
const showSettings = ref(false);
const conversationData = ref<ConversationData | null>(null);

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

const loadConversation = (data: ConversationData) => {
  conversationData.value = data;
  showSettings.value = false;
};

const resetConversation = () => {
  conversationData.value = null;
};

onMounted(() => {
  // Load saved preferences
  const savedDarkMode = localStorage.getItem("darkMode");
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === "true";
  }

  const savedSettings = localStorage.getItem("replaySettings");
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings));
  }

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sourceUrl = urlParams.get("source");
  if (sourceUrl) {
    // Auto-load from URL parameter
    console.log("Auto-loading from URL:", sourceUrl);
  }
});
</script>

<style scoped>
.icon {
  width: 16px;
  height: 16px;
}

.conversation-area {
  position: relative;
}

.terminal-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5vh 5vw;
  box-sizing: border-box;
}

.terminal-container :deep(.terminal-window) {
  width: 90vw;
  height: 90vh;
  max-width: 90vw;
  max-height: 90vh;
  min-width: 90vw;
  min-height: 90vh;
}

/* Settings Dialog */
.settings-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.settings-dialog {
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: var(--transition);
}

.close-btn:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.settings-content {
  padding: var(--spacing-3);
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}
</style>
