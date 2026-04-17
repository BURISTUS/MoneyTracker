# API Connection Troubleshooting

## Problem: Network request failed

### Common Causes

1. **Android Emulator Issue**
   - `localhost` doesn't work on Android emulator
   - Use `10.0.2.2` instead (maps to host's localhost)

2. **CORS Configuration**
   - Backend not allowing requests from mobile app
   - Missing origin headers

3. **Authorization**
   - Missing or expired JWT token
   - Token not being sent with requests

## Solutions

### 1. For Android Emulator

Update `mobile/.env`:
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
```

**Why:** `10.0.2.2` is a special IP that Android emulator uses to access the host machine's `localhost`.

### 2. For iOS Simulator

Use `localhost` (this works on iOS):
```bash
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. For Physical Device

Find your computer's IP:
```bash
# Linux/Mac
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

Use your local IP in `.env`:
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api
```

### 4. Backend CORS

The backend is already configured for multiple origins. To check current config:

```bash
cd backend
grep -A 10 "enableCors" src/main.ts
```

Origins included:
- `http://localhost:8081` (Expo web)
- `http://10.0.2.2:8081` (Android emulator)
- `exp://10.0.2.2:19000` (Expo Go app)

### 5. Testing Connection

**Test with curl:**
```bash
# Should return: {"message":"Unauthorized","statusCode":401}
curl http://localhost:3001/api/categories

# Test login:
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
```

**Test in browser:**
Open `http://localhost:3001/docs` and try API endpoints

## Debug Mode

### Enable Logging

Logs are already enabled in `mobile/src/services/api.ts`. You'll see:

```
🚀 API Request: GET /transactions
✅ API Response: /transactions 200
```

or

```
❌ API Error: {
  url: '/transactions',
  status: 401,
  message: 'Request failed with status code 401'
}
```

### Check Logs

**Mobile logs:**
```bash
cd mobile
yarn start
# Press 'l' in Expo DevTools
```

**Backend logs:**
```bash
cd backend
yarn start:dev
# Check console for incoming requests
```

## Quick Fix Checklist

- [ ] Backend is running on port 3001
- [ ] PostgreSQL is running and connected
- [ ] CORS allows your mobile app's origin
- [ ] Correct API URL in `mobile/.env`
- [ ] Using `10.0.2.2` for Android emulator
- [ ] Using `localhost` for iOS simulator
- [ ] Using local IP for physical device
- [ ] JWT token is being sent (check logs)
- [ ] Token is valid and not expired

## Platform-Specific URLs

### Android Emulator
```
http://10.0.2.2:3001/api
```

### iOS Simulator
```
http://localhost:3001/api
```

### Physical Device
```
http://YOUR_LOCAL_IP:3001/api
```

### Web
```
http://localhost:3001/api
```

## Example Setup for Each Platform

### Android Development
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
```

### iOS Development
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
```

### Production/Physical Device
```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://your-backend.com/api

# Backend .env
CORS_ORIGIN=https://your-frontend.com
```

## Still Not Working?

1. **Restart services:**
```bash
# Terminal 1
cd backend && yarn start:dev

# Terminal 2
cd mobile && yarn start -c  # Clear cache
```

2. **Check firewall:**
```bash
# Linux
sudo ufw allow 3001

# macOS (Application Firewall)
# Allow Node.js in System Preferences
```

3. **Verify network connectivity:**
```bash
# From mobile directory
curl http://10.0.2.2:3001/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

4. **Check Expo Go App:**
- Make sure you're on the same network
- Use LAN IP instead of localhost
