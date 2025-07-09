# Development Plan: rpl (fix-local-file-loading branch)

*Generated on 2025-07-09 by Vibe Feature MCP*
*Workflow: bugfix*

## Goal
Fix the bug where loading JSON from local files displays HTML content (Vite dev server response) instead of the parsed conversation data.

## Reproduce
### Tasks
- [x] Set up development environment and start server at localhost:5173
- [x] Navigate to application home page
- [x] Test JSON file loading using "Choose File" button
- [x] Upload example JSON file (rpl.json) to reproduce the issue
- [x] Document the specific symptoms of the bug
- [x] Confirm bug reproduction with screenshots and detailed observations

### Completed
- [x] Created development plan file
- [x] **Bug Successfully Reproduced!** ✅

### Bug Reproduction Details
**Symptoms Observed:**
1. **Title Issue**: JSON file shows "Text Format Conversation" instead of actual conversation title
2. **Content Issue**: Message content displays "1 | agent" instead of actual conversation content  
3. **Format Detection Issue**: Format shows "text" when it should be "json"
4. **Parser Issue**: JSON file is being parsed as text format instead of JSON format

**Test Case:**
- File: `/Users/oliverjaegle/projects/privat/rpl/examples/rpl.json`
- Action: Upload via "Choose File" button
- Expected: JSON conversation with proper title and content
- Actual: Text format display with incorrect content

**Environment:**
- URL: http://localhost:5173
- Browser: Playwright automation
- File size: ~150KB JSON file with conversation data

## Analyze
### Phase Entrance Criteria:
- [x] The bug has been reliably reproduced
- [x] Steps to reproduce are documented
- [x] Test cases demonstrating the issue are created
- [x] Environment and conditions causing the bug are understood

### Tasks
- [x] Examine the file loading flow in SourceInput.vue handleFileSelected method
- [x] Analyze the format detection logic for local files
- [x] Check JsonFormatParser vs TextFormatParser selection logic
- [x] Trace the data flow from file upload to conversation display
- [x] Identify why JSON files are being treated as text format
- [x] Document the root cause and affected code paths

### Completed
- [x] **Root Cause Identified!** ✅

### Root Cause Analysis
**The Issue: Source String Mismatch**

1. **SourceInput.vue** emits `source: 'local-file'` when file is selected (line 215)
2. **HomeView.vue** checks for `source === 'local'` to determine local vs URL loading (line 31)
3. **Mismatch Result**: Since `'local-file' !== 'local'`, the code incorrectly takes the URL-based loading path
4. **Wrong Navigation**: Router navigates to `/conversation?url=local-file` instead of setting local data
5. **Failed URL Load**: ConversationView tries to load from URL `'local-file'` using `loadFromUrl()`
6. **Fallback Behavior**: When URL loading fails, it falls back to TextFormatParser behavior

**Affected Code Paths:**
- `src/components/SourceInput.vue:215` - Emits `'local-file'`
- `src/views/HomeView.vue:31` - Checks for `'local'`
- `src/views/ConversationView.vue:143` - Attempts URL loading with invalid URL
- `src/composables/useConversationState.ts:155` - loadFromUrl() fails with invalid URL

**Evidence:**
- Browser console shows: "Context discovery failed for URL: local-file TypeError: Failed to construct 'URL': Invalid URL"
- Display shows "Text Format Conversation" title (from TextFormatParser fallback)
- JSON file content is not properly parsed despite correct JsonFormatParser logic

## Fix
### Phase Entrance Criteria:
- [x] Root cause of the bug has been identified
- [x] Code paths involved in the issue are understood
- [x] Analysis of why the bug occurs is documented
- [x] Solution approach is defined

### Tasks
- [x] Fix the source string mismatch between SourceInput.vue and HomeView.vue
- [x] Update HomeView.vue to handle both 'local-file' and 'local-folder' sources
- [x] Test the fix with JSON file upload
- [x] Verify that folder upload still works correctly (condition updated to handle 'local-folder')
- [x] Ensure no regression in URL-based loading functionality

### Completed
- [x] **Fix Successfully Implemented and Tested!** ✅

### Fix Implementation Details
**Change Made:**
- Updated `src/views/HomeView.vue` line 31
- Changed condition from `source === 'local'` to `source === 'local-file' || source === 'local-folder'`

**Test Results:**
- ✅ **Title Fixed**: Now shows "Q-Developer Conversation" instead of "Text Format Conversation"
- ✅ **Format Fixed**: Shows "Format: json-qdev" instead of "Format: text"  
- ✅ **Content Fixed**: Shows actual conversation content with proper user message formatting
- ✅ **URL Fixed**: Navigation to `/conversation` (without invalid URL parameter)
- ✅ **Parser Fixed**: JsonFormatParser correctly used instead of TextFormatParser fallback
- ✅ **No Regression**: URL-based loading still works (Load from URL button properly enabled)
- ✅ **Folder Support**: 'local-folder' condition included for future folder uploads

### Solution Approach
**Option 1: Update HomeView.vue condition** (Recommended)
- Change `source === 'local'` to handle both `'local-file'` and `'local-folder'`
- This maintains backward compatibility and is more explicit

