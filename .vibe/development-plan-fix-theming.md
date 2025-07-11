# Development Plan: rpl (fix-theming branch)

*Generated on 2025-07-05 by Vibe Feature MCP*
*Workflow: waterfall*

## Goal
Refactor the theming system to eliminate conflicts between light/dark mode and terminal themes, ensure complete theme coverage across all components, and remove the complex central stylesheet (style.css) in favor of component-scoped theming.

## Requirements
### Tasks
- [x] Analyze current theming implementation
- [x] Document theming conflicts and issues
- [x] Define new theming architecture requirements
- [x] Specify terminal theme variants and colors
- [x] Define OS-based window styling requirements
- [x] Define light/dark mode detection and persistence behavior
- [x] Define new settings structure
- [x] Specify component theming approach (theme provider + scoped styles)
- [x] Identify all components requiring light/dark mode styling
- [x] Define theme provider composable API requirements
- [x] Define terminal theme data structure
- [x] Document component migration requirements

### Completed
- [x] Created development plan file
- [x] Analyzed current theming system in style.css, App.vue, ConversationDisplay.vue, and SettingsPanel.vue
- [x] Clarified theming scope and architecture with user

## Design

### Phase Entrance Criteria:
- [x] The requirements have been thoroughly defined
- [x] Current theming system has been analyzed and documented
- [x] Conflicts between light/dark mode and terminal themes are understood
- [x] Scope of theming refactor is clearly defined

### Tasks
- [x] Design theme provider composable API and implementation
- [x] Design OS detection utility and window styling system
- [x] Design terminal theme system architecture
- [x] Design component styling patterns and CSS organization
- [x] Design new settings structure (no migration needed)
- [x] Define TypeScript interfaces for new theme system
- [x] Design component integration patterns
- [x] Plan style.css elimination strategy

### Completed
- [x] Analyzed existing composable patterns in useConversationState.ts
- [x] Designed theme provider composable API following Vue 3 Composition API patterns
- [x] Refined API design based on user feedback - simplified to essential component needs
- [x] Designed complete technical architecture for dual theme system
- [x] Defined clean settings structure with no migration complexity
- [x] Planned style.css elimination strategy

## Implementation

### Phase Entrance Criteria:
- [x] Technical design for new theming system is complete
- [x] Architecture decisions have been documented
- [x] Migration strategy from current system is defined
- [x] Component-level theming approach is designed

### Tasks
- [x] Create theme-related TypeScript interfaces
- [x] Implement useTheme composable
- [x] Implement useOSStyle composable
- [x] Update Settings interface and remove old theme field
- [x] Refactor ConversationDisplay for local terminal theming (partially - template and script updated)
- [x] Update App.vue to use new theme system
- [x] Update SettingsPanel for new theme structure
- [x] Update AppFooter and other components for light/dark theming
- [x] Eliminate style.css complexity - keep only essentials
- [x] Test theme switching and OS detection
- [x] Fix terminal light/dark variants (terminal themes should adapt to app light/dark mode)
- [x] Fix missing window control buttons (close, minimize, maximize)
- [x] Fix home page styling issues
- [x] Fix window style detection - currently always shows macOS with crowded buttons
- [x] Fix context window light/dark theme adaptation
- [x] Redesign source selection UI to be more organized and user-friendly

### New Task: Source Selection UI Redesign
- [x] Reorganize into clear sections: Remote Sources vs Local Files
- [x] For Local Files: differentiate single conversation vs conversation + context
- [x] Make demo less prominent (move to bottom or separate section)
- [x] Improve visual hierarchy and user experience
- [x] Add clear descriptions for each option

