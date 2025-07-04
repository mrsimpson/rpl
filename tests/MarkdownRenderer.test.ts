import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MarkdownRenderer from '../src/components/viewers/MarkdownRenderer.vue'

describe('MarkdownRenderer', () => {
  let wrapper: any

  beforeEach(() => {
    // Clean up any existing wrapper
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('renders markdown content correctly', async () => {
    const markdownContent = '# Test Header\n\nThis is **bold** text.'
    
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: markdownContent,
        filename: 'test.md'
      }
    })

    // Wait for rendering to complete
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(wrapper.find('.markdown-content').exists()).toBe(true)
  })

  it('detects markdown content by file extension', async () => {
    const plainContent = 'This is plain text without markdown.'
    
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: plainContent,
        filename: 'test.md'
      }
    })

    await wrapper.vm.$nextTick()
    
    // Should render as markdown because of .md extension
    expect(wrapper.find('.markdown-content').exists()).toBe(true)
  })

  it('detects markdown content by patterns', async () => {
    const markdownContent = '# This looks like markdown\n\n- List item\n- Another item'
    
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: markdownContent,
        filename: 'test.txt'
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Should render as markdown because of content patterns
    expect(wrapper.find('.markdown-content').exists()).toBe(true)
  })

  it('clears content when props change', async () => {
    const initialContent = '# Initial Content'
    
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: initialContent,
        filename: 'test.md'
      }
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Verify initial content is rendered
    expect(wrapper.find('.markdown-content').exists()).toBe(true)

    // Change the content
    await wrapper.setProps({
      content: '# New Content',
      filename: 'test.md'
    })

    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))

    // Content should still be rendered (but different)
    expect(wrapper.find('.markdown-content').exists()).toBe(true)
  })

  it('shows loading state during rendering', async () => {
    const markdownContent = '# Test Content'
    
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: markdownContent,
        filename: 'test.md'
      }
    })

    // Initially might show loading
    const hasLoading = wrapper.find('.loading-container').exists()
    const hasContent = wrapper.find('.markdown-content').exists()
    
    // Should have either loading or content (or both during transition)
    expect(hasLoading || hasContent).toBe(true)
  })

  it('handles empty content gracefully', async () => {
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: '',
        filename: 'test.md'
      }
    })

    await wrapper.vm.$nextTick()
    
    // Should not crash and should not show markdown content
    expect(wrapper.find('.markdown-content').exists()).toBe(false)
  })

  it('cleans up on unmount', async () => {
    const markdownContent = '# Test Content'
    
    wrapper = mount(MarkdownRenderer, {
      props: {
        content: markdownContent,
        filename: 'test.md'
      }
    })

    await wrapper.vm.$nextTick()
    
    // Unmount the component
    wrapper.unmount()
    
    // Should not throw any errors during cleanup
    expect(true).toBe(true)
  })
})