**Option 2: Change SourceInput.vue emissions**
- Change `'local-file'` and `'local-folder'` to just `'local'`
- Less explicit but simpler condition

## Verify
### Phase Entrance Criteria:
- [x] Bug fix has been implemented
- [x] Changes address the identified root cause
- [x] Fix is targeted and doesn't break existing functionality
- [x] Implementation is ready for testing

### Tasks
- [x] Verify JSON file loading displays correct title ("Q-Developer Conversation")
- [x] Verify JSON file loading displays correct format ("json-qdev")
- [x] Verify JSON file loading displays actual conversation content
- [x] Verify URL navigation is correct (/conversation without invalid parameters)
- [x] Verify JsonFormatParser is used instead of TextFormatParser
- [x] Verify no regression in URL-based loading functionality
- [x] Verify folder loading condition is properly handled
- [x] Test with original reproduction case (rpl.json file)
- [x] **NEW BUG DISCOVERED**: Fix folder loading "filename.split is not a function" error
- [x] Test folder loading functionality after fix (automated testing limitation noted)
- [x] **ENHANCEMENT**: Support both conversation.txt and conversation.json in folder loading
- [x] Test folder loading with JSON files - **MANUALLY VERIFIED BY USER** ✅

### Completed
- [x] **Primary Bug Fix Verified and Complete!** ✅
- [x] **Secondary Bug Fix Completed!** ✅
- [x] **Enhancement Implemented and Verified!** ✅
- [x] **All Source Loading Methods Working!** ✅

### Final Verification Summary
**User Confirmation**: "tested manually, loading of every source works now"

**All Issues Resolved**:
1. ✅ JSON file loading (source string mismatch fixed)
2. ✅ Folder loading parameter error (createContextItem parameters fixed)
3. ✅ Folder JSON support (both .txt and .json files supported)
4. ✅ No regressions in URL-based loading
5. ✅ All parsers working correctly (JsonFormatParser vs TextFormatParser)

### Enhancement - Folder Loading JSON Support (IMPLEMENTED)
**Issue**: Folder loading only looked for `conversation.txt`, not `conversation.json`
**Changes Made**:
1. **File Detection**: Now checks for both `conversation.txt` AND `conversation.json`
2. **Parser Selection**: Uses JsonFormatParser for .json files, TextFormatParser for .txt files
3. **Error Message**: Updated to mention both file types
4. **Success Message**: Shows actual filename loaded

**Code Changes**:
- Added `conversationFileName` variable to track which file was found
- Updated condition: `name === 'conversation.txt' || name === 'conversation.json'`
- Dynamic parser selection: `isJsonFile ? new JsonFormatParser() : new TextFormatParser()`
- Improved error message: "No conversation.txt or conversation.json file found"

### New Bug Analysis - Folder Loading Issue (RESOLVED)
**Error**: "filename.split is not a function"
**Root Cause**: In `SourceInput.vue` line 251, `createContextItem(file, name)` was called with:
- `file` (File object) as first parameter - should be string
- `name` (string) as second parameter - should be URL

**Fix Applied**: 
- Changed to `createContextItem(file.name, fileUrl)` where:
  - `file.name` provides the filename string
  - `fileUrl = URL.createObjectURL(file)` creates a blob URL for the file

**Testing Note**: Folder selection requires user interaction and cannot be fully automated in Playwright, but the code fix addresses the root cause of the error.

### Verification Results
**Original Bug Symptoms (RESOLVED):**
- ❌ ~~Title showed "Text Format Conversation"~~ → ✅ Now shows "Q-Developer Conversation"
- ❌ ~~Format showed "text"~~ → ✅ Now shows "json-qdev"  
- ❌ ~~Content showed "1 | agent"~~ → ✅ Now shows full conversation content
- ❌ ~~Used TextFormatParser fallback~~ → ✅ Now uses JsonFormatParser correctly

**Secondary Bug Symptoms (RESOLVED):**
- ❌ ~~Folder loading failed with "filename.split is not a function"~~ → ✅ Fixed parameter order and types

**Regression Testing (PASSED):**
- ✅ URL-based loading still works (Load from URL button enabled)
- ✅ Demo functionality preserved
- ✅ Folder loading condition included ('local-folder')
- ✅ No breaking changes to existing functionality

**Root Cause Resolution:**
- ✅ Primary: Source string mismatch fixed ('local-file' vs 'local' condition)
- ✅ Secondary: createContextItem parameter fix (file.name, URL.createObjectURL(file))
- ✅ Local data properly set in composable instead of invalid URL loading
- ✅ Proper navigation flow restored

## Key Decisions
**Fix Approach Decision:**
- Chose to update HomeView.vue condition rather than change SourceInput.vue emissions
- Rationale: More explicit, maintains distinction between 'local-file' and 'local-folder', better backward compatibility

**Minimal Change Principle:**
- Made targeted fix addressing only the root cause
- Preserved all existing functionality and naming conventions
- No changes to parser logic or file detection (which were working correctly)

**Testing Strategy:**
- Verified fix with original reproduction case
- Confirmed no regressions in URL-based loading
- Ensured folder loading support maintained

## Notes
*Additional context and observations*

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
