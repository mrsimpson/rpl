# Development Plan: rpl (merge-q-json branch)

*Generated on 2025-07-09 by Vibe Feature MCP*
*Workflow: epcc*

## Goal
Implement a feature to merge historic conversation files when loading from a git repository. This is needed because sometimes exported Q conversations are cut off, and when re-saving with the same name, the previous conversation is overwritten. When loading a conversation from a git repository, we can access the file history and merge the historic files to recover the complete conversation.

## Explore
### Tasks
- [ ] Understand how the GitHub API can be used to fetch file history
- [ ] Determine the best approach to merge conversation data from multiple files
- [ ] Define what parts of conversations should be merged (messages, metadata, etc.)
- [ ] Identify potential edge cases and how to handle them

### Completed
- [x] Created development plan file
- [x] Explored the codebase structure and understood how conversations are loaded
- [x] Identified that conversations are saved from Q Developer CLI and loaded into this app
- [x] Found that the app uses different adapters to load conversations from various sources
- [x] Confirmed that GitHubRepoSourceAdapter is responsible for loading conversations from GitHub repositories
- [x] Determined that there's no existing functionality to handle git history or merge multiple versions of conversation files

## Plan
### Tasks
- [ ] Design the algorithm for merging conversation files
- [ ] Plan the changes needed to GitHubRepoSourceAdapter to fetch file history
- [ ] Determine how to integrate the merging functionality with the existing code
- [ ] Define tests to verify the merging functionality works correctly

### Completed
*None yet*

## Code
### Tasks
- [ ] Enhance GitHubRepoSourceAdapter to fetch previous versions of the conversation file
- [ ] Implement a merging algorithm to combine current and historic versions of conversations
- [ ] Update useConversationState to handle merged conversation data
- [ ] Add error handling for potential issues during merging
- [ ] Add logging to track the merging process

### Completed
*None yet*

## Commit
### Tasks
- [ ] Test the feature with different conversation files
- [ ] Document the feature in code comments
- [ ] Update README if necessary
- [ ] Create a final commit with all changes

### Completed
*None yet*

## Key Decisions
- The feature will focus on merging conversations loaded from GitHub repositories since they provide an accessible API for file history
- Conversations are saved externally by Q Developer CLI and only loaded by this app

## Notes
- The app uses different adapters to load conversations from various sources (FileSourceAdapter, GistSourceAdapter, GitHubRepoSourceAdapter)
- The GitHubRepoSourceAdapter loads a single conversation file from a GitHub repository
- We'll need to use the GitHub API to fetch previous versions of the conversation file
- We'll need to implement a merging algorithm to combine the current and historic versions of the conversation

---
*This plan is maintained by the LLM. Tool responses provide guidance on which section to focus on and what tasks to work on.*
