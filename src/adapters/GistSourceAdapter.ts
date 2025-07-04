import type { SourceAdapter, ContextItem } from '../types'
import { createContextItem, validateContextItem, parseMessageRange } from '../utils/contextUtils'

export class GistSourceAdapter implements SourceAdapter {
  async fetchContent(url: string): Promise<string> {
    try {
      // Extract gist ID from URL
      const gistId = this.extractGistId(url)
      if (!gistId) {
        throw new Error('Invalid GitHub Gist URL')
      }

      // Fetch gist data from GitHub API
      const apiUrl = `https://api.github.com/gists/${gistId}`
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`)
      }
      
      const gistData = await response.json()
      
      // Find the conversation file first
      const files = Object.values(gistData.files) as any[]
      if (files.length === 0) {
        throw new Error('Gist contains no files')
      }
      
      // Look for conversation file by name and type
      const conversationFile = files.find(file => 
        this.isConversationFile(file.filename)
      )
      
      if (!conversationFile) {
        // Fallback to first file if no obvious conversation file found
        console.warn('No obvious conversation file found, using first file:', files[0].filename)
        return files[0].content
      }
      
      return conversationFile.content
    } catch (error) {
      throw new Error(`Error fetching gist: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async discoverContext(url: string): Promise<ContextItem[]> {
    try {
      // Extract gist ID from URL
      const gistId = this.extractGistId(url)
      if (!gistId) {
        throw new Error('Invalid GitHub Gist URL')
      }

      // Fetch gist data from GitHub API
      const apiUrl = `https://api.github.com/gists/${gistId}`
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch gist: ${response.status} ${response.statusText}`)
      }
      
      const gistData = await response.json()
      const files = Object.values(gistData.files) as any[]
      
      const contextItems: ContextItem[] = []
      
      // Find the conversation file first to exclude it from context
      const conversationFile = files.find(file => 
        this.isConversationFile(file.filename)
      )
      
      for (const file of files) {
        const filename = file.filename
        
        // Skip the conversation file
        if (conversationFile && filename === conversationFile.filename) {
          continue
        }
        
        // Check if filename follows range-based naming convention
        const messageRange = parseMessageRange(filename)
        if (messageRange.length === 0) {
          continue // Skip files that don't follow naming convention
        }
        
        // Create context item using the raw_url for direct access
        const contextItem = createContextItem(
          filename,
          file.raw_url,
          {
            size: file.size,
            mimeType: this.getMimeType(filename),
            description: `Context from GitHub Gist: ${filename}`
          }
        )
        
        if (validateContextItem(contextItem)) {
          contextItems.push(contextItem)
        }
      }
      
      return contextItems
      
    } catch (error) {
      console.warn('Context discovery failed for gist:', url, error)
      return []
    }
  }

  private extractGistId(url: string): string | null {
    const match = url.match(/gist\.github\.com\/(?:[\w-]+\/)?([a-f0-9]+)/)
    return match ? match[1] : null
  }

  private isConversationFile(filename: string): boolean {
    const lowerFilename = filename.toLowerCase()
    
    // Check for explicit conversation file names
    if (lowerFilename.includes('conversation')) {
      return true
    }
    
    // Check for common conversation file patterns
    if (lowerFilename.match(/^(chat|dialogue?|transcript|messages?)\.(txt|json|md)$/)) {
      return true
    }
    
    // Check for files that are NOT context files (don't start with numbers)
    const conversationExtensions = ['txt', 'json', 'md', 'log']
    const ext = lowerFilename.split('.').pop() || ''
    
    // If it's a supported conversation format and doesn't start with a number (context file pattern)
    if (conversationExtensions.includes(ext) && !lowerFilename.match(/^\d+/)) {
      return true
    }
    
    return false
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || ''
    
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'text/javascript',
      'json': 'application/json',
      'xml': 'application/xml'
    }
    
    return mimeTypes[ext] || 'application/octet-stream'
  }
}