# Development Plan: rpl (refactor-components branch)

*Generated on 2025-07-03 by Vibe Feature MCP*
*Workflow: epcc*

## Goal
Refactor the Vue.js conversation replay application's component hierarchy to implement proper separation of concerns between router views and components. Currently, views are not loaded into router slots and there's no clear responsibility distribution for state management. The refactoring should follow the architecture outlined in ARCHITECTURE.md with proper view-level state management and component-level presentation logic.

## Explore
### Tasks
- [x] Analyze current component hierarchy and identify issues
- [x] Compare current implementation with ARCHITECTURE.md requirements
- [x] Identify specific components that need to be created/refactored
- [x] Map out state management responsibilities for each component level
- [x] Assess impact on existing functionality and context discovery features

### Completed
- [x] Created development plan file
- [x] Analyzed current router setup - both routes point to App.vue (incorrect)
- [x] Identified App.vue as monolithic component handling all concerns
- [x] Reviewed ARCHITECTURE.md desired structure with proper separation
- [x] Confirmed architectural decisions with user

## Plan

### Phase Entrance Criteria:
- [x] Current component hierarchy and responsibilities have been thoroughly analyzed
- [x] Architecture.md requirements have been compared with current implementation
- [x] Specific refactoring approach has been identified and documented
- [x] Impact assessment of changes has been completed

### Tasks
- [x] Define component responsibility matrix
- [x] Create step-by-step refactoring strategy
- [x] Identify code extraction and migration points
- [x] Plan router structure updates
- [x] Design state management flow between components
- [x] Address local file loading router compatibility
- [ ] Review plan with user for approval

### Completed
- [x] Analyzed current vs desired architecture
- [x] Confirmed architectural decisions with user
- [x] Identified local file loading state management challenge

### Completed
*None yet*

## Code

### Phase Entrance Criteria:
- [ ] Detailed refactoring plan has been created and approved
- [ ] Component responsibilities have been clearly defined
- [ ] Router structure and view hierarchy has been designed
- [ ] Migration strategy for existing state and functionality has been planned

### Implementation Tasks

#### Step 1: Create Unified Conversation State Management
- [ ] Create `src/composables/useConversationState.ts`
- [ ] Implement unified state management for both URL and local file loading
- [ ] Include loading, error, and conversation data state
- [ ] Add methods: `loadFromUrl()`, `setLocalData()`, `clearData()`
- [ ] Integrate context discovery state management

#### Step 2: Create View Components Structure
- [ ] Create `src/views/` directory
- [ ] Create `HomeView.vue` - extract source input logic from App.vue
- [ ] Create `ConversationView.vue` - extract conversation management from App.vue
- [ ] Update router to use proper view components

#### Step 3: Refactor App.vue (Global Concerns Only)
- [ ] Remove conversation loading logic
- [ ] Remove source input rendering
- [ ] Keep only: settings management, theme/dark mode, router-view, global error handling
- [ ] Add proper router-view template
- [ ] Preserve settings persistence and global state

#### Step 3: Extract Conversation State Management
- [ ] Update HomeView.vue to use `useConversationState()` for local file loading
- [ ] Update ConversationView.vue to use `useConversationState()` for URL-based loading
- [ ] Move context discovery integration to the composable
- [ ] Create clean props interface for passing data to ConversationDisplay.vue
- [ ] Handle both loading scenarios: URL params and pre-loaded local data

#### Step 4: Refactor ConversationTerminal.vue → ConversationDisplay.vue
- [ ] Rename ConversationTerminal.vue to ConversationDisplay.vue
- [ ] Keep all existing terminal functionality (playback, pause, scroll-to-pause)
- [ ] Keep playback state management in ConversationDisplay.vue
- [ ] Remove conversation loading concerns (now handled by ConversationView)
- [ ] Update props to receive conversation data from parent
- [ ] Preserve all existing terminal features and animations

#### Step 5: Update Component Imports and References
- [ ] Update all imports of ConversationTerminal to ConversationDisplay
- [ ] Update router imports to use new view components
- [ ] Update any component references in tests or documentation

#### Step 6: Integration and Testing
- [ ] Test home page functionality (source input)
- [ ] Test conversation loading via URL parameters
- [ ] Test context discovery and visualization
- [ ] Test all existing terminal features (playback, pause, scroll, etc.)
- [ ] Test settings persistence across views
- [ ] Test theme and dark mode functionality

### Completed
*None yet*

### Completed
*None yet*

## Commit

### Phase Entrance Criteria:
- [ ] All refactoring implementation has been completed
- [ ] Components follow the new architecture patterns
- [ ] Router views properly manage state and pass data to components
- [ ] Application functionality remains intact after refactoring

### Tasks
- [ ] *To be added when this phase becomes active*

### Completed
*None yet*

## Key Decisions
- **Current Architecture Problems Identified**:
  - Router points both `/` and `/conversation` routes to same App.vue component
  - App.vue is monolithic (280+ lines) handling routing, state, UI, and business logic
  - No proper router-view implementation
  - No separation between view-level state management and component presentation
  
