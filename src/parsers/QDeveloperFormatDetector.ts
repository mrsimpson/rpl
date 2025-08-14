/**
 * Q-Developer format version detection
 */
export class QDeveloperFormatDetector {
  /**
   * Detect the format version of Q-Developer conversation data
   */
  static detectVersion(data: any): string {
    if (!this.isQDeveloperFormat(data)) {
      throw new Error('Not a Q-Developer format')
    }

    // Check if history contains arrays (V1) or objects (V2)
    if (data.history && data.history.length > 0) {
      const firstItem = data.history[0]
      
      if (Array.isArray(firstItem)) {
        return 'v1-array'
      } else if (firstItem && typeof firstItem === 'object' && firstItem.user && firstItem.assistant) {
        return 'v2-object'
      }
    }

    // Default to V1 if we can't determine
    return 'v1-array'
  }

  /**
   * Check if the data is in Q-Developer format
   */
  static isQDeveloperFormat(data: any): boolean {
    return data && 
           typeof data === 'object' &&
           data.conversation_id && 
           data.history && 
           Array.isArray(data.history)
  }

  /**
   * Get detailed format information
   */
  static getFormatInfo(data: any): {
    version: string
    isValid: boolean
    historyLength: number
    sampleStructure: any
  } {
    const isValid = this.isQDeveloperFormat(data)
    
    if (!isValid) {
      return {
        version: 'unknown',
        isValid: false,
        historyLength: 0,
        sampleStructure: null
      }
    }

    const version = this.detectVersion(data)
    const historyLength = data.history?.length || 0
    const sampleStructure = historyLength > 0 ? {
      firstItem: {
        isArray: Array.isArray(data.history[0]),
        hasUserProperty: !!(data.history[0]?.user),
        hasAssistantProperty: !!(data.history[0]?.assistant),
        keys: Object.keys(data.history[0] || {})
      }
    } : null

    return {
      version,
      isValid,
      historyLength,
      sampleStructure
    }
  }
}
