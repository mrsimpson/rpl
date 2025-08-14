import type { ConversationData, Message } from '../types'

/**
 * Interface for Q-Developer format version parsers
 */
export interface QDeveloperVersionParser {
  /**
   * Parse the conversation data for this specific version
   */
  parse(data: any): ConversationData
  
  /**
   * Get the version identifier for this parser
   */
  getVersion(): string
}

/**
 * Base class with shared parsing logic for Q-Developer formats
 */
export abstract class BaseQDeveloperParser implements QDeveloperVersionParser {
  abstract getVersion(): string
  abstract parse(data: any): ConversationData

  protected parseAssistantTurn(assistantTurn: any, messages: Message[], messageId: { value: number }): void {
    if (assistantTurn?.ToolUse) {
      const toolUse = assistantTurn.ToolUse
      
      if (toolUse.content) {
        messages.push({
          id: (messageId.value++).toString(),
          type: 'agent',
          content: toolUse.content,
          timestamp: assistantTurn.timestamp || new Date().toISOString()
        })
      }

      if (toolUse.tool_uses) {
        for (const tool of toolUse.tool_uses) {
          messages.push({
            id: (messageId.value++).toString(),
            type: 'tool_call',
            content: JSON.stringify({
              type: 'tool_use',
              name: tool.name,
              args: tool.args,
              id: tool.id
            }),
            timestamp: assistantTurn.timestamp || new Date().toISOString(),
            metadata: {
              toolName: tool.name,
              toolId: tool.id,
              toolType: 'use'
            }
          })
        }
      }
    }

    // Handle other assistant response types
    this.parseCommonAssistantTypes(assistantTurn, messages, messageId)
  }

  protected parseCommonAssistantTypes(assistantTurn: any, messages: Message[], messageId: { value: number }): void {
    // Tool results
    if (assistantTurn?.content?.ToolUseResults) {
      const results = assistantTurn.content.ToolUseResults.tool_use_results
      for (const result of results) {
        messages.push({
          id: (messageId.value++).toString(),
          type: 'tool_call',
          content: JSON.stringify({
            type: 'tool_result',
            tool_use_id: result.tool_use_id,
            content: result.content,
            status: result.status
          }),
          timestamp: assistantTurn.timestamp || new Date().toISOString(),
          metadata: {
            toolId: result.tool_use_id,
            toolType: 'result',
            status: result.status
          }
        })
      }
    }

    // Cancelled tool uses
    if (assistantTurn?.content?.CancelledToolUses) {
      const cancelled = assistantTurn.content.CancelledToolUses
      messages.push({
        id: (messageId.value++).toString(),
        type: 'tool_call',
        content: JSON.stringify({
          type: 'tool_cancelled',
          prompt: cancelled.prompt,
          tool_use_results: cancelled.tool_use_results
        }),
        timestamp: assistantTurn.timestamp || new Date().toISOString(),
        metadata: {
          toolType: 'cancelled',
          reason: cancelled.prompt
        }
      })
    }

    // Response messages
    if (assistantTurn?.Response) {
      messages.push({
        id: (messageId.value++).toString(),
        type: 'agent',
        content: assistantTurn.Response.content,
        timestamp: assistantTurn.timestamp || new Date().toISOString(),
        metadata: {
          messageId: assistantTurn.Response.message_id
        }
      })
    }
  }

  protected parseUserTurn(userTurn: any, messages: Message[], messageId: { value: number }): void {
    // Extract user message
    if (userTurn?.content?.Prompt?.prompt) {
      messages.push({
        id: (messageId.value++).toString(),
        type: 'human',
        content: userTurn.content.Prompt.prompt,
        timestamp: userTurn.timestamp || new Date().toISOString()
      })
    }

    // Handle tool results from user turn
    if (userTurn?.content?.ToolUseResults) {
      const results = userTurn.content.ToolUseResults.tool_use_results
      for (const result of results) {
        messages.push({
          id: (messageId.value++).toString(),
          type: 'tool_call',
          content: JSON.stringify({
            type: 'tool_result',
            tool_use_id: result.tool_use_id,
            content: result.content,
            status: result.status
          }),
          timestamp: userTurn.timestamp || new Date().toISOString(),
          metadata: {
            toolId: result.tool_use_id,
            toolType: 'result',
            status: result.status
          }
        })
      }
    }
  }
}

/**
 * Q-Developer V1 Parser - Legacy array format [userTurn, assistantTurn]
 */
export class QDeveloperV1Parser extends BaseQDeveloperParser {
  getVersion(): string {
    return 'v1-array'
  }

  parse(data: any): ConversationData {
    const messages: Message[] = []
    const messageId = { value: 1 }

    for (let i = 0; i < data.history.length; i++) {
      const historyItem = data.history[i]
      
      if (!Array.isArray(historyItem) || historyItem.length < 2) {
        continue
      }

      const [userTurn, assistantTurn] = historyItem

      this.parseUserTurn(userTurn, messages, messageId)
      this.parseAssistantTurn(assistantTurn, messages, messageId)
    }

    return {
      metadata: {
        title: 'Q-Developer Conversation (V1)',
        timestamp: new Date().toISOString(),
        format: 'json-qdev-v1',
        source: data.conversation_id
      },
      messages
    }
  }
}

/**
 * Q-Developer V2 Parser - New object format {user: ..., assistant: ...}
 */
export class QDeveloperV2Parser extends BaseQDeveloperParser {
  getVersion(): string {
    return 'v2-object'
  }

  parse(data: any): ConversationData {
    const messages: Message[] = []
    const messageId = { value: 1 }

    for (let i = 0; i < data.history.length; i++) {
      const historyItem = data.history[i]
      
      if (!historyItem.user || !historyItem.assistant) {
        continue
      }

      const userTurn = historyItem.user
      const assistantTurn = historyItem.assistant

      this.parseUserTurn(userTurn, messages, messageId)
      this.parseAssistantTurn(assistantTurn, messages, messageId)
    }

    return {
      metadata: {
        title: 'Q-Developer Conversation (V2)',
        timestamp: new Date().toISOString(),
        format: 'json-qdev-v2',
        source: data.conversation_id
      },
      messages
    }
  }
}
