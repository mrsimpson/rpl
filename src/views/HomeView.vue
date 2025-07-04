<template>
  <div class="home-view">
    <div class="source-input">
      <SourceInput @load-conversation="handleLoadConversation" />
    </div>
  </div>

    <!-- Hackathon Badge -->
    <HackathonBadge />
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SourceInput from '../components/SourceInput.vue'
import { useConversationState } from '../composables/useConversationState'
import type { ConversationData } from '../types'
import HackathonBadge from '../components/HackathonBadge.vue'

const router = useRouter()
const { setLocalData } = useConversationState()

interface LoadConversationEvent {
  data: ConversationData
  source: string
  contextItems?: any[]
}

const handleLoadConversation = async (event: LoadConversationEvent) => {
  const { data, source, contextItems = [] } = event

  if (source === 'local') {
    // Local file loading - set data in composable and navigate
    setLocalData(data, contextItems)
    await router.push('/conversation')
  } else {
    // URL-based loading - navigate with URL parameter
    await router.push({
      path: '/conversation',
      query: { url: source }
    })
  }
}
</script>

<style scoped>
.home-view {
  height: calc(100vh - var(--footer-height));
  display: flex;
  align-items: center;
  justify-content: center;
}

.source-input {
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}
</style>
