# Development Plan: rpl (main branch)

*Generated on 2025-07-01 by Vibe Feature MCP*
*Workflow: bugfix*

## Goal
Fix text format parsing for user messages in the LLM Conversation Replay Player. Currently, user messages are not properly recognized when loading conversations from text format. Need to improve detection of messages starting with `>` or `[something]>` and handle multi-line messages properly until an empty line delimiter. Also add a toast notification to inform users about text format parsing behavior.

## Reproduce
### Tasks
- [x] Examine current TextFormatParser implementation
- [x] Create test cases for different user message formats
- [x] Test current behavior with `>` prefixed messages
- [x] Test current behavior with `[prefix]>` formatted messages
- [x] Test multi-line user messages with empty line delimiters
- [x] Document specific parsing failures
- [x] Create sample text conversations that demonstrate the issues

### Current Parser Issues Identified

**Issue 1: Limited User Message Detection**
- Current parser only detects `> ` (greater than followed by space)
- Does NOT detect `[prefix]>` formats like `[vibe]>`, `[user]>`, etc.
- Line 17: `if (line.startsWith('> '))` is too restrictive

**Issue 2: Inconsistent Multi-line Handling**
- Parser attempts to handle multi-line messages but logic is complex
- Lines 35-44: Multi-line logic checks for `> ` prefix again, which may not exist in continuation lines
- Empty line detection (line 25) ends messages, but continuation logic is unclear

**Issue 3: No User Feedback**
- No toast/notification to inform users about text parsing behavior
- Users don't know that empty lines serve as delimiters
- No guidance on how to fix parsing issues

**Issue 4: Edge Cases Not Handled**
- Messages without proper empty line separation may be misparsed
- Agent responses may be incorrectly labeled as user messages
- Mixed format conversations (both `>` and `[prefix]>`) not supported

### Reproduction Summary

**Bug Successfully Reproduced**: ✅
1. Examined TextFormatParser.ts implementation
2. Identified that parser only detects `> ` (with space) format
3. Created test cases showing `[prefix]>` formats are not detected
4. Documented multi-line message handling issues
5. Created sample conversation file demonstrating all issues

**Clear Steps to Reproduce**:
1. Create a text conversation with `[vibe]>` or `[user]>` prefixed messages
2. Load the conversation in the application
3. Observe that prefixed messages are parsed as agent messages instead of user messages
4. Multi-line messages may also be incorrectly split or grouped

**Files Created for Testing**:
- `test-conversations.txt` - Various test cases
- `sample-broken-conversation.txt` - Comprehensive example showing all issues

### Completed
- [x] Created development plan file

## Analyze

### Phase Entrance Criteria:
- [x] Bug has been successfully reproduced with clear steps
- [x] Current text parsing behavior is documented
- [x] Specific failure cases are identified and documented
- [x] Test cases demonstrate the parsing issues

### Tasks
- [x] Analyze the TextFormatParser.ts line-by-line to identify root causes
- [x] Determine the exact regex/pattern needed for `[prefix]>` detection
- [x] Analyze multi-line message handling logic and identify improvements
- [x] Research toast/notification implementation options in Vue.js
- [x] Design the improved parsing algorithm
- [x] Identify potential edge cases and how to handle them
- [x] Plan the user feedback mechanism (toast notification)

### User Feedback Mechanism Plan

**Toast Notification Design**:
```vue
<!-- ToastNotification.vue -->
<template>
  <Transition name="toast">
    <div v-if="visible" class="toast-notification" :class="themeClass">
      <div class="toast-content">
        <div class="toast-icon">ℹ️</div>
        <div class="toast-message">
          <strong>Text Format Parsing</strong><br>
          Empty lines separate messages. User messages start with > or [prefix]>. 
          Some messages might be mislabeled - remove empty lines or use invisible characters to fix.
        </div>
        <button @click="dismiss" class="toast-close">×</button>
      </div>
    </div>
  </Transition>
</template>
```

**Integration Points**:
1. **Trigger**: Show toast when TextFormatParser is used in SourceInput.vue
2. **Timing**: Display for 7 seconds, then auto-dismiss
3. **Styling**: Match current terminal theme
4. **Positioning**: Top-right corner, below hackathon badge

**Toast Message Content**:
- **Primary**: "Text format parsing active"
- **Secondary**: "Empty lines separate messages. User messages start with > or [prefix]>"
- **Actionable**: "Some messages might be mislabeled - remove empty lines or use invisible characters to fix"

