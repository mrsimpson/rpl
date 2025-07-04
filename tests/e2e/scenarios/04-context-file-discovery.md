# Scenario 4: Context File Discovery

## Feature: Context File Discovery and Filtering

**As a** user  
**I want the** system to automatically discover context files in the repository  
**So that** relevant images, documents, and code files are available during conversation replay  

---

## Background:
```gherkin
Given the system has successfully retrieved a GitHub repository file listing
And a conversation file has been identified
```

---

## Test Cases:

### Test Case 4.1: Range-based Context Files Discovery
```gherkin
Scenario: Repository contains files with message range patterns
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | 1-5.md           | file |
    | 20-30.png        | file |
    | 4.jpg            | file |
    | 7-8.mov          | file |
    | README.md        | file |
  When the system analyzes files for context discovery
  Then the following context files should be discovered:
    | filename  | message_range | type     |
    | 1-5.md    | [1,2,3,4,5]  | document |
    | 20-30.png | [20-30]      | image    |
    | 4.jpg     | [4]          | image    |
    | 7-8.mov   | [7,8]        | video    |
  And "conversation.json" should be excluded from context files
  And "README.md" should be excluded as noise
```

### Test Case 4.2: Mixed File Types Context Discovery
```gherkin
Scenario: Repository contains various supported file types
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | 1.png            | file |
    | 2.jpg            | file |
    | 3.gif            | file |
    | 4.mp4            | file |
    | 5.mov            | file |
    | 6.md             | file |
    | 7.txt            | file |
    | 8.js             | file |
    | 9.css            | file |
    | 10.html          | file |
  When the system analyzes files for context discovery
  Then all supported file types should be included as context files
  And each file should be assigned the correct content type
  And message ranges should be parsed from filenames
```

### Test Case 4.3: Noise File Filtering
```gherkin
Scenario: Repository contains noise files that should be filtered out
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | 1.png            | file |
    | README.md        | file |
    | package.json     | file |
    | .gitignore       | file |
    | LICENSE          | file |
    | CHANGELOG.md     | file |
    | node_modules     | directory |
  When the system analyzes files for context discovery
  Then only "1.png" should be included as a context file
  And all noise files should be filtered out:
    | excluded_file     | reason           |
    | README.md        | noise pattern    |
    | package.json     | noise pattern    |
    | .gitignore       | noise pattern    |
    | LICENSE          | noise pattern    |
    | CHANGELOG.md     | noise pattern    |
    | node_modules     | directory        |
```

### Test Case 4.4: Repository with No Context Files
```gherkin
Scenario: Repository contains only conversation file and noise
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | README.md        | file |
    | package.json     | file |
    | LICENSE          | file |
  When the system analyzes files for context discovery
  Then no context files should be discovered
  And the system should proceed with conversation-only loading
  And no context panel should be displayed
  And the conversation should load normally without context
```

### Test Case 4.5: Unsupported File Types Filtering
```gherkin
Scenario: Repository contains files with unsupported extensions
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | 1.png            | file |
    | 2.exe            | file |
    | 3.bin            | file |
    | 4.zip            | file |
    | 5.pdf            | file |
    | 6.docx           | file |
  When the system analyzes files for context discovery
  Then only supported file types should be included:
    | filename | supported | reason                    |
    | 1.png    | yes       | supported image format    |
    | 2.exe    | no        | unsupported binary format |
    | 3.bin    | no        | unsupported binary format |
    | 4.zip    | no        | unsupported archive       |
    | 5.pdf    | no        | unsupported document      |
    | 6.docx   | no        | unsupported document      |
```

### Test Case 4.6: Large Repository Filtering Performance
```gherkin
Scenario: Repository contains many files requiring efficient filtering
  Given the repository file listing contains 100+ files including:
    | pattern           | count | should_include |
    | *.png            | 20    | yes            |
    | *.jpg            | 15    | yes            |
    | *.md             | 10    | yes            |
    | *.js             | 25    | yes            |
    | README.md        | 1     | no             |
    | package.json     | 1     | no             |
    | node_modules/*   | 30    | no             |
  When the system analyzes files for context discovery
  Then filtering should complete within reasonable time
  And only valid context files should be included
  And noise files should be efficiently filtered out
  And the system should handle large file lists gracefully
```

### Test Case 4.7: Invalid Range Pattern Handling
```gherkin
Scenario: Repository contains files with invalid range patterns
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | 1-5.png          | file |
    | invalid-range.jpg | file |
    | -10.png          | file |
    | 5-.md            | file |
    | abc.png          | file |
  When the system analyzes files for context discovery
  Then files with valid ranges should be included:
    | filename     | message_range | included |
    | 1-5.png      | [1,2,3,4,5]  | yes      |
    | invalid-range.jpg | []      | no       |
    | -10.png      | []           | no       |
    | 5-.md        | []           | no       |
    | abc.png      | []           | no       |
  And invalid range patterns should be handled gracefully
  And no errors should be thrown for invalid patterns
```

---

## Mock Data Requirements:
- **Repository with range-based files**: Files following 1-5.md, 20-30.png patterns
- **Repository with mixed file types**: Various supported extensions
- **Repository with noise files**: Common repository files to filter out
- **Repository with no context**: Only conversation and noise files
- **Repository with unsupported files**: Binary and unsupported formats
- **Large repository**: 100+ files for performance testing
- **Repository with invalid patterns**: Files with malformed range patterns

## Expected Behaviors:
- Context discovery runs after conversation file detection
- File filtering is efficient and handles large repositories
- Range parsing is robust and handles invalid patterns gracefully
- Supported file types are correctly identified
- Noise filtering removes common repository files
- Context files are properly categorized by type
- Discovery process doesn't block conversation loading
