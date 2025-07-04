# Scenario 3: Conversation File Detection

## Feature: Conversation File Detection and Prioritization

**As a** user  
**I want the** system to automatically find the conversation file in a repository  
**So that** I don't have to manually specify which file contains the conversation  

---

## Background:
```gherkin
Given the system has successfully retrieved a GitHub repository file listing
And the repository contains various files
```

---

## Test Cases:

### Test Case 3.1: Repository with conversation.json (Highest Priority)
```gherkin
Scenario: Repository contains conversation.json file
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | conversation.txt  | file |
    | other.json        | file |
    | README.md         | file |
  When the system analyzes files for conversation detection
  Then "conversation.json" should be selected as the conversation file
  And other files should be ignored for conversation purposes
  And the system should proceed to load the JSON file content
```

### Test Case 3.2: Repository with conversation.txt (Second Priority)
```gherkin
Scenario: Repository contains conversation.txt but no conversation.json
  Given the repository file listing contains:
    | filename         | type |
    | conversation.txt | file |
    | other.txt        | file |
    | data.json        | file |
    | README.md        | file |
  When the system analyzes files for conversation detection
  Then "conversation.txt" should be selected as the conversation file
  And other text files should be ignored for conversation purposes
  And the system should proceed to load the text file content
```

### Test Case 3.3: Repository with Multiple JSON Files (Third Priority)
```gherkin
Scenario: Repository contains JSON files but no conversation.json
  Given the repository file listing contains:
    | filename    | type |
    | data.json   | file |
    | config.json | file |
    | chat.json   | file |
    | README.md   | file |
  When the system analyzes files for conversation detection
  Then the first JSON file should be selected as the conversation file
  And the selection should be deterministic and consistent
  And the system should proceed to load the selected JSON file
```

### Test Case 3.4: Repository with Multiple Text Files (Fourth Priority)
```gherkin
Scenario: Repository contains text files but no JSON files
  Given the repository file listing contains:
    | filename  | type |
    | chat.txt  | file |
    | notes.txt | file |
    | log.txt   | file |
    | README.md | file |
  When the system analyzes files for conversation detection
  Then the first text file should be selected as the conversation file
  And README.md should be excluded from consideration
  And the system should proceed to load the selected text file
```

### Test Case 3.5: Repository with No Conversation Files
```gherkin
Scenario: Repository contains no suitable conversation files
  Given the repository file listing contains:
    | filename      | type |
    | README.md     | file |
    | package.json  | file |
    | image.png     | file |
    | script.js     | file |
  When the system analyzes files for conversation detection
  Then no conversation file should be found
  And an error "No conversation file found in repository" should be displayed
  And the user should be redirected to home with an error message
  And no further processing should occur
```

### Test Case 3.6: Repository with Only Directories
```gherkin
Scenario: Repository path contains only directories, no files
  Given the repository file listing contains:
    | filename | type      |
    | src      | directory |
    | docs     | directory |
    | tests    | directory |
  When the system analyzes files for conversation detection
  Then no conversation file should be found
  And an error should indicate no conversation files are available
  And the system should handle the empty file list gracefully
```

### Test Case 3.7: Priority Order Verification
```gherkin
Scenario: Repository with all conversation file types
  Given the repository file listing contains:
    | filename          | type |
    | conversation.json | file |
    | conversation.txt  | file |
    | other.json        | file |
    | other.txt         | file |
  When the system analyzes files for conversation detection
  Then the priority order should be:
    | priority | filename          |
    | 1        | conversation.json |
    | 2        | conversation.txt  |
    | 3        | other.json        |
    | 4        | other.txt         |
  And "conversation.json" should be selected
  And the priority logic should be consistent across runs
```

---

## Mock Data Requirements:
- **Repository with conversation.json**: File listing including conversation.json
- **Repository with conversation.txt**: File listing with text conversation file
- **Repository with multiple JSON files**: Various JSON files without conversation.json
- **Repository with multiple text files**: Various text files without conversation files
- **Repository with no conversation files**: Only non-conversation files
- **Empty repository**: No files or only directories

## Expected Behaviors:
- File detection follows the documented priority order
- Only files (not directories) are considered for conversation detection
- Noise files (README.md, package.json) are excluded
- Error handling is graceful when no conversation files exist
- Selection is deterministic and consistent
- File type detection is based on file extension
