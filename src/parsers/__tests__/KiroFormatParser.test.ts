import { describe, it, expect } from 'vitest'
import { JsonFormatParser } from '../JsonFormatParser'

const KIRO_MINIMAL = {
  format: 'kiro-session-export-v1',
  metadata: {
    title: 'Test conversation',
    created_at: '2026-04-30T09:39:33.354908Z'
  },
  log_entries: [
    {
      version: 'v1',
      kind: 'Prompt',
      data: {
        message_id: 'msg-1',
        content: [{ kind: 'text', data: 'Hello, can you help me?' }],
        meta: { timestamp: 1777542150 }
      }
    },
    {
      version: 'v1',
      kind: 'AssistantMessage',
      data: {
        message_id: 'msg-2',
        content: [{ kind: 'text', data: 'Sure, I can help!' }]
      }
    },
    {
      version: 'v1',
      kind: 'Prompt',
      data: {
        message_id: 'msg-3',
        content: [{ kind: 'text', data: 'Great, thanks.' }],
        meta: { timestamp: 1777542200 }
      }
    },
    {
      version: 'v1',
      kind: 'AssistantMessage',
      data: {
        message_id: 'msg-4',
        content: [
          { kind: 'text', data: 'You are welcome.' },
          {
            kind: 'toolUse',
            data: {
              toolUseId: 'tooluse_abc123',
              name: 'write',
              input: { path: 'test.txt', content: 'hello' }
            }
          }
        ]
      }
    },
    {
      version: 'v1',
      kind: 'ToolResults',
      data: {
        message_id: 'msg-5',
        content: [
          {
            kind: 'toolResult',
            data: {
              toolUseId: 'tooluse_abc123',
              content: [{ kind: 'text', data: 'File written.' }],
              status: 'success'
            }
          }
        ]
      }
    }
  ]
}

describe('Kiro Session Export Format', () => {
  const parser = new JsonFormatParser()

  it('should detect kiro-session-export-v1 format', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    expect(result.metadata.format).toBe('json-kiro')
  })

  it('should use the session title as conversation title', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    expect(result.metadata.title).toBe('Test conversation')
  })

  it('should use created_at as timestamp', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    expect(result.metadata.timestamp).toBe('2026-04-30T09:39:33.354908Z')
  })

  it('should parse Prompt entries as human messages', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    const humanMessages = result.messages.filter(m => m.type === 'human')
    expect(humanMessages).toHaveLength(2)
    expect(humanMessages[0].content).toBe('Hello, can you help me?')
    expect(humanMessages[1].content).toBe('Great, thanks.')
  })

  it('should parse AssistantMessage text content as agent messages', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    const agentMessages = result.messages.filter(m => m.type === 'agent')
    expect(agentMessages.length).toBeGreaterThanOrEqual(1)
    expect(agentMessages[0].content).toBe('Sure, I can help!')
  })

  it('should parse toolUse content as tool_call messages', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    const toolMessages = result.messages.filter(m => m.type === 'tool_call')
    expect(toolMessages.length).toBeGreaterThanOrEqual(1)
    expect(toolMessages[0].metadata?.toolId).toBe('tooluse_abc123')
  })

  it('should skip ToolResults entries (not rendered as messages)', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_MINIMAL))
    // ToolResults are internal plumbing; we don't need them as separate messages
    const total = result.messages.length
    expect(total).toBeGreaterThanOrEqual(4) // 2 human + 1 agent + 1 tool_call minimum
  })

  it('should handle AssistantMessage with only text (no tool use)', async () => {
    const simple = {
      format: 'kiro-session-export-v1',
      metadata: { title: 'Simple', created_at: '2026-01-01T00:00:00Z' },
      log_entries: [
        {
          version: 'v1',
          kind: 'AssistantMessage',
          data: {
            message_id: 'a1',
            content: [{ kind: 'text', data: 'Just text.' }]
          }
        }
      ]
    }
    const result = await parser.parse(JSON.stringify(simple))
    expect(result.messages).toHaveLength(1)
    expect(result.messages[0].type).toBe('agent')
    expect(result.messages[0].content).toBe('Just text.')
  })

  it('should handle missing log_entries gracefully', async () => {
    const noEntries = {
      format: 'kiro-session-export-v1',
      metadata: { title: 'Empty', created_at: '2026-01-01T00:00:00Z' }
    }
    const result = await parser.parse(JSON.stringify(noEntries))
    expect(result.messages).toHaveLength(0)
  })

  it('should parse the real-world making-of-plan.json structure', async () => {
    // Minimal slice of the real file structure
    const realWorldSlice = {
      format: 'kiro-session-export-v1',
      metadata: {
        session_id: '0e2b0306-a67d-4586-8f02-510c6937aa30',
        title: 'Ich möchte gerne einen Bugtracker bauen.',
        created_at: '2026-04-30T09:39:33.354908Z',
        updated_at: '2026-04-30T10:36:50.889435Z'
      },
      log_entries: [
        {
          version: 'v1',
          kind: 'Prompt',
          data: {
            message_id: '2cf3338f-fc02-486d-8e63-eb32df14aedc',
            content: [{ kind: 'text', data: 'Ich möchte gerne einen Bugtracker bauen.' }],
            meta: { timestamp: 1777542150 }
          }
        },
        {
          version: 'v1',
          kind: 'AssistantMessage',
          data: {
            message_id: 'ea28094e-8db4-4b1f-9a2d-b85fe9294a46',
            content: [{ kind: 'text', data: 'Verstanden! Ich unterstütze Sie gerne.' }]
          }
        }
      ]
    }
    const result = await parser.parse(JSON.stringify(realWorldSlice))
    expect(result.metadata.format).toBe('json-kiro')
    expect(result.metadata.title).toBe('Ich möchte gerne einen Bugtracker bauen.')
    expect(result.messages).toHaveLength(2)
    expect(result.messages[0].type).toBe('human')
    expect(result.messages[1].type).toBe('agent')
  })
})
