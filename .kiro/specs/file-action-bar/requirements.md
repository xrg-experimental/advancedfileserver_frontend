# Requirements Document

## Introduction

This feature adds a dynamic action bar to the Files page that displays contextual actions based on the currently selected file or directory within the current directory view. The Files page uses a page-by-page directory navigation where users can navigate up and down the directory hierarchy. The action bar will provide quick access to file operations such as upload, download, rename, move, delete, and create directory, with actions enabled or disabled based on the selection context and user permissions.

## Requirements

### Requirement 1

**User Story:** As a user, I want to see an action bar at the top of the Files page, so that I can quickly access file operations without navigating through menus.

#### Acceptance Criteria

1. WHEN the Files page loads THEN the system SHALL display an action bar at the top of the current directory listing area
2. WHEN no files or directories are selected THEN the system SHALL enable "Upload File" and "Create Directory" actions and disable Download, Rename, Move, and Delete actions
3. WHEN the action bar is displayed THEN the system SHALL position it prominently above the current directory listing
4. WHEN navigating between directories THEN the system SHALL maintain the action bar position and reset selection state

### Requirement 2

**User Story:** As a user, I want the action bar to show different actions based on my file selection, so that I only see relevant operations for the selected item.

#### Acceptance Criteria

1. WHEN a single file is selected THEN the system SHALL enable actions: Download, Rename, Move, Delete and disable Upload File (to directory)
2. WHEN a single directory is selected THEN the system SHALL enable actions: Rename, Move, Delete, Upload File (to directory) and disable Download
3. WHEN selection changes THEN the system SHALL update the enabled/disabled state of actions within 100ms
4. WHEN a user attempts to select multiple items THEN the system SHALL only allow single selection

### Requirement 3

**User Story:** As a user, I want to perform file operations directly from the action bar, so that I can manage files efficiently without additional navigation.

#### Acceptance Criteria

1. WHEN I click "Upload File" THEN the system SHALL open a file picker dialog to upload to the current directory
2. WHEN I click "Download" on a selected file THEN the system SHALL initiate file download using the /files/download API
3. WHEN I click "Rename" THEN the system SHALL show an inline rename dialog with the current name pre-filled
4. WHEN I click "Move" THEN the system SHALL show a directory picker dialog for selecting the target location within the accessible directory hierarchy
5. WHEN I click "Delete" THEN the system SHALL show a confirmation dialog before proceeding
6. WHEN I click "Create Directory" THEN the system SHALL show an input dialog for the new directory name in the current directory

### Requirement 4

**User Story:** As a user, I want the action bar to respect my permissions, so that I only see actions I'm authorized to perform.

#### Acceptance Criteria

1. WHEN I lack write permissions THEN the system SHALL disable Upload, Create Directory, Rename, Move, and Delete actions
2. WHEN I lack delete permissions THEN the system SHALL disable the Delete action
3. WHEN I lack read permissions THEN the system SHALL disable the Download action
4. WHEN permissions change THEN the system SHALL update action states immediately

### Requirement 5

**User Story:** As a user, I want visual feedback when performing actions, so that I understand the current state of operations.

#### Acceptance Criteria

1. WHEN a quick action (rename, move, delete, create directory) is in progress THEN the system SHALL show a loading indicator on the relevant action button
2. WHEN an action completes successfully THEN the system SHALL show a success message and refresh the file listing
3. WHEN an action fails THEN the system SHALL display an error message with details from the API response
4. WHEN multiple quick actions are queued THEN the system SHALL disable action buttons until current operations complete

### Requirement 6

**User Story:** As a user, I want to monitor and control long-running file operations, so that I can track progress and cancel if needed.

#### Acceptance Criteria

1. WHEN I start a file upload THEN the system SHALL show a progress dialog with upload percentage, file name, and estimated time remaining
2. WHEN I start a file download THEN the system SHALL show a progress indicator with download percentage and file name
3. WHEN a long-running operation is in progress THEN the system SHALL provide a cancel button to interrupt the operation
4. WHEN I cancel an upload or download THEN the system SHALL stop the operation and show a cancellation confirmation
5. WHEN upload or download operations are running THEN the system SHALL allow other quick actions to continue normally
6. WHEN multiple files are being uploaded THEN the system SHALL show progress for each file individually