### Completed
- [x] Created theme.ts with TypeScript interfaces for new theme system
- [x] Updated Settings interface to use new terminalTheme and windowStyle fields
- [x] Implemented useTheme composable with system preference detection and session persistence
- [x] Implemented useOSStyle composable with automatic OS detection
- [x] Refactored App.vue to use new theme system, removed old dark-mode class
- [x] Updated SettingsPanel with new theme controls and light/dark styling
- [x] Updated AppFooter to use new theme system
- [x] Updated ConversationDisplay template and script for new theming (styles need completion)
- [x] Eliminated style.css complexity - reduced from 800+ lines to ~50 lines of essential tokens
- [x] Fixed Vue compilation errors in AppFooter and ConversationDisplay
- [x] Successfully tested theme switching: light/dark mode toggle works perfectly
- [x] Successfully tested terminal theme selection: Matrix Green and High Contrast options work
- [x] Successfully tested demo loading: conversation display works with new theming system
- [x] Fixed terminal light/dark variants: Matrix theme now has light green variant, High Contrast adapts to app theme
- [x] Fixed missing window control buttons: macOS-style colored buttons (×, −, +) are working
- [x] Fixed home page styling: SourceInput component now has proper theme-aware styling
- [x] Fixed CSS syntax errors in ConversationDisplay that were preventing compilation
- [x] Fixed window style detection: Now properly detects and applies macOS/Linux/Windows styles based on settings
- [x] Fixed button spacing: Window controls now have proper 8px gap instead of crowded appearance
- [x] Fixed ApplicationWindow component: Updated to use new theming system with proper light/dark adaptation
- [x] Made window style changes reactive: Settings changes now properly update window controls in real-time
- [x] Redesigned source selection UI with clear organization and improved user experience:
  - **Remote Sources section**: Clean URL input with format selection
  - **Local Files section**: Two distinct options for single files vs folders with context
  - **Demo section**: Collapsible details element, less prominent but still accessible
  - **Visual improvements**: Icons, better typography, hover effects, responsive design
  - **Better descriptions**: Clear explanations for each loading option
  - **Improved functionality**: Toast notifications, better error handling, file type validation
- [x] Created theme.ts with TypeScript interfaces for new theme system
- [x] Updated Settings interface to use new terminalTheme and windowStyle fields
- [x] Implemented useTheme composable with system preference detection and session persistence
- [x] Implemented useOSStyle composable with automatic OS detection
- [x] Refactored App.vue to use new theme system, removed old dark-mode class
- [x] Updated SettingsPanel with new theme controls and light/dark styling
- [x] Updated AppFooter to use new theme system
- [x] Updated ConversationDisplay template and script for new theming (styles need completion)
- [x] Eliminated style.css complexity - reduced from 800+ lines to ~50 lines of essential tokens
- [x] Fixed Vue compilation errors in AppFooter and ConversationDisplay
- [x] Successfully tested theme switching: light/dark mode toggle works perfectly
- [x] Successfully tested terminal theme selection: Matrix Green and High Contrast options work
- [x] Successfully tested demo loading: conversation display works with new theming system
- [x] Fixed terminal light/dark variants: Matrix theme now has light green variant, High Contrast adapts to app theme
- [x] Fixed missing window control buttons: macOS-style colored buttons (×, −, +) are working
- [x] Fixed home page styling: SourceInput component now has proper theme-aware styling
- [x] Fixed CSS syntax errors in ConversationDisplay that were preventing compilation

## Qa

### Phase Entrance Criteria:
- [ ] Core theming implementation is complete
- [ ] All components have been migrated to new theming system
- [ ] Central stylesheet has been eliminated
- [ ] Light/dark mode conflicts have been resolved

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Testing

### Phase Entrance Criteria:
- [ ] Code quality review is complete
- [ ] Syntax and build checks pass
- [ ] Linting issues are resolved
- [ ] Security and performance review is done

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Complete

