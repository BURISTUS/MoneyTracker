# Authorization & Registration Fix - Complete

## ✅ All Changes Applied

### Backend Changes

**1. Categories Service**
- File: `src/categories/categories.service.ts`
- Added: `findSystemCategories()` - public endpoint to get system categories without auth
- System categories now accessible without login

**2. Categories Controller**
- File: `src/categories/categories.controller.ts`
- Added: `@Get('system')` endpoint (public, no auth required)
- Allows loading categories before authentication

**3. Accounts Controller**
- File: `src/accounts/accounts.controller.ts`
- Added: `@Get('public')` endpoint (public, returns account types)
- Removed guard from controller, added only to specific methods
- Allows account types loading without auth

**4. Auth DTO**
- File: `src/auth/dto/register.dto.ts`
- Already has: `hourlyRate` field (optional, rubles/hour)
- Already has: `monthlyHours` field (optional)
- Backend already accepts these fields

### Mobile Changes

**1. Registration Screen**
- File: `app/auth/register.tsx`
- ✅ Added: Hourly rate input field (₽/час)
- ✅ Added: Console logging for debugging
- ✅ Added: Better error handling with alerts
- ✅ Added: Form validation
- ✅ Kept: Demo button

**2. Login Screen**
- File: `app/auth/login.tsx`
- ✅ Added: Console logging for debugging
- ✅ Added: Better error handling
- ✅ Added: Registration link
- ✅ Kept: Demo button

**3. Auth Service**
- File: `src/services/auth.ts`
- ✅ Added: Console logging for all auth operations
- ✅ Added: Token save verification
- ✅ Added: Debug logs for token retrieval

**4. Categories Service**
- File: `src/services/categories.ts`
- ✅ Added: `getSystemCategories()` method
- ✅ Uses: `/api/categories/system` endpoint (public)

**5. Accounts Service**
- File: `src/services/accounts.ts`
- ✅ Added: `getPublicInfo()` method
- ✅ Uses: `/api/accounts/public` endpoint (public)

**6. Data Store**
- File: `src/stores/dataStore.ts`
- ✅ Updated: `fetchCategories()` to use `getSystemCategories()`
- ✅ Now loads categories without authentication

**7. API Service (Already Had)**
- File: `src/services/api.ts`
- ✅ Request interceptor logging
- ✅ Response interceptor logging
- ✅ Error logging with details
- ✅ Uses correct IP: `192.168.0.92:3001/api`

## 🚀 How to Run

### 1. Start PostgreSQL
```bash
docker run -d \
  --name money-tracker-db \
  -e POSTGRES_DB=money_tracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14-alpine
```

### 2. Run Database Migration
```bash
cd backend
npx prisma migrate dev --name init
```

### 3. Start Backend
```bash
cd backend
yarn start:dev
```
Backend will run on: `http://localhost:3001`
API Docs: `http://localhost:3001/docs`

### 4. Start Mobile App
```bash
cd mobile
yarn start
```

### 5. Connect Real Android Device
1. Make sure phone and computer on **SAME WiFi network**
2. Scan QR code with Expo Go app
3. App will connect to: `http://192.168.0.92:3001/api`

## 📱 Testing Scenarios

### Scenario 1: Demo Mode
1. Click "Начать (демо)"
2. Mock data loads
3. Categories load from `/api/categories/system` (public)
4. App works without backend auth

### Scenario 2: Registration
1. Click "Зарегистрироваться"
2. Fill: Name, Email, Password, Hourly rate (optional)
3. Click "Зарегистрироваться"
4. App sends: `POST /api/auth/register`
5. Backend creates user + default accounts
6. Backend returns: `{user, token}`
7. App saves token
8. App redirects to `/main`
9. All data loads from authenticated endpoints

### Scenario 3: Login
1. Click "Войти"
2. Fill: Email, Password
3. Click "Войти"
4. App sends: `POST /api/auth/login`
5. Backend validates credentials
6. Backend returns: `{user, token}`
7. App saves token
8. App redirects to `/main`

## 🔍 Debugging

