import { describe, it, expect } from 'vitest'
import { TextFormatParser } from '../TextFormatParser'

describe('TextFormatParser', () => {
  const parser = new TextFormatParser()

  describe('Basic user message detection', () => {
    it('should parse standard > format', async () => {
      const content = `> This is a user message

This is an agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('This is a user message')
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[1].content).toBe('This is an agent response')
    })

    it('should parse [prefix]> format (no space)', async () => {
      const content = `[vibe]> This is a user message with prefix

Agent response here`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('This is a user message with prefix')
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[1].content).toBe('Agent response here')
    })

    it('should parse [prefix] > format (with space) - THE BUG FIX', async () => {
      const content = `[vibe] > This is a user message with space

Agent response here`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('This is a user message with space')
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[1].content).toBe('Agent response here')
    })
  })

  describe('Multi-line message handling', () => {
    it('should group multi-line user messages until empty line', async () => {
      const content = `> Multi-line user message
line 2 of user message
line 3 of user message

Agent response starts here`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('Multi-line user message\nline 2 of user message\nline 3 of user message')
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[1].content).toBe('Agent response starts here')
    })

    it('should group multi-line agent messages until empty line', async () => {
      const content = `> User message

Agent response line 1
Agent response line 2
Agent response line 3

> Another user message`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(3)
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[1].content).toBe('Agent response line 1\nAgent response line 2\nAgent response line 3')
    })
  })

  describe('Mixed format conversations', () => {
    it('should handle mixed > and [prefix]> formats', async () => {
      const content = `> Standard user message

Agent response

[vibe]> Prefixed user message

Another agent response

[user] > Spaced prefix message

Final agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(6)
      
      // First user message (standard)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('Standard user message')
      
      // Second user message (no space prefix)
      expect(result.messages[2].type).toBe('human')
      expect(result.messages[2].content).toBe('Prefixed user message')
      
      // Third user message (with space prefix)
      expect(result.messages[4].type).toBe('human')
      expect(result.messages[4].content).toBe('Spaced prefix message')
      
      // All agent messages
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[3].type).toBe('agent')
      expect(result.messages[5].type).toBe('agent')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty user messages', async () => {
      const content = `> 

Agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('')
    })

    it('should handle nested brackets in prefix', async () => {
      const content = `[user[nested]]> Message with nested brackets

Agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('Message with nested brackets')
    })

    it('should handle multiple > symbols in content', async () => {
      const content = `[user]>> Message with extra > symbols

Agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('> Message with extra > symbols')
    })

    it('should handle conversation with only agent messages', async () => {
      const content = `This is an agent message

Another agent message

Final agent message`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(3)
      expect(result.messages.every(msg => msg.type === 'agent')).toBe(true)
    })

    it('should handle special characters in prefix like !', async () => {
      const content = `[vibe] !> Message with exclamation in prefix

Agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('Message with exclamation in prefix')
    })

    it('should handle whitespace-only lines as delimiters', async () => {
      const content = `> User message
   
Agent response with whitespace delimiter`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[1].type).toBe('agent')
    })

    it('should handle consecutive user messages', async () => {
      const content = `> First user message

> Second user message

Agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(3)
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toBe('First user message')
      expect(result.messages[1].type).toBe('human')
      expect(result.messages[1].content).toBe('Second user message')
      expect(result.messages[2].type).toBe('agent')
    })
  })

  describe('Real-world format compatibility', () => {
    it('should handle the hackathon conversation format', async () => {
      const content = `[vibe] > I want you to help me file a hackathon submission for this project.
Story: this is a fun project which I though about when submitting another hackathon project.

I'd be happy to help you create a compelling hackathon submission for your LLM Conversation Replay Player!

[vibe] > /tools trustall

All tools are now trusted (!). Amazon Q will execute tools without asking for confirmation.

[vibe] !> y

Let me start a development workflow to help you structure this hackathon submission properly.`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(6)
      
      // First user message
      expect(result.messages[0].type).toBe('human')
      expect(result.messages[0].content).toContain('I want you to help me file a hackathon submission')
      
      // Second user message
      expect(result.messages[2].type).toBe('human')
      expect(result.messages[2].content).toBe('/tools trustall')
      
      // Third user message (with different prefix)
      expect(result.messages[4].type).toBe('human')
      expect(result.messages[4].content).toBe('y')
      
      // Agent messages
      expect(result.messages[1].type).toBe('agent')
      expect(result.messages[3].type).toBe('agent')
      expect(result.messages[5].type).toBe('agent')
    })
  })

  describe('Metadata', () => {
    it('should return correct metadata', async () => {
      const content = `> Test message

Test response`

      const result = await parser.parse(content)
      
      expect(result.metadata.title).toBe('Text Format Conversation')
      expect(result.metadata.format).toBe('text')
      expect(result.metadata.timestamp).toBeDefined()
    })
  })

  describe('Message properties', () => {
    it('should assign unique IDs to messages', async () => {
      const content = `> First message

First response

> Second message

Second response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(4)
      expect(result.messages[0].id).toBe('1')
      expect(result.messages[1].id).toBe('2')
      expect(result.messages[2].id).toBe('3')
      expect(result.messages[3].id).toBe('4')
    })

    it('should assign timestamps to all messages', async () => {
      const content = `> User message

Agent response`

      const result = await parser.parse(content)
      
      expect(result.messages).toHaveLength(2)
      expect(result.messages[0].timestamp).toBeDefined()
      expect(result.messages[1].timestamp).toBeDefined()
      expect(new Date(result.messages[0].timestamp)).toBeInstanceOf(Date)
      expect(new Date(result.messages[1].timestamp)).toBeInstanceOf(Date)
    })
  })
})
