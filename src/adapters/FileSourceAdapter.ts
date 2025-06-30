import type { SourceAdapter } from '../types'

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
}