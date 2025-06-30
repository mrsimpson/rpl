<template>
  <div class="app" :class="{ 'dark-mode': isDarkMode }">
    <main class="main-container">
      <header class="app-header">
        <h1 class="app-title">LLM Conversation Replay</h1>
        <div class="header-controls">
          <button @click="toggleSettings" class="settings-btn" :class="{ active: showSettings }">
            <SettingsIcon class="icon" />
            Settings
          </button>
          <button @click="toggleDarkMode" class="theme-btn">
            <SunIcon v-if="isDarkMode" class="icon" />
            <MoonIcon v-else class="icon" />
          </button>
        </div>
      </header>

      <div class="content-area">
        <aside v-if="showSettings" class="settings-panel">
          <SettingsPanel 
            :settings="settings"
            @update-settings="updateSettings"
          />
        </aside>

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

      <footer class="app-footer">
        <div class="instructions">
          <span><kbd>Enter</kbd> Next message</span>
          <span><kbd>Tab</kbd> Complete current</span>
          <span><kbd>Esc</kbd> Reset</span>
        </div>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SettingsIcon, SunIcon, MoonIcon } from 'lucide-vue-next'
import SourceInput from './components/SourceInput.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ConversationTerminal from './components/ConversationTerminal.vue'
import type { ConversationData, Settings } from './types'

const isDarkMode = ref(true)
const showSettings = ref(false)
const conversationData = ref<ConversationData | null>(null)

const settings = reactive<Settings>({
  humanAnimationSpeed: 50,
  agentAnimationSpeed: 30,
  theme: 'matrix',
  windowStyle: 'macos',
  showProgress: true,
  showGhostPreview: true,
  enableSounds: false
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', String(isDarkMode.value))
}

const toggleSettings = () => {
  showSettings.value = !showSettings.value
}

const updateSettings = (newSettings: Partial<Settings>) => {
  Object.assign(settings, newSettings)
  localStorage.setItem('replaySettings', JSON.stringify(settings))
}

const loadConversation = (data: ConversationData) => {
  conversationData.value = data
  showSettings.value = false
}

const resetConversation = () => {
  conversationData.value = null
}

onMounted(() => {
  // Load saved preferences
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  }

  const savedSettings = localStorage.getItem('replaySettings')
  if (savedSettings) {
    Object.assign(settings, JSON.parse(savedSettings))
  }

  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search)
  const sourceUrl = urlParams.get('source')
  if (sourceUrl) {
    // Auto-load from URL parameter
    console.log('Auto-loading from URL:', sourceUrl)
  }
})
</script>

<style scoped>
.icon {
  width: 16px;
  height: 16px;
}
</style>