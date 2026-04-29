# accounts Specification

## Purpose
Manage user financial accounts with multi-currency support, multiple account types, and balance tracking.

## Requirements

### Requirement: Account types
The system SHALL support multiple account types.

#### Scenario: Create account
- GIVEN an authenticated user
- WHEN they create an account with type CASH, BANK, CREDIT, INVESTMENT, or DEBT
- THEN persist the account with the selected type

### Requirement: Multi-currency support
The system SHALL allow accounts in different currencies.

#### Scenario: Create multi-currency account
- GIVEN an authenticated user
- WHEN they create an account with a specific currency code
- THEN persist the account with that currency
- AND track balances independently per currency

### Requirement: Default account
The system SHALL support a default account per user.

#### Scenario: Set default account
- GIVEN an authenticated user with multiple accounts
- WHEN they mark one account as default
- THEN update the default flag on the selected account
- AND clear the default flag from other accounts

### Requirement: Include/exclude from total
The system SHALL allow accounts to be excluded from total balance calculations.

#### Scenario: Toggle inclusion
- GIVEN an authenticated user with an existing account
- WHEN they toggle the includeInTotal flag
- THEN the account balance is included or excluded from total balance accordingly

### Requirement: Account CRUD
The system SHALL support full CRUD operations for accounts.

#### Scenario: Read accounts
- GIVEN an authenticated user
- WHEN they request their accounts
- THEN return all accounts belonging to the user

#### Scenario: Update account
- GIVEN an authenticated user
- WHEN they update account name, type, currency, or flags
- THEN persist the changes

#### Scenario: Delete account
- GIVEN an authenticated user
- WHEN they delete an account with no transactions
- THEN remove the account

#### Scenario: Prevent delete with transactions
- GIVEN an authenticated user
- WHEN they attempt to delete an account that has transactions
- THEN return a 409 Conflict error
