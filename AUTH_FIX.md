# Authorization Issues Fix

## Problem
- Demo mode doesn't work (401 error)
- Registration removed
- App tries to load data before auth

## Solution
Made the following changes:

### 1. Backend - Public Endpoints
Added public endpoints that don't require authentication:

**Categories:**
- `GET /api/categories/system` - Get system categories only (public)
- `GET /api/categories` - Get all categories (requires auth)

**Accounts:**
- `GET /api/accounts/public` - Get account types (public)
- `GET /api/accounts` - Get user accounts (requires auth)

### 2. Mobile App - Use Public Endpoints
Updated data store to use public endpoints before authentication:
- `fetchCategories()` now uses `/api/categories/system`
- Can load categories without login
- Demo mode works without backend auth

### 3. Auth Flow
- Demo mode uses mock data (no API calls)
- Registration works when backend is running
- Login works when user exists

## Required Actions

### 1. Restart Backend
```bash
# Stop current backend (Ctrl+C)
cd backend
yarn start:dev
```

### 2. Test Public Endpoints
```bash
# Test system categories (should work without auth)
curl http://localhost:3001/api/categories/system

# Test accounts public info
curl http://localhost:3001/api/accounts/public
```

### 3. Test Demo Mode
1. Open mobile app
2. Click "Начать (демо)"
3. Should work without backend connection

### 4. Test Registration
1. Click "Войти"
2. Fill email, password, name
3. Click "Войти" (will register since account doesn't exist)
4. Should work if backend is running

### 5. Test Real Device
1. Make sure phone and computer on same WiFi
2. Backend running: `cd backend && yarn start:dev`
3. Mobile app: `cd mobile && yarn start`
4. Scan QR code
5. Should connect to `http://192.168.0.92:3001/api`

## What Was Changed

### Backend Files
- `src/categories/categories.controller.ts`
  - Added `@Get('system')` endpoint (public)
  
- `src/categories/categories.service.ts`
  - Added `findSystemCategories()` method

- `src/accounts/accounts.controller.ts`
  - Removed `@UseGuards` from controller
  - Added `@Get('public')` endpoint (public)
  - Added guard back to non-public methods

### Mobile Files
- `src/services/categories.ts`
  - Added `getSystemCategories()` method
  - Uses `/categories/system` endpoint

- `src/services/accounts.ts`
  - Added `getPublicInfo()` method
  - Uses `/accounts/public` endpoint

- `src/stores/dataStore.ts`
  - Updated `fetchCategories()` to use `getSystemCategories()`
  - Now loads categories without authentication

## Demo Mode Flow

1. User clicks "Начать (демо)" button
2. `loginMock()` is called
3. Mock user and gamification data set in store
4. App redirects to `/main`
5. Categories loaded from public endpoint
6. App works with mock accounts and transactions

## Real Auth Flow

1. User fills login form
2. `login()` called with email/password
3. If user exists → Login success
4. If user doesn't exist → Register automatically
5. Token stored in SecureStore
6. User data fetched from `/api/auth/me`
7. Redirected to `/main`
8. All data loaded from authenticated endpoints

## Troubleshooting

### "401 Unauthorized" on categories
→ Backend needs restart
```bash
cd backend
yarn start:dev
```

### "Network request failed"
→ Check API URL in `mobile/.env`
→ For real device: Should be `http://192.168.0.92:3001/api`
→ For Android emulator: Should be `http://10.0.2.2:3001/api`

### "Demo mode doesn't work"
→ Check browser console for errors
→ Mock data should load without API calls
→ Categories should load from public endpoint

### Registration not working
→ Backend must be running
→ Password must be 6+ characters
→ Check `/api/auth/register` in Swagger

## Test Commands

```bash
# Test public endpoints (no auth needed)
curl http://localhost:3001/api/categories/system
curl http://localhost:3001/api/categories/icons
curl http://localhost:3001/api/accounts/public

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test"}'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Check Swagger
open http://localhost:3001/docs
```

## Status

✅ Backend built successfully
✅ Mobile TypeScript compiles
✅ Public endpoints added
✅ Demo mode uses public endpoints
⚠️ Backend needs restart to apply changes
