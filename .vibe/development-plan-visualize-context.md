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
The contextual data feature will be implemented as a modular system that extends the existing Vue.js application without disrupting current functionality. The system consists of:

1. **Context Discovery Layer** - Adapters for different source types
2. **Context Management Layer** - Loading, caching, and state management
3. **UI Components Layer** - Context panel, tabs, responsive behavior
4. **Integration Layer** - Hooks into existing message flow

#### **Component Architecture**
```
ConversationTerminal (modified)
├── ContextPanel (new)
│   ├── ContextTabs (new)
│   ├── ContextViewer (new)
│   │   ├── ImageViewer (new)
│   │   ├── VideoViewer (new)
│   │   ├── DocumentViewer (new)
│   │   └── CodeViewer (new)
│   └── ContextPlaceholder (new)
└── ContextIndicator (new, mobile)
```

#### **Data Flow**
1. Conversation loads → Context discovery runs in background
2. Message about to appear → Check for context items
3. Context found → Load and display in panel/show indicator
4. User interaction → Navigate tabs, resize panel, mobile modal

### Tasks

#### **Phase 1: Core Infrastructure**
- [ ] Create ContextDiscoveryAdapter interface and base implementations
- [ ] Implement LocalFileContextAdapter for folder-based discovery
- [ ] Implement GistContextAdapter for GitHub Gist integration
- [ ] Implement QueryParameterContextAdapter for plain HTML resources
- [ ] Create ContextItem type definitions and range parsing utilities
- [ ] Create ContextManager service for discovery coordination

#### **Phase 2: UI Components**
- [ ] Create ContextPanel component with resizable behavior
- [ ] Implement ContextTabs component for multiple items navigation
- [ ] Create ContextViewer with support for different content types
- [ ] Implement ImageViewer with zoom and navigation
- [ ] Implement VideoViewer with basic controls
- [ ] Implement DocumentViewer for PDFs and text files
- [ ] Implement CodeViewer with syntax highlighting
- [ ] Create ContextPlaceholder for loading states
- [ ] Create ContextIndicator for mobile nudge behavior

#### **Phase 3: Integration & Responsive Design**
- [x] Modify ConversationTerminal to include context panel
- [x] Implement responsive layout (dual-pane desktop, modal mobile)
- [x] Add context discovery to conversation loading flow
- [x] Implement lazy loading when messages appear
- [ ] Add pause/resume functionality for mobile modal
- [x] Implement scroll-to-bottom and pause-while-resizing behavior

#### **Phase 4: Polish & Edge Cases**
- [ ] Add proper error handling for missing context items
- [ ] Implement file type detection and fallback viewers
- [ ] Add keyboard navigation for accessibility
- [ ] Optimize loading performance and add progress indicators
- [x] Add settings integration for context panel preferences

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
- [ ] Implementation plan is complete and detailed
- [ ] Component architecture has been designed
- [ ] Data flow and integration points are defined
- [ ] UI/UX approach has been planned
- [ ] Technical approach has been validated

### Tasks

#### **Core Types & Interfaces**
- [x] Create ContextItem interface in types/index.ts
- [x] Create ContextDiscoveryAdapter interface
- [x] Add context-related types to Settings interface
- [x] Create range parsing utility functions

#### **Context Discovery Adapters**
- [x] Implement LocalFileContextAdapter.ts (simplified for HTTP fallback)
- [x] Implement GistContextAdapter.ts  
- [x] Implement QueryParameterContextAdapter.ts
- [x] Implement FileSystemContextAdapter.ts (for local folder access)
- [x] Create ContextAdapterFactory for adapter selection
- [x] Add File System Access API support for local folders
- [x] Add context discovery to existing source adapters

#### **Context Management**
- [x] Create ContextManager.ts service
- [x] Implement context discovery coordination
- [x] Add context caching and state management
- [x] Implement lazy loading logic

#### **UI Components - Context Panel**
- [x] Create ContextPanel.vue component
- [x] Implement resizable panel behavior
- [x] Add responsive layout switching (desktop/mobile)
- [ ] Implement scroll-to-bottom after resize

