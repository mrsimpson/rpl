<!-- 
INSTRUCTIONS FOR DESIGN DOCUMENT (COMPREHENSIVE):
- Document what to build, not how you decided to build it
- Include concrete interfaces, data models, and implementation patterns
- Focus on testing strategy and concepts, not actual test cases
- Cover error handling, security, and performance considerations
- Reference requirements that drive design decisions
- Keep technical details specific and actionable
- Link to architecture document for high-level context
-->

# Design Document

## Architecture Reference
See [Architecture Document](./architecture.md) for high-level system context and architecture decisions.

## Technology Stack
- **Frontend Framework:** Vue.js 3 with Composition API - Modern reactive framework with excellent TypeScript support
- **Build System:** Vite - Fast development server and optimized production builds
- **Language:** TypeScript - Type safety and better developer experience
- **Routing:** Vue Router 4 - Client-side routing with named views for contextual UI
- **Testing:** Vitest + Vue Test Utils + JSDOM - Modern testing stack with Vue component support
- **Icons:** Lucide Vue Next - Consistent icon library
- **Markdown:** Marked with syntax highlighting - For rendering conversation content

## External Interface Design

### GitHub Gist API Integration
- **Interface:** `GistSourceAdapter.fetchContent(url: string): Promise<string>`
- **Implementation:** 
  - Extracts gist ID from URL patterns
  - Makes authenticated requests to `https://api.github.com/gists/{gistId}`
  - Handles rate limiting and error responses
  - Discovers context files within gist structure
- **Error Handling:** Specific error messages for private repos, invalid URLs, rate limits

### GitHub Repository API Integration  
- **Interface:** `GitHubRepoSourceAdapter.fetchContent(url: string): Promise<string>`
- **Implementation:**
  - Parses GitHub repository URLs to extract user/repo/branch/path
  - Uses GitHub Contents API for file access
  - Supports both direct file links and repository browsing
  - Discovers related context files in same directory
- **Error Handling:** Repository access validation, file existence checks

### File System Access API Integration
- **Interface:** `FileSourceAdapter` with File System Access API support
- **Implementation:**
  - Uses modern File System Access API for secure local file access
  - Supports both individual files and folder selection
  - Automatically discovers context files in selected folders
  - Creates blob URLs for local file access without CORS issues
- **Fallback:** Traditional file input for browsers without File System Access API support

### Web URL Integration
- **Interface:** Generic HTTP/HTTPS URL support through `FileSourceAdapter`
- **Implementation:**
  - Standard fetch API for web-accessible conversation files
  - Support for query parameters to specify context files
  - CORS-aware error handling
- **Security:** Same-origin policy compliance, no credential exposure

## Vue Component Architecture Principles

### Composition API Design Patterns
- **Single Responsibility**: Each component has a clear, focused purpose (ConversationDisplay for terminal interface, SourceInput for loading, MessageRenderer for individual messages)
- **Composable Pattern**: Shared logic extracted into reusable composables (useConversationState, useTheme, useOSStyle, useResponsive)
- **Reactive State Management**: Vue 3 reactivity system with ref() and computed() for responsive UI updates
- **Props Down, Events Up**: Unidirectional data flow with props for data passing and custom events for communication

### Component Hierarchy and Communication
- **Hierarchical Structure**: Clear parent-child relationships with App.vue as root, view components as pages, and specialized components for features
- **Named Router Views**: Contextual UI with different footer content per route using Vue Router's named views
- **Event-Driven Communication**: Global events for cross-component communication (playback controls ↔ conversation display)
- **Slot Architecture**: Flexible content projection in AppFooter for page-specific footer content

### State Management Strategy
- **Global Composables**: Centralized state management through composables for conversation data, theme, and settings
- **Local Component State**: Component-specific state kept local using ref() and reactive()
- **Persistence Layer**: localStorage integration for user preferences and settings
- **Reactive Computed Properties**: Derived state using computed() for theme classes, responsive breakpoints, and UI states