**CSS Styling**:
```css
.toast-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 350px;
  background: var(--terminal-bg);
  border: 1px solid var(--terminal-text);
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--terminal-text);
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
```

**State Management**:
- Use Vue composable or simple reactive state
- Track if toast has been shown for current session
- Don't show repeatedly for same user

### Edge Cases and Handling

**Edge Case 1: Empty User Messages**
```
> 

Agent response
```
- **Issue**: User message with only whitespace
- **Solution**: Check if content is empty after trimming, skip if so

**Edge Case 2: Nested Square Brackets**
```
[user[nested]]> Message content
```
- **Issue**: Complex bracket patterns
- **Solution**: Non-greedy regex `(\[.*?\])?` handles this correctly

**Edge Case 3: Multiple > Symbols**
```
[user]>> Message with extra >
```
- **Issue**: Extra > symbols in content
- **Solution**: Only first > is treated as delimiter, rest is content

**Edge Case 4: No Empty Line at End**
```
> User message
Agent response without empty line before EOF
```
- **Issue**: Last message might not be captured
- **Solution**: Algorithm handles this with final message check

**Edge Case 5: Only Agent Messages**
```
This is an agent response
With multiple lines

Another agent response
```
- **Issue**: No user messages in conversation
- **Solution**: All content becomes agent messages (acceptable behavior)

**Edge Case 6: Empty Lines Within Messages**
```
> User message with

empty line in middle
```
- **Issue**: Empty line breaks user message incorrectly
- **Solution**: This is expected behavior per requirements - user must remove empty lines or use invisible character

**Edge Case 7: False Positive Patterns**
```
This line contains > but isn't user message
This line has [brackets] but no >
```
- **Issue**: Patterns that look like user messages but aren't
- **Solution**: Regex requires exact pattern match at line start

### Improved Parsing Algorithm Design

**New Algorithm Flow**:
```javascript
const USER_MESSAGE_PATTERN = /^(\[.*?\])?>\s*/;

function parse(content: string) {
  const lines = content.split('\n');
  const messages = [];
  let currentMessage = null;
  let messageCounter = 0;

  for (const line of lines) {
    // Check if line starts a new user message
    const userMatch = line.match(USER_MESSAGE_PATTERN);
    
    if (userMatch) {
      // Save previous message if exists
      if (currentMessage?.content) {
        messages.push(finalizeMessage(currentMessage, ++messageCounter));
      }
      
      // Start new user message (remove prefix)
      const content = line.replace(USER_MESSAGE_PATTERN, '').trim();
      currentMessage = {
        type: 'human',
        content: content,
        timestamp: new Date().toISOString()
      };
    }
    // Check for empty line (message delimiter)
    else if (line.trim() === '') {
      if (currentMessage?.content) {
        messages.push(finalizeMessage(currentMessage, ++messageCounter));
        currentMessage = null;
      }
    }
    // Handle continuation lines or agent messages
    else if (line.trim()) {
      if (currentMessage) {
        // Continue current message (user or agent)
        currentMessage.content += '\n' + line.trim();
      } else {
        // Start new agent message
        currentMessage = {
          type: 'agent',
          content: line.trim(),
          timestamp: new Date().toISOString()
        };
      }
    }
  }
  
  // Don't forget last message
  if (currentMessage?.content) {
    messages.push(finalizeMessage(currentMessage, ++messageCounter));
  }
  
  return { messages, metadata };
}
```

**Key Improvements**:
1. **Flexible Pattern Matching**: Uses regex to detect both `>` and `[prefix]>` formats
2. **Simplified State Machine**: Clear logic flow without complex branching
3. **Consistent Multi-line Handling**: All continuation lines are treated the same
4. **Clean Message Boundaries**: Empty lines clearly separate messages

### Root Cause Analysis

**Primary Issue: Restrictive User Message Detection**
- **Line 17**: `if (line.startsWith('> '))` - Only detects exact `> ` pattern
- **Missing**: Detection of `[prefix]>` patterns like `[vibe]>`, `[user]>`, `[system]>`, etc.
- **Root Cause**: Hard-coded string matching instead of flexible pattern matching

**Required Pattern for User Message Detection**:
```javascript
// Current (broken): line.startsWith('> ')
// New pattern needed: /^(\[.*?\])?>\s*/
// This matches:
// - "> " (current format)
// - "[vibe]> " 
// - "[user]> "
// - "[system]>"
// - ">" (without space)
// - "[anything]>" (flexible prefix)
```

