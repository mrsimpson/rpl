import { QDeveloperFormatDetector } from './QDeveloperFormatDetector'
import { QDeveloperV1Parser, QDeveloperV2Parser, type QDeveloperVersionParser } from './QDeveloperVersionParser'
import type { ConversationData } from '../types'

/**
 * Factory for creating and managing Q-Developer format parsers
 */
export class QDeveloperParserFactory {
  private static parsers: Map<string, QDeveloperVersionParser> = new Map([
    ['v1-array', new QDeveloperV1Parser()],
    ['v2-object', new QDeveloperV2Parser()]
  ])

  /**
   * Parse Q-Developer conversation data using the appropriate version parser
   */
  static parse(data: any): ConversationData {
    // Detect format version
    const version = QDeveloperFormatDetector.detectVersion(data)
    
    // Get appropriate parser
    const parser = this.getParser(version)
    
    if (!parser) {
      throw new Error(`No parser available for Q-Developer format version: ${version}`)
    }

    // Parse with version-specific parser
    return parser.parse(data)
  }

  /**
   * Get parser for specific version
   */
  static getParser(version: string): QDeveloperVersionParser | undefined {
    return this.parsers.get(version)
  }

  /**
   * Register a new version parser
   */
  static registerParser(version: string, parser: QDeveloperVersionParser): void {
    this.parsers.set(version, parser)
  }

  /**
   * Get all available parser versions
   */
  static getAvailableVersions(): string[] {
    return Array.from(this.parsers.keys())
  }

  /**
   * Get detailed format analysis
   */
  static analyzeFormat(data: any): {
    isQDeveloperFormat: boolean
    version?: string
    formatInfo?: any
    parser?: QDeveloperVersionParser
  } {
    if (!QDeveloperFormatDetector.isQDeveloperFormat(data)) {
      return {
        isQDeveloperFormat: false
      }
    }

    const version = QDeveloperFormatDetector.detectVersion(data)
    const formatInfo = QDeveloperFormatDetector.getFormatInfo(data)
    const parser = this.getParser(version)

    return {
      isQDeveloperFormat: true,
      version,
      formatInfo,
      parser
    }
  }
}
