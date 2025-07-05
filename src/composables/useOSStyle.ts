import { ref, computed, readonly } from 'vue'
import type { OSType, WindowStyle, OSDetectionResult } from '../types/theme'

// Global state for OS detection and window styling
const detectedOS = ref<OSType>('linux') // Default fallback
const manualWindowStyle = ref<WindowStyle>('auto')

// Detect operating system
const detectOS = (): OSDetectionResult => {
  const userAgent = navigator.userAgent.toLowerCase()
  const platform = navigator.platform.toLowerCase()
  
  let detected: OSType = 'linux' // Default fallback
  
  // Check platform first (more reliable)
  if (platform.includes('mac') || platform.includes('darwin')) {
    detected = 'macos'
  } else if (platform.includes('win')) {
    detected = 'windows'
  } else if (platform.includes('linux')) {
    detected = 'linux'
  } else {
    // Fallback to user agent
    if (userAgent.includes('mac os') || userAgent.includes('darwin')) {
      detected = 'macos'
    } else if (userAgent.includes('windows') || userAgent.includes('win32') || userAgent.includes('win64')) {
      detected = 'windows'
    } else if (userAgent.includes('linux') || userAgent.includes('x11')) {
      detected = 'linux'
    }
  }
  
  return {
    detected,
    userAgent,
    platform
  }
}

export function useOSStyle(windowStyleSetting?: WindowStyle) {
  // Current effective window style - use setting if provided, otherwise use internal state
  const currentWindowStyle = computed<WindowStyle>(() => {
    const effectiveStyle = windowStyleSetting || manualWindowStyle.value
    return effectiveStyle === 'auto' ? detectedOS.value : effectiveStyle
  })

  // CSS classes for window styling
  const windowStyleClasses = computed(() => {
    return [currentWindowStyle.value]
  })

  // Set window style (including 'auto' for system detection)
  const setWindowStyle = (style: WindowStyle) => {
    manualWindowStyle.value = style
  }

  // Initialize OS detection
  const initializeOSDetection = () => {
    const result = detectOS()
    detectedOS.value = result.detected
    
    // Log detection result for debugging
    console.log('OS Detection:', result)
  }

  return {
    // Reactive state
    detectedOS: readonly(detectedOS),
    currentWindowStyle: readonly(currentWindowStyle),
    
    // Actions
    setWindowStyle,
    
    // CSS classes for easy component integration
    windowStyleClasses: readonly(windowStyleClasses),
    
    // Internal initialization
    initializeOSDetection
  }
}

// Initialize OS detection once when first composable is created
let isInitialized = false
export function ensureOSStyleInitialized() {
  if (!isInitialized) {
    const { initializeOSDetection } = useOSStyle()
    initializeOSDetection()
    isInitialized = true
  }
}
