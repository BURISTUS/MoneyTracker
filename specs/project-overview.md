# MoneyTracker - Project Specification

## Overview
MoneyTracker is a full-stack financial management application with gamification elements, designed for personal and family finance tracking.

## Architecture

### Backend (NestJS)
- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for caching and rate limiting
- **Authentication**: JWT with Passport
- **API Documentation**: Swagger/OpenAPI

### Mobile (React Native)
- **Framework**: React Native with Expo
- **UI Library**: Gluestack UI
- **State Management**: Zustand
- **Navigation**: React Navigation
- **i18n**: Custom internationalization system

## Core Features

### 1. Authentication & Users
- Email/password registration and login
- User profiles with hourly rate configuration
- JWT-based authentication
- Family support (invite codes, roles)

### 2. Accounts
- Multiple account types: CASH, BANK, CREDIT, INVESTMENT, DEBT
- Multi-currency support
- Default account selection
- Include/exclude from total balance

### 3. Categories
- Personal categories per user
- System categories (seeded on registration)
- Expense and Income types
- Icons and colors
- Base needs classification for life cost calculation

### 4. Transactions
- Create, read, update, delete transactions
- Transaction types: INCOME, EXPENSE, TRANSFER
- Filtering by date range, category, type
- Transaction summary statistics

### 5. Budgets
- Budget limits per category
- Periods: WEEKLY, MONTHLY, YEARLY
- Progress tracking (spent, remaining, percentage)
- Alert thresholds for budget warnings

### 6. Goals
- Financial goals with target amounts
- Progress tracking
- Deadline management
- Completion status

### 7. Gamification
- XP and leveling system
- Achievement system (Bronze, Silver, Gold, Platinum)
- Challenges (Personal, Family, Social)
- Status progression: CONSUMER_DRONE → AWAKENED → ASCETIC → STRATEGIST → CAPITALIST → FINANCIAL_ARCHITECT

### 8. Wishlist
- Item wish management with cooldown periods
- Status workflow: PENDING → READY → REJECTED/PURCHASED/EXPIRED
- Life cost calculation (hours worked to afford item)
- Integration with gamification (rejection rewards)

### 9. Life Cost Calculator
- Hourly rate based cost calculation
- Convert prices to "hours worked"
- Support for salary periods: hour, week, month, year

### 10. Currency
- Multi-currency support
- Exchange rate fetching and caching
- Popular currencies: FIAT, CRYPTO, METAL
- Redis caching for rates

### 11. Notifications
- In-app notifications
- Types: WISHLIST_READY, BUDGET_ALERT, CHALLENGE_INVITE, LEVEL_UP, ACHIEVEMENT_EARNED, STREAK_WARNING

### 12. Family
- Family creation with invite codes
- Member roles: OWNER, ADMIN, MEMBER
- Shared financial tracking

## Technology Stack

### Backend Dependencies
- `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
- `@nestjs/passport`, `@nestjs/jwt`
- `@nestjs/config`, `@nestjs/schedule`
- `@prisma/client`
- `passport-jwt`
- `class-validator`, `class-transformer`
- `redis`
- `i18n`

### Mobile Dependencies
- `react`, `react-native`
- `expo-router`
- `@gluestack-ui/themed`
- `zustand`
- `@react-navigation/native`
- `recharts` (for charts)
- `date-fns`

## Database Schema Highlights
- Users with gamification profiles
- Accounts with balances and currency
- Categories (personal and system)
- Transactions with accounts and categories
- Budgets with periods and alerts
- Goals with progress tracking
- Wishlist items with cooldowns
- Families with members and roles
- Achievements and challenges
- Notifications
- Exchange rates

## API Structure
- `/auth` - Authentication endpoints
- `/users` - User management
- `/accounts` - Account CRUD
- `/categories` - Category management
- `/transactions` - Transaction CRUD and filtering
- `/budgets` - Budget management
- `/goals` - Financial goals
- `/wishlist` - Wishlist management
- `/life-cost` - Life cost calculations
- `/currency` - Currency rates
- `/family` - Family management
- `/gamification` - Gamification features
- `/notifications` - Notification management
- `/i18n` - Translations

## Internationalization
Supported languages:
- English (en)
- Russian (ru)
- Spanish (es)
- Portuguese (pt)
- French (fr)
- German (de)
- Japanese (ja)
- Chinese (zh)

## Development Workflow (Spec-Driven)
1. Create spec in `specs/` directory
2. Define requirements for Backend (NestJS) and Mobile (React Native)
3. AI generates implementation based on spec
4. Review and test
5. Update spec if needed

## Current State
- Backend: Fully functional with all core features
- Mobile: UI components and screens implemented, state management with Zustand
- Integration: API calls implemented in services layer
- Testing: Manual testing required

## Future Enhancements (Potential Specs)
- Recurring transactions
- Advanced analytics and reports
- Investment portfolio tracking
- Bill splitting
- Receipt scanning (OCR)
- Widget support
- Apple Watch / Wear OS companion
- Offline mode support
