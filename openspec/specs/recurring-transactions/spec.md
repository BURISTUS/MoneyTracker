# recurring-transactions Specification

## Purpose
Manage recurring transaction rules that automatically generate transactions on a schedule.

## Requirements

### Requirement: Recurring rule creation
The system SHALL allow users to create rules for automatic transaction generation.

#### Scenario: Create monthly rule
- GIVEN an authenticated user
- WHEN they create a rule with amount, category, account, type, and period=MONTHLY
- THEN persist the rule with nextRunDate calculated from startDate

#### Scenario: Create weekly rule
- GIVEN an authenticated user
- WHEN they create a rule with period=WEEKLY
- THEN persist the rule with nextRunDate on the same day of week

### Requirement: Rule management
The system SHALL support pausing, editing, and deleting recurring rules.

#### Scenario: Pause rule
- GIVEN an authenticated user with an active recurring rule
- WHEN they pause the rule
- THEN stop generating transactions for that rule
- AND preserve the rule for future reactivation

#### Scenario: Edit rule
- GIVEN an authenticated user
- WHEN they update a rule's amount, category, or period
- THEN recalculate nextRunDate if needed
- AND apply changes to future generated transactions only

#### Scenario: Delete rule
- GIVEN an authenticated user
- WHEN they delete a recurring rule
- THEN remove the rule
- AND optionally delete or keep already generated future transactions

### Requirement: Auto-generation
The system SHALL automatically create transactions based on recurring rules.

#### Scenario: Daily cron job
- GIVEN the system runs a daily cron job
- WHEN the job executes
- THEN find all active rules where nextRunDate <= today
- AND create a transaction for each
- AND update nextRunDate to the next occurrence

#### Scenario: Handle missed runs
- GIVEN a rule was missed because the system was down
- WHEN the system recovers
- THEN generate transactions for all missed occurrences
- OR generate a single catch-up transaction based on configuration

### Requirement: Rule preview
The system SHALL show upcoming occurrences of recurring rules.

#### Scenario: Preview next occurrences
- GIVEN an authenticated user views a recurring rule
- THEN display the next 3 upcoming dates and amounts
