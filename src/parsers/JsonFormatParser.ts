import type { FormatParser, ConversationData, Message } from '../types'
import { QDeveloperParserFactory } from './QDeveloperParserFactory'
import { QDeveloperFormatDetector } from './QDeveloperFormatDetector'
import { normalizeToolInput } from './kiro/ToolInputNormalizer'

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

    // First pass: build a map of toolUseId → tool result content and metadata
    // so we can attach them to the corresponding tool_call messages later.
    const toolResultMap = new Map<string, { content: any; status: string; toolName?: string; isBuiltIn?: boolean }>()
    // Also collect steering messages keyed by the message_id of the ToolResults entry
    // so we can inject them at the right position.
    const steeringByMessageId = new Map<string, string>()

    for (const entry of entries) {
      if (entry.kind !== 'ToolResults') continue
      const entryData = entry.data || {}
      const resultsMap: Record<string, any> = entryData.results || {}

      // Extract steering messages from the content array.
      // Steering messages are text items injected by the runtime alongside tool results.
      for (const part of (entryData.content || [])) {
        if (part.kind === 'text' && part.data) {
          const steeringMatch = part.data.match(
            /\[LIVE STEERING[^\]]*\][\s\S]*?<user_message[^>]*>\s*([\s\S]*?)\s*<\/user_message>/
          )
          if (steeringMatch) {
            steeringByMessageId.set(entryData.message_id, steeringMatch[1].trim())
          }
        }
      }

      // Extract tool results keyed by toolUseId
      for (const part of (entryData.content || [])) {
        if (part.kind !== 'toolResult') continue
        const toolUseId: string = part.data?.toolUseId
        if (!toolUseId) continue

        // Normalize result content to the {Text: "..."} format expected by ToolCallRenderer
        const rawContent: any[] = part.data?.content || []
        const normalizedContent = this.normalizeKiroResultContent(rawContent)

        // Determine if this was a built-in tool (read/write/shell) vs MCP tool
        const resultMeta = resultsMap[toolUseId]
        const isBuiltIn = resultMeta?.tool?.kind?.BuiltIn !== undefined
        const toolNameFromMeta: string | undefined =
          resultMeta?.tool?.kind?.Mcp?.toolName ||
          this.inferBuiltInToolName(resultMeta?.tool?.kind?.BuiltIn)

        toolResultMap.set(toolUseId, {
          content: normalizedContent,
          status: part.data?.status || 'success',
          toolName: toolNameFromMeta,
          isBuiltIn
        })
      }
    }

    // Second pass: build the message list in order
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
            const toolUseId: string = part.data?.toolUseId
            const toolName: string = part.data?.name || 'unknown'
            const resultMeta = toolResultMap.get(toolUseId)

            // Build tool_call message with a canonical args shape so renderers
            // never need to know about format-specific input structures.
            const resolvedToolName = resultMeta?.toolName || toolName
            const args = normalizeToolInput(resolvedToolName, part.data?.input ?? {})
            const toolCallContent = JSON.stringify({
              type: 'tool_use',
              name: resolvedToolName,
              args,
              toolUseId
            })

            // Push the tool_use message first, then the tool_result message.
            // ConversationDisplay wires them via toolType + toolId metadata.
            messages.push({
              id: (messageId++).toString(),
              type: 'tool_call',
              content: toolCallContent,
              timestamp: new Date().toISOString(),
              metadata: {
                toolId: toolUseId,
                toolType: 'use',
                toolName: resolvedToolName,
                isBuiltIn: resultMeta?.isBuiltIn
              }
            })

            if (resultMeta) {
              messages.push({
                id: (messageId++).toString(),
                type: 'tool_call',
                content: JSON.stringify({
                  type: 'tool_result',
                  toolUseId,
                  content: resultMeta.content,
                  status: resultMeta.status
                }),
                timestamp: new Date().toISOString(),
                metadata: {
                  toolId: toolUseId,
                  toolType: 'result',
                  status: resultMeta.status,
                  isBuiltIn: resultMeta.isBuiltIn
                }
              })
            }
          }
        }
      } else if (kind === 'ToolResults') {
        // Inject any steering message that was embedded in this ToolResults entry
        const steering = steeringByMessageId.get(entryData.message_id)
        if (steering) {
          messages.push({
            id: (messageId++).toString(),
            type: 'human',
            content: steering,
            timestamp: new Date().toISOString(),
            metadata: { isSteering: true }
          })
        }
      }
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

  /**
   * Normalizes Kiro tool result content (array of {kind, data} items) into
   * the [{Text: "..."}] format expected by ToolCallRenderer.
   */
  private normalizeKiroResultContent(rawContent: any[]): any[] {
    if (!rawContent || rawContent.length === 0) return []

    return rawContent.map((item: any) => {
      if (item.kind === 'text') {
        return { Text: item.data ?? '' }
      }
      if (item.kind === 'json') {
        // Serialize JSON data back to a formatted string for display
        const text = typeof item.data === 'string'
          ? item.data
          : JSON.stringify(item.data, null, 2)
        return { Text: text }
      }
      // Legacy format already uses {Text: "..."} — pass through
      if (item.Text !== undefined) return item
      // Fallback
      return { Text: JSON.stringify(item) }
    })
  }

  /**
   * Infers a human-readable tool name from a BuiltIn tool kind descriptor.
   */
  private inferBuiltInToolName(builtIn: any): string | undefined {
    if (!builtIn) return undefined
    if (builtIn.FileRead) return 'read'
    if (builtIn.FileWrite) return 'write'
    if (builtIn.ExecuteCmd) return 'shell'
    if (builtIn.FileList) return 'ls'
    return 'builtin'
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