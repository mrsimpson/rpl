# Development Plan: rpl (fix-terminal-window branch)

*Generated on 2025-07-06 by Vibe Feature MCP*
*Workflow: minor*

## Goal
Fix terminal window styling and conversation display issues:
1. Make ConversationDisplay use ApplicationWindow component (like context visualization)
2. Fix conversation display issues:
   - User message "jumping" when sent
   - Tool calls not easily recognizable
   - Inconsistent font sizes

## Explore
### Phase Entrance Criteria:
- [x] Development plan created and goal defined

### Tasks
- [x] Analyze current ConversationDisplay component structure
- [x] Examine ApplicationWindow component usage in context visualization
- [x] Identify specific conversation display issues
- [x] Design solution approach for window styling integration
- [x] Plan fixes for message jumping, tool call recognition, and font consistency

### Completed
- [x] Created development plan file
- [x] Defined project goal and scope
- [x] Analyzed ConversationDisplay component (has its own terminal-window styling)
- [x] Examined ApplicationWindow component (clean, reusable window wrapper)
- [x] Reviewed ContextPanel usage of ApplicationWindow (good example)
- [x] Identified conversation display issues in MessageRenderer and ToolCallRenderer
- [x] Designed comprehensive solution approach

## Implement
### Phase Entrance Criteria:
- [x] Current component structure analyzed
- [x] ApplicationWindow integration approach designed
- [x] Conversation display issues identified and solutions planned
- [x] Clear implementation steps defined

### Tasks
- [x] **Phase 1: Window Integration**
  - [x] Import ApplicationWindow into ConversationDisplay
  - [x] Replace terminal-window wrapper with ApplicationWindow
  - [x] Move window title and controls to ApplicationWindow props
  - [x] Remove duplicate window styling from ConversationDisplay
  - [x] Test window integration works correctly
- [x] **Phase 2: Message Flow Fixes**
  - [x] Analyze and simplify message state management
  - [x] Remove ghost/completed message duplication logic (CSS fix instead)
  - [x] Ensure smooth message transitions without jumping
  - [x] Test typewriter animations still work properly
- [x] **Phase 3: Visual Improvements**
  - [x] Enhance tool call styling with better visual distinction
  - [x] Standardize font sizes across message types
  - [x] Improve message type indicators and spacing
  - [x] Test visual consistency across all message types
- [x] **Final Testing & Commit**
  - [x] Test complete conversation flow
  - [x] Verify no regressions in functionality
  - [x] Commit changes with descriptive message

### Completed
*None yet*

## Key Decisions

### Analysis Findings:

**ConversationDisplay Issues:**
1. **Window Styling**: ConversationDisplay has its own `.terminal-window` styling with duplicate window controls, header, and OS-specific styles that should be handled by ApplicationWindow
2. **Message Jumping**: User messages show as "ghost preview" then "completed message" before being added to visible messages - causes visual jumping
3. **Tool Call Recognition**: Tool calls use generic styling and don't stand out visually from regular messages
4. **Font Size Inconsistency**: Multiple font sizes used (message content, metadata, tool calls) without clear hierarchy

**ApplicationWindow Component:**
- Clean, reusable component with proper OS-specific styling
- Handles window controls, header, and theming consistently
- Used successfully by ContextPanel
- Provides slots for title, actions, and content

### Implementation Decisions:

**Window Integration (Phase 1):**
- Successfully replaced ConversationDisplay's custom window styling with ApplicationWindow
- Moved window controls, title, and OS-specific styling to ApplicationWindow component
- Preserved terminal-specific styling and functionality
- Added `content-class="terminal-content-wrapper"` for proper padding control

**Message Flow Fixes (Phase 2):**
- Kept original message state logic intact (ghost → completed → visible)
- Fixed jumping by standardizing CSS layout between ghost-preview and completed-message
- Added consistent `min-height: 1.4em` and flex layout to prevent layout shifts
- Maintained all keyboard controls and animation sequences

**Visual Improvements (Phase 3):**
- Enhanced tool call styling with borders, background, and color-coded types
- Added visual distinction for tool_use (green), tool_result (blue), tool_cancelled (red)
- Standardized font sizes: `--font-size-base` for content, `--font-size-xs` for metadata
- Improved message type indicators with consistent spacing and colors
- Added subtle border-left for human messages to improve visual hierarchy

### Detailed Implementation Plan:

**Phase 1: Window Integration**
- Replace ConversationDisplay's `.terminal-window` wrapper with ApplicationWindow
- Move window controls and header logic to ApplicationWindow props
- Preserve terminal-specific styling for content area only
- Remove duplicate OS-specific window styling

**Phase 2: Message Flow Fixes**
- Simplify message state management to eliminate ghost/completed message duplication
- Ensure smooth transitions without visual jumping
- Maintain typewriter animation functionality

**Phase 3: Visual Improvements**
- Enhance tool call styling with better visual distinction (borders, icons, colors)
- Standardize font sizes: base terminal font for content, smaller for metadata
- Improve message type indicators and spacing
- Ensure consistent line heights and spacing

## Notes
*Additional context and observations*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
