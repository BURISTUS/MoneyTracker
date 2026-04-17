# Money Tracker - Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Yarn or npm

## Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/money_tracker
JWT_SECRET=your-secret-key-change-this
PORT=3001
CORS_ORIGIN=http://localhost:8081
```

4. Run Prisma migrations (ensure PostgreSQL is running):
```bash
npx prisma migrate dev
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Start backend server:
```bash
yarn start:dev
```

Backend will run on `http://localhost:3001`
API Docs: `http://localhost:3001/docs`

## Mobile App Setup

1. Navigate to mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update:
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

4. Start Expo development server:
```bash
yarn start
```

5. Run on device/simulator:
- iOS: `yarn ios`
- Android: `yarn android`
- Web: `yarn web`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Accounts
- `GET /api/accounts` - Get all accounts (requires auth)
- `POST /api/accounts` - Create account (requires auth)
- `PATCH /api/accounts/:id` - Update account (requires auth)
- `DELETE /api/accounts/:id` - Delete account (requires auth)

### Transactions
- `GET /api/transactions` - Get all transactions (requires auth)
- `POST /api/transactions` - Create transaction (requires auth)
- `PATCH /api/transactions/:id` - Update transaction (requires auth)
- `DELETE /api/transactions/:id` - Delete transaction (requires auth)

### Categories
- `GET /api/categories` - Get all categories (requires auth)
- `GET /api/categories/icons` - Get available icons
- `GET /api/categories/types` - Get account types
- `POST /api/categories` - Create category (requires auth)
- `PATCH /api/categories/:id` - Update category (requires auth)
- `DELETE /api/categories/:id` - Delete category (requires auth)

### Life Cost
- `GET /api/life-cost/rate` - Get hourly rate (requires auth)
- `POST /api/life-cost/calculate` - Calculate life cost hours (requires auth)
- `POST /api/life-cost/simulate` - Simulate investment (requires auth)

## Features

### Authentication
- JWT-based authentication
- Secure token storage
- Auto-refresh on token expiration

### Accounts
- Multiple account support (Cash, Bank, Credit, Investment, Debt)
- Real-time balance tracking

### Transactions
- Income and expense tracking
- Category-based organization
- Date filtering
- Type filtering (All/Expense/Income)

### Categories
- System categories (read-only)
- Personal categories (custom)
- Icon and color customization
- Image support (1money-style)
- Base needs flag for essential expenses

### Life Cost
- Hourly rate calculation
- Hours of life display
- Motivational messages
- Investment simulation

## Database Schema

The app uses PostgreSQL with Prisma ORM. Key models:
- User
- Account
- Transaction
- Category
- Budget
- Goal
- UserGamification
- Achievement
- WishlistItem

## Troubleshooting

### Backend Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Run `npx prisma migrate dev` if schema changes

### Mobile Issues
- Ensure backend is running on port 3001
- Check EXPO_PUBLIC_API_URL in .env
- Clear Expo cache: `expo start -c`

## Development

### Backend
```bash
cd backend
yarn start:dev  # Hot reload
yarn build        # Production build
yarn start:prod  # Run production build
```

### Mobile
```bash
cd mobile
yarn start       # Expo dev server
yarn android      # Android
yarn ios         # iOS
yarn web         # Web
```
