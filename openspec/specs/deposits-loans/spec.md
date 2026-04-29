# deposits-loans Specification

## Purpose
Track bank deposits with compound interest and loans with amortization schedules.

## Requirements

### Requirement: Deposit tracking
The system SHALL allow users to track deposits with interest calculation.

#### Scenario: Create deposit
- GIVEN an authenticated user
- WHEN they create a deposit with principal, annual rate, term, and compounding frequency
- THEN calculate and store the maturity amount

#### Scenario: Deposit forecast
- GIVEN an existing deposit
- WHEN the user requests a forecast
- THEN return projected growth over time with compound interest

#### Scenario: Update deposit
- GIVEN an authenticated user
- WHEN they update deposit details
- THEN recalculate the maturity amount

### Requirement: Loan tracking
The system SHALL allow users to track loans and repayment schedules.

#### Scenario: Create loan
- GIVEN an authenticated user
- WHEN they create a loan with principal, interest rate, term, and type
- THEN generate an amortization schedule

#### Scenario: View amortization schedule
- GIVEN an existing loan
- WHEN the user views the loan details
- THEN display a schedule of payments: date, principal, interest, remaining balance

#### Scenario: Record loan payment
- GIVEN an authenticated user
- WHEN they record a payment toward a loan
- THEN update the current balance
- AND update the amortization schedule

### Requirement: Net worth impact
The system SHALL include deposits and loans in net worth calculations.

#### Scenario: Calculate net worth
- GIVEN a user with accounts, deposits, and loans
- WHEN net worth is calculated
- THEN sum all account balances and deposit principals
- AND subtract all loan balances

### Requirement: Gamification integration
The system SHALL link deposits and loans to RPG status progression.

#### Scenario: Deposit counts toward status
- GIVEN a user has deposits totaling more than 6 months of expenses
- WHEN status is evaluated
- THEN contribute toward STRATEGIST or higher status

#### Scenario: Loan impacts status
- GIVEN a user has active loans
- WHEN status is evaluated
- THEN prevent reaching ASCETIC until loans are paid off