### Phase Entrance Criteria:
- [ ] All theming functionality works correctly
- [ ] Theme switching works without conflicts
- [ ] All components are properly themed
- [ ] User acceptance criteria are met

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Key Decisions
### User Requirements Clarified:
1. **Separation of Concerns**: Terminal themes apply ONLY to terminal content area
2. **App-wide Theming**: Rest of application uses light/dark mode system
3. **Terminal Themes**: Only 2 themes - Matrix (green) and High-Contrast (black/white)
4. **OS Integration**: Auto-detect OS for window styling with manual override option
5. **Light/Dark Detection**: Auto-detect system preference on load, remember user changes during session, reset to auto-detect on next load
6. **Complete Redesign**: No migration - fresh implementation

### New Settings Structure:
```typescript
// New structure
terminalTheme: 'matrix' | 'high-contrast'
windowStyle: 'macos' | 'linux' | 'windows' | 'auto'
// light/dark handled by theme provider, not in settings

// Old structure (to be removed)
theme: 'matrix' | 'amber' | 'blue' | 'hacker' | 'light'
windowStyle: 'macos' | 'linux' | 'windows'
```

### New Architecture Requirements:
- **Dual Theme System**: 
  - App-level: Light/Dark mode via lightweight theme provider composable
  - Terminal-level: Terminal themes scoped locally to terminal component
- **OS-Aware Styling**: Auto-detect OS with manual override for window decorations
- **Component Scoping**: Each component imports theme provider for light/dark, terminal manages own themes
- **Eliminate Central CSS**: Remove style.css complexity, move to component-scoped styles
- **Session-based Persistence**: Light/dark preference persists during session, resets to system preference on reload

### Design Clarification:
- **Window Light/Dark Sensitivity**: Windows combine OS styling (shape, decorations) with light/dark theming (colors)
  - OS determines: border radius, shadow style, control button appearance
  - Light/Dark determines: background colors, text colors, border colors
  - Example: macOS window with rounded corners + dark theme colors

### Technical Design Decisions:

#### 1. Theme Provider Composable (`useTheme`) - REVISED
```typescript
// src/composables/useTheme.ts
export function useTheme() {
  return {
    // Simple reactive state - only what components need
    isDark: ComputedRef<boolean>
    
    // Actions
    toggleTheme: () => void
    
    // CSS classes for easy component integration
    themeClasses: ComputedRef<string[]> // ['dark'] or ['light']
  }
}
```

**Simplified Implementation Strategy:**
- Components only need to know: "am I dark or light?"
- Internal complexity (system detection, manual override, session storage) is hidden
- Clean, minimal API focused on component needs
- The composable handles all the complexity internally:
  - Auto-detect system preference on load
  - Track manual overrides during session
  - Reset to system on reload
  - But components don't need to know these details

#### 2. OS Detection & Window Styling System
```typescript
// src/composables/useOSStyle.ts
export function useOSStyle() {
  return {
    detectedOS: ComputedRef<OSType>
    currentWindowStyle: ComputedRef<WindowStyle>
    setWindowStyle: (style: WindowStyle | 'auto') => void
    windowStyleClasses: ComputedRef<string[]>
  }
}

type OSType = 'macos' | 'windows' | 'linux'
type WindowStyle = OSType | 'auto'
```

**Detection Strategy:**
- Use `navigator.platform` and `navigator.userAgent` for OS detection
- Fallback hierarchy: platform → userAgent → default to 'linux'
- Allow manual override in settings
- Provide CSS classes for window styling

#### 3. Terminal Theme System (Component-Scoped)
```typescript
// Local to ConversationDisplay.vue
interface TerminalTheme {
  name: 'matrix' | 'high-contrast'
  colors: {
    background: string
    text: string
    accent: string
    dim: string
    cursor: string
  }
}

const terminalThemes: Record<string, TerminalTheme> = {
  matrix: {
    name: 'matrix',
    colors: {
      background: '#0d1117',
      text: '#00ff41',
      accent: '#00cc33',
      dim: '#008822',
      cursor: '#00ff41'
    }
  },
  'high-contrast': {
    name: 'high-contrast', 
    colors: {
      background: '#000000',
      text: '#ffffff',
      accent: '#ffffff',
      dim: '#cccccc',
      cursor: '#ffffff'
    }
  }
}
```

