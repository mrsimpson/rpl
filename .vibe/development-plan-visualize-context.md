# Development Plan: rpl (visualize-context branch)

*Generated on 2025-07-02 by Vibe Feature MCP*
*Workflow: epcc*

## Goal
Add a feature to display relevant contextual data (screenshots, images, documents) during conversation replay to illustrate what the agent achieved at specific points in the conversation process.

## Explore
### Tasks
- [x] Analyze current codebase architecture
- [x] Define data format for contextual attachments
- [x] Determine integration points in message flow
- [x] Explore UI/UX patterns for displaying contextual data
- [x] Investigate file handling and storage options
- [x] Define user interaction patterns
- [x] Explore association mechanisms without modifying original files
- [x] Research responsive layout patterns for dual-pane vs modal
- [x] Define file naming conventions and parsing logic
- [x] Explore context discovery algorithm
- [x] Research tabbed interface patterns for context navigation
- [x] Analyze existing adapter pattern for source handling
- [x] Design context discovery adapter architecture
- [x] Explore plain HTML resource context association strategies

### Completed
- [x] Created development plan file
- [x] Examined Vue.js application structure
- [x] Analyzed message rendering system (MessageRenderer, ConversationTerminal)
- [x] Reviewed current Message interface and type system
- [x] Gathered user requirements for contextual data display
- [x] Defined association mechanism (folder + range-based naming)
- [x] Established automatic discovery approach
- [x] Clarified loading behavior (placeholders with pause option)
- [x] Defined context panel behavior (resizable with scroll/pause)
- [x] Designed context discovery adapter architecture
- [x] Selected query parameter approach for plain HTML resources

### Completed
- [x] Created development plan file
- [x] Examined Vue.js application structure
- [x] Analyzed message rendering system (MessageRenderer, ConversationTerminal)
- [x] Reviewed current Message interface and type system
- [x] Gathered user requirements for contextual data display
- [x] Defined association mechanism (folder + range-based naming)
- [x] Established automatic discovery approach
- [x] Clarified loading behavior (placeholders with pause option)
- [x] Defined context panel behavior (resizable with scroll/pause)

## Plan

### Phase Entrance Criteria:
- [x] The requirements have been thoroughly defined and documented
- [x] Current codebase architecture has been analyzed
- [x] Data format and integration approach has been explored
- [x] User interaction patterns have been identified
- [x] Technical alternatives have been evaluated

### Implementation Strategy

#### **Architecture Overview**
The contextual data feature will be implemented as a modular extension to the newly refactored Vue.js application architecture. The system will leverage the existing unified composable pattern and component hierarchy established during the recent refactoring.

#### **Integration with New Architecture**
The context visualization will integrate seamlessly with the refactored architecture:

1. **State Management Layer** - Extend `useConversationState.ts` composable
2. **View Layer** - Enhance ConversationView with context coordination  
3. **Component Layer** - Add context-specific components alongside existing ones
4. **Router Layer** - Leverage named views for contextual UI elements

#### **Updated Component Architecture**
```
ConversationView (Route Component - Enhanced)
├── ConversationDisplay (Terminal - Context Integration Points)
├── ContextPanel (New - Side Panel/Modal)
│   ├── ContextTabs (New - Multiple Items Navigation)
│   ├── ContextViewer (New - Content Type Viewers)
│   │   ├── ImageViewer (New)
│   │   ├── VideoViewer (New)
│   │   ├── DocumentViewer (New)
│   │   └── CodeViewer (New)
│   └── ContextPlaceholder (New - Loading States)
└── AppFooter (Existing - Context Controls Integration)
    └── ConversationFooter (Enhanced - Context Status/Controls)
```

#### **State Management Integration**
Extend the existing `useConversationState.ts` composable to include context management:

```typescript
// Enhanced useConversationState.ts
const useConversationState = () => {
  // Existing state
  const conversationData = ref<ConversationData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // New context state
  const contextItems = ref<ContextItem[]>([])
  const contextLoading = ref(false)
  const currentMessageContext = ref<ContextItem[]>([])
  const showContextPanel = ref(false)
  
  // Enhanced loading functions
  const loadFromUrl = async (url: string) => {
    // Existing conversation loading
    // + Context discovery integration
  }
  
  const setLocalData = (data: ConversationData, contextData?: ContextItem[]) => {
    // Enhanced to handle context data from local folders
  }
  
  // New context functions
  const discoverContext = async (source: string) => { /* ... */ }
  const getContextForMessage = (messageIndex: number) => { /* ... */ }
  const toggleContextPanel = () => { /* ... */ }
  
  return {
    // Existing exports
    conversationData, loading, error,
    loadFromUrl, setLocalData, clearData,
    // New context exports
    contextItems, contextLoading, currentMessageContext,
    showContextPanel, discoverContext, getContextForMessage,
    toggleContextPanel
  }
}
```

