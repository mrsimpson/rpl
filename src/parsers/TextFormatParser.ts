import type { FormatParser, ConversationData, Message } from '../types'

export class TextFormatParser implements FormatParser {
  async parse(content: string): Promise<ConversationData> {
    const lines = content.split('\n')
    const messages: Message[] = []
    let currentMessage: Partial<Message> | null = null
    let messageCounter = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Detect start of new user message (lines starting with > followed by space)
      if (line.startsWith('> ')) {
        // Save previous message if exists
        if (currentMessage?.content) {
          messages.push(this.finalizeMessage(currentMessage, ++messageCounter))
        }
        
        // Start new human message (remove the "> " prefix)
        currentMessage = {
          type: 'human',
          content: line.substring(2).trim(),
          timestamp: new Date().toISOString()
        }
      }
      // Detect empty line (end of current message)
      else if (line.trim() === '') {
        if (currentMessage?.content) {
          messages.push(this.finalizeMessage(currentMessage, ++messageCounter))
          currentMessage = null
        }
      }
      // Detect agent response (after user message or standalone)
      else if (line.trim() && !currentMessage) {
        // This is likely an agent response
        currentMessage = {
          type: 'agent',
          content: line.trim(),
          timestamp: new Date().toISOString()
        }
      }
      // Continue building current message content
      else if (line.trim() && currentMessage) {
        if (currentMessage.type === 'human') {
          // Multi-line user input (continue without the "> " prefix)
          if (line.startsWith('> ')) {
            currentMessage.content += '\n' + line.substring(2).trim()
          } else {
            currentMessage.content += '\n' + line.trim()
          }
        } else {
          // Multi-line agent response
          currentMessage.content += '\n' + line.trim()
        }
      }
    }

    // Don't forget the last message
    if (currentMessage?.content) {
      messages.push(this.finalizeMessage(currentMessage, ++messageCounter))
    }

    return {
      metadata: {
        title: 'Shell Format Conversation',
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