- **Desired Architecture (from ARCHITECTURE.md)**:
  - App.vue: Global concerns only (routing, error handling, settings persistence)
  - ConversationWrapper.vue: Conversation-specific state management
  - ConversationTerminal.vue: Stateless message visualization
  - Proper router views for different application states

- **User-Confirmed Architectural Decisions**:
  - Create separate view components: HomeView.vue and ConversationView.vue
  - Context visualization managed at ConversationView level with refs passed down
  - Component naming: ConversationView.vue (state) + ConversationDisplay.vue (presentation)
  - Playback state remains in ConversationDisplay (presentation layer) since it handles pausing
  - Reuse existing ConversationTerminal.vue components - preserve terminal functionality
  - Migration strategy: Refactor existing components to maintain investment in terminal features

- **Local File Loading Router Compatibility**:
  - **Challenge**: Local files via File System Access API don't use URL parameters
  - **Solution**: Unified composable for all conversation state management
  - **Approach**: `useConversationState()` handles both URL-based and local file loading
  - **Flow**: HomeView/ConversationView populate composable → ConversationView passes to ConversationDisplay

- **Component Responsibility Matrix**:
  ```
  useConversationState() Composable:
  - Unified conversation state management (URL + local files)
  - Loading, error, and conversation data state
  - Context discovery state integration
  - Methods: loadFromUrl(), setLocalData(), clearData()

  App.vue (Global Layer):
  - Settings management and persistence
  - Theme and dark mode handling
  - Global error boundaries
  - Router-view container
  - Global UI state (settings modal)

  HomeView.vue (Home Route):
  - Source input interface (URL + local folder selection)
  - Local file loading via File System Access API
  - Demo functionality
  - Populate useConversationState() and navigate to conversation
  - Handle initial URL-based loading if needed

  ConversationView.vue (Conversation Route):
  - Retrieve conversation data from useConversationState()
  - Handle URL parameter loading if not already loaded
  - Manage conversation-level UI state
  - Pass conversation data and context to ConversationDisplay
  - Handle conversation-level error states

  ConversationDisplay.vue (Presentation):
  - Terminal UI and styling
  - Playback state and controls (pause, play, restart)
  - Message rendering and animations
  - User interaction handling (keyboard controls)
  - All existing terminal features preserved
  - Context panel integration and display
  ```

## Notes
**Current Component Analysis:**
- **App.vue (280+ lines)**: Monolithic component handling:
  - Route logic and URL parameter processing
  - Conversation loading and error handling
  - Settings management and persistence
  - Dark mode and theme management
  - Source input and adapter selection
  - All UI rendering and layout

- **ConversationTerminal.vue**: Mixed responsibilities:
  - Presentation logic (terminal styling, message rendering)
  - State management (playback control, message progression)
  - Business logic (conversation state machine)

**Refactoring Strategy:**
- **Preserve Investment**: Reuse ConversationTerminal.vue components and terminal functionality
- **Component Reuse**: Keep existing terminal features (pause, scroll-to-pause, playback controls)
- **State Extraction**: Extract conversation loading/management from App.vue to ConversationView.vue
- **Presentation Separation**: Rename ConversationTerminal.vue to ConversationDisplay.vue for clarity

**State Distribution Plan:**
- **App.vue**: Global settings, theme, routing, error boundaries
- **HomeView.vue**: Source input and initial loading
- **ConversationView.vue**: Conversation data, context discovery, loading states
- **ConversationDisplay.vue**: Playback state, terminal presentation, user interactions

**Context Discovery Integration**: 
- FileSystemContextAdapter and context management from previous work
- ContextManager with blob URL handling
- Context state managed in ConversationView.vue as refs passed to display components

**Router Structure Design:**
```typescript
// New router structure
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/conversation',
    name: 'Conversation', 
    component: () => import('../views/ConversationView.vue'),
    props: (route) => ({
      conversationUrl: route.query.url as string
    })
  }
]
```

**Data Flow with Unified Composable:**
```
Local Files:
HomeView → useConversationState.setLocalData() → router.push('/conversation') → 
ConversationView → useConversationState.conversationData → ConversationDisplay

URL Parameters:
Direct /conversation?url=... → ConversationView → useConversationState.loadFromUrl() → 
ConversationDisplay

Context Discovery:
useConversationState manages context state → ConversationView passes context refs → 
ConversationDisplay renders context panel
```

**Migration Risks and Mitigation:**
- **Risk**: Breaking existing terminal functionality
  - **Mitigation**: Preserve ConversationTerminal.vue logic, only extract state management
- **Risk**: Context discovery integration issues  
  - **Mitigation**: Move context state to useConversationState composable with careful ref passing
- **Risk**: Settings persistence across views
  - **Mitigation**: Keep settings in App.vue global state, pass as props
- **Risk**: State synchronization between composable and components
  - **Mitigation**: Use Vue's reactivity system with readonly refs for consumers

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
