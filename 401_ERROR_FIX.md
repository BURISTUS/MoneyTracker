# 401 Unauthorized Error Fix

## Problem
- Getting 401 errors when trying to authenticate
- Registration/Login fails
- Demo mode not working

## What Was Fixed

### 1. Registration Form
**File:** `mobile/app/auth/register.tsx`

Added:
- ✅ Hourly rate input field (₽/час)
- ✅ Better error handling with alerts
- ✅ Console logging for debugging
- ✅ Form validation

### 2. Login Form
**File:** `mobile/app/auth/login.tsx`

Added:
- ✅ Better error handling
- ✅ Alerts for different error types
- ✅ Console logging for debugging
- ✅ Link to registration page

### 3. Auth Service
**File:** `mobile/src/services/auth.ts`

Added:
- ✅ Console logging for all auth operations
- ✅ Token save verification
- ✅ Debug logs for token retrieval

### 4. API Service (Already Had)
**File:** `mobile/src/services/api.ts`

Already has:
- ✅ Request interceptor logging
- ✅ Response interceptor logging
- ✅ Error logging with details

## How to Debug 401 Errors

### Step 1: Check Backend is Running
```bash
cd backend
yarn start:dev
```

### Step 2: Test API Directly
```bash
# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@test.com","password":"123456","name":"Test"}'

# Check Swagger
open http://localhost:3001/docs
```

### Step 3: Check Mobile App Logs

Open Expo DevTools on your phone:
- Shake device or press `Ctrl+D` (Android) / `Cmd+D` (iOS)
- Go to **Console** tab
- Look for logs:

**Successful Login:**
```
📝 Logging in: {email: "test@test.com"}
🔐 API login request: {email: "test@test.com", password: "***"}
🚀 API Request: POST /auth/login baseURL: "http://192.168.0.92:3001/api" hasToken: false
✅ API Response: /auth/login 200
✅ API login response: {user: {...}, token: "..."}
💾 Saving token to SecureStore
✅ Token saved
```

**Registration:**
```
📝 Registering user: {name: "...", email: "...", hourlyRate: 50000}
🔐 API register request: {...}
🚀 API Request: POST /auth/register
✅ API Response: /auth/register 200
✅ API register response: {user: {...}, token: "..."}
💾 Saving token to SecureStore
✅ Token saved
```

**401 Unauthorized:**
```
❌ API Error: {
  url: '/auth/me',
  status: 401,
  message: 'Request failed with status code 401'
}
🔄 Token expired, redirecting to login
```

### Step 4: Check Network Tab in DevTools

In Expo DevTools → **Network** tab:
- Look for requests to your API URL
- Check status codes
- Check if token is sent in headers

### Step 5: Check API URL

For **real Android device**, `mobile/.env` should be:
```bash
EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:3001/api
```

Current IP in your setup: `192.168.0.92`

### Step 6: Common 401 Causes

**1. Token not saved**
→ Check console for "Token saved" log
→ Check SecureStore working

**2. Token not sent with requests**
→ Check API interceptor logs
→ Look for "hasToken: true" in logs

**3. Wrong API URL**
→ Check baseURL in logs
→ Should be `http://192.168.0.92:3001/api` for real device
→ Should be `http://10.0.2.2:3001/api` for Android emulator

**4. Backend requires restart**
→ New endpoints not loaded
→ Restart: `cd backend && yarn start:dev`

**5. CORS blocking**
→ Backend should allow all origins
→ Check: `origin: true` in main.ts

**6. Phone on different network**
→ Must be same WiFi as computer
→ Check phone WiFi settings

## Complete Registration Flow

1. User fills form (name, email, password, hourly rate)
2. Click "Зарегистрироваться"
3. App sends POST to `/api/auth/register`
4. Backend creates user + default accounts
5. Backend returns `{user, token}`
6. App saves token to SecureStore
7. App sets user in store
8. App redirects to `/main`

## Complete Login Flow

1. User fills form (email, password)
2. Click "Войти"
3. App sends POST to `/api/auth/login`
4. Backend validates credentials
5. Backend returns `{user, token}`
6. App saves token to SecureStore
7. App sets user in store
8. App redirects to `/main`

## Demo Mode Flow

1. User clicks "Начать (демо)"
2. App calls `loginMock()`
3. App sets mock user and gamification data
4. App redirects to `/main`
5. No API calls needed

## Testing Checklist

- [ ] Backend running on port 3001
- [ ] Phone and computer on same WiFi
- [ ] `mobile/.env` has correct IP
- [ ] Registration form accepts hourly rate
- [ ] Login form shows registration link
- [ ] Console logs show API requests
- [ ] Token saved successfully
- [ ] Redirect to `/main` after auth
- [ ] Categories load on main screen
- [ ] Can create transaction

## Quick Test

```bash
# 1. Test backend is working
curl http://192.168.0.92:3001/api/categories/system

# 2. Test registration
curl -X POST http://192.168.0.92:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test","hourlyRate":50000}'

# 3. Test login
curl -X POST http://192.168.0.92:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# 4. Check token (will be in response)
# Copy token and test:
curl http://192.168.0.92:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Still Having Issues?

### If registration works but app doesn't:
1. Check if backend is running
2. Check IP address (should be same)
3. Check WiFi connection
4. Clear Expo cache: `cd mobile && yarn start -c`
5. Restart Expo Go app

### If 401 on all requests:
1. Token not saving (check console logs)
2. Token not sending (check Network tab)
3. Wrong API URL (check console baseURL)
4. Backend not accepting token (check backend logs)

### If network error:
1. IP wrong (use `./setup-real-device.sh`)
2. Firewall blocking
3. Different networks
4. VPN on phone
