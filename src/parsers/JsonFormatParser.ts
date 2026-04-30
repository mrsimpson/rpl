import type { FormatParser, ConversationData, Message } from '../types'
import { QDeveloperParserFactory } from './QDeveloperParserFactory'
import { QDeveloperFormatDetector } from './QDeveloperFormatDetector'

export class JsonFormatParser implements FormatParser {
  async parse(content: string): Promise<ConversationData> {
    try {
      const jsonData = JSON.parse(content)
      
      // Handle Kiro session export format
      if (jsonData.format === 'kiro-session-export-v1') {
        return this.parseKiroFormat(jsonData)
      }

      // Handle Q-Developer format using version-based parsers
      if (QDeveloperFormatDetector.isQDeveloperFormat(jsonData)) {
        return QDeveloperParserFactory.parse(jsonData)
      }
      
      // Handle Amazon Q flat array format
      if (this.isAmazonQFormat(jsonData)) {
        return this.parseAmazonQFormat(jsonData)
      }
      
      // Handle generic JSON format
      return this.parseGenericFormat(jsonData)
      
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private parseKiroFormat(data: any): ConversationData {
    const messages: Message[] = []
    let messageId = 1
    const entries: any[] = data.log_entries || []

    for (const entry of entries) {
      const kind: string = entry.kind
      const entryData = entry.data || {}

      if (kind === 'Prompt') {
        const text = (entryData.content || [])
          .filter((c: any) => c.kind === 'text')
          .map((c: any) => c.data)
          .join('\n')
        if (text) {
          messages.push({
            id: (messageId++).toString(),
            type: 'human',
            content: text,
            timestamp: entryData.meta?.timestamp
              ? new Date(entryData.meta.timestamp * 1000).toISOString()
              : new Date().toISOString()
          })
        }
      } else if (kind === 'AssistantMessage') {
        for (const part of (entryData.content || [])) {
          if (part.kind === 'text' && part.data) {
            messages.push({
              id: (messageId++).toString(),
              type: 'agent',
              content: part.data,
              timestamp: new Date().toISOString()
            })
          } else if (part.kind === 'toolUse') {
            messages.push({
              id: (messageId++).toString(),
              type: 'tool_call',
              content: JSON.stringify(part.data?.input ?? {}),
              timestamp: new Date().toISOString(),
              metadata: {
                toolId: part.data?.toolUseId,
                toolName: part.data?.name
              }
            })
          }
        }
      }
      // ToolResults entries are skipped — they are internal plumbing
    }

    return {
      metadata: {
        title: data.metadata?.title || 'Kiro Conversation',
        timestamp: data.metadata?.created_at || new Date().toISOString(),
        format: 'json-kiro'
      },
      messages
    }
  }

  private isAmazonQFormat(data: any): boolean {
    return Array.isArray(data) && 
           data.length > 0 && 
           data.some((item: any) => 
             (item.content && item.content.ToolUseResults) || 
             item.Response
           )
  }

  private parseAmazonQFormat(data: any[]): ConversationData {
    const messages: Message[] = []
    let messageId = 1

    for (const item of data) {
      // Handle ToolUseResults
      if (item.content && item.content.ToolUseResults) {
        const toolResults = item.content.ToolUseResults.tool_use_results
        for (const result of toolResults) {
          messages.push({
            id: (messageId++).toString(),
            type: 'tool_call',
            content: JSON.stringify({
              type: 'tool_result',
              tool_use_id: result.tool_use_id,
              content: result.content,
              status: result.status
            }),
            timestamp: new Date().toISOString(),
            metadata: {
              toolId: result.tool_use_id,
              toolType: 'result',
              status: result.status
            }
          })
        }
      }

      // Handle Response messages
      if (item.Response) {
        messages.push({
          id: (messageId++).toString(),
          type: 'agent',
          content: item.Response.content,
          timestamp: new Date().toISOString(),
          metadata: {
            messageId: item.Response.message_id
          }
        })
      }
    }

    return {
      metadata: {
        title: 'Amazon Q Conversation',
        timestamp: new Date().toISOString(),
        format: 'json-amazonq'
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