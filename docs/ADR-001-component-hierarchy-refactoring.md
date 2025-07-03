# ADR-001: Component Hierarchy Refactoring

## Status
Accepted

## Context
The original application architecture had all functionality concentrated in a single App.vue component, leading to:
- Mixed concerns (global settings, conversation loading, UI rendering)
- Difficult testing and maintenance
- Poor separation of responsibilities
- Limited reusability of components
- Monolithic structure that was hard to extend

## Decision
We decided to refactor the component hierarchy into a clean, layered architecture with:

### 1. Unified State Management
- **Composable Pattern**: `useConversationState.ts` for centralized conversation state
- **Global State**: Shared across views without prop drilling
- **Reactive Updates**: Vue 3 reactivity system for automatic UI updates

### 2. View-Based Architecture
- **HomeView**: Source input and file selection
- **ConversationView**: Conversation state management and display coordination
- **Router Views**: Named views for contextual content (main + footer)

### 3. Component Separation
- **App.vue**: Global concerns only (settings, theme, dialogs)
- **ConversationDisplay**: Pure presentation component for terminal interface
- **AppFooter**: Reusable footer with slot-based architecture

### 4. Event-Driven Communication
- **Global Events**: Communication between footer and conversation display
- **State Synchronization**: Playback state shared across components
- **Decoupled Architecture**: Components don't directly depend on each other

## Consequences

### Positive
- **Separation of Concerns**: Each component has a single responsibility
- **Testability**: Components can be tested in isolation
- **Reusability**: Components can be reused across different contexts
- **Maintainability**: Easier to modify and extend individual components
- **Type Safety**: Full TypeScript support with proper interfaces
- **Performance**: Better tree-shaking and code splitting opportunities

### Negative
- **Complexity**: More files and components to manage
- **Learning Curve**: Developers need to understand the new architecture
- **Event Management**: Global events need careful cleanup to prevent memory leaks

### Neutral
- **Migration Effort**: One-time cost to refactor existing code
- **Bundle Size**: Slightly larger due to additional component overhead

## Implementation Details

### State Management
```typescript
// Centralized conversation state
const {
  conversationData,
  loading,
  error,
  contextItems,
  loadFromUrl,
  setLocalData,
  clearData
} = useConversationState()
```

### Router Configuration
```typescript
// Named views for contextual UI
{
  path: '/conversation',
  components: {
    default: ConversationView,
    footer: ConversationFooter
  }
}
```

### Event Communication
```typescript
// Footer → Conversation Display
window.dispatchEvent(new CustomEvent('playback-toggle'))

// Conversation Display → Footer
window.dispatchEvent(new CustomEvent('playback-state-change', {
  detail: { isPlaying: newValue }
}))
```

## Alternatives Considered

### 1. Vuex/Pinia Store
- **Rejected**: Overkill for this application size
- **Reason**: Composables provide sufficient state management with less boilerplate

### 2. Props/Events Only
- **Rejected**: Would require deep prop drilling
- **Reason**: Global events provide cleaner communication for cross-component interactions

### 3. Provide/Inject
- **Rejected**: Less explicit than composables
- **Reason**: Composables offer better TypeScript support and testing capabilities

## Validation
- ✅ All existing functionality preserved
- ✅ Build successful with no TypeScript errors
- ✅ Manual testing confirms proper operation
- ✅ Performance maintained (no regression)
- ✅ Code organization significantly improved

## Future Considerations
- Consider implementing context discovery integration
- Evaluate component library extraction for reusability
- Monitor event cleanup to prevent memory leaks
- Consider state persistence for better UX

## References
- Vue 3 Composition API documentation
- Vue Router named views documentation
- TypeScript best practices for Vue applications
