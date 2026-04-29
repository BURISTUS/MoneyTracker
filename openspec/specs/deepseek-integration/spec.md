# deepseek-integration Specification

## Purpose
Provide AI-powered features via DeepSeek API integration: chat assistant, transaction voice parsing, receipt OCR, budget audit, and financial advice.

## Requirements

### Requirement: AI Chat interface
The system SHALL expose a chat interface where users can ask financial questions.

#### Scenario: Send a chat message
- GIVEN an authenticated user
- WHEN they send a message in the AI chat
- THEN prepare a context snapshot of their financial data (anonymized)
- AND send the message + context + system prompt to DeepSeek API
- AND return the AI response to the user

#### Scenario: Preset buttons
- GIVEN an authenticated user in the AI chat
- WHEN they tap a preset button ("Audit budget", "How to save?", "Monthly forecast")
- THEN send the corresponding pre-defined prompt to DeepSeek
- AND display the response

### Requirement: Request rate limiting
The system SHALL limit AI requests per user to control costs.

#### Scenario: Free tier limit
- GIVEN a user on the free plan
- WHEN they exceed 10 requests per day
- THEN block further requests and show an upgrade prompt

#### Scenario: Premium tier limit
- GIVEN a user on the premium plan
- WHEN they exceed 100 requests per day
- THEN block further requests until the next day

### Requirement: System prompt compliance
The system SHALL enforce structured output from DeepSeek via system prompts.

#### Scenario: Transaction parsing
- GIVEN a voice or text description of a transaction
- WHEN DeepSeek processes it
- THEN return strict JSON with fields: amount (number), type (INCOME|EXPENSE), categoryId (string|null), accountId (string|null), description (string)
- AND never return markdown or explanatory text outside JSON

#### Scenario: Receipt OCR
- GIVEN a receipt image
- WHEN DeepSeek Vision processes it
- THEN return strict JSON with array of items: [{ name, amount, category? }]
- AND total amount, merchant name, and date if detectable

### Requirement: Context injection
The system SHALL provide relevant financial context to DeepSeek for personalized answers.

#### Scenario: Budget audit context
- GIVEN a user requests a budget audit
- WHEN the context is prepared
- THEN include: last 90 days of transactions, active budgets with progress, goals, hourly rate
- AND anonymize sensitive fields

### Requirement: Safety and privacy
The system SHALL ensure user data privacy when using third-party AI.

#### Scenario: No PII in prompts
- GIVEN any AI request
- WHEN data is sent to DeepSeek
- THEN exclude: full names, emails, exact addresses, account numbers
- AND use category aggregates instead of individual transactions where possible

#### Scenario: No write access
- GIVEN the AI chat interface
- WHEN the AI generates a response
- THEN the response cannot trigger any database writes
- AND all actions require explicit user confirmation
