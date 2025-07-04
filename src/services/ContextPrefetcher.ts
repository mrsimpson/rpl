import type { ContextItem } from '../types'

interface PrefetchQueueItem {
  item: ContextItem
  priority: number // Lower number = higher priority (earliest message)
  status: 'pending' | 'loading' | 'loaded' | 'error'
  content?: string
  error?: string
}

export class ContextPrefetcher {
  private queue: PrefetchQueueItem[] = []
  private cache = new Map<string, string>()
  private loadingPromises = new Map<string, Promise<string>>()
  private isProcessing = false
  private maxConcurrent = 3 // Maximum concurrent downloads

  /**
   * Add context items to the prefetch queue, sorted by earliest message appearance
   */
  public queueItems(contextItems: ContextItem[]): void {
    // Clear existing queue and cache for new conversation
    this.queue = []
    this.cache.clear()
    this.loadingPromises.clear()

    // Create queue items with priority based on earliest message appearance
    const queueItems: PrefetchQueueItem[] = contextItems.map(item => ({
      item,
      priority: this.getEarliestMessageIndex(item),
      status: 'pending' as const
    }))

    // Sort by priority (earliest message first)
    queueItems.sort((a, b) => a.priority - b.priority)
    
    this.queue = queueItems

    console.log(`[ContextPrefetcher] Queued ${contextItems.length} items for prefetching`)
    
    // Start processing the queue
    this.processQueue()
  }

  /**
   * Get cached content for a context item
   */
  public getCachedContent(item: ContextItem): string | null {
    return this.cache.get(item.url) || null
  }

  /**
   * Check if content is cached
   */
  public isCached(item: ContextItem): boolean {
    return this.cache.has(item.url)
  }

  /**
   * Get loading promise for an item if it's currently being loaded
   */
  public getLoadingPromise(item: ContextItem): Promise<string> | null {
    return this.loadingPromises.get(item.url) || null
  }

  /**
   * Get the earliest message index for a context item
   */
  private getEarliestMessageIndex(item: ContextItem): number {
    if (!item.messageRange || item.messageRange.length === 0) {
      return Infinity // Items without message range go to the end
    }
    
    return Math.min(...item.messageRange)
  }

  /**
   * Process the prefetch queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing) return
    
    this.isProcessing = true

    try {
      // Get pending items up to max concurrent limit
      const pendingItems = this.queue
        .filter(queueItem => queueItem.status === 'pending')
        .slice(0, this.maxConcurrent)

      if (pendingItems.length === 0) {
        this.isProcessing = false
        return
      }

      // Start loading all pending items concurrently
      const loadPromises = pendingItems.map(queueItem => this.loadItem(queueItem))
      
      // Wait for all to complete (or fail)
      await Promise.allSettled(loadPromises)

      // Continue processing if there are more items
      const hasMorePending = this.queue.some(item => item.status === 'pending')
      if (hasMorePending) {
        // Small delay to prevent overwhelming the browser
        setTimeout(() => this.processQueue(), 100)
      } else {
        this.isProcessing = false
        console.log(`[ContextPrefetcher] Completed prefetching. Cached ${this.cache.size} items`)
      }
    } catch (error) {
      console.error('[ContextPrefetcher] Error processing queue:', error)
      this.isProcessing = false
    }
  }

  /**
   * Load a single context item
   */
  private async loadItem(queueItem: PrefetchQueueItem): Promise<void> {
    const { item } = queueItem
    
    // Skip if already cached or loading
    if (this.cache.has(item.url) || this.loadingPromises.has(item.url)) {
      queueItem.status = 'loaded'
      return
    }

    queueItem.status = 'loading'

    try {
      console.log(`[ContextPrefetcher] Loading ${item.filename} (priority: ${queueItem.priority})`)
      
      // Create loading promise
      const loadPromise = this.fetchContent(item)
      this.loadingPromises.set(item.url, loadPromise)

      // Wait for content
      const content = await loadPromise
      
      // Cache the content
      this.cache.set(item.url, content)
      queueItem.content = content
      queueItem.status = 'loaded'
      
      // Remove from loading promises
      this.loadingPromises.delete(item.url)
      
      console.log(`[ContextPrefetcher] Cached ${item.filename} (${content.length} chars)`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.warn(`[ContextPrefetcher] Failed to load ${item.filename}:`, errorMessage)
      
      queueItem.status = 'error'
      queueItem.error = errorMessage
      
      // Remove from loading promises
      this.loadingPromises.delete(item.url)
    }
  }

  /**
   * Fetch content for a context item
   */
  private async fetchContent(item: ContextItem): Promise<string> {
    // Only prefetch text-based content (documents, code)
    if (item.type !== 'document' && item.type !== 'code') {
      throw new Error(`Prefetching not supported for type: ${item.type}`)
    }

    const response = await fetch(item.url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.text()
  }

  /**
   * Get queue status for debugging
   */
  public getQueueStatus(): { total: number; pending: number; loading: number; loaded: number; error: number } {
    const status = { total: 0, pending: 0, loading: 0, loaded: 0, error: 0 }
    
    this.queue.forEach(item => {
      status.total++
      status[item.status]++
    })

    return status
  }

  /**
   * Clear all cached data
   */
  public clear(): void {
    this.queue = []
    this.cache.clear()
    this.loadingPromises.clear()
    this.isProcessing = false
  }
}

// Export singleton instance
export const contextPrefetcher = new ContextPrefetcher()
