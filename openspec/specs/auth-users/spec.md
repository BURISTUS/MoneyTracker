# auth-users Specification

## Purpose
Manage user authentication, registration, profiles, and JWT-based session lifecycle.

## Requirements

### Requirement: Email/password registration
The system SHALL allow users to register with a valid email and password.

#### Scenario: Successful registration
- GIVEN a new user provides a valid email and strong password
- WHEN the registration request is submitted
- THEN create a new user account
- AND return a JWT access token
- AND seed system categories for the user

#### Scenario: Duplicate email
- GIVEN a user already exists with the provided email
- WHEN the registration request is submitted
- THEN return a 409 Conflict error with code EMAIL_EXISTS

### Requirement: User login
The system SHALL authenticate users with email and password.

#### Scenario: Successful login
- GIVEN a registered user provides correct credentials
- WHEN the login request is submitted
- THEN return a JWT access token

#### Scenario: Invalid credentials
- GIVEN a user provides incorrect password
- WHEN the login request is submitted
- THEN return a 401 Unauthorized error with code INVALID_CREDENTIALS

### Requirement: User profile
The system SHALL support user profile management with hourly rate configuration and gamification display.

#### Scenario: Update profile
- GIVEN an authenticated user
- WHEN they update their profile or hourly rate
- THEN persist the changes
- AND update the user's gamification profile if needed

#### Scenario: Profile includes gamification data
- GIVEN an authenticated user requests their profile
- WHEN the profile is returned
- THEN include gamification fields: xp, level, status, achievements count
- AND make gamification section interactive (tappable for details)

### Requirement: JWT authentication
The system SHALL protect API endpoints using JWT tokens.

#### Scenario: Access protected resource
- GIVEN a user with a valid JWT token
- WHEN they access a protected endpoint
- THEN allow the request and identify the user from the token

#### Scenario: Expired or invalid token
- GIVEN a user provides an expired or invalid token
- WHEN they access a protected endpoint
- THEN return a 401 Unauthorized error
