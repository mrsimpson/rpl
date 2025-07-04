import type { SourceAdapter, ContextItem } from '../types'
import { createContextItem, validateContextItem } from '../utils/contextUtils'

export class FileSourceAdapter implements SourceAdapter {
  async fetchContent(url: string): Promise<string> {
    try {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
      }
      
      return await response.text()
    } catch (error) {
      throw new Error(`Error fetching file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async discoverContext(url: string): Promise<ContextItem[]> {
    try {
      // For HTTP-based resources, try to discover context using query parameter approach
      const urlObj = new URL(url)
      const contextParam = urlObj.searchParams.get('context')
      
      if (!contextParam) {
        // No context parameter, return empty array
        return []
      }
      
      // Fetch context map file
      const contextMapContent = await this.fetchContent(contextParam)
      return this.parseContextMap(contextMapContent)
      
    } catch (error) {
      console.warn('Context discovery failed for URL:', url, error)
      return []
    }
  }

  private async parseContextMap(content: string): Promise<ContextItem[]> {
    const items: ContextItem[] = []
    const lines = content.split('\n')
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }
      
      // Parse format: "1-3: http://example.com/screenshot.png"
      const match = trimmed.match(/^([^:]+):\s*(.+)$/)
      if (!match) {
        continue
      }
      
      const [, rangeStr, itemUrl] = match
      
      try {
        // Create a temporary filename from the range for parsing
        const filename = `${rangeStr.trim()}.${this.getExtensionFromUrl(itemUrl)}`
        const contextItem = createContextItem(filename, itemUrl.trim())
        
        if (validateContextItem(contextItem)) {
          items.push(contextItem)
        }
      } catch (error) {
        console.warn('Failed to parse context item:', line, error)
      }
    }
    
    return items
  }

  private getExtensionFromUrl(url: string): string {
    try {
      const pathname = new URL(url).pathname
      const parts = pathname.split('.')
      return parts.length > 1 ? parts.pop() || 'unknown' : 'unknown'
    } catch {
      return 'unknown'
    }
  }
}