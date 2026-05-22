# categories Specification

## Purpose
Manage income and expense categories with personalization, icons, colors, and base-needs classification.

## Requirements

### Requirement: Personal categories
The system SHALL allow users to create and manage their own categories.

#### Scenario: Create category
- GIVEN an authenticated user
- WHEN they create a category with name, type (EXPENSE or INCOME), icon, and color
- THEN persist the category and associate it with the user

#### Scenario: List categories
- GIVEN an authenticated user
- WHEN they request their categories
- THEN return both personal and system categories

### Requirement: System categories
The system SHALL seed default categories on user registration.

#### Scenario: Registration seeds categories
- GIVEN a new user successfully registers
- THEN the system creates a set of predefined system categories for that user
- AND system categories are marked as isSystem = true

### Requirement: Base needs classification
The system SHALL classify categories for life cost calculations.

#### Scenario: Mark base need
- GIVEN an authenticated user with an expense category
- WHEN they mark the category as a base need
- THEN the category is included in life cost calculations

### Requirement: Category CRUD
The system SHALL support updating and deleting personal categories.

#### Scenario: Update personal category
- GIVEN an authenticated user
- WHEN they update a personal category's name, icon, color, or baseNeed flag
- THEN persist the changes

#### Scenario: Delete personal category
- GIVEN an authenticated user
- WHEN they delete a personal category that has no transactions
- THEN remove the category

#### Scenario: Prevent delete system category
- GIVEN an authenticated user
- WHEN they attempt to delete a system category
- THEN return a 403 Forbidden error

#### Scenario: Prevent delete with transactions
- GIVEN an authenticated user
- WHEN they attempt to delete a category that has transactions
- THEN return a 409 Conflict error
