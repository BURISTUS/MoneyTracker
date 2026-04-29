# budgets Specification

## Purpose
Manage category-based budget limits with periodic tracking and alert thresholds.

## Requirements

### Requirement: Budget creation
The system SHALL allow users to create budgets with a limit amount, category, and period.

#### Scenario: Create monthly budget
- GIVEN an authenticated user
- WHEN they create a budget for a category with limit 1000 and period MONTHLY
- THEN persist the budget
- AND start tracking spending against it

### Requirement: Budget periods
The system SHALL support WEEKLY, MONTHLY, and YEARLY budget periods.

#### Scenario: Budget period rollover
- GIVEN an existing monthly budget
- WHEN a new month begins
- THEN reset the spent amount to zero
- AND keep the same limit

### Requirement: Progress tracking
The system SHALL track spent, remaining, and percentage for each budget.

#### Scenario: Update on transaction
- GIVEN an existing expense budget
- WHEN a new expense transaction is recorded in the budget's category
- THEN increase the budget's spent amount by the transaction amount
- AND recalculate remaining and percentage

### Requirement: Alert thresholds
The system SHALL warn users when budget spending exceeds configured thresholds.

#### Scenario: Threshold alert
- GIVEN a budget with an alert threshold of 80%
- WHEN spending reaches or exceeds 80% of the limit
- THEN generate a BUDGET_ALERT notification

### Requirement: Inline budget indicators
The system SHALL display budget progress in context without requiring a separate screen.

#### Scenario: Budget indicator in transaction list
- GIVEN an authenticated user views transactions for a category with a budget
- THEN show a compact progress indicator (dot or mini-bar) next to the category name
- AND use color coding: green < 80%, yellow 80-100%, red > 100%

#### Scenario: Budget preview in add transaction
- GIVEN an authenticated user selects a category when adding a transaction
- WHEN that category has an active budget
- THEN show remaining budget amount and progress bar
- AND warn if the new transaction would exceed the limit

### Requirement: Budget CRUD
The system SHALL support updating and deleting budgets.

#### Scenario: Update budget limit
- GIVEN an authenticated user
- WHEN they update a budget's limit or alert threshold
- THEN persist the changes and recalculate progress

#### Scenario: Delete budget
- GIVEN an authenticated user
- WHEN they delete a budget
- THEN remove the budget and stop tracking
