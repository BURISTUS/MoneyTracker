# Real Android Device Setup

## Problem
When running on a real Android device, you need to use your computer's **actual IP address**, not `localhost` or `10.0.2.2`.

## Quick Fix

Run the setup script (automatic):
```bash
chmod +x setup-real-device.sh
./setup-real-device.sh
```

This will:
1. Find your computer's IP automatically
2. Update `mobile/.env` with correct IP
3. Test backend connection

## Manual Setup

### 1. Find Your IP

**Linux:**
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
# or
hostname -I
```

**macOS:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# or
ipconfig getifaddr en0
```

**Windows:**
```cmd
ipconfig
```

Look for your local IP (like `192.168.1.100`, `10.0.0.5`, etc.)

### 2. Update mobile/.env

```bash
# Replace YOUR_IP with your actual IP
echo "EXPO_PUBLIC_API_URL=http://YOUR_IP:3001/api" > mobile/.env

# Example:
echo "EXPO_PUBLIC_API_URL=http://192.168.1.100:3001/api" > mobile/.env
```

### 3. Start Backend

```bash
cd backend
yarn start:dev
```

### 4. Start Expo

```bash
cd mobile
yarn start
```

### 5. Connect Device

1. Make sure phone and computer are on **SAME WiFi network**
2. Open Expo Go app on phone
3. Scan QR code from Expo
4. App should connect to backend

## Important: CORS

Backend is now configured to accept requests from any origin (`origin: true`).

## Troubleshooting

### 1. "Network request failed"

**Check network:**
```bash
# On your computer
ping YOUR_IP

# On your phone (terminal app)
ping YOUR_IP
```

**Check backend is running:**
```bash
curl http://localhost:3001/api/categories
curl http://YOUR_IP:3001/api/categories
```

### 2. "Connection refused"

**Firewall blocking?**

**Linux (UFW):**
```bash
sudo ufw allow 3001
sudo ufw allow from 192.168.1.0/24 to any port 3001
```

**macOS:**
```bash
# Add Node.js to firewall exceptions
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
```

**Windows:**
1. Windows Defender Firewall
2. Advanced Settings → Inbound Rules
3. New Rule → Port → 3001 → Allow

### 3. Device can't see QR code

- Make sure computer and phone are on same network
- Try disabling VPN on phone
- Restart Expo: `cd mobile && yarn start -c`

### 4. Slow connection

- Try using WiFi instead of cellular data
- Move closer to WiFi router
- Check WiFi signal strength

### 5. "Unauthorized" error

This means authentication is working but token is invalid:
- Log out and log in again
- Try registering new account

## Platform Comparison

| Platform | API URL in .env |
|----------|-------------------|
| Android Emulator | `http://10.0.2.2:3001/api` |
| iOS Simulator | `http://localhost:3001/api` |
| **Real Android Device** | `http://192.168.1.X:3001/api` |
| Real iOS Device | `http://192.168.1.X:3001/api` |
| Web (localhost) | `http://localhost:3001/api` |

## Complete Checklist

- [ ] Backend running on port 3001
- [ ] Phone and computer on same WiFi
- [ ] `mobile/.env` has correct IP
- [ ] Firewall allows port 3001
- [ ] VPN disabled on phone
- [ ] Expo QR code scanned
- [ ] App loaded successfully
- [ ] Can log in/register
- [ ] Can create transaction

## Test Connection from Phone

Install a terminal app on your Android phone (like "Termux") and test:

```bash
curl http://YOUR_IP:3001/api/categories
```

If this works, the app should work too.

## Still Having Issues?

### Try Using Ngrok (Public URL)

```bash
# Install ngrok
npm install -g ngrok

# Expose backend
cd backend
ngrok http 3001
```

You'll get a URL like: `https://xxxx-xx-xx-xx.ngrok-free.app`

Update `mobile/.env`:
```bash
echo "EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api" > mobile/.env
```

This works even if networks are different.

### Debug Mode

Enable detailed logging in `mobile/src/services/api.ts` (already enabled):
- Open Expo DevTools on phone
- Check Network tab
- Look for API requests and responses