**Pattern Breakdown**:
- `^` - Start of line
- `(\[.*?\])?` - Optional square bracket prefix (non-greedy)
- `>` - Required greater than symbol
- `\s*` - Optional whitespace after >

**Secondary Issue: Multi-line Message Handling Problems**

**Current Logic Issues**:
1. **Lines 35-44**: Attempts to detect `> ` in continuation lines
   - **Problem**: User message continuation lines don't have `> ` prefix
   - **Result**: Multi-line user messages get split incorrectly

2. **Lines 25-29**: Empty line detection ends current message
   - **Correct behavior**: Empty lines should end messages
   - **Problem**: Logic flow after empty line is unclear

3. **Lines 30-34**: Agent response detection
   - **Problem**: Any non-empty line without current message becomes agent
   - **Issue**: May incorrectly label continuation lines as agent messages

**Improved Multi-line Logic Needed**:
```javascript
// Simplified state machine:
// 1. Detect user message start with new regex pattern
// 2. Collect all subsequent lines until empty line
// 3. Start new message (user or agent) after empty line
// 4. No complex prefix checking in continuation lines
```

**Toast Notification Research**:

**Option 1: Simple CSS-based Toast (Recommended)**
- No external dependencies (project has minimal deps)
- Custom Vue component with CSS transitions
- Fits with existing terminal theme styling
- Can be styled to match terminal aesthetics

**Option 2: Vue Toast Libraries**
- Would require adding new dependency
- May not match terminal styling
- Overkill for simple notification needs

**Recommended Implementation**:
```vue
<!-- ToastNotification.vue -->
<template>
  <div v-if="visible" class="toast-notification">
    <div class="toast-content">
      {{ message }}
    </div>
  </div>
</template>
```

**Integration Point**: 
- Show toast when TextFormatParser is used
- Trigger from SourceInput.vue after parsing
- Auto-dismiss after 5-7 seconds
- Style to match terminal theme

**Missing Feature: User Feedback**
- **No toast notification** to inform users about parsing behavior
- **No guidance** on how empty lines serve as delimiters
- **No warning** when messages might be mislabeled

### Completed
- [x] All analysis tasks completed successfully
- [x] Root cause identified: Restrictive pattern matching and complex multi-line logic
- [x] Solution designed: Regex-based pattern matching with simplified state machine
- [x] Toast notification approach planned
- [x] Edge cases identified and handling planned

## Fix

### Phase Entrance Criteria:
- [x] Root cause of text parsing issues has been identified
- [x] Solution approach has been determined
- [x] Impact on existing functionality has been assessed
- [x] Implementation plan is clear

### Tasks
- [x] Update TextFormatParser.ts with improved regex pattern matching
- [x] Implement simplified multi-line message handling logic
- [x] Create ToastNotification.vue component
- [x] Integrate toast notification in SourceInput.vue
- [x] Test the improved parser with sample conversations
- [x] Ensure backward compatibility with existing > format
- [x] Style toast notification to match terminal theme

### Completed
- [x] All fix tasks completed successfully
- [x] TextFormatParser updated with regex pattern matching for [prefix]> formats
- [x] Multi-line message handling simplified and improved
- [x] ToastNotification component created and integrated
- [x] Testing verified fix works correctly with mixed message formats
- [x] Backward compatibility maintained for existing > format

### Implementation Results

**✅ Text Parsing Fix Successful**:
- `[vibe]>` prefixed messages now correctly identified as user messages
- `[user]>` and other `[prefix]>` formats supported
- Multi-line messages properly grouped until empty line delimiter
- Backward compatibility maintained for standard `>` format
- Conversation parsing shows correct message count

**✅ Toast Notification Working**:
- Toast appears when text format is used
- Styled to match terminal theme
- Provides clear guidance about empty line delimiters
- Auto-dismisses after 7 seconds

**✅ Testing Verified**:
- Tested with sample conversation containing mixed formats
- `[vibe]>` messages correctly labeled as "human" type
- Standard `>` messages still work correctly
- Multi-line messages properly handled
- Agent responses correctly identified

## Verify

### Phase Entrance Criteria:
- [x] Text parsing fix has been implemented
- [x] No regressions in existing functionality
- [x] Toast notification has been added
- [x] Code changes are ready for testing

