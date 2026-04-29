# currency Specification

## Purpose
Provide multi-currency support with exchange rate fetching, caching, and support for FIAT, CRYPTO, and METAL currencies.

## Requirements

### Requirement: Currency list
The system SHALL maintain a list of supported currencies.

#### Scenario: List currencies
- GIVEN an authenticated user
- WHEN they request the currency list
- THEN return all supported currencies with code, name, symbol, and type (FIAT, CRYPTO, METAL)

### Requirement: Exchange rate fetching
The system SHALL fetch current exchange rates from an external provider.

#### Scenario: Fetch rates
- GIVEN the system needs current rates
- WHEN the scheduled job runs or a manual refresh is triggered
- THEN fetch rates for all supported currency pairs
- AND store them in the database

### Requirement: Redis caching
The system SHALL cache exchange rates in Redis for performance.

#### Scenario: Read cached rate
- GIVEN a cached exchange rate exists and is not expired
- WHEN a conversion is requested
- THEN return the cached rate without hitting the external API

#### Scenario: Cache expiry
- GIVEN a cached exchange rate has expired
- WHEN a conversion is requested
- THEN fetch a fresh rate from the external provider
- AND update the cache

### Requirement: Currency conversion
The system SHALL convert amounts between currencies.

#### Scenario: Convert amount
- GIVEN an authenticated user
- WHEN they request conversion from one currency to another
- THEN return the converted amount using the current exchange rate

### Requirement: Popular currencies
The system SHALL prioritize popular FIAT, CRYPTO, and METAL currencies.

#### Scenario: Default popular currencies
- GIVEN a fresh system setup
- WHEN the currency list is initialized
- THEN include popular currencies like USD, EUR, GBP, BTC, ETH, XAU
