import { ref, readonly, computed } from 'vue'
import type { ConversationData, ContextItem } from '../types'
import { TextFormatParser } from '../parsers/TextFormatParser'
import { JsonFormatParser } from '../parsers/JsonFormatParser'
import { FileSourceAdapter } from '../adapters/FileSourceAdapter'
import { GistSourceAdapter } from '../adapters/GistSourceAdapter'
import { GitHubRepoSourceAdapter } from '../adapters/GitHubRepoSourceAdapter'
import { contextPrefetcher } from '../services/ContextPrefetcher'

// Global state for conversation management
const conversationData = ref<ConversationData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Enhanced context state
const contextItems = ref<ContextItem[]>([])
const contextLoading = ref(false)
const contextError = ref<string | null>(null)
const currentMessageContext = ref<ContextItem[]>([])
const showContextPanel = ref(false)
const contextMap = ref<Map<number, ContextItem[]>>(new Map())

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
    contextError.value = null
    currentMessageContext.value = []
    showContextPanel.value = false
    contextMap.value.clear()
    
    // Clear prefetcher cache
    contextPrefetcher.clear()
  }

  const setLocalData = (data: ConversationData, contexts: ContextItem[] = []) => {
    setConversationData(data)
    setContextItems(contexts)
  }

  // Context management functions
  const setContextItems = (items: ContextItem[]) => {
    contextItems.value = items
    contextError.value = null
    
    // Build context map for quick lookup
    buildContextMap(items)
  }

  const buildContextMap = (items: ContextItem[]) => {
    const map = new Map<number, ContextItem[]>()
    
    items.forEach(item => {
      // Ensure messageRange exists and is an array
      if (item.messageRange && Array.isArray(item.messageRange)) {
        item.messageRange.forEach(messageIndex => {
          if (typeof messageIndex === 'number' && messageIndex > 0) {
            if (!map.has(messageIndex)) {
              map.set(messageIndex, [])
            }
            map.get(messageIndex)!.push(item)
          }
        })
      }
    })
    
    contextMap.value = map
  }

  const getContextForMessage = (messageIndex: number): ContextItem[] => {
    // Convert 0-based message array index to 1-based context file numbering
    return contextMap.value.get(messageIndex + 1) || []
  }

  const updateCurrentMessageContext = (messageIndex: number) => {
    const contextForMessage = getContextForMessage(messageIndex)
    currentMessageContext.value = contextForMessage
    
    // Auto-show/hide context panel on desktop based on context availability
    if (window.innerWidth >= 1024) {
      showContextPanel.value = contextForMessage.length > 0
    }
  }

  const toggleContextPanel = () => {
    showContextPanel.value = !showContextPanel.value
  }

  // Enhanced context discovery
  const discoverContext = async (source: string): Promise<ContextItem[]> => {
    contextLoading.value = true
    contextError.value = null
    
    try {
      // Select appropriate adapter based on source type
      let adapter
      if (source.includes('gist.github.com') || source.includes('gist.githubusercontent.com')) {
        adapter = new GistSourceAdapter()
      } else if (source.includes('github.com') && source.includes('/tree/')) {
        adapter = new GitHubRepoSourceAdapter()
      } else {
        adapter = new FileSourceAdapter()
      }

      // Check if adapter supports context discovery
      if (adapter.discoverContext) {
        const items = await adapter.discoverContext(source)
        setContextItems(items)
        
        // Start prefetching context items
        if (items.length > 0) {
          console.log(`[useConversationState] Starting prefetch for ${items.length} context items`)
          contextPrefetcher.queueItems(items)
        }
        
        return items
      }
      
      return []
    } catch (err) {
      console.error('Context discovery failed:', err)
      contextError.value = err instanceof Error ? err.message : 'Failed to discover context'
      return []
    } finally {
      contextLoading.value = false
    }
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
        : url.includes('github.com') && url.includes('/tree/')
        ? new GitHubRepoSourceAdapter()
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

      // Try to discover context for URL-based conversations in parallel
      discoverContext(url).catch(err => {
        console.warn('Context discovery failed:', err)
        // Don't fail the entire conversation load if context discovery fails
      })

    } catch (err) {
      console.error('Error loading conversation:', err)
      setError(err instanceof Error ? err.message : 'Failed to load conversation')
    } finally {
      loading.value = false
    }
  }

  // Computed properties
  const hasContext = computed(() => contextItems.value.length > 0)
  const hasCurrentMessageContext = computed(() => currentMessageContext.value.length > 0)

  return {
    // Existing conversation state
    conversationData: readonly(conversationData),
    loading: readonly(loading),
    error: readonly(error),
    
    // Enhanced context state
    contextItems: readonly(contextItems),
    contextLoading: readonly(contextLoading),
    contextError: readonly(contextError),
    currentMessageContext: readonly(currentMessageContext),
    showContextPanel: readonly(showContextPanel),
    hasContext,
    hasCurrentMessageContext,
    
    // Existing functions
    loadFromUrl,
    setLocalData,
    clearData,
    
    // New context functions
    discoverContext,
    getContextForMessage,
    updateCurrentMessageContext,
    toggleContextPanel,
    setContextItems
  }
}
