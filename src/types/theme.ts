// Theme-related TypeScript interfaces

export type TerminalTheme = 'matrix' | 'high-contrast'
export type WindowStyle = 'macos' | 'linux' | 'windows' | 'auto'
export type OSType = 'macos' | 'windows' | 'linux'

export interface TerminalThemeColors {
  background: string
  text: string
  accent: string
  dim: string
  cursor: string
}

export interface TerminalThemeDefinition {
  name: TerminalTheme
  colors: TerminalThemeColors
}

// OS Detection result
export interface OSDetectionResult {
  detected: OSType
  userAgent: string
  platform: string
}