#### 4. Component Styling Patterns
**Pattern 1: Theme-Aware Components (Non-Terminal)**
```vue
<template>
  <div :class="themeClasses">
    <!-- Component content -->
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
const { themeClasses } = useTheme()
</script>

<style scoped>
.light {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  --border-color: #e0e0e0;
}

.dark {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --border-color: #404040;
}

.component-root {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>
```

**Pattern 2: OS-Aware Window Components**
```vue
<template>
  <div :class="[themeClasses, windowStyleClasses]">
    <!-- Window content -->
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { useOSStyle } from '@/composables/useOSStyle'

const { themeClasses } = useTheme()
const { windowStyleClasses } = useOSStyle()
</script>

<style scoped>
/* Base window styles */
.window {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* OS-specific overrides */
.macos.window {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.windows.window {
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.linux.window {
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>
```

#### 5. New Settings Structure (No Migration)
```typescript
// New Settings Interface - Clean Start
interface Settings {
  // Animation settings (unchanged)
  humanAnimationSpeed: number
  agentAnimationSpeed: number
  
  // NEW: Simple terminal theme
  terminalTheme: 'matrix' | 'high-contrast'
  
  // NEW: Enhanced window styling with auto-detect
  windowStyle: 'macos' | 'linux' | 'windows' | 'auto'
  
  // Visual options (unchanged)
  showProgress: boolean
  showGhostPreview: boolean
  enableSounds: boolean
  
  // Context settings (unchanged)
  contextPanelWidth?: number
  showContextPanel?: boolean
  pauseOnContext?: boolean
  autoShowContext?: boolean
  
  // REMOVED: theme (old terminal theme system)
  // Light/dark mode handled by useTheme composable, not in settings
}
```

**Settings Handling:**
- Remove old `theme` field completely
- Add new `terminalTheme` field with default 'matrix'
- Add `windowStyle` with default 'auto'
- Light/dark mode not stored in settings (session-only via useTheme)

#### 6. TypeScript Interfaces
```typescript
// src/types/theme.ts
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

// Update existing Settings interface
export interface Settings {
  humanAnimationSpeed: number
  agentAnimationSpeed: number
  terminalTheme: TerminalTheme  // NEW
  windowStyle: WindowStyle      // NEW
  showProgress: boolean
  showGhostPreview: boolean
  enableSounds: boolean
  contextPanelWidth?: number
  showContextPanel?: boolean
  pauseOnContext?: boolean
  autoShowContext?: boolean
}
```

#### 7. Style.css Elimination Strategy
**Phase 1: Extract Reusable Tokens**
- Create minimal CSS custom properties for spacing, fonts, transitions
- Keep only truly global styles (reset, base typography)

**Phase 2: Component Migration**
- Each component defines its own theme-aware styles
- Use useTheme() and useOSStyle() composables for dynamic styling
- Remove all theme-specific CSS from global scope

**Phase 3: Global Cleanup**
- Remove all theme classes (.theme-matrix, .theme-amber, etc.)
- Remove dark-mode class system
- Keep only essential global styles (~50 lines vs current 800+)

```css
/* New minimal style.css */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
  --spacing-1: 8px;
  --spacing-2: 16px;
  --spacing-3: 24px;
  --spacing-4: 32px;
  --transition: all 0.2s ease;
  --border-radius: 4px;
}

body {
  font-family: var(--font-mono);
  font-size: 14px;
  line-height: 1.5;
}
```

#### 4. Component Styling Patterns
**Pattern 1: Theme-Aware Components (Non-Terminal)**
```vue
<template>
  <div :class="themeClasses">
    <!-- Component content -->
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
const { themeClasses } = useTheme()
</script>

<style scoped>
.light {
  --bg-primary: #ffffff;
  --text-primary: #000000;
  --border-color: #e0e0e0;
}

.dark {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
  --border-color: #404040;
}

.component-root {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
</style>
```