### Component Design Principles
- **Scoped Styling**: Component-specific CSS with global theme system integration
- **TypeScript Integration**: Full type safety with interfaces for props, events, and component state
- **Accessibility Compliance**: Proper ARIA attributes, keyboard navigation, and semantic HTML
- **Performance Optimization**: Lazy loading, computed properties for expensive operations, and efficient re-rendering

### Reusability and Extensibility
- **Adapter Pattern**: Pluggable source adapters (File, Gist, GitHub Repo) and format parsers (Text, JSON)
- **Theme System**: Extensible theme architecture with CSS custom properties and computed classes
- **Component Composition**: Small, focused components that can be composed into larger features
- **Configuration-Driven**: Settings-based customization for animation speeds, themes, and UI preferences

## Data Models

### Core Interfaces
```typescript
interface Message {
  id: string
  type: 'human' | 'agent' | 'tool_call' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

interface ConversationData {
  metadata: {
    title?: string
    timestamp: string
    format: string
    source?: string
  }
  messages: Message[]
}

interface ContextItem {
  id: string
  type: 'image' | 'video' | 'document' | 'code' | 'audio' | 'other'
  url: string
  filename: string
  messageRange: number[]
}
```

### Settings and Configuration
```typescript
interface Settings {
  humanSpeed: number
  agentSpeed: number
  autoPlay: boolean
  showProgress: boolean
  showGhostText: boolean
  theme: TerminalTheme
  windowStyle: WindowStyle
  autoPauseOnContext: boolean
}
```

## Testing Strategy

### Unit Testing
- **Composables**: Test reactive state management, computed properties, and side effects
- **Parsers**: Test conversation format parsing with various input scenarios and edge cases
- **Adapters**: Test source loading with mocked HTTP responses and error conditions
- **Utilities**: Test helper functions for context discovery and validation

### Integration Testing
- **Component Integration**: Test component communication through props and events
- **Service Integration**: Test adapter and parser integration with real data flows
- **State Management**: Test composable integration with component lifecycle

### End-to-End Testing
- **User Workflows**: Test complete conversation loading and playback scenarios
- **External API Integration**: Test GitHub API integration with rate limiting and error handling
- **File System Integration**: Test local file loading with various file types and structures

## Error Handling

### API Error Scenarios
- **GitHub API Rate Limiting**: Graceful degradation with user feedback and retry mechanisms
- **Network Failures**: Timeout handling, connection error recovery, and offline detection
- **Invalid URLs**: User-friendly error messages with suggestions for correction
- **Private Repository Access**: Clear messaging about access limitations

### File System Error Scenarios
- **Permission Denied**: Fallback to traditional file input when File System Access API unavailable
- **Invalid File Formats**: Format detection with helpful error messages
- **Large File Handling**: Progress indicators and memory management for large conversations

### User Experience Considerations
- **Loading States**: Visual feedback during conversation loading and context prefetching
- **Error Recovery**: Clear error messages with actionable next steps
- **Graceful Degradation**: Fallback functionality when advanced features unavailable

## Security Considerations

### Client-Side Security
- **No Credential Storage**: No API keys or sensitive data stored in client application
- **CORS Compliance**: Proper handling of cross-origin requests with appropriate error messaging
- **File System Access**: User-consented file access through modern browser APIs
- **XSS Prevention**: Proper content sanitization for user-provided conversation data

### Privacy Protection
- **Local Data Processing**: Conversations processed entirely client-side
- **No Server-Side Storage**: No conversation data transmitted to or stored on servers
- **Settings Privacy**: User preferences stored locally in browser storage only

## Performance Optimizations

### Loading Performance
- **Lazy Loading**: Components and routes loaded on demand
- **Code Splitting**: Vite automatic code splitting for optimal bundle sizes
- **Asset Optimization**: Image optimization and efficient static asset delivery
- **Context Prefetching**: Intelligent background loading of context items

### Runtime Performance
- **Virtual Scrolling**: Efficient rendering of large conversations (future enhancement)
- **Computed Properties**: Cached derived state for expensive calculations
- **Event Debouncing**: Optimized user input handling for settings and controls
- **Memory Management**: Proper cleanup of event listeners and cached data
