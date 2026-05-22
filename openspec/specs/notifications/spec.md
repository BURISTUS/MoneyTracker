# notifications Specification

## Purpose
Deliver in-app notifications for key user events across the platform.

## Requirements

### Requirement: Notification types
The system SHALL support multiple notification types.

#### Scenario: Supported types
- GIVEN the notification system is active
- THEN it SHALL support WISHLIST_READY, BUDGET_ALERT, CHALLENGE_INVITE, LEVEL_UP, ACHIEVEMENT_EARNED, and STREAK_WARNING

### Requirement: Notification creation
The system SHALL create notifications when relevant events occur.

#### Scenario: Wishlist ready
- GIVEN a wishlist item cooldown expires
- WHEN the item status changes to READY
- THEN create a WISHLIST_READY notification for the user

#### Scenario: Budget alert
- GIVEN a budget exceeds its alert threshold
- WHEN the threshold is crossed
- THEN create a BUDGET_ALERT notification for the user

#### Scenario: Level up
- GIVEN a user's XP crosses a level threshold
- WHEN the level increases
- THEN create a LEVEL_UP notification

#### Scenario: Achievement earned
- GIVEN a user unlocks an achievement
- WHEN the achievement is awarded
- THEN create an ACHIEVEMENT_EARNED notification

### Requirement: Notification delivery
The system SHALL deliver unread notifications to users.

#### Scenario: List notifications
- GIVEN an authenticated user
- WHEN they request their notifications
- THEN return notifications ordered by creation time descending
- AND include read/unread status

#### Scenario: Mark as read
- GIVEN an authenticated user
- WHEN they mark a notification as read
- THEN update the notification's read status

### Requirement: Notification cleanup
The system SHALL clean up old read notifications periodically.

#### Scenario: Auto-archive
- GIVEN read notifications older than a configured retention period
- WHEN the cleanup job runs
- THEN archive or delete old notifications
