import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'

// Consistent breakpoints across the application
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const

export function useResponsive() {
  const windowWidth = ref(window.innerWidth)

  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  const isMobile = computed(() => windowWidth.value <= BREAKPOINTS.mobile)
  const isTablet = computed(() => 
    windowWidth.value > BREAKPOINTS.mobile && windowWidth.value <= BREAKPOINTS.tablet
  )
  const isDesktop = computed(() => windowWidth.value > BREAKPOINTS.tablet)

  return {
    windowWidth: readonly(windowWidth),
    isMobile,
    isTablet,
    isDesktop,
  }
}
