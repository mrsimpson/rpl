# LLM Conversation Replay Player

A Vue.js application for replaying LLM conversations with an interactive terminal-style interface. Features typewriter animations, keyboard controls, and support for multiple conversation formats through an extensible adapter system.

![Demo](https://img.shields.io/badge/demo-live-brightgreen) ![Vue 3](https://img.shields.io/badge/Vue-3-4FC08D) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC) ![Vite](https://img.shields.io/badge/Vite-646CFF)

## ✨ Features

### 🎬 Interactive Playback
- **Typewriter animations** with configurable speeds for human and agent messages
- **Keyboard controls**: Enter to progress, Tab to complete current message, Esc to pause
- **Auto-play mode** with customizable timing
- **Ghost preview** of upcoming user messages
- **Progress indicators** showing conversation completion
- **Smart auto-pause**: Automatically pauses when new context becomes available during fast playback
- **Context notifications**: Toast notifications with resume controls when context appears

### 🖥️ Terminal Interface
- **Authentic terminal styling** with monospace fonts and cursor animations
- **Command prompt aesthetics** with message type indicators
- **Multiple themes**: Matrix, Amber, Blue, Hacker, and Light modes
- **Window styles**: macOS, Linux, and Windows terminal appearances
- **System-aware dark mode** with proper contrast ratios

### 🔌 Extensible Architecture
- **Source adapters** for different content sources (File, Gist, URL)
- **Parser adapters** for multiple conversation formats
- **Modular component system** with clean separation of concerns
- **TypeScript interfaces** for easy extension

### ⚙️ Customization
- **Animation speed controls** (separate for human/agent messages)
- **Visual preferences** (themes, window styles, progress indicators)
- **Auto-pause settings** (enable/disable context-aware pausing)
- **Settings persistence** via localStorage
- **Responsive design** for mobile, tablet, and desktop

### 🔔 Smart Context Awareness
- **Intelligent auto-pause**: Automatically pauses playback when new context documents appear
- **Context notifications**: Non-intrusive toast notifications with resume controls
- **Smart filtering**: Only pauses for NEW context documents, not repeated ones
- **Immediate detection**: Context appears as soon as messages become visible
- **Universal support**: Works with all message types including tool calls
- **Mobile optimized**: Context notifications adapt to mobile and desktop layouts

## 🔗 URL-Based Loading

The application supports direct conversation loading via URL parameters:

### URL Format
```
http://localhost:5173/conversation?url=<conversation-url>
```

### Examples
```bash
# Load from GitHub Gist
http://localhost:5173/conversation?url=https://gist.githubusercontent.com/user/gist-id/raw/file.json

# Load from any accessible URL
http://localhost:5173/conversation?url=https://example.com/conversation.txt
```

### Behavior
- **Auto-loading**: Conversations load automatically when URL parameter is provided
- **Error handling**: Invalid URLs show error message and redirect to home after 3 seconds
- **Format detection**: Automatically detects JSON or text format
- **Loading states**: Shows loading spinner during fetch operations

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rpl

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Load a conversation**:
   - Enter a file URL or GitHub Gist URL in the source input
   - Or use the demo button to see a sample conversation
   - Supported URL formats:
     - `file://path/to/conversation.txt`
     - `https://gist.github.com/username/gist-id`

2. **Control playback**:
   - **Enter**: Advance to next message
   - **Tab**: Complete current typewriter animation
   - **Esc**: Pause/resume auto-play
   - **Settings icon**: Open customization panel

3. **Customize experience**:
   - Adjust animation speeds for different message types
   - Choose from 5 terminal themes
   - Toggle progress indicators and ghost previews
   - Select window style (macOS/Linux/Windows)

## 📁 Project Structure

```
src/
├── components/           # Reusable Vue components
│   ├── ConversationDisplay.vue     # Main terminal interface (renamed from ConversationTerminal)
│   ├── MessageRenderer.vue         # Individual message display
│   ├── TypewriterText.vue         # Typewriter animation
│   ├── SourceInput.vue            # URL input and file loading
│   ├── SettingsPanel.vue          # Configuration panel
│   ├── ProgressIndicator.vue      # Progress tracking
│   ├── AppFooter.vue              # Global footer with slot architecture
│   ├── PlaybackControls.vue       # Playback control buttons and hints
│   └── HackathonBadge.vue         # Project badge
├── views/               # Router view components
│   ├── HomeView.vue               # Home page with source input
│   ├── ConversationView.vue       # Conversation display page
│   ├── HomeFooter.vue             # Home page footer content
│   └── ConversationFooter.vue     # Conversation page footer content
├── composables/         # Vue 3 composables
│   └── useConversationState.ts    # Unified conversation state management
├── adapters/            # Source adapters
│   ├── FileSourceAdapter.ts       # Local file loading
│   └── GistSourceAdapter.ts       # GitHub Gist integration
├── parsers/             # Format parsers
│   ├── TextFormatParser.ts        # Shell-style text format
│   └── JsonFormatParser.ts        # Q-Developer JSON format
├── router/              # Vue Router configuration
│   └── index.ts                   # Route definitions with named views
├── types/               # TypeScript definitions
│   └── index.ts                   # Core interfaces
├── App.vue              # Root component (global concerns only)
├── main.ts              # Application entry point
└── style.css            # Global styles and themes
```

## 🏗️ Architecture

### Component Hierarchy

The application follows a clean separation of concerns with three main layers:

#### 1. **Global Layer (App.vue)**
- **Responsibilities**: Settings management, theme control, global dialogs
- **State**: Settings persistence, dark mode, dialog visibility
- **Does NOT handle**: Conversation loading, source input, conversation display

#### 2. **View Layer (src/views/)**
- **HomeView.vue**: Source input and file selection interface
- **ConversationView.vue**: Conversation state management and display coordination
- **Footer Views**: Contextual footer content for each page

#### 3. **Component Layer (src/components/)**
- **Presentation Components**: ConversationDisplay, MessageRenderer, TypewriterText
- **Input Components**: SourceInput with File System Access API support
- **UI Components**: AppFooter with slot architecture, PlaybackControls

### State Management

#### Unified Composable Pattern
```typescript
// useConversationState.ts - Global conversation state
const {
  conversationData,    // Current conversation
  loading,            // Loading state
  error,              // Error messages
  contextItems,       // Context files/media
  loadFromUrl,        // URL-based loading
  setLocalData,       // Local file/folder loading
  clearData           // Reset state
} = useConversationState()
```

#### Data Flow
1. **URL Loading**: ConversationView → useConversationState → Source Adapters → Parsers
2. **Local Loading**: HomeView → SourceInput → useConversationState → Direct data setting
3. **Display**: ConversationView → ConversationDisplay (props) → MessageRenderer

### Router Architecture

#### Named Views for Contextual UI
```typescript
// Different footer content per route
{
  path: '/conversation',
  components: {
    default: ConversationView,    // Main content
    footer: ConversationFooter    // Contextual footer
  }
}
```

#### Benefits
- **Contextual footers**: Home shows app info, Conversation shows playback controls
- **Clean separation**: Each view manages its own footer content
- **Reusable components**: AppFooter provides consistent styling with slots

### File System Integration

#### Local Folder Support
- **File System Access API**: Secure local folder selection
- **Folder Structure**: `conversation.txt` + context files in same directory
- **Context Discovery**: Automatic detection of images, videos, code files
- **Blob URL Handling**: Proper local file access without CORS issues

### Event-Driven Communication

#### Footer ↔ Conversation Communication
```typescript
// Footer emits global events
window.dispatchEvent(new CustomEvent('playback-toggle'))

// ConversationDisplay listens for events
window.addEventListener('playback-toggle', togglePlayback)

// State synchronization
window.dispatchEvent(new CustomEvent('playback-state-change', {
  detail: { isPlaying: newValue }
}))
```

## 🔧 Supported Formats

### Text Format (Shell-style)
```
> This is a user message
that can span multiple lines
until there's an empty line

Agent response follows here
with tool calls and system messages

> Another user message
```

**Parsing rules**:
- User messages start with `>`
- Multi-line messages continue until empty line
- Everything else is treated as agent/system response

### JSON Format (Q-Developer)
```json
{
  "messages": [
    {
      "content": {
        "Prompt": "User message content"
      },
      "timestamp": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Parsing rules**:
- Messages with `content.Prompt` are user messages
- Other messages are agent responses
- Timestamps and metadata preserved

## 🎨 Themes

| Theme | Description | Colors |
|-------|-------------|---------|
| **Matrix** | Classic green-on-black terminal | `#00ff00` on `#000000` |
| **Amber** | Retro amber monochrome | `#ffb000` on `#1a0f00` |
| **Blue** | Cool blue terminal | `#00aaff` on `#001122` |
| **Hacker** | High-contrast green | `#00ff41` on `#0d1117` |
| **Light** | Modern light theme | `#24292e` on `#ffffff` |

## 🛠️ Extending the Application

### Adding New Source Adapters

Create a new adapter implementing the `SourceAdapter` interface:

```typescript
// src/adapters/CustomSourceAdapter.ts
import type { SourceAdapter } from '../types'

export class CustomSourceAdapter implements SourceAdapter {
  async fetchContent(url: string): Promise<string> {
    // Implement your source loading logic
    const response = await fetch(url)
    return response.text()
  }
}
```

Register in `SourceInput.vue`:
```typescript
import { CustomSourceAdapter } from '../adapters/CustomSourceAdapter'

// Add to adapter selection logic
const adapter = url.startsWith('custom://') 
  ? new CustomSourceAdapter()
  : new FileSourceAdapter()
```

### Adding New Format Parsers

Create a parser implementing the `FormatParser` interface:

```typescript
// src/parsers/CustomFormatParser.ts
import type { FormatParser, ConversationData } from '../types'

export class CustomFormatParser implements FormatParser {
  async parse(content: string): Promise<ConversationData> {
    // Implement your parsing logic
    return {
      metadata: {
        title: 'Custom Format',
        timestamp: new Date().toISOString(),
        format: 'custom'
      },
      messages: [] // Parse your format here
    }
  }
}
```

### Adding New Themes

Add theme definitions to `style.css`:

```css
[data-theme="mytheme"] {
  --terminal-bg: #your-bg-color;
  --terminal-text: #your-text-color;
  --terminal-cursor: #your-cursor-color;
  --terminal-prompt: #your-prompt-color;
}
```

Update the theme type in `types/index.ts`:
```typescript
theme: 'matrix' | 'amber' | 'blue' | 'hacker' | 'light' | 'mytheme'
```

## 🧪 Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Type checking
npm run build

# Preview production build
npm run preview
```

### Code Style

The project follows these principles:
- **Readability over brevity**: Verbose, clear code preferred
- **Simple solutions**: Avoid unnecessary complexity
- **Structured development**: Requirements → Documentation → Tests → Implementation
- **TypeScript**: Full type safety throughout

### Component Architecture

- **Composition API**: Vue 3 `<script setup>` syntax
- **Scoped styling**: Component-specific CSS with global theme system
- **Props/Events**: Clear component interfaces
- **Reactive state**: Vue's reactivity system for UI updates

## 🎯 Use Cases

- **Development teams**: Review and analyze LLM conversations
- **AI researchers**: Study conversation patterns and flows
- **Documentation**: Create interactive conversation examples
- **Training**: Demonstrate LLM interaction patterns
- **Debugging**: Replay conversations to identify issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow the coding guidelines in the project
4. Add tests for new functionality
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with Vue 3, TypeScript, and Vite
- Icons from Lucide Vue Next
- Terminal aesthetics inspired by classic command-line interfaces
- Typewriter animations for authentic conversation replay experience
