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

export interface Settings {
  humanAnimationSpeed: number
  agentAnimationSpeed: number
  theme: 'matrix' | 'amber' | 'blue' | 'hacker' | 'light'
  windowStyle: 'macos' | 'linux' | 'windows'
  showProgress: boolean
  showGhostPreview: boolean
  enableSounds: boolean
}

export interface SourceAdapter {
  fetchContent(url: string): Promise<string>
}

export interface FormatParser {
  parse(content: string): Promise<ConversationData>
}