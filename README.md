# Money Tracker - Full Stack Application

"Escape from Consumer Society" - Financial tracking mobile app with gamification.

## Tech Stack

- **Backend**: NestJS + PostgreSQL + Redis
- **Frontend**: React Native (Expo)
- **Database**: PostgreSQL
- **Cache**: Redis
- **Docker**: For containerized deployment

## Quick Start

### 1. Start Infrastructure (Docker)

```bash
# Start PostgreSQL, Redis, and Backend
docker-compose up -d

# Run database migrations
cd backend
npm run prisma:migrate
```

The backend will be available at `http://localhost:3001`
API documentation: `http://localhost:3001/docs`

### 2. Start Mobile App

```bash
cd mobile

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the app
npx expo start
```

## Environment Variables

### Backend (backend/.env)
```env
DATABASE_URL=postgresql://money_tracker:secret@localhost:5432/money_tracker
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d
PORT=3001
CORS_ORIGIN=http://localhost:8081
```

### Mobile (mobile/.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires JWT)

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Accounts
- `GET /api/accounts` - Get all accounts
- `POST /api/accounts` - Create account

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

## Project Structure

```
money-tracker/
├── backend/           # NestJS backend
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # Users module
│   │   ├── transactions/ # Transactions module
│   │   ├── accounts/ # Accounts module
│   │   ├── categories/   # Categories module
│   │   └── ...
│   └── prisma/       # Database schema
├── mobile/           # React Native app
│   ├── app/         # App screens
│   ├── src/
│   │   ├── services/ # API services
│   │   ├── stores/   # State management
│   │   ├── components/ # UI components
│   │   └── types/   # TypeScript types
└── docker-compose.yml
```

## Development

### Backend
```bash
cd backend
npm run start:dev   # Start with hot reload
npm run prisma:studio  # Open Prisma Studio
```

### Mobile
```bash
cd mobile
npx expo start
# Scan QR code with Expo Go app on your phone
```

## License

MIT
