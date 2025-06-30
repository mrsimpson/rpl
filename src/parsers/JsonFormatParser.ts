import type { FormatParser, ConversationData, Message } from '../types'

export class JsonFormatParser implements FormatParser {
  async parse(content: string): Promise<ConversationData> {
    try {
      const jsonData = JSON.parse(content)
      
      // Handle Q-Developer format
      if (this.isQDeveloperFormat(jsonData)) {
        return this.parseQDeveloperFormat(jsonData)
      }
      
      // Handle generic JSON format
      return this.parseGenericFormat(jsonData)
      
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private isQDeveloperFormat(data: any): boolean {
    return data.conversation_id && 
           data.history && 
           Array.isArray(data.history)
  }

  private parseQDeveloperFormat(data: any): ConversationData {
    const messages: Message[] = []
    let messageId = 1

    // Process conversation history
    for (const historyItem of data.history) {
      if (Array.isArray(historyItem) && historyItem.length >= 2) {
        const [userTurn, assistantTurn] = historyItem

        // Extract user message
        if (userTurn?.content?.Prompt?.prompt) {
          messages.push({
            id: (messageId++).toString(),
            type: 'human',
            content: userTurn.content.Prompt.prompt,
            timestamp: new Date().toISOString()
          })
        }

        // Extract assistant response
        if (assistantTurn?.ToolUse?.content) {
          messages.push({
            id: (messageId++).toString(),
            type: 'agent',
            content: assistantTurn.ToolUse.content,
            timestamp: new Date().toISOString()
          })
        }

        // Extract tool calls if present
        if (assistantTurn?.ToolUse?.tool_uses) {
          for (const toolUse of assistantTurn.ToolUse.tool_uses) {
            messages.push({
              id: (messageId++).toString(),
              type: 'tool_call',
              content: `${toolUse.name}(${JSON.stringify(toolUse.args)})`,
              timestamp: new Date().toISOString()
            })
          }
        }
      }
    }

    return {
      metadata: {
        title: 'Q-Developer Conversation',
        timestamp: new Date().toISOString(),
        format: 'json-qdev',
        source: data.conversation_id
      },
      messages
    }
  }

  private parseGenericFormat(data: any): ConversationData {
    const messages: Message[] = []

    if (data.messages && Array.isArray(data.messages)) {
      messages.push(...data.messages.map((msg: any, index: number) => ({
        id: msg.id || (index + 1).toString(),
        type: msg.type || this.inferMessageType(msg),
        content: msg.content || msg.text || '',
        timestamp: msg.timestamp || new Date().toISOString()
      })))
    }

    return {
      metadata: {
        title: data.title || 'JSON Conversation',
        timestamp: data.timestamp || new Date().toISOString(),
        format: 'json-generic'
      },
      messages
    }
  }

  private inferMessageType(msg: any): 'human' | 'agent' | 'tool_call' | 'system' {
    if (msg.role === 'user' || msg.sender === 'user') return 'human'
    if (msg.role === 'assistant' || msg.sender === 'assistant') return 'agent'
    if (msg.role === 'tool' || msg.type === 'tool_call') return 'tool_call'
    if (msg.role === 'system') return 'system'
    return 'agent'
  }
}