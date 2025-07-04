export interface Message {
  id: string
  type: 'human' | 'agent' | 'tool_call' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface ConversationData {
  metadata: {
    title?: string
    timestamp: string
    format: string
    source?: string
  }
  messages: Message[]
}

// Context-related interfaces
export interface ContextItem {
  id: string
  type: 'image' | 'video' | 'document' | 'code' | 'audio' | 'other'
  url: string
  filename: string
  messageRange: number[] // Array of message indices this context applies to
  metadata?: {
    size?: number
    mimeType?: string
    description?: string
    language?: string // For code files
    [key: string]: any
  }
}

export interface Settings {
  humanAnimationSpeed: number
  agentAnimationSpeed: number
  theme: 'matrix' | 'amber' | 'blue' | 'hacker' | 'light'
  windowStyle: 'macos' | 'linux' | 'windows'
  showProgress: boolean
  showGhostPreview: boolean
  enableSounds: boolean
  // Context-related settings
  showContextPanel?: boolean
  contextPanelWidth?: number
  pauseOnContext?: boolean
  autoShowContext?: boolean
}

export interface SourceAdapter {
  fetchContent(url: string): Promise<string>
  // Optional context discovery method
  discoverContext?(url: string): Promise<ContextItem[]>
}

export interface FormatParser {
  parse(content: string): Promise<ConversationData>
}

// Context discovery utilities
export interface ContextDiscoveryResult {
  items: ContextItem[]
  errors: string[]
}

// Range parsing utility types
export type MessageRange = number | [number, number] // Single message or range