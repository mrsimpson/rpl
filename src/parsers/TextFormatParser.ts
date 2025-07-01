import type { FormatParser, ConversationData, Message } from '../types'

export class TextFormatParser implements FormatParser {
  // Pattern to detect user messages: > or [prefix] > at start of line (with optional space)
  private readonly USER_MESSAGE_PATTERN = /^(\[.*?\]\s*)?>\s*/

  async parse(content: string): Promise<ConversationData> {
    const lines = content.split('\n')
    const messages: Message[] = []
    let currentMessage: Partial<Message> | null = null
    let messageCounter = 0

    for (const line of lines) {
      // Check if line starts a new user message
      const userMatch = line.match(this.USER_MESSAGE_PATTERN)
      
      if (userMatch) {
        // Save previous message if exists
        if (currentMessage?.content) {
          messages.push(this.finalizeMessage(currentMessage, ++messageCounter))
        }
        
        // Start new user message (remove prefix)
        const content = line.replace(this.USER_MESSAGE_PATTERN, '').trim()
        currentMessage = {
          type: 'human',
          content: content,
          timestamp: new Date().toISOString()
        }
      }
      // Check for empty line (message delimiter)
      else if (line.trim() === '') {
        if (currentMessage?.content) {
          messages.push(this.finalizeMessage(currentMessage, ++messageCounter))
          currentMessage = null
        }
      }
      // Handle continuation lines or agent messages
      else if (line.trim()) {
        if (currentMessage) {
          // Continue current message (user or agent)
          currentMessage.content += '\n' + line.trim()
        } else {
          // Start new agent message
          currentMessage = {
            type: 'agent',
            content: line.trim(),
            timestamp: new Date().toISOString()
          }
        }
      }
    }
    
    // Don't forget the last message
    if (currentMessage?.content) {
      messages.push(this.finalizeMessage(currentMessage, ++messageCounter))
    }

    return {
      metadata: {
        title: 'Text Format Conversation',
        timestamp: new Date().toISOString(),
        format: 'text'
      },
      messages
    }
  }

  private finalizeMessage(message: Partial<Message>, id: number): Message {
    return {
      id: id.toString(),
      type: message.type || 'agent',
      content: message.content || '',
      timestamp: message.timestamp || new Date().toISOString()
    }
  }
}