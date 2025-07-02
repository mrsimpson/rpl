# Development Plan: Scroll-Based Playback Controls Enhancement

*Generated on 2025-07-02 by Vibe Feature MCP*
*Workflow: minor*

## Goal
Implement new playback behavior for the LLM Conversation Replay Player:
- **Play button**: Triggers typing and continues until the next user message, then auto-pauses
- **Auto-pause**: System automatically pauses when reaching a user message
- **Interrupt/Resume**: Play/pause button can interrupt and resume the flow
- **Continue**: When resumed, continues to the next message

## Explore
### Phase Entrance Criteria:
*Initial phase - no entrance criteria needed*

### Tasks
- [x] Analyze current playback control implementation in ConversationTerminal.vue
- [x] Understand the regression: agent messages don't auto-play without explicit play trigger
- [x] Design new play logic: continue until next user message, then auto-pause
- [x] Plan implementation for auto-pause behavior
- [x] Consider interrupt/resume functionality
- [x] **IMPLEMENTED**: Added pause support to TypewriterText component
- [x] **IMPLEMENTED**: Updated MessageRenderer to pass paused prop
- [x] **IMPLEMENTED**: Modified ConversationTerminal playback logic for new behavior
- [x] **IMPLEMENTED**: Auto-pause functionality when reaching user messages
- [x] **IMPLEMENTED**: Resume functionality to continue to next message
- [x] **TESTED**: Verified complete playback flow works correctly
- [x] **BUG FIX 1**: Tab+Enter should trigger play-until-next-user-message behavior ✅
- [x] **BUG FIX 2**: Human messages should NOT auto-type during play - require manual Tab+Enter ✅
- [x] **ENHANCEMENT**: User messages show as ghost preview when reached during playback ✅
- [x] **REGRESSION FIX**: Tool calls were invisible - added fallback case in ToolCallRenderer ✅
- [x] **NEW FEATURE**: Scroll-to-pause - automatically pause playback when user scrolls up ✅
- [x] **ENHANCEMENT**: Auto-scroll to bottom when play button is pressed ✅

### Completed
- [x] Created development plan file
- [x] Analyzed ConversationTerminal.vue - found existing `isPlaying` state and `togglePlayback()` function
- [x] Identified existing `scrollToBottom()` function that auto-scrolls during playback
- [x] Confirmed `terminalContent` ref provides access to scrollable container
- [x] **NEW**: Identified issues with scroll detection implementation:
  - Scroll event listener may not be properly attached
  - `isAtBottom` state may not be updating correctly
  - Need to verify TypewriterText component is receiving paused prop
- [x] **NEW**: Identified approach for auto-play implementation:
  - Need to modify `processAgentMessages()` to automatically trigger user messages
  - When `isPlaying` is true and next message is a user message, should auto-complete and submit
  - Need to add a delay between agent messages and auto-triggering user messages

## Implement
### Phase Entrance Criteria:
- [x] Requirements are clearly defined and documented
- [x] Current playback control architecture is understood
- [x] Technical approach for scroll detection is designed
- [x] Integration points with existing controls are identified
- [x] Edge cases and UX considerations are documented

### Tasks
- [x] **Update Settings Interface**:
  - Add `autoTypeUserMessages` boolean to Settings interface
  - Update default settings with new property

- [x] **Enhance MessageRenderer**:
  - Modify to use TypewriterText for human messages when autoplay is enabled
  - Update isCurrent logic to support human message animations

- [x] **Update ConversationTerminal**:
  - Replace play/pause button with autoplay toggle
  - Update processAgentMessages() to handle user messages differently
  - Add visual indicator for autoplay mode

- [x] **Testing**:
  - Test autoplay toggle functionality
  - Verify user messages animate properly
  - Test interaction with scroll-based pause/resume

### Completed
- [x] Fixed scroll detection with debug logging
- [x] Implemented auto-play functionality for user messages
- [x] Added appropriate delays for natural conversation flow
- [x] Ensured auto-play can be interrupted by scrolling
- [x] Fixed auto-play issues to work without requiring Tab-Enter
- [x] Enhanced scroll-based pause/resume functionality
- [x] Tested all functionality in development environment
- [x] **NEW**: Added autoTypeUserMessages setting to Settings interface
- [x] **NEW**: Enhanced MessageRenderer to support user message animations
- [x] **NEW**: Updated ConversationTerminal with autoplay visual indicator
- [x] **NEW**: Modified processAgentMessages to handle user messages differently with autoplay

## Key Decisions

### Current Playback Architecture Analysis
- **State Management**: Uses `isPlaying` ref and `togglePlayback()` function
- **Conversation Flow**: State machine with 'waiting_for_user' | 'user_typing' | 'agent_typing'
- **Auto-scroll**: `scrollToBottom()` function automatically scrolls during message display
- **Scroll Container**: `terminalContent` ref provides access to scrollable div
- **Keyboard Controls**: Enter, Tab, Esc, Space already implemented

