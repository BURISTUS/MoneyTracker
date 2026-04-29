# wishlist Specification

## Purpose
Manage item wishlists with cooldown periods, life cost calculation, and gamification-integrated status workflow.

## Requirements

### Requirement: Add wishlist item
The system SHALL allow users to add items to their wishlist with price and optional cooldown.

#### Scenario: Create wishlist item
- GIVEN an authenticated user
- WHEN they add an item with name, price, and optional cooldown period
- THEN persist the item with status PENDING
- AND calculate the life cost in hours worked

### Requirement: Status workflow
The system SHALL manage wishlist item statuses: PENDING → READY → REJECTED / PURCHASED / EXPIRED.

#### Scenario: Item becomes ready
- GIVEN a wishlist item in PENDING status
- WHEN the cooldown period elapses
- THEN change the status to READY
- AND notify the user via WISHLIST_READY notification

#### Scenario: Purchase item
- GIVEN a wishlist item in READY status
- WHEN the user marks it as purchased
- THEN change the status to PURCHASED
- AND optionally deduct funds from a selected account

#### Scenario: Reject item
- GIVEN a wishlist item in READY status
- WHEN the user rejects it
- THEN change the status to REJECTED
- AND award gamification rewards for conscious spending

#### Scenario: Expire item
- GIVEN a wishlist item in PENDING or READY status
- WHEN a configured expiration period passes
- THEN change the status to EXPIRED

### Requirement: Life cost calculation
The system SHALL convert item prices to "hours worked" based on the user's hourly rate.

#### Scenario: Calculate life cost
- GIVEN a user with an hourly rate configured
- WHEN a wishlist item is created or viewed
- THEN display the price as hours and minutes worked

### Requirement: Visual cooldown and decision UX
The system SHALL provide rich visual feedback during the wishlist lifecycle.

#### Scenario: Visual cooldown timer
- GIVEN a wishlist item in PENDING status
- WHEN the user views the item
- THEN display a visual countdown timer (progress circle or bar)
- AND show days/hours remaining until READY

#### Scenario: Decision screen for READY items
- GIVEN a wishlist item in READY status
- WHEN the user taps on it
- THEN open a full-screen or bottom-sheet decision screen
- AND prominently display the life cost and original description
- AND emphasize the "Reject" action (larger, more prominent than "Purchase")

#### Scenario: Gamification reward on reject
- GIVEN a user rejects a READY wishlist item
- WHEN the rejection is confirmed
- THEN display an animated reward screen showing XP earned and money saved
- AND show an investment growth projection for the saved amount

### Requirement: Wishlist CRUD
The system SHALL support updating and deleting wishlist items.

#### Scenario: Update item
- GIVEN an authenticated user
- WHEN they update item name, price, or cooldown
- THEN recalculate life cost and reset status if needed

#### Scenario: Delete item
- GIVEN an authenticated user
- WHEN they delete a wishlist item
- THEN remove the item from the database
