# Quick Start Guide

## 🚀 Start Everything

### 1. Start Database
```bash
# Docker (recommended)
docker run -d \
  --name money-tracker-db \
  -e POSTGRES_DB=money_tracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14-alpine
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies (first time only)
yarn install

# Run migrations
npx prisma migrate dev --name init

# Start server
yarn start:dev
```
✅ Backend will run on `http://localhost:3001`
📚 API Docs: `http://localhost:3001/docs`

### 3. Setup Mobile
```bash
cd mobile

# Install dependencies (first time only)
yarn install

# Start Expo
yarn start
```

### 4. Run App
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app on mobile

## 📱 First Run

1. **Registration**
   - Enter email, name, password
   - Or click "Start (demo)" for quick test
   - Default account will be created automatically

2. **Main Screen**
   - View total balance
   - See monthly income/expenses
   - Recent transactions (max 4)

3. **Add Transaction**
   - Click FAB (+) button
   - Choose type (Expense/Income)
   - Enter amount or use presets (100, 500, 1000, 5000, 10000)
   - Select category
   - Click "Save"

4. **View Transactions**
   - Navigate to "Transactions" tab
   - Filter by All/Expense/Income
   - See grouped by date

5. **Manage Categories**
   - Categories loaded from backend
   - System categories (read-only)
   - Create personal categories via API

## 🔧 Common Issues

### "Can't reach database"
```bash
# Check if Docker container is running
docker ps | grep money-tracker-db

# Restart container
docker restart money-tracker-db
```

### "Network request failed"
- Ensure backend is running on port 3001
- Check `EXPO_PUBLIC_API_URL` in `mobile/.env`
- Try `http://10.0.2.2:3001/api` if on Android emulator

### "Authentication failed"
- Check if user exists in database
- Verify JWT_SECRET in `backend/.env`
- Try registering again

### Migration errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name init
```

## 🧪 Testing API

### Using Swagger (Recommended)
Open `http://localhost:3001/docs` in browser

### Using curl
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'

# Get transactions (requires JWT token)
curl http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📊 Database Access

```bash
cd backend
npx prisma studio
```
Opens at `http://localhost:5555`

## 🎯 Development Workflow

1. Make changes to backend → Auto-reloads
2. Make changes to mobile → Press `r` in Expo to reload
3. Check API docs for endpoint changes
4. Test with Swagger or mobile app
5. Update types if schema changes

## 📝 Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/money_tracker
JWT_SECRET=your-secret-key-here
PORT=3001
CORS_ORIGIN=http://localhost:8081
```

### Mobile (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

## 🔐 Security Notes

- Change default passwords in production
- Use strong JWT_SECRET
- Enable HTTPS in production
- Implement rate limiting
- Add input validation on all endpoints