**Pattern 2: OS-Aware Window Components**
```vue
<template>
  <div :class="[themeClasses, windowStyleClasses]">
    <!-- Window content -->
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'
import { useOSStyle } from '@/composables/useOSStyle'

const { themeClasses } = useTheme()
const { windowStyleClasses } = useOSStyle()
</script>

<style scoped>
/* Base window styles */
.window {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* OS-specific overrides */
.macos.window {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.windows.window {
  border-radius: 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.linux.window {
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>
```

#### 5. Settings Structure Migration
```typescript
// New Settings Interface
interface Settings {
  // Animation settings (unchanged)
  humanAnimationSpeed: number
  agentAnimationSpeed: number
  
  // New terminal theme structure
  terminalTheme: 'matrix' | 'high-contrast'
  
  // Enhanced window styling
  windowStyle: 'macos' | 'linux' | 'windows' | 'auto'
  
  // Visual options (unchanged)
  showProgress: boolean
  showGhostPreview: boolean
  enableSounds: boolean
  
  // Context settings (unchanged)
  contextPanelWidth?: number
  showContextPanel?: boolean
  pauseOnContext?: boolean
  autoShowContext?: boolean
}

// Migration function
function migrateSettings(oldSettings: any): Settings {
  return {
    ...oldSettings,
    terminalTheme: mapOldThemeToNew(oldSettings.theme),
    windowStyle: oldSettings.windowStyle || 'auto'
  }
}

function mapOldThemeToNew(oldTheme: string): 'matrix' | 'high-contrast' {
  switch (oldTheme) {
    case 'matrix':
    case 'hacker':
      return 'matrix'
    case 'light':
    case 'amber':
    case 'blue':
    default:
      return 'high-contrast'
  }
}
```

### Current Architecture Problems:
- App.vue manages both `isDarkMode` and `settings.theme` separately
- style.css contains both global variables and theme-specific overrides
- Components mix CSS custom properties from global scope with local styles
- Theme switching doesn't affect all UI elements consistently

## Notes
### Detailed Requirements Specification:

#### 1. Theme Provider Composable
- **Purpose**: Provide light/dark mode state to all non-terminal components
- **Behavior**: 
  - Auto-detect system preference on app load using `prefers-color-scheme`
  - Allow manual toggle during session
  - Persist manual choice in sessionStorage (not localStorage)
  - Reset to system preference on next app load
- **API**: Reactive state and toggle function

#### 2. Terminal Theme System
- **Scope**: Only applies to terminal content area (ConversationDisplay component)
- **Themes**:
  - **Matrix**: Green text on dark background (classic terminal look)
  - **High-Contrast**: Black text on white background / white text on black background
- **Implementation**: Local to terminal component, no global CSS variables

#### 3. OS Detection & Window Styling
- **Auto-detection**: Use navigator.platform or userAgent to detect OS
- **Window Styles**: 
  - macOS: Rounded corners, colored traffic lights
  - Windows: Square corners, minimize/maximize/close buttons
  - Linux: Varies, but generally square with simple controls
- **Manual Override**: Settings allow user to override auto-detected OS style

#### 4. Component Migration Requirements
- **Remove Dependencies**: All components must stop using style.css variables
- **Scoped Styles**: Each component defines its own theme-aware styles
- **Theme Provider Integration**: Non-terminal components use theme provider for light/dark
- **OS Style Integration**: Window-like components (settings, dialogs) use OS-appropriate styling

#### 5. Components Requiring Updates
- App.vue: Remove dark-mode class, integrate theme provider
- ConversationDisplay.vue: Implement local terminal theming
- SettingsPanel.vue: Use theme provider, OS-style window appearance
- AppFooter.vue: Use theme provider for light/dark styling
- All dialog/modal components: OS-appropriate styling
- Form components: Theme-aware input styling

*Additional context and observations*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