#### **Component Integration Strategy**

**1. ConversationView Enhancement**
- Coordinate context discovery alongside conversation loading
- Manage context state using enhanced composable
- Handle responsive layout switching (desktop/mobile)
- Provide context data to child components via props

**2. ConversationDisplay Integration**
- Add context indicators for messages with associated content
- Emit events when messages with context become visible
- Maintain existing terminal functionality without disruption
- Support context-aware message highlighting

**3. ContextPanel Implementation**
- Standalone component that receives context data via props
- Responsive behavior (side panel on desktop, modal on mobile)
- Resizable on desktop with drag handles
- Tab navigation for multiple context items per message

**4. AppFooter/ConversationFooter Enhancement**
- Add context panel toggle controls
- Show context status indicators
- Integrate with existing playback controls
- Maintain contextual footer architecture

#### **Data Flow Architecture**
```
1. User loads conversation (URL/local folder)
   ↓
2. ConversationView calls useConversationState.loadFromUrl()
   ↓
3. Composable loads conversation + discovers context in parallel
   ↓
4. Context items stored in composable state
   ↓
5. ConversationDisplay renders messages + context indicators
   ↓
6. User interaction or message visibility triggers context display
   ↓
7. ContextPanel receives context data via props
   ↓
8. Context viewers render appropriate content types
```

#### **Context Discovery Integration**
Leverage and enhance existing adapter pattern:

```typescript
// Enhanced SourceAdapter pattern
interface SourceAdapter {
  fetchContent(url: string): Promise<string>
  discoverContext?(url: string): Promise<ContextItem[]> // New optional method
}

// Context-aware adapters
class FileSourceAdapter implements SourceAdapter {
  async fetchContent(url: string): Promise<string> { /* existing */ }
  async discoverContext(url: string): Promise<ContextItem[]> { /* new */ }
}

class GistSourceAdapter implements SourceAdapter {
  async fetchContent(url: string): Promise<string> { /* existing */ }
  async discoverContext(url: string): Promise<ContextItem[]> { /* new */ }
}

// New File System Access API adapter
class FileSystemSourceAdapter implements SourceAdapter {
  async fetchContent(folderHandle: FileSystemDirectoryHandle): Promise<string> { /* new */ }
  async discoverContext(folderHandle: FileSystemDirectoryHandle): Promise<ContextItem[]> { /* new */ }
}
```

#### **Responsive Design Strategy**
Leverage existing responsive patterns and AppFooter slot architecture:

**Desktop (>1024px):**
- Side-by-side layout with resizable divider
- Context panel integrated into main layout
- Persistent context visibility

**Mobile (<1024px):**
- Modal overlay for context display
- Context indicators in message flow
- Footer controls for context access

#### **Integration Points**

**1. Enhanced Composable State**
- Add context discovery to existing loading functions
- Extend state management for context items
- Maintain backward compatibility

**2. ConversationView Coordination**
- Integrate context loading with conversation loading
- Manage layout state (show/hide context panel)
- Handle responsive breakpoints

**3. Component Communication**
- Use existing event-driven patterns
- Leverage props/events for context data flow
- Maintain clean component boundaries

**4. Router Integration**
- Extend existing named views pattern
- Add context-specific footer content
- Support context-aware URL parameters

#### **Migration Strategy**
1. **Extend existing composable** with context functionality
2. **Enhance ConversationView** with context coordination
3. **Build context components** alongside existing ones
4. **Integrate context discovery** into existing adapters
5. **Add responsive context UI** using established patterns
6. **Test integration** with existing functionality
7. **Polish and optimize** context loading performance

### Tasks

#### **Phase 1: Enhanced State Management**
- [ ] Extend `useConversationState.ts` composable with context functionality
- [ ] Add context-related state properties (contextItems, contextLoading, etc.)
- [ ] Implement context discovery integration in loadFromUrl()
- [ ] Add context handling to setLocalData() for local folder support
- [ ] Create context utility functions (getContextForMessage, toggleContextPanel)
- [ ] Add context-related TypeScript interfaces to types/index.ts