### Technical Approach for Scroll Detection
- **Strategy**: Monitor scroll position relative to bottom of container
- **Trigger Logic**: 
  - Pause when user scrolls up (not at bottom)
  - Resume when user scrolls back to bottom
- **Integration**: Add scroll event listener to `terminalContent` element
- **State Coordination**: Work alongside existing `isPlaying` state

### Scroll Threshold Design
- **Bottom Detection**: `scrollTop + clientHeight >= scrollHeight - THRESHOLD`
- **Threshold Value**: 10px tolerance to account for sub-pixel scrolling
- **Debouncing**: 100ms debounce to prevent excessive state changes
- **State Variables**: 
  - `isAtBottom` - tracks if user is at bottom
  - `wasPlayingBeforeScroll` - remembers playback state before manual scroll

### Edge Cases & UX Considerations
- **Initial State**: Start with `isAtBottom = true` when conversation loads
- **Auto-scroll Conflict**: Don't trigger pause when `scrollToBottom()` is called programmatically
- **Manual Play/Pause**: Respect manual play/pause button clicks over scroll behavior
- **Short Conversations**: Handle cases where content doesn't exceed viewport height
- **Rapid Scrolling**: Debounce scroll events to prevent flickering
- **Mobile Touch**: Ensure touch scrolling works properly on mobile devices
- **Keyboard Navigation**: Don't interfere with existing keyboard controls

### Implementation Integration Points
- **Event Listeners**: Add scroll listener in `onMounted`, remove in `onUnmounted`
- **State Management**: New reactive refs for scroll state tracking
- **Playback Logic**: Modify existing `togglePlayback()` to consider scroll state
- **Auto-scroll Enhancement**: Flag programmatic scrolls to avoid triggering pause
- **Visual Feedback**: Consider subtle UI indication when paused due to scrolling

### Revised Implementation Approach
- **Scroll Detection Fix**:
  - Verify scroll event listener is properly attached to `terminalContent`
  - Add console logging to confirm `checkScrollPosition` is being called
  - Ensure `isAtBottom` state is correctly updated and reactive
  - Verify TypewriterText component is receiving and responding to `paused` prop

- **Auto-Play Enhancement**:
  - Modify `processAgentMessages()` to check `isPlaying` state
  - When reaching a user message during auto-play:
    1. Show ghost message briefly (500-1000ms)
    2. Auto-complete user message (like Tab key)
    3. Auto-submit user message (like Enter key)
  - Add appropriate delays between steps for natural flow
  - Ensure auto-play can be interrupted by scrolling up

### Autoplay UX Enhancement Design
- **Toggle Switch**: Replace play/pause button with an autoplay toggle switch
- **Settings Integration**: Add `autoTypeUserMessages` boolean to Settings interface
- **MessageRenderer Enhancement**: Modify to use TypewriterText for human messages when autoplay is enabled
- **User Message Handling**: Update `processAgentMessages()` to skip ghost/completion steps for user messages
- **Visual Feedback**: Add subtle indicator when autoplay is enabled
- **Persistence**: Save autoplay preference in localStorage with other settings
- **Auto-Play Fixes**:
  - Modified `togglePlayback()` to always start processing when play is clicked
  - Updated `processAgentMessages()` to handle scroll position more intelligently
  - Enhanced `initializeConversation()` to work with auto-play state
  - Fixed `scrollToBottom()` to properly set `isAtBottom` state
  - Added more comprehensive logging for debugging
*Additional context and observations*

### Implementation Summary
1. **Fixed Scroll Detection**:
   - Added comprehensive debug logging
   - Verified scroll event listener attachment
   - Fixed `isAtBottom` state updates
   - Ensured TypewriterText receives correct `paused` prop

2. **Enhanced Auto-Play Functionality**:
   - Modified `processAgentMessages()` to handle user messages during auto-play
   - Added auto-complete and auto-submit functionality for user messages
   - Implemented natural delays between message transitions
   - Ensured auto-play can be interrupted by scrolling up

3. **User Experience Improvements**:
   - Typing animations pause immediately when scrolling up
   - Animations resume from current position when scrolling to bottom
   - Auto-play provides seamless conversation playback without user interaction
   - Maintains compatibility with existing keyboard controls

4. **Testing Completed**:
   - Verified scroll detection works with console logs
   - Confirmed typing animations pause/resume correctly
   - Tested auto-play with various conversation lengths
   - Verified interaction between auto-play and scroll-based pause

5. **Autoplay UX Enhancement**:
   - Added `autoTypeUserMessages` setting to control user message animation
   - Enhanced MessageRenderer to support TypewriterText for human messages
   - Updated ConversationTerminal with visual indicator for autoplay mode
   - Modified message processing to handle user messages differently with autoplay
   - Improved overall playback experience with seamless transitions

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
