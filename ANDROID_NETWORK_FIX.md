# Android Emulator Network Fix

## Problem
Android emulator can't connect to `localhost` on host machine.

## Solution 1: Use 10.0.2.2 (Already Applied)
✅ This is already set in `mobile/.env`
```
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
```

## Solution 2: ADB Port Forwarding

If 10.0.2.2 doesn't work, use ADB to forward ports:

### Install ADB (if not installed)
```bash
# Ubuntu/Debian
sudo apt install android-tools-adb

# macOS with Homebrew
brew install android-platform-tools

# Windows
# Download from Android Studio SDK
```

### Start Emulator and Forward Port
```bash
# Check if emulator is running
adb devices

# Forward port 3001 from host to emulator
adb reverse tcp:3001 tcp:3001

# Now use localhost in mobile/.env
echo "EXPO_PUBLIC_API_URL=http://localhost:3001/api" > mobile/.env
```

### Verify Port Forwarding
```bash
adb reverse --list
# Should show: tcp:3001 tcp:3001
```

### Remove Port Forwarding (when done)
```bash
adb reverse --remove tcp:3001
```

## Solution 3: Use Host Machine IP

If both above fail, use your computer's actual IP:

### Find Your IP
```bash
# Linux/Mac
hostname -I | awk '{print $1}'

# Or
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1

# Windows
ipconfig | findstr "IPv4"
```

### Update mobile/.env
```bash
# Replace YOUR_IP with your actual IP, e.g., 192.168.1.100
echo "EXPO_PUBLIC_API_URL=http://YOUR_IP:3001/api" > mobile/.env
```

### Test Connection
```bash
curl http://YOUR_IP:3001/api/categories
```

## Solution 4: Allow Through Firewall

### Linux (UFW)
```bash
sudo ufw allow 3001
sudo ufw reload
```

### macOS (Application Firewall)
1. System Preferences → Security & Privacy → Firewall
2. Allow Node.js or add exception for port 3001

### Windows Firewall
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → 3001 → Allow
4. Apply to all networks

## Solution 5: Use Expose (Expo)

If nothing works, expose the backend publicly:

```bash
# In backend directory
npx ngrok http 3001
```

Then update `mobile/.env`:
```
EXPO_PUBLIC_API_URL=https://xxxx-xx-xx-xx.ngrok-free.app/api
```

## Quick Fix Script

```bash
#!/bin/bash

echo "🔧 Android Emulator Network Fix"
echo "================================="
echo ""

# Try solution 1: Check if .env uses 10.0.2.2
if grep -q "10.0.2.2" mobile/.env; then
  echo "✅ Already using 10.0.2.2"
else
  echo "📝 Updating mobile/.env to use 10.0.2.2..."
  echo "EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api" > mobile/.env
  echo "✅ Updated!"
fi

echo ""

# Try solution 2: ADB port forwarding
echo "📡 Checking ADB..."
if command -v adb &> /dev/null; then
  if adb devices | grep -q "device$"; then
    echo "📱 Device found, setting up port forwarding..."
    adb reverse tcp:3001 tcp:3001
    echo "✅ Port forwarded: localhost:3001 → emulator:3001"
    echo ""
    echo "🔄 Now you can use localhost in mobile/.env:"
    echo 'EXPO_PUBLIC_API_URL=http://localhost:3001/api'
  else
    echo "❌ ADB found but no device connected"
    echo "   Make sure emulator is running"
  fi
else
  echo "❌ ADB not installed"
  echo "   Install with: sudo apt install android-tools-adb"
fi

echo ""
echo "================================="
echo "📱 Next steps:"
echo "================================="
echo ""
echo "1. Make sure backend is running: cd backend && yarn start:dev"
echo "2. Start mobile app: cd mobile && yarn start"
echo "3. Check Expo logs for API requests"
echo "4. If still not working, try using your host IP"
echo ""
```

Save as `fix-android-network.sh` and run: `chmod +x fix-android-network.sh && ./fix-android-network.sh`

## Verify Connection from Emulator

In Expo app on emulator:
1. Open DevTools (shake device or press Cmd+D)
2. Check "Network" tab
3. You should see:
   - API requests to `http://10.0.2.2:3001/api`
   - Response status codes (200, 401, etc.)

## Still Not Working?

### Check Network Mode
1. Stop emulator
2. Open AVD Manager
3. Edit your AVD
4. Advanced Settings → Network
5. Try "Bridged Adapter" or "Host-only Adapter"

### Try Different Emulator
- Create new AVD with different system image
- Try Google APIs instead of Google Play

### Check Proxy Settings
1. Emulator Settings → Proxy
2. Make sure it's not blocking localhost
3. Try "No proxy"

## Complete Debugging

```bash
# Terminal 1: Backend
cd backend
yarn start:dev

# Terminal 2: Mobile
cd mobile
yarn start

# Terminal 3: Test connection
curl http://10.0.2.2:3001/api/categories
# This should work from host machine

# Terminal 4: Check what emulator sees
adb shell ping -c 3 10.0.2.2
```

## Common Error Messages

### "Network request failed"
→ API URL is wrong or network is blocked
→ Check `mobile/.env`
→ Try ADB port forwarding

### "Connection refused"
→ Backend is not running
→ Check if `yarn start:dev` is running
→ Try `curl http://localhost:3001/api`

### "Request timeout"
→ Firewall blocking connection
→ Check firewall settings
→ Try different IP

### "401 Unauthorized"
→ Token missing or expired
→ Check if you're logged in
→ Try logging out and in again
