# Scenario 7: Context Panel Integration

## Feature: Context Panel Display and Interaction

**As a** user  
**I want to** view context files alongside the conversation  
**So that** I can see relevant images, documents, and code at the appropriate message ranges  

---

## Background:
```gherkin
Given a GitHub repository conversation has been loaded
And context files have been discovered and prefetched
And the conversation is being displayed in the terminal interface
```

---

## Test Cases:

### Test Case 7.1: Context Panel Appearance
```gherkin
Scenario: Context panel appears when context files are available
  Given context files have been discovered:
    | filename  | message_range | type     |
    | 1-5.md    | [1,2,3,4,5]  | document |
    | 20-30.png | [20-30]      | image    |
  When the conversation view is displayed
  Then a context panel should appear on the right side
  And the terminal should resize to accommodate the context panel
  And the layout should be responsive and well-proportioned
  And the context panel should have appropriate styling
```

### Test Case 7.2: Range-based Context Display
```gherkin
Scenario: Context files appear at appropriate message ranges
  Given context files with specific message ranges:
    | filename  | message_range | type     |
    | 1-5.md    | [1,2,3,4,5]  | document |
    | 4.jpg     | [4]          | image    |
    | 20-30.png | [20-30]      | image    |
  When I navigate to message 1
  Then "1-5.md" should be visible in the context panel
  When I navigate to message 4
  Then both "1-5.md" and "4.jpg" should be visible
  When I navigate to message 10
  Then no context files should be displayed
  When I navigate to message 25
  Then "20-30.png" should be visible in the context panel
```

### Test Case 7.3: Image Context File Display
```gherkin
Scenario: Image context files are properly rendered
  Given image context files are available:
    | filename    | type  | format |
    | 1.png       | image | PNG    |
    | 2.jpg       | image | JPEG   |
    | 3.gif       | image | GIF    |
  When these files are displayed in the context panel
  Then images should render with proper aspect ratios
  And images should be clickable for full-size viewing
  And image loading errors should be handled gracefully
  And images should have appropriate alt text or captions
  And large images should be scaled appropriately for the panel
```

### Test Case 7.4: Document Context File Display
```gherkin
Scenario: Document context files are properly rendered
  Given document context files are available:
    | filename | type     | format   |
    | 1-5.md   | document | markdown |
    | 2.txt    | document | text     |
  When these files are displayed in the context panel
  Then markdown files should be rendered with proper formatting
  And text files should display with appropriate styling
  And long documents should be scrollable within the panel
  And document content should be readable and well-formatted
```

### Test Case 7.5: Code Context File Display
```gherkin
Scenario: Code context files are properly rendered with syntax highlighting
  Given code context files are available:
    | filename | type | language   |
    | 1.js     | code | javascript |
    | 2.css    | code | css        |
    | 3.html   | code | html       |
  When these files are displayed in the context panel
  Then code should have appropriate syntax highlighting
  And the language should be detected correctly
  And code should be formatted with proper indentation
  And line numbers should be displayed where appropriate
  And code should be readable with good contrast
```

### Test Case 7.6: Context File Navigation
```gherkin
Scenario: User can navigate between multiple context files
  Given multiple context files are available for the current message range:
    | filename | type     | priority |
    | 4.jpg    | image    | 4        |
    | 4.md     | document | 4        |
    | 4.js     | code     | 4        |
  When multiple context files are displayed
  Then navigation controls should be available
  And users should be able to switch between context files
  And the active context file should be clearly indicated
  And navigation should be smooth and responsive
```

### Test Case 7.7: Context Panel Responsiveness
```gherkin
Scenario: Context panel adapts to different screen sizes
  Given context files are being displayed
  When the browser window is resized to different dimensions:
    | screen_size | width | expected_behavior           |
    | desktop     | 1920  | full context panel visible |
    | tablet      | 768   | context panel adjusts      |
    | mobile      | 375   | context panel collapses    |
  Then the context panel should adapt appropriately
  And the conversation should remain readable
  And navigation should remain functional
  And the layout should not break at any screen size
```

### Test Case 7.8: Context File Loading States
```gherkin
Scenario: Context panel shows appropriate loading states
  Given context files are being loaded in the background
  When context files are still loading
  Then loading indicators should be displayed in the context panel
  And partially loaded content should be shown progressively
  When context files fail to load
  Then error states should be displayed with retry options
  And failed files should not break the entire context panel
  When context files load successfully
  Then loading indicators should disappear
  And content should display smoothly
```

### Test Case 7.9: Context Panel Performance
```gherkin
Scenario: Context panel performs well with many context files
  Given a repository with many context files:
    | file_count | file_types           | size_range    |
    | 50         | images, docs, code   | 1KB - 5MB     |
  When navigating through messages with context
  Then context switching should be responsive
  And memory usage should remain reasonable
  And large files should be loaded efficiently
  And the interface should not become sluggish
  And context prefetching should work effectively
```

### Test Case 7.10: Context Panel Integration with Playback
```gherkin
Scenario: Context panel integrates seamlessly with conversation playback
  Given a conversation is playing automatically
  And context files are available at various message ranges
  When auto-play progresses through messages
  Then context files should appear and disappear automatically
  And context changes should not interrupt playback flow
  And context loading should not slow down playback
  When playback is paused
  Then context files should remain visible and interactive
  When playback is restarted
  Then context synchronization should resume correctly
```

### Test Case 7.11: No Context Files Scenario
```gherkin
Scenario: Conversation displays normally when no context files are available
  Given a conversation has been loaded successfully
  And no context files were discovered in the repository
  When the conversation is displayed
  Then no context panel should appear
  And the terminal should use the full available width
  And the conversation should function normally
  And no context-related errors should be displayed
  And the layout should be optimized for conversation-only viewing
```

---

## Mock Data Requirements:
- **Image files**: PNG, JPG, GIF files of various sizes
- **Document files**: Markdown and text files with different content lengths
- **Code files**: JavaScript, CSS, HTML files with syntax highlighting
- **Mixed context sets**: Combinations of different file types
- **Large context sets**: Many files for performance testing
- **Loading error scenarios**: Failed file loads, network issues
- **No context scenarios**: Conversations without context files

## Expected Behaviors:
- Context panel appears only when context files are available
- Context files display at correct message ranges
- Different file types are rendered appropriately
- Context panel is responsive and performs well
- Integration with conversation playback is seamless
- Loading states and errors are handled gracefully
- Navigation between context files is smooth
- Layout adapts to different screen sizes
- Memory and performance remain acceptable with large context sets
