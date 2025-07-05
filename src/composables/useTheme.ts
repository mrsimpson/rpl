import { ref, computed, onMounted, readonly } from 'vue'

// Global state for theme management
const isSystemDark = ref(false)
const isManualOverride = ref(false)
const manualDarkMode = ref(false)

// Session storage key
const SESSION_KEY = 'theme-manual-override'

export function useTheme() {
  // Computed current dark mode state
  const isDark = computed(() => {
    return isManualOverride.value ? manualDarkMode.value : isSystemDark.value
  })

  // CSS classes for easy component integration
  const themeClasses = computed(() => {
    return [isDark.value ? 'dark' : 'light']
  })

  // Toggle between light and dark mode
  const toggleTheme = () => {
    if (isManualOverride.value) {
      // If already overridden, toggle the manual setting
      manualDarkMode.value = !manualDarkMode.value
    } else {
      // First manual override - set opposite of system
      isManualOverride.value = true
      manualDarkMode.value = !isSystemDark.value
    }
    
    // Save to session storage
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      isManualOverride: isManualOverride.value,
      manualDarkMode: manualDarkMode.value
    }))
  }

  // Initialize theme system
  const initializeTheme = () => {
    // Detect system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    isSystemDark.value = mediaQuery.matches

    // Listen for system preference changes
    mediaQuery.addEventListener('change', (e) => {
      isSystemDark.value = e.matches
    })

    // Check for session override (but don't restore from localStorage)
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        const { isManualOverride: savedOverride, manualDarkMode: savedMode } = JSON.parse(saved)
        isManualOverride.value = savedOverride
        manualDarkMode.value = savedMode
      }
    } catch (e) {
      console.warn('Failed to parse saved theme preference:', e)
      // Reset to system preference on error
      isManualOverride.value = false
    }
  }

  return {
    // Reactive state - only what components need
    isDark: readonly(isDark),
    
    // Actions
    toggleTheme,
    
    // CSS classes for easy component integration
    themeClasses: readonly(themeClasses),
    
    // Internal initialization (called once)
    initializeTheme
  }
}

// Initialize theme system once when first composable is created
let isInitialized = false
export function ensureThemeInitialized() {
  if (!isInitialized) {
    const { initializeTheme } = useTheme()
    initializeTheme()
    isInitialized = true
  }
}
