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
  if adb devices 2>/dev/null | grep -q "device$"; then
    echo "📱 Device found, setting up port forwarding..."
    adb reverse tcp:3001 tcp:3001
    echo "✅ Port forwarded: localhost:3001 → emulator:3001"
    echo ""
    echo "🔄 Now you can use localhost in mobile/.env:"
    echo 'EXPO_PUBLIC_API_URL=http://localhost:3001/api'
  else
    echo "❌ ADB found but no device connected"
    echo "   Make sure emulator is running"
    echo "   Start emulator and run: adb devices"
  fi
else
  echo "❌ ADB not installed"
  echo "   Install with: sudo apt install android-tools-adb"
  echo "   On macOS: brew install android-platform-tools"
fi

echo ""
echo "================================="
echo "📱 Next steps:"
echo "================================="
echo ""
echo "1. Make sure backend is running: cd backend && yarn start:dev"
echo "2. Start mobile app: cd mobile && yarn start"
echo "3. Check Expo logs for API requests"
echo "4. If still not working, read ANDROID_NETWORK_FIX.md"
echo ""
