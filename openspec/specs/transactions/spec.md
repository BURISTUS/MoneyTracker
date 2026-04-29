# transactions Specification

## Purpose
Manage financial transactions including income, expenses, and transfers between accounts.

## Requirements

### Requirement: Transaction types
The system SHALL support INCOME, EXPENSE, and TRANSFER transaction types.

#### Scenario: Create income transaction
- GIVEN an authenticated user
- WHEN they create an income transaction with amount, account, and category
- THEN increase the account balance by the transaction amount

#### Scenario: Create expense transaction
- GIVEN an authenticated user
- WHEN they create an expense transaction with amount, account, and category
- THEN decrease the account balance by the transaction amount

#### Scenario: Create transfer
- GIVEN an authenticated user with at least two accounts
- WHEN they create a transfer between accounts
- THEN decrease the source account balance
- AND increase the destination account balance
- AND optionally apply an exchange rate if currencies differ

### Requirement: Transaction CRUD
The system SHALL support full CRUD operations for transactions.

#### Scenario: Read transactions
- GIVEN an authenticated user
- WHEN they request their transactions
- THEN return paginated transactions ordered by date descending

#### Scenario: Update transaction
- GIVEN an authenticated user
- WHEN they update a transaction's amount, account, category, or date
- THEN recalculate affected account balances
- AND persist the changes

#### Scenario: Delete transaction
- GIVEN an authenticated user
- WHEN they delete a transaction
- THEN revert the balance change on the affected account(s)
- AND remove the transaction

### Requirement: Transaction filtering
The system SHALL support filtering transactions.

#### Scenario: Filter by date range
- GIVEN an authenticated user
- WHEN they request transactions with a from and to date
- THEN return only transactions within that range

#### Scenario: Filter by category
- GIVEN an authenticated user
- WHEN they request transactions for a specific category
- THEN return only transactions matching that category

#### Scenario: Filter by type
- GIVEN an authenticated user
- WHEN they request transactions of a specific type
- THEN return only transactions of that type

### Requirement: Voice transaction creation
The system SHALL support creating transactions via voice input parsed by AI.

#### Scenario: Speak transaction details
- GIVEN an authenticated user on the add transaction screen
- WHEN they tap the microphone button and speak a description
- THEN capture the audio and transcribe to text

#### Scenario: AI parses voice intent
- GIVEN a transcribed voice description
- WHEN the backend sends it to the AI service
- THEN return structured data: amount, type, categoryId, accountId, description
- AND pre-fill the transaction form

#### Scenario: Fallback for unclear voice input
- GIVEN a voice description that AI cannot parse
- WHEN the parsing fails
- THEN show the transcribed text in the description field
- AND let the user fill in the remaining fields manually

### Requirement: Receipt scanning import
The system SHALL support importing transactions from photographed receipts.

#### Scenario: Photograph a receipt
- GIVEN an authenticated user on the add transaction screen
- WHEN they tap the receipt scan button and photograph a receipt
- THEN compress and send the image to the backend

#### Scenario: AI extracts receipt items
- GIVEN a receipt image
- WHEN the backend sends it to the AI vision service
- THEN return a list of items with name, amount, and suggested category
- AND display the items for user confirmation

#### Scenario: Save receipt items as transactions
- GIVEN parsed receipt items displayed for confirmation
- WHEN the user confirms
- THEN create a transaction for each item
- AND optionally create a single total transaction

### Requirement: Transaction summary
The system SHALL provide summary statistics for transactions.

#### Scenario: Get summary
- GIVEN an authenticated user
- WHEN they request a summary for a date range
- THEN return total income, total expense, and net balance