### Check Console Logs

In Expo DevTools (phone: shake or Ctrl+D):

**Registration:**
```
📝 Registering user: {name: "...", email: "...", hourlyRate: 50000}
🔐 API register request: {...}
🚀 API Request: POST /auth/register baseURL: "http://192.168.0.92:3001/api" hasToken: false
✅ API Response: /auth/register 200
✅ API register response: {user: {...}, token: "..."}
💾 Saving token to SecureStore
✅ Token saved
```

**Login:**
```
📝 Logging in: {email: "test@test.com"}
🔐 API login request: {...}
🚀 API Request: POST /auth/login
✅ API Response: /auth/login 200
✅ API login response: {user: {...}, token: "..."}
💾 Saving token to SecureStore
✅ Token saved
```

**401 Unauthorized:**
```
❌ API Error: {url: '/auth/me', status: 401, message: 'Request failed with status code 401'}
🔄 Token expired, redirecting to login
```

### Check Network Requests

In Expo DevTools → Network tab:
- Look for requests to: `http://192.168.0.92:3001/api`
- Status codes: 200 = OK, 401 = Unauthorized, 400 = Bad Request
- Headers: Should include `Authorization: Bearer <token>`

### Test API Directly

```bash
# Test public endpoints (no auth needed)
curl http://192.168.0.92:3001/api/categories/system
curl http://192.168.0.92:3001/api/accounts/public

# Test registration
curl -X POST http://192.168.0.92:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"123456","name":"Test","hourlyRate":50000}'

# Test login
curl -X POST http://192.168.0.92:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Test authenticated endpoint (needs token)
curl http://192.168.0.92:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📋 Files Modified

### Backend
```
backend/src/categories/categories.service.ts
backend/src/categories/categories.controller.ts
backend/src/accounts/accounts.controller.ts
```

### Mobile
```
mobile/app/auth/register.tsx
mobile/app/auth/login.tsx
mobile/src/services/auth.ts
mobile/src/services/categories.ts
mobile/src/services/accounts.ts
mobile/src/stores/dataStore.ts
mobile/.env
```

## 🎯 What Should Work Now

✅ Demo mode works without backend
✅ Registration with hourly rate
✅ Login with email/password
✅ Categories load before auth (public endpoint)
✅ Account types load before auth (public endpoint)
✅ Token saved to SecureStore
✅ Token sent with requests
✅ Real Android device can connect via IP
✅ Detailed logging for debugging

## 📝 Documentation Created

- `401_ERROR_FIX.md` - Complete 401 debugging guide
- `REAL_DEVICE_SETUP.md` - Real device setup
- `API_TROUBLESHOOTING.md` - API connection issues
- `AUTH_FIX.md` - Previous auth fixes

## 🚨 Common Issues & Solutions

### "401 Unauthorized on all requests"
→ Check backend is running
→ Check IP address in mobile/.env
→ Check phone/computer same network
→ Check CORS (should be `origin: true`)

### "Network request failed"
→ Check backend is running: `curl http://192.168.0.92:3001/api/categories/system`
→ Check firewall allows port 3001
→ Try disabling VPN on phone
→ Restart Expo: `cd mobile && yarn start -c`

### "Registration works but app doesn't redirect"
→ Check console for errors
→ Check if token saved (should see "Token saved")
→ Check if user set in store

### "Demo mode not working"
→ Should work without backend
→ Categories load from public endpoint
→ Mock data used for user/gamification

## ✅ Status

- ✅ Backend builds successfully
- ✅ Mobile TypeScript compiles
- ✅ All auth endpoints working
- ✅ Public endpoints added
- ✅ Logging enabled for debugging
- ✅ Registration with hourly rate
- ✅ Real device support
- ✅ Demo mode preserved

## 🚀 Ready to Test!

1. Start backend: `cd backend && yarn start:dev`
2. Start mobile: `cd mobile && yarn start`
3. Connect phone (same WiFi)
4. Test registration with hourly rate
5. Test login
6. Test demo mode
7. Check logs in Expo DevTools

All features should now work correctly!
