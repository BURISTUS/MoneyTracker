# goals Specification

## Purpose
Manage financial goals with target amounts, progress tracking, deadlines, and completion status.

## Requirements

### Requirement: Goal creation
The system SHALL allow users to create financial goals with a target amount and optional deadline.

#### Scenario: Create goal
- GIVEN an authenticated user
- WHEN they create a goal with title, target amount, and optional deadline
- THEN persist the goal with progress 0 and status ACTIVE

### Requirement: Progress tracking
The system SHALL track progress toward each goal.

#### Scenario: Update progress
- GIVEN an authenticated user with an active goal
- WHEN they add funds toward the goal
- THEN increase the current amount
- AND recalculate progress percentage

### Requirement: Deadline management
The system SHALL support optional deadlines and track overdue goals.

#### Scenario: Overdue goal
- GIVEN a goal with a past deadline and currentAmount < targetAmount
- WHEN the deadline passes
- THEN mark the goal as OVERDUE
- AND optionally notify the user

### Requirement: Completion status
The system SHALL mark goals as completed when the target is reached.

#### Scenario: Goal completed
- GIVEN a goal with currentAmount >= targetAmount
- WHEN the progress reaches or exceeds the target
- THEN mark the goal as COMPLETED
- AND trigger gamification rewards if applicable

### Requirement: Visual progress and milestones
The system SHALL provide rich visual feedback for goal progress.

#### Scenario: Circular progress display
- GIVEN a goal with any progress
- WHEN the user views the goal
- THEN display a circular progress indicator with percentage
- AND show milestone markers at 25%, 50%, 75%

#### Scenario: Goal completion celebration
- GIVEN a goal reaches currentAmount >= targetAmount
- WHEN the completion is detected
- THEN display a celebration screen with confetti or similar animation
- AND show total saved and time taken
- AND award gamification XP

### Requirement: Auto-contribute
The system SHALL support automatic contributions to goals.

#### Scenario: Set up auto-contribute
- GIVEN an authenticated user with an active goal
- WHEN they configure auto-contribute (fixed amount or percentage of income)
- THEN automatically add funds to the goal when income transactions are logged

#### Scenario: Deadline-based suggestion
- GIVEN a goal with a deadline
- WHEN the user views the goal
- THEN suggest a monthly contribution amount to meet the deadline

### Requirement: Deadline notifications
The system SHALL remind users about upcoming goal deadlines.

#### Scenario: Deadline reminders
- GIVEN a goal with an approaching deadline
- WHEN 7, 3, or 1 day remains
- THEN send a notification reminding the user
- AND include current progress and suggested action

### Requirement: Goal CRUD
The system SHALL support updating and deleting goals.

#### Scenario: Update goal
- GIVEN an authenticated user
- WHEN they update a goal's title, target amount, or deadline
- THEN persist the changes

#### Scenario: Delete goal
- GIVEN an authenticated user
- WHEN they delete a goal
- THEN remove the goal and free any linked funds
