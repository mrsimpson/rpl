import type { SourceAdapter, ContextItem } from '../types'
import { createContextItem, validateContextItem } from '../utils/contextUtils'

interface GitHubFileItem {
  name: string
  path: string
  type: 'file' | 'dir'
  download_url?: string
}

interface GitHubUrlParts {
  user: string
  repo: string
  branch: string
  path: string
}

const ERROR_MESSAGES = {
  PRIVATE_REPO: 'Repository is private or does not exist',
  NO_CONVERSATION: 'No conversation file found in repository',
  INVALID_URL: 'Invalid GitHub repository URL',
  NETWORK_ERROR: 'Unable to access GitHub repository',
  PARSE_ERROR: 'Unable to parse repository data',
  API_RATE_LIMIT: 'GitHub API rate limit exceeded'
} as const

export class GitHubRepoSourceAdapter implements SourceAdapter {
  async fetchContent(url: string): Promise<string> {
    try {
      const urlParts = this.parseGitHubUrl(url)
      const files = await this.fetchGitHubFileData(urlParts)
      const conversationFile = this.findConversationFile(files)
      
      if (!conversationFile) {
        throw new Error(ERROR_MESSAGES.NO_CONVERSATION)
      }
      
      if (!conversationFile.download_url) {
        throw new Error('Conversation file has no download URL')
      }
      
      const response = await fetch(conversationFile.download_url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch conversation file: ${response.status} ${response.statusText}`)
      }
      
      return await response.text()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error(ERROR_MESSAGES.PARSE_ERROR)
    }
  }

  async discoverContext(url: string): Promise<ContextItem[]> {
    try {
      const urlParts = this.parseGitHubUrl(url)
      const files = await this.fetchGitHubFileData(urlParts)
      const contextFiles = this.filterContextFiles(files)
      
      const contextItems: ContextItem[] = []
      
      for (const file of contextFiles) {
        try {
          if (!file.download_url) continue
          
          const contextItem = createContextItem(file.name, file.download_url)
          
          if (validateContextItem(contextItem)) {
            contextItems.push(contextItem)
          }
        } catch (error) {
          console.warn('Failed to create context item for file:', file.name, error)
        }
      }
      
      return contextItems
    } catch (error) {
      console.warn('Context discovery failed for GitHub repository:', url, error)
      return []
    }
  }

  private parseGitHubUrl(url: string): GitHubUrlParts {
    // Pattern: https://github.com/user/repo/tree/branch/path
    const githubPattern = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/
    const match = url.match(githubPattern)
    
    if (!match) {
      throw new Error(ERROR_MESSAGES.INVALID_URL)
    }
    
    return {
      user: match[1],
      repo: match[2],
      branch: match[3],
      path: match[4]
    }
  }

  private async fetchGitHubFileData(urlParts: GitHubUrlParts): Promise<GitHubFileItem[]> {
    try {
      // Use GitHub API instead of HTML scraping to avoid CORS issues
      const apiUrl = `https://api.github.com/repos/${urlParts.user}/${urlParts.repo}/contents/${urlParts.path}?ref=${urlParts.branch}`
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(ERROR_MESSAGES.PRIVATE_REPO)
        }
        if (response.status === 403) {
          throw new Error(ERROR_MESSAGES.API_RATE_LIMIT)
        }
        throw new Error(`GitHub API request failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // GitHub API returns an array for directory contents
      if (!Array.isArray(data)) {
        throw new Error('Expected directory contents from GitHub API')
      }
      
      return data.map((item: any) => ({
        name: item.name,
        path: item.path,
        type: item.type,
        download_url: item.download_url
      }))
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
      }
      if (error instanceof SyntaxError) {
        throw new Error(ERROR_MESSAGES.PARSE_ERROR)
      }
      throw error
    }
  }

  private findConversationFile(files: GitHubFileItem[]): GitHubFileItem | null {
    // Priority: conversation.json > conversation.txt > *.json > *.txt
    const priorities = [
      (f: GitHubFileItem) => f.name === 'conversation.json',
      (f: GitHubFileItem) => f.name === 'conversation.txt',
      (f: GitHubFileItem) => f.name.endsWith('.json'),
      (f: GitHubFileItem) => f.name.endsWith('.txt')
    ]
    
    for (const priority of priorities) {
      const found = files.find(priority)
      if (found && found.type === 'file') {
        return found
      }
    }
    
    return null
  }

  private filterContextFiles(files: GitHubFileItem[]): GitHubFileItem[] {
    const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.mov', '.md', '.txt', '.js', '.css', '.html']
    const noisePatterns = ['README.md', 'package.json', '.git', 'node_modules/', 'LICENSE', 'CHANGELOG.md', 'conversation.json', 'conversation.txt']
    
    return files.filter(file => {
      // Must be a file, not directory
      if (file.type !== 'file') return false
      
      // Must have supported extension
      const hasValidExtension = supportedExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext.toLowerCase())
      )
      if (!hasValidExtension) return false
      
      // Must not match noise patterns
      const isNoise = noisePatterns.some(pattern => 
        file.name.includes(pattern) || file.path.includes(pattern)
      )
      if (isNoise) return false
      
      return true
    })
  }
}
