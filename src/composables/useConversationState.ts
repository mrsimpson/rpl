import { ref, readonly } from 'vue'
import type { ConversationData } from '../types'
import { TextFormatParser } from '../parsers/TextFormatParser'
import { JsonFormatParser } from '../parsers/JsonFormatParser'
import { FileSourceAdapter } from '../adapters/FileSourceAdapter'
import { GistSourceAdapter } from '../adapters/GistSourceAdapter'

// Global state for conversation management
const conversationData = ref<ConversationData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const contextItems = ref<any[]>([])
const contextLoading = ref(false)

export function useConversationState() {
  
  const setConversationData = (data: ConversationData) => {
    conversationData.value = data
    error.value = null
  }

  const setError = (errorMessage: string) => {
    error.value = errorMessage
    loading.value = false
    contextLoading.value = false
  }

  const clearData = () => {
    conversationData.value = null
    error.value = null
    loading.value = false
    contextItems.value = []
    contextLoading.value = false
  }

  const setLocalData = (data: ConversationData, contexts: any[] = []) => {
    setConversationData(data)
    contextItems.value = contexts
  }

  const loadFromUrl = async (url: string) => {
    if (!url) {
      setError('No URL provided')
      return
    }

    loading.value = true
    error.value = null

    try {
      // Handle demo case
      if (url === 'demo') {
        const demoData = {
          metadata: {
            title: 'Demo Conversation',
            timestamp: new Date().toISOString(),
            format: 'text',
            source: 'demo'
          },
          messages: [
            {
              id: '1',
              type: 'human' as const,
              content: 'Hello! Can you help me understand how this conversation replay works?',
              timestamp: new Date().toISOString(),
              metadata: {}
            },
            {
              id: '2', 
              type: 'agent' as const,
              content: 'Of course! This is a demo conversation showing how the LLM Conversation Replay Player works. You can use keyboard controls like Enter to advance messages, Tab to complete typing animations, and Esc to reset. The interface mimics a terminal environment with typewriter effects.',
              timestamp: new Date().toISOString(),
              metadata: {}
            }
          ]
        }
        setConversationData(demoData)
        loading.value = false
        return
      }

      // Select appropriate source adapter
      const sourceAdapter = url.includes('gist.github.com') || url.includes('gist.githubusercontent.com')
        ? new GistSourceAdapter()
        : new FileSourceAdapter()

      // Fetch content
      const content = await sourceAdapter.fetchContent(url)

      // Determine format and parse
      let parser
      try {
        JSON.parse(content)
        parser = new JsonFormatParser()
      } catch {
        parser = new TextFormatParser()
      }

      const data = await parser.parse(content)
      setConversationData(data)

      // Try to discover context for URL-based conversations
      await discoverContext(url)

    } catch (err) {
      console.error('Error loading conversation:', err)
      setError(err instanceof Error ? err.message : 'Failed to load conversation')
    } finally {
      loading.value = false
    }
  }

  const discoverContext = async (sourceUrl?: string) => {
    if (!sourceUrl) return

    contextLoading.value = true
    try {
      // TODO: Implement context discovery when ContextAdapterFactory is available
      // const contextAdapter = ContextAdapterFactory.createAdapter(sourceUrl)
      // if (contextAdapter) {
      //   const contexts = await contextAdapter.discoverContextItems()
      //   contextItems.value = contexts
      // }
      console.log('Context discovery not yet implemented for URL:', sourceUrl)
    } catch (err) {
      console.warn('Context discovery failed:', err)
      // Don't set error for context discovery failures
    } finally {
      contextLoading.value = false
    }
  }

  return {
    // Readonly state
    conversationData: readonly(conversationData),
    loading: readonly(loading),
    error: readonly(error),
    contextItems: readonly(contextItems),
    contextLoading: readonly(contextLoading),
    
    // Actions
    loadFromUrl,
    setLocalData,
    clearData,
    discoverContext
  }
}
