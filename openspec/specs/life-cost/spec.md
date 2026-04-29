# life-cost Specification

## Purpose
Calculate the real cost of purchases in terms of hours worked, based on the user's hourly rate and salary period.

## Requirements

### Requirement: Hourly rate configuration
The system SHALL allow users to configure their hourly rate or derive it from salary.

#### Scenario: Set hourly rate
- GIVEN an authenticated user
- WHEN they set their hourly rate directly
- THEN store the rate and use it for life cost calculations

#### Scenario: Derive from salary
- GIVEN an authenticated user
- WHEN they enter a salary amount and period (hour, week, month, year)
- THEN calculate and store the equivalent hourly rate

### Requirement: Life cost calculation
The system SHALL convert any monetary amount to "hours worked".

#### Scenario: Calculate for amount
- GIVEN a user with an hourly rate of 25 USD/hour
- WHEN they view an item costing 100 USD
- THEN display the life cost as 4 hours

#### Scenario: Handle fractional hours
- GIVEN a user with an hourly rate of 30 USD/hour
- WHEN they view an item costing 45 USD
- THEN display the life cost as 1 hour 30 minutes

### Requirement: Integration with wishlist
The system SHALL automatically calculate life cost for wishlist items.

#### Scenario: Wishlist life cost
- GIVEN a user adds a wishlist item with price 200 USD
- AND their hourly rate is 50 USD/hour
- WHEN the item is saved
- THEN store and display the life cost as 4 hours

### Requirement: API endpoint
The system SHALL expose a life cost calculation endpoint.

#### Scenario: Calculate via API
- GIVEN an authenticated user
- WHEN they POST to /life-cost/calculate with an amount and optional currency
- THEN return the life cost in hours and minutes
