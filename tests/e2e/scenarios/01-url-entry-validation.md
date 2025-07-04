# Scenario 1: URL Entry & Validation

## Feature: GitHub Repository URL Entry and Validation

**As a** user  
**I want to** enter GitHub repository URLs in the source input field  
**So that** I can load conversations and context from GitHub repositories  

---

## Background:
```gherkin
Given I am on the conversation replay home page
And the source input field is visible
```

---

## Test Cases:

### Test Case 1.1: Valid GitHub Repository URL
```gherkin
Scenario: User enters a valid GitHub repository URL
  Given I am on the home page
  When I enter "https://github.com/user/repo/tree/main/path" in the source URL field
  Then the "Load Conversation" button should be enabled
  And no validation errors should be displayed
  And the URL should be accepted for processing
```

### Test Case 1.2: Invalid GitHub Repository URL Format
```gherkin
Scenario: User enters an invalid GitHub repository URL
  Given I am on the home page
  When I enter "https://github.com/invalid-url-format" in the source URL field
  Then the "Load Conversation" button should remain disabled
  And a validation error should be displayed
  And the error message should guide the user to the correct format
```

### Test Case 1.3: Non-GitHub URL (Regression Test)
```gherkin
Scenario: User enters a non-GitHub URL
  Given I am on the home page
  When I enter "https://example.com/conversation.txt" in the source URL field
  Then the "Load Conversation" button should be enabled
  And the system should prepare to use FileSourceAdapter
  And existing functionality should not be affected
```

### Test Case 1.4: GitHub Gist URL (Regression Test)
```gherkin
Scenario: User enters a GitHub Gist URL
  Given I am on the home page
  When I enter "https://gist.github.com/user/gist-id" in the source URL field
  Then the "Load Conversation" button should be enabled
  And the system should prepare to use GistSourceAdapter
  And existing gist functionality should not be affected
```

### Test Case 1.5: Empty Input Field
```gherkin
Scenario: User leaves the input field empty
  Given I am on the home page
  And the source URL field is empty
  Then the "Load Conversation" button should be disabled
  And the placeholder text should guide users to enter GitHub repository URLs
  And no error messages should be displayed
```

### Test Case 1.6: URL with Special Characters
```gherkin
Scenario: User enters GitHub URL with special characters
  Given I am on the home page
  When I enter "https://github.com/user-name/repo_name/tree/feature/branch-name/path%20with%20spaces" in the source URL field
  Then the URL should be properly encoded and accepted
  And the "Load Conversation" button should be enabled
  And special characters should be handled correctly
```

---

## Mock Data Requirements:
- Valid GitHub repository URLs for testing
- Invalid URL formats for negative testing
- Non-GitHub URLs for regression testing
- URLs with special characters for encoding testing

## Expected Behaviors:
- URL validation happens in real-time as user types
- Button state changes immediately based on validation
- Error messages are clear and actionable
- Existing functionality remains unaffected
