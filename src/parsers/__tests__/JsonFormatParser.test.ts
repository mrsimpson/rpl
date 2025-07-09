import { describe, it, expect } from 'vitest'
import { JsonFormatParser } from '../JsonFormatParser'

describe('JsonFormatParser', () => {
  const parser = new JsonFormatParser()

  describe('Amazon Q Format', () => {
    it('should parse Amazon Q flat array format with ToolUseResults and Response', async () => {
      const amazonQData = [
        {
          "additional_context": "",
          "env_context": {
            "env_state": {
              "operating_system": "macos",
              "current_working_directory": "/test",
              "environment_variables": []
            }
          },
          "content": {
            "ToolUseResults": {
              "tool_use_results": [
                {
                  "tool_use_id": "tooluse_test123",
                  "content": [
                    {
                      "Text": "Tool result content"
                    }
                  ],
                  "status": "Success"
                }
              ]
            }
          },
          "images": null
        },
        {
          "Response": {
            "message_id": "msg-123",
            "content": "This is the agent response content"
          }
        }
      ]

      const result = await parser.parse(JSON.stringify(amazonQData))

      expect(result.metadata.format).toBe('json-amazonq')
      expect(result.metadata.title).toBe('Amazon Q Conversation')
      expect(result.messages).toHaveLength(2)

      // Check tool result message
      const toolMessage = result.messages[0]
      expect(toolMessage.type).toBe('tool_call')
      expect(toolMessage.metadata?.toolId).toBe('tooluse_test123')
      expect(toolMessage.metadata?.status).toBe('Success')
      expect(JSON.parse(toolMessage.content)).toMatchObject({
        type: 'tool_result',
        tool_use_id: 'tooluse_test123',
        status: 'Success'
      })

      // Check agent response message
      const agentMessage = result.messages[1]
      expect(agentMessage.type).toBe('agent')
      expect(agentMessage.content).toBe('This is the agent response content')
      expect(agentMessage.metadata?.messageId).toBe('msg-123')
    })

    it('should handle empty ToolUseResults', async () => {
      const amazonQData = [
        {
          "content": {
            "ToolUseResults": {
              "tool_use_results": []
            }
          }
        }
      ]

      const result = await parser.parse(JSON.stringify(amazonQData))
      expect(result.messages).toHaveLength(0)
    })
  })

  describe('Q-Developer Format', () => {
    it('should still parse Q-Developer format correctly', async () => {
      const qDevData = {
        conversation_id: "test-123",
        history: [
          [
            { content: { Prompt: { prompt: "Hello" } } },
            { content: { Response: { content: "Hi there!" } } }
          ]
        ]
      }

      const result = await parser.parse(JSON.stringify(qDevData))
      expect(result.metadata.format).toBe('json-qdev')
      expect(result.messages.length).toBeGreaterThan(0)
    })

    it('should handle Response messages in Q-Developer format', async () => {
      const qDevData = {
        conversation_id: "test-123",
        history: [
          [
            { content: { Prompt: { prompt: "Hello" } } },
            { Response: { message_id: "msg-123", content: "This is a response message" } }
          ]
        ]
      }

      const result = await parser.parse(JSON.stringify(qDevData))
      expect(result.metadata.format).toBe('json-qdev')
      expect(result.messages).toHaveLength(2)

      // Check user message
      const userMessage = result.messages[0]
      expect(userMessage.type).toBe('human')
      expect(userMessage.content).toBe('Hello')

      // Check response message
      const responseMessage = result.messages[1]
      expect(responseMessage.type).toBe('agent')
      expect(responseMessage.content).toBe('This is a response message')
      expect(responseMessage.metadata?.messageId).toBe('msg-123')
    })
  })

  describe('Generic Format', () => {
    it('should still parse generic JSON format correctly', async () => {
      const genericData = {
        messages: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" }
        ]
      }

      const result = await parser.parse(JSON.stringify(genericData))
      expect(result.metadata.format).toBe('json-generic')
      expect(result.messages).toHaveLength(2)
    })
  })

  describe('Format Detection', () => {
    it('should prioritize Q-Developer format over Amazon Q format', async () => {
      // Edge case: data that could match both formats
      const ambiguousData = {
        conversation_id: "test",
        history: [],
        // This would also match Amazon Q if it were an array
      }

      const result = await parser.parse(JSON.stringify(ambiguousData))
      expect(result.metadata.format).toBe('json-qdev')
    })

    it('should handle invalid JSON gracefully', async () => {
      await expect(parser.parse('invalid json')).rejects.toThrow('Invalid JSON format')
    })
  })
})
