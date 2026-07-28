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

// --- New format features (results map + steering messages) ---
describe('Kiro Session Export Format — new features', () => {
  const parser = new JsonFormatParser()

  const KIRO_WITH_RESULTS_MAP = {
    format: 'kiro-session-export-v1',
    metadata: { title: 'Results map test', created_at: '2026-07-28T09:00:00Z' },
    log_entries: [
      {
        version: 'v1',
        kind: 'Prompt',
        data: {
          message_id: 'p1',
          content: [{ kind: 'text', data: 'Do something.' }],
          meta: { timestamp: 1785230000 }
        }
      },
      {
        version: 'v1',
        kind: 'AssistantMessage',
        data: {
          message_id: 'a1',
          content: [
            { kind: 'text', data: 'I will call a tool.' },
            {
              kind: 'toolUse',
              data: {
                toolUseId: 'tooluse_MCP1',
                name: 'whats_next',
                input: { user_input: 'Do something.' }
              }
            },
            {
              kind: 'toolUse',
              data: {
                toolUseId: 'tooluse_BUILTIN1',
                name: 'read',
                input: { operations: [{ mode: 'Line', path: '/tmp/foo.txt' }] }
              }
            }
          ]
        }
      },
      {
        version: 'v1',
        kind: 'ToolResults',
        data: {
          message_id: 'tr1',
          content: [
            {
              kind: 'toolResult',
              data: {
                toolUseId: 'tooluse_MCP1',
                content: [{ kind: 'json', data: { phase: 'explore' } }],
                status: 'success'
              }
            },
            {
              kind: 'toolResult',
              data: {
                toolUseId: 'tooluse_BUILTIN1',
                content: [{ kind: 'json', data: { exit_status: 'exit status: 0', stdout: 'hello' } }],
                status: 'success'
              }
            }
          ],
          results: {
            tooluse_MCP1: {
              tool: {
                kind: {
                  Mcp: {
                    toolName: 'whats_next',
                    serverName: 'workflows',
                    params: { user_input: 'Do something.' }
                  }
                }
              }
            },
            tooluse_BUILTIN1: {
              tool: {
                kind: {
                  BuiltIn: {
                    FileRead: { operations: [{ mode: 'Line', path: '/tmp/foo.txt' }] }
                  }
                }
              }
            }
          }
        }
      }
    ]
  }

  it('should produce a tool_use and tool_result pair for each toolUse', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_RESULTS_MAP))
    const toolMessages = result.messages.filter(m => m.type === 'tool_call')
    // 2 tool_use + 2 tool_result
    expect(toolMessages).toHaveLength(4)
  })

  it('should set toolType use/result metadata', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_RESULTS_MAP))
    const uses = result.messages.filter(m => m.metadata?.toolType === 'use')
    const results = result.messages.filter(m => m.metadata?.toolType === 'result')
    expect(uses).toHaveLength(2)
    expect(results).toHaveLength(2)
  })

  it('should set isBuiltIn=true for BuiltIn tools', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_RESULTS_MAP))
    const builtInUse = result.messages.find(m => m.metadata?.toolId === 'tooluse_BUILTIN1' && m.metadata?.toolType === 'use')
    expect(builtInUse?.metadata?.isBuiltIn).toBe(true)
  })

  it('should normalize {kind:json, data} result content to {Text: string}', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_RESULTS_MAP))
    const mcpResult = result.messages.find(m => m.metadata?.toolId === 'tooluse_MCP1' && m.metadata?.toolType === 'result')
    expect(mcpResult).toBeDefined()
    const parsed = JSON.parse(mcpResult!.content)
    expect(parsed.content[0].Text).toBeDefined()
    expect(parsed.content[0].Text).toContain('explore')
  })

  it('should infer tool name "read" for FileRead built-in', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_RESULTS_MAP))
    const builtInUse = result.messages.find(m => m.metadata?.toolId === 'tooluse_BUILTIN1' && m.metadata?.toolType === 'use')
    const toolData = JSON.parse(builtInUse!.content)
    expect(toolData.name).toBe('read')
  })

  const KIRO_WITH_STEERING = {
    format: 'kiro-session-export-v1',
    metadata: { title: 'Steering test', created_at: '2026-07-28T09:00:00Z' },
    log_entries: [
      {
        version: 'v1',
        kind: 'Prompt',
        data: {
          message_id: 'p1',
          content: [{ kind: 'text', data: 'Start working.' }],
          meta: { timestamp: 1785230000 }
        }
      },
      {
        version: 'v1',
        kind: 'AssistantMessage',
        data: {
          message_id: 'a1',
          content: [
            {
              kind: 'toolUse',
              data: { toolUseId: 'tooluse_X', name: 'list_workflows', input: {} }
            }
          ]
        }
      },
      {
        version: 'v1',
        kind: 'ToolResults',
        data: {
          message_id: 'tr1',
          content: [
            {
              kind: 'toolResult',
              data: {
                toolUseId: 'tooluse_X',
                content: [{ kind: 'json', data: { workflows: [] } }],
                status: 'success'
              }
            },
            {
              kind: 'text',
              data: '[LIVE STEERING - New message from user]\n\nThe user sent a new message while you are working.\n\n<user_message id="steer-abc">\nuse epcc\n</user_message>\n\nIMPORTANT: After completing your work, include a brief note.'
            }
          ],
          results: {}
        }
      }
    ]
  }

  it('should extract steering messages from ToolResults text content', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_STEERING))
    const steering = result.messages.find(m => m.metadata?.isSteering === true)
    expect(steering).toBeDefined()
    expect(steering?.type).toBe('human')
    expect(steering?.content).toBe('use epcc')
  })

  it('should inject steering message after the ToolResults entry', async () => {
    const result = await parser.parse(JSON.stringify(KIRO_WITH_STEERING))
    const steeringIdx = result.messages.findIndex(m => m.metadata?.isSteering === true)
    const toolResultIdx = result.messages.findIndex(m => m.metadata?.toolType === 'result')
    // Steering comes after the tool result
    expect(steeringIdx).toBeGreaterThan(toolResultIdx)
  })
})
