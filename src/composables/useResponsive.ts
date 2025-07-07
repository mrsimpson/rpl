import { ref, onMounted, onUnmounted } from 'vue'

export function useResponsive() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)
  
  const updateResponsiveState = () => {
    const width = window.innerWidth
    
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024
  }
  
  onMounted(() => {
    updateResponsiveState()
    window.addEventListener('resize', updateResponsiveState)
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', updateResponsiveState)
  })
  
  return {
    isMobile,
    isTablet,
    isDesktop
  }
}
