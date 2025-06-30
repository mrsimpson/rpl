# Development Plan: rpl (main branch)

*Generated on 2025-06-30 by Vibe Feature MCP*
*Workflow: epcc*

## Goal
Add Vue Router to the LLM Conversation Replay Player to enable URL-based conversation loading. Users should be able to provide conversation URLs as route parameters, allowing direct links to specific conversations.

## Explore
### Tasks
- [x] Examine current codebase structure
- [x] Identify existing router setup (found basic router in src/router/index.ts)
- [x] Analyze current URL handling in App.vue (uses URLSearchParams for 'source' parameter)
- [x] Review SourceInput component for conversation loading patterns
- [x] Check package.json dependencies (Vue Router not installed)
- [x] Document current state and identify key questions for user
- [x] Understand user requirements for URL parameter structure
- [x] Determine integration approach with existing components
- [x] Identify potential conflicts with current URL handling
- [x] Analyze component architecture for router integration

### Completed
- [x] Created development plan file

## Plan

### Phase Entrance Criteria:
- [x] Current codebase structure is understood
- [x] Existing URL handling patterns are identified
- [x] Router requirements are clearly defined
- [x] Integration approach with current components is determined

### Tasks
- [x] Define implementation strategy and approach
- [x] Break down work into specific coding tasks
- [x] Identify dependencies and installation requirements
- [x] Plan component architecture changes
- [x] Design error handling and redirect strategy
- [x] Consider edge cases and potential challenges

### Implementation Strategy

**1. Dependencies & Setup**
- Install Vue Router as dependency
- Activate router in main.ts
- Update existing router configuration if needed

**2. Component Architecture Changes**
- Modify App.vue to work with router props instead of URLSearchParams
- Add router-aware conversation loading logic
- Implement error handling with router redirects
- Preserve existing SourceInput and ConversationTerminal components

**3. URL Parameter Handling**
- Use router query parameters (`/conversation?url=...`)
- Implement async loading with proper loading states
- Add validation for conversation URLs
- Handle loading errors with redirect to home

**4. Integration Points**
- Replace URLSearchParams logic with router.query
- Maintain existing event-driven architecture (SourceInput → App.vue)
- Preserve settings and theme management
- Ensure backward compatibility

### Completed
- [x] Created detailed implementation strategy

## Code

### Phase Entrance Criteria:
- [x] Implementation plan is complete and approved
- [x] Vue Router integration approach is defined
- [x] Component modifications are planned
- [x] URL parameter handling strategy is documented

### Tasks
- [x] Install Vue Router dependency (`npm install vue-router`)
- [x] Update main.ts to initialize and use the router
- [x] Modify App.vue to accept and handle router props
- [x] Replace URLSearchParams logic with router query parameters
- [x] Implement async conversation loading from URL parameter
- [x] Add error handling with router.push redirect to home
- [x] Add loading states for URL-based conversation loading
- [x] Test both routes: `/` (home) and `/conversation?url=...`
- [x] Verify existing functionality is preserved
- [x] Test error scenarios (invalid URLs, network failures)

### Implementation Details

**File Changes Required:**
1. `package.json` - Add vue-router dependency ✅
2. `main.ts` - Import and use router ✅
3. `App.vue` - Add router props, replace URLSearchParams logic ✅
4. `src/router/index.ts` - Verify/update existing router config ✅

**Key Functions to Implement:**
- `loadConversationFromUrl()` - Handle URL parameter loading ✅
- Error handling with router redirect ✅
- Loading state management during URL-based loading ✅

### Completed
- [x] All implementation tasks completed successfully
- [x] Router functionality working with both valid and invalid URLs
- [x] Error handling and redirect functionality tested
- [x] Existing functionality preserved (demo, manual loading, settings)

## Commit

### Phase Entrance Criteria:
- [x] Router implementation is complete and functional
- [x] URL parameter loading works correctly
- [x] Existing functionality is preserved
- [x] Code is tested and ready for production

### Tasks
- [x] Review code quality and clean up debug code
- [x] Verify all functionality works as expected
- [x] Update documentation (README.md) with router usage
- [x] Ensure production readiness
- [x] Final testing and validation
- [x] Prepare summary of changes

### Implementation Summary

**✅ Successfully Implemented Vue Router for URL-Based Conversation Loading**

**Key Features Added:**
- **Router Integration**: Activated existing Vue Router setup with proper main.ts integration
- **URL Parameter Handling**: `/conversation?url=...` format for direct conversation loading
- **Async Loading**: Conversations load automatically from URLs with loading states
- **Error Handling**: Invalid URLs show error message and redirect to home after 3 seconds
- **Format Detection**: Automatically detects JSON or text conversation formats
- **Existing Functionality Preserved**: Demo, manual loading, settings all working perfectly

**Technical Changes:**
- Added Vue Router to main.ts application setup
- Modified App.vue to use `useRoute()` and `useRouter()` composables
- Implemented `loadConversationFromUrl()` function with proper error handling
- Added loading and error states to the UI
- Replaced URLSearchParams logic with router query parameters
- Added route watchers for automatic conversation loading

**Tested Scenarios:**
- ✅ Home route (`/`) - SourceInput interface working
- ✅ Valid conversation URLs - Load and display correctly
- ✅ Invalid conversation URLs - Error handling and redirect working
- ✅ Demo functionality - Preserved and functional
- ✅ Manual loading - All existing features working
- ✅ Settings and themes - All preserved

**Files Modified:**
- `src/main.ts` - Added router integration
- `src/App.vue` - Complete router implementation
- `README.md` - Documentation already up to date

### Completed
- [x] Removed debug console.log statements
- [x] Cleaned up unused component files
- [x] Verified router functionality with both valid and invalid URLs
- [x] Confirmed existing features are preserved
- [x] Documented implementation summary
- [x] Prepared feature for production delivery

## Key Decisions
- **Existing Router Found**: There's already a basic Vue Router setup in src/router/index.ts with routes for '/' and '/conversation'
- **Current URL Handling**: App.vue already checks for 'source' URL parameter using URLSearchParams
- **Vue Router Not Installed**: Despite router code existing, vue-router is not in package.json dependencies
- **Router Not Active**: main.ts doesn't use the router, so it's not currently functional
- **URL Structure**: Use `/conversation?url=...` format (matches existing router setup)
- **Loading Behavior**: Load conversation but wait for user to start playback (don't auto-play)
- **Error Handling**: Show error message and redirect to home route on invalid URLs
- **Route Structure**: Keep two-route approach: `/` (home) and `/conversation` (with url parameter)
- **Implementation Approach**: Activate existing router, modify App.vue to use router props instead of URLSearchParams

## Notes
**Integration Analysis:**
- App.vue currently uses URLSearchParams directly - this will conflict with Vue Router
- Need to replace URLSearchParams logic with router props/params
- SourceInput component emits 'loadConversation' event - this pattern can be preserved
- ConversationTerminal component is already designed to receive conversation data as props
- Settings and theme management is independent and won't be affected
- Error handling needs to be router-aware for redirects

**Architecture Considerations:**
- App.vue serves as both home and conversation view - may need to split into separate components
- Router props mechanism already defined in existing router setup
- Need to handle async loading states during URL-based conversation loading
- Current localStorage persistence for settings should be preserved

**Edge Cases & Challenges:**
- Invalid conversation URLs (404, network errors, malformed content)
- URL encoding/decoding for conversation URLs with special characters
- Browser back/forward navigation behavior
- Direct URL access vs navigation from within app
- Loading states and user feedback during async operations
- Preserving existing manual loading workflow alongside URL-based loading

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
