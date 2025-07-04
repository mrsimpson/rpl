import type { ContextItem } from '../types'

/**
 * Parse range from filename (e.g., "4.jpg" -> [4], "7-8.mov" -> [7, 8])
 */
export function parseMessageRange(filename: string): number[] {
  // Remove file extension and any descriptive suffix
  const baseName = filename.split('.')[0]
  
  // Handle range format (e.g., "7-8" or "1-3")
  if (baseName.includes('-')) {
    const [start, end] = baseName.split('-').map(n => parseInt(n.trim(), 10))
    if (!isNaN(start) && !isNaN(end) && start <= end) {
      const range = []
      for (let i = start; i <= end; i++) {
        range.push(i)
      }
      return range
    }
  }
  
  // Handle single message format (e.g., "4" or "10-code")
  const match = baseName.match(/^(\d+)/)
  if (match) {
    const messageIndex = parseInt(match[1], 10)
    if (!isNaN(messageIndex)) {
      return [messageIndex]
    }
  }
  
  return []
}

/**
 * Detect content type from filename/extension
 */
export function detectContentType(filename: string): ContextItem['type'] {
  const ext = filename.toLowerCase().split('.').pop() || ''
  
  // Image types
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
    return 'image'
  }
  
  // Video types
  if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'].includes(ext)) {
    return 'video'
  }
  
  // Audio types
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext)) {
    return 'audio'
  }
  
  // Code types
  if (['js', 'ts', 'jsx', 'tsx', 'vue', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'scala', 'html', 'css', 'scss', 'sass', 'less', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'cfg', 'conf', 'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd'].includes(ext)) {
    return 'code'
  }
  
  // Document types
  if (['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'odt'].includes(ext)) {
    return 'document'
  }
  
  return 'other'
}

/**
 * Get programming language from file extension for syntax highlighting
 */
export function getLanguageFromExtension(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() || ''
  
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'vue': 'vue',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'swift': 'swift',
    'kt': 'kotlin',
    'scala': 'scala',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'toml': 'toml',
    'ini': 'ini',
    'sh': 'bash',
    'bash': 'bash',
    'zsh': 'bash',
    'fish': 'fish',
    'ps1': 'powershell',
    'bat': 'batch',
    'cmd': 'batch',
    'sql': 'sql',
    'md': 'markdown'
  }
  
  return languageMap[ext] || 'text'
}

/**
 * Create a ContextItem from file information
 */
export function createContextItem(
  filename: string,
  url: string,
  metadata?: Partial<ContextItem['metadata']>
): ContextItem {
  const messageRange = parseMessageRange(filename)
  const type = detectContentType(filename)
  const language = type === 'code' ? getLanguageFromExtension(filename) : undefined
  
  return {
    id: `${filename}-${Date.now()}`,
    type,
    url,
    filename,
    messageRange,
    metadata: {
      language,
      ...metadata
    }
  }
}

/**
 * Validate context item
 */
export function validateContextItem(item: ContextItem): boolean {
  return Boolean(
    item.id &&
    item.type &&
    item.url &&
    item.filename &&
    Array.isArray(item.messageRange) &&
    item.messageRange.length > 0 &&
    item.messageRange.every(n => typeof n === 'number' && n > 0)
  )
}

/**
 * Sort context items by message range
 */
export function sortContextItems(items: ContextItem[]): ContextItem[] {
  return items.sort((a, b) => {
    const aMin = Math.min(...a.messageRange)
    const bMin = Math.min(...b.messageRange)
    return aMin - bMin
  })
}

/**
 * Group context items by message index
 */
export function groupContextByMessage(items: ContextItem[]): Map<number, ContextItem[]> {
  const map = new Map<number, ContextItem[]>()
  
  items.forEach(item => {
    item.messageRange.forEach(messageIndex => {
      if (!map.has(messageIndex)) {
        map.set(messageIndex, [])
      }
      map.get(messageIndex)!.push(item)
    })
  })
  
  return map
}
