# Requirements Document

## Introduction

This feature adds a dynamic action bar to the Files page that displays contextual actions based on the currently selected file or directory. The action bar will provide quick access to file operations such as upload, download, rename, move, delete, and create directory, with actions shown or hidden based on the selection context and user permissions.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see an action bar at the top of the Files page, so that I can quickly access file operations without navigating through menus.

#### Acceptance Criteria

1. WHEN the Files page loads THEN the system SHALL display an action bar at the top of the file listing area
2. WHEN no files or directories are selected THEN the system SHALL show only general actions like "Upload File" and "Create Directory"
3. WHEN the action bar is displayed THEN the system SHALL position it prominently above the file listing

### Requirement 2

**User Story:** As a user, I want the action bar to show different actions based on my file selection, so that I only see relevant operations for the selected item.

#### Acceptance Criteria

1. WHEN a single file is selected THEN the system SHALL display actions: Download, Rename, Move, Delete
2. WHEN a single directory is selected THEN the system SHALL display actions: Rename, Move, Delete, Upload File (to directory)
3. WHEN selection changes THEN the system SHALL update the visible actions within 100ms
4. WHEN a user attempts to select multiple items THEN the system SHALL only allow single selection

### Requirement 3

**User Story:** As a user, I want to perform file operations directly from the action bar, so that I can manage files efficiently without additional navigation.

#### Acceptance Criteria

1. WHEN I click "Upload File" THEN the system SHALL open a file picker dialog
2. WHEN I click "Download" on a selected file THEN the system SHALL initiate file download using the /files/download API
3. WHEN I click "Rename" THEN the system SHALL show an inline rename dialog with the current name pre-filled
4. WHEN I click "Move" THEN the system SHALL show a directory picker dialog for selecting the target location
5. WHEN I click "Delete" THEN the system SHALL show a confirmation dialog before proceeding
6. WHEN I click "Create Directory" THEN the system SHALL show an input dialog for the new directory name

### Requirement 4

**User Story:** As a user, I want the action bar to respect my permissions, so that I only see actions I'm authorized to perform.

#### Acceptance Criteria

1. WHEN I lack write permissions THEN the system SHALL hide Upload, Create Directory, Rename, Move, and Delete actions
2. WHEN I lack delete permissions THEN the system SHALL hide the Delete action
3. WHEN I lack read permissions THEN the system SHALL hide the Download action
4. WHEN permissions change THEN the system SHALL update visible actions immediately

### Requirement 5

**User Story:** As a user, I want visual feedback when performing actions, so that I understand the current state of operations.

#### Acceptance Criteria

1. WHEN an action is in progress THEN the system SHALL show a loading indicator on the relevant action button
2. WHEN an action completes successfully THEN the system SHALL show a success message and refresh the file listing
3. WHEN an action fails THEN the system SHALL display an error message with details from the API response
4. WHEN multiple actions are queued THEN the system SHALL disable action buttons until current operations complete

### Requirement 6

**User Story:** As a user, I want keyboard shortcuts for common actions, so that I can work more efficiently.

#### Acceptance Criteria

1. WHEN I press Ctrl+U THEN the system SHALL trigger the Upload File action
2. WHEN I press Delete key with items selected THEN the system SHALL trigger the Delete action
3. WHEN I press F2 with a single item selected THEN the system SHALL trigger the Rename action
4. WHEN I press Ctrl+X with an item selected THEN the system SHALL trigger the Move action
5. WHEN keyboard shortcuts are pressed THEN the system SHALL only execute if the corresponding action is visible and enabled