#### **Integration & Architecture Fix**
- [x] Move conversation state management from ConversationTerminal to ConversationWrapper
- [x] Make ConversationTerminal stateless for message visualization only
- [x] Update App.vue to not pass contextData/currentMessageIndex to ConversationWrapper
- [x] Add context discovery and management to ConversationWrapper
- [x] Remove unused keyboard handling and conversation control from ConversationTerminal
- [x] Context discovery is working - shows "Discovered 0 context items for conversation"
- [x] Context panel visibility logic implemented
- [x] FileSystemContextAdapter integration working

#### **UI REVAMP - New Component Architecture**

**DECISION**: Complete UI revamp to fix current regressions and create cleaner architecture

**New Component Structure:**
```
ConversationView (Route Component)
├── ConversationLayout (Resizable Container) 
│   ├── TerminalWindow (Conversation Display)
│   └── ContextWindow (Context Visualization)
└── ConversationFooter (Controls & Settings)
```

**Component Responsibilities:**

1. **ConversationView** (Route Target)
   - URL parsing and conversation identification
   - Conversation and context loading coordination
   - Global state management (current message, playing status)
   - Event handling and coordination
   - Error boundary for the entire conversation

2. **ConversationLayout** (Layout Manager)
   - Resizable panel management (terminal vs context)
   - Responsive behavior (desktop dual-pane, mobile stack/modal)
   - Layout persistence (remember user's panel sizes)
   - Drag-and-drop resize handling

3. **TerminalWindow** (Conversation Display)
   - Pure presentation component for messages
   - Typewriter animations and message rendering
   - Scroll management and auto-scroll behavior
   - Ghost message previews
   - Message-level context indicators

4. **ContextWindow** (Context Visualization)
   - Context item display and navigation
   - Content type viewers (image, video, code, etc.)
   - Context loading states and error handling
   - Context-specific interactions

5. **ConversationFooter** (Controls & UI)
   - Playback controls (play, pause, reset, speed)
   - Progress indicators and message counters
   - Keyboard shortcut hints
   - Settings panel access
   - Mobile-friendly control layout

**Technical Specifications:**

**State Management Flow:**
```typescript
// ConversationView manages global state
interface ConversationState {
  conversationData: ConversationData
  contextData: ContextData
  currentMessageIndex: number
  playbackState: 'waiting' | 'typing' | 'playing' | 'paused'
  settings: Settings
  layout: {
    terminalWidth: number
    showContext: boolean
    isMobile: boolean
  }
}

// Props flow down, events bubble up
ConversationView → ConversationLayout → TerminalWindow (props)
ConversationView ← ConversationLayout ← TerminalWindow (events)
```

**Event Architecture:**
```typescript
// TerminalWindow emits
'message-complete' | 'animation-complete' | 'scroll-pause'

// ContextWindow emits  
'context-loaded' | 'context-error' | 'item-selected'

// ConversationFooter emits
'play' | 'pause' | 'reset' | 'speed-change' | 'settings-open'

// ConversationLayout emits
'resize' | 'layout-change' | 'mobile-toggle'
```

**Responsive Strategy:**
- **Desktop (>1024px)**: Side-by-side panels with resizable divider
- **Tablet (768-1024px)**: Stacked layout with collapsible context
- **Mobile (<768px)**: Full-screen terminal with context modal/drawer

**Error Handling:**
- ConversationView: Global error boundary with fallback UI
- Each component: Local error states with retry mechanisms
- Loading states: Skeleton screens and progress indicators

**Implementation Tasks:**

**Phase 1: Core Components** ✅ COMPLETED
- [x] Create ConversationView.vue as new route component
- [x] Create ConversationLayout.vue for resizable panels
- [x] Create TerminalWindow.vue for message display
- [x] Create ContextWindow.vue for context visualization  
- [x] Create ConversationFooter.vue for controls

**Phase 2: Integration** ✅ COMPLETED
- [x] Update App.vue routing to use ConversationView
- [x] Migrate conversation loading logic to ConversationView
- [x] Migrate context discovery to ConversationView
- [x] Implement state management between components
- [x] Add responsive layout behavior
- [x] Fix component prop interfaces and event handling
- [x] **CRITICAL FIX**: Add demo conversation handling to ConversationView
- [x] Test basic conversation playback functionality
- [x] Verify typewriter animations and message progression
- [x] Confirm state machine transitions and UI updates
- [x] **INTERACTIVE FEATURES**: Add keyboard interactions (Enter, Tab, Esc, Space)
- [x] **SCROLL-TO-PAUSE**: Implement scroll handling for auto-pause functionality
- [x] Test all interactive controls and confirm proper event handling

**Phase 3: Polish & Testing** 🚧 IN PROGRESS
- [x] **USER MESSAGE TYPING**: Implement proper user message behavior ✅
  - [x] Tab starts fast typing of user message ✅
  - [x] Enter sends message and starts auto-continue ✅
  - [x] Proper state transitions and visual feedback ✅
  - [x] **SPEED OPTIMIZATION**: Make user typing much faster (5ms vs 50ms) ✅
  - [x] **BUG FIX**: Restored typing animations after pause implementation ✅
- [x] **AUTO-CONTINUE**: Fix auto-play continuation ✅
  - [x] Starts auto-play after Enter ✅
  - [x] Continues through agent messages ✅
  - [x] Continues through tool call messages ✅
  - [x] Stops correctly at next user message ✅
- [ ] **PAUSE FUNCTIONALITY**: Ensure pause works with typing animations 🚧
  - [x] **FIXED**: Space key pause during user typing ✅
  - [ ] **TODO**: Scroll-to-pause functionality (scroll detection issue)
  - [ ] **TODO**: State display shows "Paused" when paused
  - [ ] **CRITICAL**: Auto-typing stops working after first message (agent messages appear instantly)
- [ ] Add error boundaries and loading states
- [ ] Remove old ConversationWrapper and ConversationTerminal
- [ ] Test complete conversation flow
- [ ] Test context loading and display
- [ ] Test responsive behavior on mobile
- [ ] Performance testing and optimization

**CURRENT STATUS**: 
✅ **Major Fix**: Space key now pauses user typing correctly!
🔧 **Critical Issue**: Auto-typing breaks after first message - agent messages appear instantly instead of typing
🔧 **Remaining**: Scroll-to-pause and proper state display

**Migration Strategy:**
1. Build new components alongside existing ones
2. Test new components in isolation
3. Switch App.vue to use new ConversationView
4. Remove old components once verified working
5. Clean up unused code and imports
- [x] Implement CodeViewer.vue with syntax highlighting
- [x] Create ContextPlaceholder.vue for loading states

#### **Mobile Components**
- [x] Create ContextIndicator.vue for nudge behavior
- [ ] Implement mobile modal overlay
- [ ] Add pause/resume conversation functionality
- [ ] Implement swipe navigation between context items

#### **Regression Fixes**
- [x] Fix terminal width expansion during typing - added overflow: hidden to terminal-container
- [x] Make context container conditional - only visible when there's actual context for current message
- [x] Clean up ConversationTerminal - removed context-related logic (now handled by ConversationWrapper)
- [x] Update showContextPanel computed to check for current message context
- [x] Test terminal width constraint with typewriter animation
- [x] Verify context panel only shows when context exists

#### **Styling & Theming**
- [ ] Add context panel styles to style.css
- [ ] Implement responsive breakpoints
- [ ] Add theme support for context components
- [ ] Style mobile modal and indicators

#### **Settings & Configuration**
- [ ] Add context panel settings to SettingsPanel.vue
- [ ] Implement context panel show/hide toggle
- [ ] Add panel width persistence
- [ ] Add context discovery enable/disable option

### Completed
*None yet*

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
- **Lazy loading strategy** - load context when message is about to appear
- **Auto-display on desktop, nudge on mobile** - different interaction patterns per device
- **Folder-based context association** - companion folder with range-based file naming
- **Range-based naming convention** - e.g., `4.jpg` (message 4), `7-8.mov` (messages 7-8)
- **Local file context folder naming** - omit file extension and suffix: `conversation.txt` → `conversation/`
- **Automatic discovery only** - well-documented conventions, no manual configuration
- **Tabbed interface** - for multiple context items per message range
- **No initial performance optimization** - "let's see it burn" approach
- **Placeholder loading with pause option** - scan context folder early, show placeholders, allow user to wait or continue
- **Resizable context panel** - with scroll-to-bottom and pause-while-resizing behavior
- **Adapter pattern for context discovery** - extend existing SourceAdapter pattern for different source types
- **Query parameter approach for plain HTML** - `?context=url` pointing to simple text file with `message-relation: url` format
- **Folder-as-container approach** - local folders contain conversation + context files directly (like GitHub Gists)
- **File System Access API** - for secure local folder access without CORS issues
- **ConversationWrapper Architecture** - simplified layout with wrapper managing playback state and draggable divider between terminal and context

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