### Tasks
- [x] Verify [prefix]> messages are correctly parsed as user messages
- [x] Verify standard > messages still work (backward compatibility)
- [x] Verify multi-line messages are properly grouped
- [x] Verify toast notification appears for text format parsing
- [x] Verify toast notification styling matches terminal theme
- [x] Test edge cases (empty messages, nested brackets, etc.)
- [x] Verify no regressions in JSON format parsing
- [x] Verify application builds successfully
- [x] Test on different conversation formats
- [x] **CRITICAL FIX**: Updated regex to handle [prefix] > format (with space)
- [x] **NEW**: Implement comprehensive unit tests with Vitest
- [x] **NEW**: Add test coverage for all format variations and edge cases
- [x] **NEW**: Fix empty message handling and special character support

### Unit Testing Implementation

**✅ Vitest Setup Complete**:
- Installed Vitest, @vitest/ui, jsdom, @vue/test-utils
- Created vitest.config.ts with Vue plugin support
- Added test scripts to package.json: `test`, `test:ui`, `test:run`

**✅ Comprehensive Test Suite (17 tests)**:
- **Basic user message detection**: Standard `>`, `[prefix]>`, `[prefix] >` formats
- **Multi-line message handling**: User and agent message grouping
- **Mixed format conversations**: Multiple format variations in one conversation
- **Edge cases**: Empty messages, nested brackets, special characters (`!`), whitespace
- **Real-world compatibility**: Hackathon conversation format testing
- **Metadata validation**: Title, format, timestamp verification
- **Message properties**: ID assignment, timestamp generation

**✅ Bug Fixes During Testing**:
- Updated regex to handle `[prefix] !>` format with special characters
- Fixed empty message handling (changed condition from `?.content` to existence check)
- Enhanced pattern: `/^(\[.*?\]\s*[!]?\s*)?>\s*/` supports all variations

### Verification Results

**✅ All Tests Passed Successfully**:

**Issue Resolution**:
- **Root Cause**: Original regex `/^(\[.*?\])?>\s*/` didn't handle space between bracket and `>`
- **Fix Applied**: Updated to `/^(\[.*?\]\s*)?>\s*/` to handle optional space
- **Result**: Now correctly parses `[vibe] >`, `[user] >`, `[prefix] >` formats

**Comprehensive Testing**:
- ✅ Standard `>` format works (backward compatibility maintained)
- ✅ `[prefix]>` format works (no space)
- ✅ `[prefix] >` format works (with space) - **NEW FIX**
- ✅ Multi-line messages properly grouped until empty line
- ✅ Toast notification appears and matches terminal theme
- ✅ Real-world file parsing: 250 messages correctly parsed from hackathon conversation
- ✅ User messages correctly identified with `>` indicator
- ✅ Agent messages correctly identified with `<` indicator

### Completed
- [x] All verification tasks completed successfully
- [x] Critical regex fix applied for [prefix] > format (with space)
- [x] Real-world testing with 250-message hackathon conversation file
- [x] Confirmed backward compatibility maintained
- [x] Toast notification working correctly
- [x] No regressions introduced

## Key Decisions
- **Chose regex-based pattern matching over string matching**: More flexible and handles multiple format variations
- **Added optional space handling in regex**: `(\[.*?\]\s*)?` handles both `[prefix]>` and `[prefix] >` formats
- **Implemented toast notification for user feedback**: Informs users about text parsing behavior and empty line delimiters
- **Maintained backward compatibility**: All existing `>` format conversations continue to work
- **Used Vue.js composition API**: Clean, modern component architecture for ToastNotification

## Notes
**Bug Successfully Resolved**: ✅
- **Root Cause**: Regex pattern didn't handle space between `[prefix]` and `>`
- **Solution**: Updated pattern from `/^(\[.*?\])?>\s*/` to `/^(\[.*?\]\s*)?>\s*/`
- **Verification**: Tested with real 250-message hackathon conversation file
- **Commit**: 7a9228b - "Fix text format parsing for [prefix] > messages with space"

**Files Modified**:
- `src/parsers/TextFormatParser.ts` - Updated regex pattern and simplified parsing logic
- `src/components/SourceInput.vue` - Added toast notification integration
- `src/components/ToastNotification.vue` - New component for user feedback

**Impact**: All text format variations now supported, user experience improved with helpful notifications.

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
