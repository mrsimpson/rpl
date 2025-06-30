import type { SourceAdapter } from '../types'

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
      
      // Get the first file's content
      const files = Object.values(gistData.files) as any[]
      if (files.length === 0) {
        throw new Error('Gist contains no files')
      }
      
      return files[0].content
    } catch (error) {
      throw new Error(`Error fetching gist: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private extractGistId(url: string): string | null {
    const match = url.match(/gist\.github\.com\/(?:[\w-]+\/)?([a-f0-9]+)/)
    return match ? match[1] : null
  }
}