#### **Phase 2: Context Discovery Integration**
- [ ] Enhance existing SourceAdapter interface with optional discoverContext method
- [ ] Update FileSourceAdapter with context discovery for HTTP resources
- [ ] Update GistSourceAdapter with context discovery for GitHub Gists
- [ ] Enhance FileSystemSourceAdapter (from refactoring) with context discovery
- [ ] Create ContextItem parsing utilities for range-based naming
- [ ] Implement context caching and lazy loading logic

#### **Phase 3: Core Context Components**
- [ ] Create ContextPanel.vue component with responsive behavior
- [ ] Implement ContextTabs.vue for multiple items navigation
- [ ] Create ContextViewer.vue with content type detection
- [ ] Implement ImageViewer.vue with zoom and navigation
- [ ] Implement VideoViewer.vue with basic controls
- [ ] Implement DocumentViewer.vue for PDFs and text files
- [ ] Implement CodeViewer.vue with syntax highlighting
- [ ] Create ContextPlaceholder.vue for loading states

#### **Phase 4: ConversationView Integration**
- [ ] Enhance ConversationView with context coordination
- [ ] Add context discovery to conversation loading flow
- [ ] Implement responsive layout management (desktop/mobile)
- [ ] Add context panel visibility controls
- [ ] Integrate context state with existing conversation state
- [ ] Handle context loading errors and edge cases

#### **Phase 5: ConversationDisplay Enhancement**
- [ ] Add context indicators to messages with associated content
- [ ] Implement message visibility detection for lazy loading
- [ ] Add context-aware message highlighting
- [ ] Emit context-related events (message-with-context-visible)
- [ ] Maintain existing terminal functionality without disruption

#### **Phase 6: Footer Integration**
- [ ] Enhance ConversationFooter with context controls
- [ ] Add context panel toggle button
- [ ] Show context status indicators (items available/loading)
- [ ] Integrate with existing playback controls layout
- [ ] Add context-related keyboard shortcuts

#### **Phase 7: Responsive & Mobile Support**
- [ ] Implement desktop side panel with resizable divider
- [ ] Create mobile modal overlay for context display
- [ ] Add context indicators for mobile message flow
- [ ] Implement swipe navigation for mobile context items
- [ ] Add responsive breakpoint handling

#### **Phase 8: Polish & Performance**
- [ ] Optimize context loading performance and caching
- [ ] Add proper error handling for missing context items
- [ ] Implement accessibility features (keyboard navigation, ARIA labels)
- [ ] Add loading indicators and progress feedback
- [ ] Test with large context files and optimize memory usage

### File Format Specifications

#### **Range Naming Convention**
```
4.jpg           → Message 4 only
7-8.mov         → Messages 7 and 8
1-3.png         → Messages 1, 2, and 3
10-code.js      → Message 10 (descriptive suffix ignored)
```

#### **Query Parameter Context Map Format**
```
# Simple text file format
1-3: http://example.com/screenshot.png
4: http://example.com/demo.mp4
7-8: http://example.com/code-snippet.js
10: http://example.com/document.pdf

# Comments supported with #
# 12: http://example.com/optional.png
```

#### **Context Discovery URLs**
```
# Local Files
conversation.txt → conversation/

# GitHub Gists  
https://gist.github.com/user/abc123 → Parse all files in gist

# Query Parameter
https://example.com/chat.txt?context=https://example.com/map.txt
```

# GitHub Gists  
https://gist.github.com/user/abc123 → Parse all files in gist

# Query Parameter
https://example.com/chat.txt?context=https://example.com/map.txt
```

### Technical Implementation Details

#### **Context Loading Strategy**
1. **Discovery Phase**: Scan for context on conversation load
2. **Preparation Phase**: Parse ranges and create context map
3. **Loading Phase**: Lazy load context items when messages appear
4. **Display Phase**: Show in panel with appropriate viewer

#### **Responsive Breakpoints**
```css
/* Desktop: Dual-pane layout */
@media (min-width: 1024px) {
  .conversation-container {
    display: grid;
    grid-template-columns: 1fr 400px; /* Terminal + Context */
  }
}

