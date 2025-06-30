<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <main class="main-container">

      <div class="content-area">
        <section class="conversation-area">
          <!-- Loading state -->
          <div v-if="loading" class="loading-container">
            <div class="loading-message">
              <div class="spinner"></div>
              <p>Loading conversation...</p>
            </div>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="error-container">
            <div class="error-message">
              <h3>Error Loading Conversation</h3>
              <p>{{ error }}</p>
              <p class="redirect-message">Redirecting to home in a few seconds...</p>
            </div>
          </div>

          <!-- Source input (home state) -->
          <div v-else-if="!conversationData" class="source-input">
            <SourceInput @load-conversation="loadConversation" />
          </div>

          <!-- Conversation terminal -->
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

    <!-- Hackathon Badge -->
    <HackathonBadge />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { SettingsIcon, SunIcon, MoonIcon } from "lucide-vue-next";
import SourceInput from "./components/SourceInput.vue";
import SettingsPanel from "./components/SettingsPanel.vue";
import ConversationTerminal from "./components/ConversationTerminal.vue";
import HackathonBadge from "./components/HackathonBadge.vue";
import { TextFormatParser } from "./parsers/TextFormatParser";
import { JsonFormatParser } from "./parsers/JsonFormatParser";
import { FileSourceAdapter } from "./adapters/FileSourceAdapter";
import { GistSourceAdapter } from "./adapters/GistSourceAdapter";
import type { ConversationData, Settings } from "./types";

const route = useRoute();
const router = useRouter();

const isDarkMode = ref(true);
const showSettings = ref(false);
const conversationData = ref<ConversationData | null>(null);
const loading = ref(false);
const error = ref("");

const settings = reactive<Settings>({
  humanAnimationSpeed: 50,
  agentAnimationSpeed: 30,
  theme: "matrix",
  windowStyle: "macos",
  showProgress: true,
  showGhostPreview: true,
  enableSounds: false,
});

// Computed property to get conversation URL from route
const conversationUrl = computed(() => route.query.url as string);

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
  error.value = "";
};

const resetConversation = () => {
  conversationData.value = null;
  error.value = "";
  // Navigate to home route
  router.push('/');
};

const loadConversationFromUrl = async (url: string) => {
  if (!url) return;

  loading.value = true;
  error.value = "";

  try {
    // Determine source adapter
    const adapter = url.includes('gist.github.com')
      ? new GistSourceAdapter()
      : new FileSourceAdapter();

    // Fetch content
    const content = await adapter.fetchContent(url);

    // Auto-detect format
    const parser = detectFormat(content) === 'json'
      ? new JsonFormatParser()
      : new TextFormatParser();

    const data = await parser.parse(content);
    loadConversation(data);

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load conversation';
    // Redirect to home on error
    setTimeout(() => {
      router.push('/');
    }, 3000);
  } finally {
    loading.value = false;
  }
};

const detectFormat = (content: string): 'json' | 'text' => {
  try {
    JSON.parse(content);
    return 'json';
  } catch {
    return 'text';
  }
};

// Watch for route changes to load conversation from URL
watch(conversationUrl, (newUrl) => {
  if (newUrl && route.name === 'Conversation') {
    loadConversationFromUrl(newUrl);
  }
}, { immediate: true });

// Watch for route changes to reset state when going to home
watch(() => route.name, (newRouteName) => {
  if (newRouteName === 'Home') {
    conversationData.value = null;
    error.value = "";
    loading.value = false;
  }
});

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
});
</script>

<style scoped>
.icon {
  width: 16px;
  height: 16px;
}

/* Loading state */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.loading-message {
  text-align: center;
  color: var(--color-text-primary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-border);
  border-top: 4px solid var(--color-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error state */
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
}

.error-message {
  text-align: center;
  color: var(--color-text-primary);
  max-width: 500px;
  padding: 2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-bg-secondary);
}

.error-message h3 {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.redirect-message {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-top: 1rem;
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
