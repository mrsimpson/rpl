# Scenario 2: Repository Discovery & Loading

## Feature: GitHub Repository Discovery and Data Loading

**As a** user  
**I want to** load repository data when I click "Load Conversation"  
**So that** the system can discover conversation and context files  

---

## Background:
```gherkin
Given I am on the conversation replay home page
And I have entered a GitHub repository URL
And the "Load Conversation" button is enabled
```

---

## Test Cases:

### Test Case 2.1: Successful Public Repository Access
```gherkin
Scenario: User loads a public GitHub repository
  Given I have entered "https://github.com/user/public-repo/tree/main/conversations" in the source URL field
  When I click the "Load Conversation" button
  Then the system should navigate to the conversation view
  And a loading indicator should be displayed
  And the GitHub API should be called with the correct repository path
  And the repository file listing should be successfully retrieved
  And the loading state should transition to content processing
```

### Test Case 2.2: Private Repository Access Denied
```gherkin
Scenario: User attempts to load a private repository
  Given I have entered "https://github.com/user/private-repo/tree/main/conversations" in the source URL field
  When I click the "Load Conversation" button
  Then the system should attempt to access the repository
  And the GitHub API should return a 404 error
  And an error message "Repository is private or does not exist" should be displayed
  And the user should be redirected to home after a few seconds
  And the error should be logged appropriately
```

### Test Case 2.3: Non-existent Repository
```gherkin
Scenario: User enters a URL for a repository that doesn't exist
  Given I have entered "https://github.com/user/non-existent-repo/tree/main/path" in the source URL field
  When I click the "Load Conversation" button
  Then the GitHub API should return a 404 error
  And an error message should indicate the repository was not found
  And the user should be able to return to home and try again
  And no partial data should be loaded
```

### Test Case 2.4: Network Connectivity Issues
```gherkin
Scenario: User attempts to load repository with network issues
  Given I have entered a valid GitHub repository URL
  And the network connection is unstable
  When I click the "Load Conversation" button
  Then the system should attempt to connect to GitHub API
  And after a reasonable timeout, a network error should be displayed
  And the error message should suggest checking internet connection
  And the user should be able to retry the operation
```

### Test Case 2.5: GitHub API Rate Limiting
```gherkin
Scenario: GitHub API rate limit is exceeded
  Given I have entered a valid GitHub repository URL
  And the GitHub API rate limit has been exceeded
  When I click the "Load Conversation" button
  Then the GitHub API should return a 403 rate limit error
  And an error message "GitHub API rate limit exceeded" should be displayed
  And the error should include guidance about rate limits
  And the user should be advised to try again later
```

### Test Case 2.6: Malformed API Response
```gherkin
Scenario: GitHub API returns malformed data
  Given I have entered a valid GitHub repository URL
  And the GitHub API returns invalid JSON
  When I click the "Load Conversation" button
  Then the system should attempt to parse the response
  And a parsing error should be caught gracefully
  And an error message "Unable to parse repository data" should be displayed
  And the error should not crash the application
```

---

## Mock Data Requirements:
- **Successful API Response**: Valid GitHub API response with file listings
- **404 Error Response**: GitHub API 404 for private/non-existent repos
- **Rate Limit Response**: GitHub API 403 rate limit error
- **Network Error**: Simulated network timeout/failure
- **Malformed Response**: Invalid JSON response from API

## Expected Behaviors:
- Loading states are clearly communicated to users
- Errors are handled gracefully with meaningful messages
- Network issues don't crash the application
- Users can recover from errors and try again
- API calls use correct GitHub API endpoints and parameters