/* Mobile: Modal overlay */
@media (max-width: 1023px) {
  .context-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
}
```

#### **Performance Considerations**
- Context discovery runs in background during conversation load
- Images lazy load with placeholder dimensions
- Videos load metadata only, full content on play
- Large files show file size warning before loading
- Context items cache in memory during session

### Completed
*None yet*

## Code

### Phase Entrance Criteria:
- [x] Implementation plan is complete and detailed
- [x] Component architecture has been designed to work with refactored codebase
- [x] Data flow and integration points are defined for new architecture
- [x] UI/UX approach leverages existing responsive patterns
- [x] Technical approach validated with unified composable pattern

### Tasks

#### **Enhanced State Management (Priority 1)**
- [x] Extend `useConversationState.ts` with context functionality
  - [x] Add contextItems, contextLoading, currentMessageContext state
  - [x] Add showContextPanel, contextError state management
  - [x] Implement discoverContext() function for different source types
  - [x] Add getContextForMessage() utility function
  - [x] Enhance loadFromUrl() to include context discovery
  - [x] Update setLocalData() to handle context from local folders
- [x] Update types/index.ts with context-related interfaces
  - [x] Create ContextItem interface with range parsing
  - [x] Add context properties to Settings interface
  - [x] Create ContextDiscoveryResult type

#### **Context Discovery Integration (Priority 2)**
- [x] Enhance existing source adapters with context discovery
  - [x] Add optional discoverContext() method to SourceAdapter interface
  - [x] Update FileSourceAdapter for HTTP-based context discovery
  - [x] Update GistSourceAdapter for GitHub Gist context discovery
  - [ ] Enhance FileSystemSourceAdapter for local folder context
- [x] Create context parsing utilities
  - [x] Implement range parsing logic (1-3, 4, 7-8 formats)
  - [x] Create file type detection utilities
  - [x] Add context item validation and error handling

#### **Core Context Components (Priority 3)**
- [x] Create ContextPanel.vue component
  - [x] Responsive behavior (side panel desktop, modal mobile)
  - [x] Resizable panel with drag handles
  - [x] Integration with existing theme system
  - [x] Proper z-index and overlay management
- [x] Create context viewer components
  - [x] ContextViewer.vue with content type routing
  - [x] ImageViewer.vue with zoom and navigation
  - [x] VideoViewer.vue with basic media controls
  - [x] CodeViewer.vue with syntax highlighting
  - [x] DocumentViewer.vue for text/PDF content
- [x] Create supporting components
  - [x] ContextTabs.vue for multiple items per message
  - [x] ContextPlaceholder.vue for loading states
  - [x] ContextIndicator.vue for mobile nudge behavior

#### **ConversationView Integration (Priority 4)**
- [x] Enhance ConversationView with context coordination
  - [x] Integrate context discovery with conversation loading
  - [x] Add context panel visibility management
  - [x] Handle responsive layout switching
  - [x] Coordinate context state with conversation state
- [x] Add context data flow to child components
  - [x] Pass context data to ConversationDisplay via props
  - [x] Handle context loading states and errors
  - [x] Implement context panel toggle functionality

#### **ConversationDisplay Enhancement (Priority 5)** ✅ **COMPLETED**
- [x] Add context integration points to ConversationDisplay
  - [x] Add context indicators for messages with content
  - [x] Emit events when messages with context become visible or complete
  - [x] Integrate with context system from useConversationState composable
  - [x] Add visual styling for context indicators (badges, tooltips)
  - [x] Test context indicator functionality with GitHub Gist test data
  - [x] Emit events when messages with context become visible
  - [x] Implement context-aware message highlighting
  - [x] Maintain existing terminal functionality
- [x] Handle context-related user interactions
  - [x] Click handlers for context indicators
  - [x] Keyboard shortcuts for context panel toggle

#### **Footer Overlap Layout Fix (Priority 12)** ✅ **COMPLETED**
- [x] Identify layout issue with footer overlapping content
  - [x] Footer positioned as `position: fixed` at bottom
  - [x] Main content using `100vh` height causing overlap
  - [x] Both terminal and context windows affected
- [x] Implement CSS variable solution
  - [x] Add `--footer-height: 60px` to global CSS variables
  - [x] Create maintainable, centralized footer height reference
- [x] Fix all affected components
  - [x] HomeView: `height: calc(100vh - var(--footer-height))`
  - [x] ConversationView: All containers updated
  - [x] ConversationDisplay: Remove `100vh` constraints
  - [x] Loading/error/no-data containers: Proper height calculation
- [x] Clean up unused imports
  - [x] Remove unused ProgressIndicator import
  - [x] Ensure clean TypeScript compilation
- [x] **RESULT**: Perfect layout without overlap
  - Footer properly positioned at bottom
  - All content fully visible and accessible
  - Consistent spacing across all views
  - Maintainable CSS variable system

#### **ApplicationWindow Component and Context Panel Styling (Priority 11)** ✅ **COMPLETED**
- [x] Create reusable ApplicationWindow component
  - [x] Extract window styling from ConversationDisplay
  - [x] Support all window styles (macOS, Linux, Windows)
  - [x] Theme-sensitive styling with CSS variables
  - [x] Interactive close button with proper hover states
  - [x] Configurable title and window controls
  - [x] Slot-based architecture for actions and content
- [x] Update ContextPanel to use ApplicationWindow
  - [x] Replace custom header with ApplicationWindow
  - [x] Add settings prop for window style configuration
  - [x] Move context count to window actions slot
  - [x] Remove old header styling and close button
  - [x] Maintain responsive behavior for mobile
- [x] Integration and styling improvements
  - [x] Pass settings from ConversationView to ContextPanel
  - [x] Ensure theme consistency with terminal window
  - [x] Proper window border and shadow effects
  - [x] Clean CSS without duplicate styles
- [x] **RESULT**: Professional application window styling
  - Context panel now matches terminal window appearance
  - Consistent window controls across all themes
  - Proper macOS/Linux/Windows styling variants
  - Theme-sensitive colors and borders
  - Reusable component for future windows

#### **Draggable Divider and Flexible Panel Sizing (Priority 10)** ✅ **COMPLETED**
- [x] Create DraggableDivider component
  - [x] Implement mouse and touch drag support
  - [x] Add visual feedback with hover states and grip handle
  - [x] Handle drag constraints (min/max width)
  - [x] Clean up event listeners on unmount
- [x] Update ConversationView layout for flexible sizing
  - [x] Add terminal-panel wrapper with dynamic width
  - [x] Integrate DraggableDivider between terminal and context panel
  - [x] Update CSS for flexible layout (replace grid with flex)
  - [x] Handle window resize events
- [x] Add context panel width to settings
  - [x] Add contextPanelWidth to Settings interface (already existed)
  - [x] Add default value (400px) to App.vue settings
  - [x] Add panel width slider to SettingsPanel
  - [x] Implement settings persistence to localStorage
- [x] Implement drag resize functionality
  - [x] Handle divider resize events
  - [x] Update both terminal and context panel widths
  - [x] Persist width changes to settings
  - [x] Maintain responsive behavior on mobile
- [x] **RESULT**: Fully functional draggable divider system
  - Users can drag to resize panels between 300px-800px
  - Settings persist across sessions
  - Smooth visual feedback and constraints
  - Mobile-friendly touch support
  - Desktop-only feature (hidden on mobile)

#### **Off-by-One Indexing Bug Fix (Priority 9)** ✅ **COMPLETED**
- [x] Fix off-by-one error in context file indexing
  - [x] Identified issue: Context files are 1-based (1.jpg, 2.txt) but message array is 0-based
  - [x] Fixed getContextForMessage in useConversationState.ts to add +1 conversion
  - [x] Fixed getContextForMessage in ConversationDisplay.vue to add +1 conversion
  - [x] Ensured consistent indexing between context file numbering and message array
  - [x] Verified build compiles successfully
- [x] **RESULT**: Context now appears on correct messages
  - Message array index 0 (first message) → Context file "1.jpg"
  - Message array index 1 (second message) → Context file "2.txt"
  - Proper 0-based to 1-based index conversion throughout

#### **Restart and Context Panel Visibility Fixes (Priority 8)** ✅ **COMPLETED**
- [x] Fix restart functionality to hide context panel
  - [x] Updated restart() function to emit messageHasContext with empty context
  - [x] Context panel now slides out when restart is triggered
- [x] Fix context panel visibility logic
  - [x] Updated updateCurrentMessageContext to hide panel when no context
  - [x] Context panel now slides out when navigating to messages without context
  - [x] Context panel slides in when navigating to messages with context
- [x] **RESULT**: Context panel properly reacts to both restart and message navigation
  - [ ] Integration with existing message navigation

#### **Footer Integration (Priority 6)**
- [ ] Enhance ConversationFooter with context controls
  - [ ] Add context panel toggle button to playback controls
  - [ ] Show context status indicators (available/loading)
  - [ ] Integrate with existing footer slot architecture
  - [ ] Add context-related keyboard shortcut hints
- [ ] Update AppFooter slot content for context features
  - [ ] Context panel controls in conversation footer
  - [ ] Context status in footer information area

#### **Responsive & Mobile Implementation (Priority 7)**
- [ ] Desktop context panel implementation
  - [ ] Side-by-side layout with ConversationDisplay
  - [ ] Resizable divider with drag handles
  - [ ] Panel width persistence in localStorage
  - [ ] Proper CSS Grid/Flexbox layout
- [ ] Mobile context modal implementation
  - [ ] Full-screen modal overlay
  - [ ] Swipe navigation between context items
  - [ ] Context indicators in message flow
  - [ ] Pause/resume conversation functionality

#### **Testing & Validation (Priority 8)**
- [ ] Test context discovery with different source types
  - [ ] Local folder selection with File System Access API
  - [ ] GitHub Gist context discovery (Test URL: https://gist.github.com/mrsimpson/d0462fdf5ee80d1e01c44dd480c667d7)
  - [ ] HTTP-based context discovery
- [ ] Test responsive behavior and layout switching
- [ ] Validate context loading performance and caching
- [ ] Test error handling for missing/invalid context
- [ ] Integration testing with existing conversation features

### Testing Resources
- **GitHub Gist Test URL**: https://gist.github.com/mrsimpson/d0462fdf5ee80d1e01c44dd480c667d7
- **Local Test Context**: `/Users/oliverjaegle/projects/privat/rpl/test-context/` with conversation.txt and context files (2.html, 4.css, 6.js)

### Completed
- [x] **Enhanced State Management** - Extended useConversationState.ts with full context functionality
- [x] **Context Discovery Integration** - Enhanced source adapters with context discovery for HTTP and GitHub Gists  
- [x] **Core Context Components** - Built comprehensive context visualization system with ContextPanel, ContextViewer, and specialized viewers
- [x] **ConversationView Integration** - Enhanced main view with context coordination and responsive layout
- [x] **Basic Testing** - Verified conversation loading and context discovery with GitHub Gist test URL
- [x] **Bug Fixes** - Fixed context item creation and buildContextMap validation issues
- [x] **Gist Conversation Loading Fix** - Fixed GistSourceAdapter to properly identify and load conversation files vs context files
- [x] **ConversationDisplay Enhancement** - Added context indicators, event emission, and visual integration with context system

## Commit

### Phase Entrance Criteria:
- [ ] Core functionality is implemented and working
- [ ] Components are properly integrated
- [ ] Basic testing has been completed
- [ ] Code quality standards are met
- [ ] Feature is ready for user testing

### Tasks

#### **Testing & Validation**
- [ ] Test context discovery with local files
- [ ] Test context discovery with GitHub Gists
- [ ] Test context discovery with query parameter approach
- [ ] Validate range parsing logic (1-3, 4, 7-8 formats)
- [ ] Test responsive behavior (desktop dual-pane, mobile modal)
- [ ] Test different content types (images, videos, documents, code)
- [ ] Validate lazy loading and performance
- [ ] Test error handling for missing context

#### **Code Quality & Cleanup**
- [ ] Review TypeScript types and interfaces
- [ ] Clean up console logs and debug code
- [ ] Ensure proper error handling throughout
- [ ] Validate accessibility features
- [ ] Check code formatting and linting
- [ ] Remove unused imports and dead code

#### **Documentation & Examples**
- [ ] Update README.md with context feature documentation
- [ ] Document context discovery conventions
- [ ] Create example context folders/files
- [ ] Document query parameter format
- [ ] Add troubleshooting guide for context issues

#### **Final Integration**
- [ ] Test with existing conversation formats
- [ ] Ensure backward compatibility
- [ ] Validate settings persistence
- [ ] Test theme compatibility
- [ ] Final responsive design validation

#### **Performance & Polish**
- [ ] Optimize context loading performance
- [ ] Add loading indicators where needed
- [ ] Ensure smooth animations and transitions
- [ ] Test with large context files
- [ ] Validate memory usage patterns

### Completed
*None yet*

## Key Decisions
- **No modification of original conversation files** - contextual data must be associated externally
- **Dual-pane layout on desktop** - terminal + context panel side-by-side
- **Modal overlay on mobile** - with pause/resume functionality
- **Context prefetching strategy** - load all context files immediately when conversation loads, prioritized by earliest message appearance
- **Auto-display on desktop, nudge on mobile** - different interaction patterns per device
- **Folder-based context association** - companion folder with range-based file naming
- **Range-based naming convention** - e.g., `4.jpg` (message 4), `7-8.mov` (messages 7-8)
- **Local file context folder naming** - omit file extension and suffix: `conversation.txt` → `conversation/`
- **Automatic discovery only** - well-documented conventions, no manual configuration
- **Tabbed interface** - for multiple context items per message range
- **Priority-based prefetching** - context files loaded in order of earliest message appearance with concurrent loading (max 3)
- **Placeholder loading with pause option** - scan context folder early, show placeholders, allow user to wait or continue
- **Resizable context panel** - with scroll-to-bottom and pause-while-resizing behavior
- **Adapter pattern for context discovery** - extend existing SourceAdapter pattern for different source types
- **Query parameter approach for plain HTML** - `?context=url` pointing to simple text file with `message-relation: url` format
- **Folder-as-container approach** - local folders contain conversation + context files directly (like GitHub Gists)
- **File System Access API** - for secure local folder access without CORS issues
- **ConversationWrapper Architecture** - simplified layout with wrapper managing playback state and draggable divider between terminal and context
- **Context Components Architecture** - Built comprehensive context visualization system with ContextPanel, ContextViewer, and specialized viewers for different content types
- **Enhanced State Management** - Extended useConversationState composable with full context functionality including discovery, loading, and display management
- **Event-Driven Context Display** - Context items display based on message completion and visibility events, with automatic discovery and lazy loading

## Notes
### Current Architecture Analysis
- Vue 3 with Composition API and TypeScript
- Message-based conversation system with Message interface
- MessageRenderer component handles individual message display
- ConversationTerminal manages overall playback flow
- Extensible parser/adapter system for different conversation formats
- Current Message interface has metadata field for extensibility
- TypewriterText component handles animation effects

### Technical Observations
- Messages have types: 'human' | 'agent' | 'tool_call' | 'system'
- Message metadata field is already available for additional data
- Component architecture is modular and extensible
- Terminal-style UI with theming support

### User Requirements
- **Data Types**: Images (PNG/JPG), Documents (PDFs, text), Code snippets, Videos
- **Display**: Second screen on desktop, modal on mobile with pause/resume
- **Loading**: Lazy load when message arrives
- **Association**: External to conversation file - no modification of originals
- **Interaction**: Auto-display desktop, nudge-to-display mobile

### Context Discovery Strategies by Source Type

#### 1. Local Files (File System Access API)
```
my-conversation/                 # User selects this folder
├── conversation.txt            # Main conversation file
├── 1.png                      # Context for message 1
├── 4-screenshot.jpg           # Context for message 4
├── 7-8.mov                    # Context for messages 7-8
└── 10-code.js                 # Context for message 10
```

#### 2. GitHub Gists
```
https://gist.github.com/user/abc123
→ All files in same gist (conversation + context assets)
→ Context files follow range naming: 4.jpg, 7-8.mov
```

#### 3. Plain HTML Resources (Query Parameter)
```
https://example.com/docs/conversation.txt?context=https://example.com/context-map.txt

context-map.txt content:
1-3: http://sample.com/title.png
4: http://sample.com/screenshot.jpg
7-8: http://sample.com/demo.mp4
```

### Context Discovery Adapter Architecture
- Extend existing SourceAdapter pattern
- `ContextDiscoveryAdapter` interface for different source types
- Automatic adapter selection based on URL patterns
- Range parsing logic: `1-3` → messages 1,2,3; `4` → message 4
- File type detection via extensions
- Tabbed interface for multiple context items per message range

### Testing Notes
- **File System Access API Testing**: Cannot be automated with Playwright due to native dialog requirement
- **Manual Testing Required**: User must manually select folder in browser to test full functionality
- **Test Context Created**: `/Users/oliverjaegle/projects/privat/rpl/test-context/` with conversation.txt and context files (2.html, 4.css, 6.js)
- **Layout Fix Implemented**: CSS grid layout with dynamic width using CSS custom properties
- **Context Panel Integration**: Complete with resizable behavior and proper event handling

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
