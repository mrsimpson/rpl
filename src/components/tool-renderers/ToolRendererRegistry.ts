import type { Component } from 'vue'
import FsReadRenderer from './FsReadRenderer.vue'
import FsWriteRenderer from './FsWriteRenderer.vue'
import DefaultToolRenderer from './DefaultToolRenderer.vue'

export interface ToolRendererProps {
  toolData: any
}

export type ToolRenderer = Component<ToolRendererProps>

class ToolRendererRegistry {
  private renderers = new Map<string, ToolRenderer>()

  constructor() {
    // Register known tool renderers
    this.register('fs_read', FsReadRenderer)
    this.register('fs_write', FsWriteRenderer)
  }

  register(toolName: string, renderer: ToolRenderer): void {
    this.renderers.set(toolName, renderer)
  }

  getRenderer(toolName: string): ToolRenderer {
    return this.renderers.get(toolName) || DefaultToolRenderer
  }

  hasRenderer(toolName: string): boolean {
    return this.renderers.has(toolName)
  }
}

export const toolRendererRegistry = new ToolRendererRegistry()
