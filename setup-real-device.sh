#!/bin/bash

echo "🔍 Finding your computer's IP address..."
echo "=================================="
echo ""

# Try multiple methods to get IP
IP=""

# Method 1: hostname -I
if command -v hostname &> /dev/null; then
  IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

# Method 2: ip command
if [ -z "$IP" ] && command -v ip &> /dev/null; then
  IP=$(ip -4 addr show 2>/dev/null | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1' | head -1)
fi

# Method 3: ifconfig
if [ -z "$IP" ] && command -v ifconfig &> /dev/null; then
  IP=$(ifconfig 2>/dev/null | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
fi

if [ -z "$IP" ]; then
  echo "❌ Could not determine IP address automatically"
  echo ""
  echo "Please find it manually:"
  echo "  Linux/Mac: ifconfig | grep inet"
  echo "  Windows: ipconfig"
  echo ""
  echo "Then update mobile/.env with:"
  echo "EXPO_PUBLIC_API_URL=http://YOUR_IP:3001/api"
  exit 1
fi

echo "✅ Found IP: $IP"
echo ""

# Update mobile/.env
echo "📝 Updating mobile/.env..."
echo "EXPO_PUBLIC_API_URL=http://$IP:3001/api" > mobile/.env
echo "✅ Updated mobile/.env to: http://$IP:3001/api"
echo ""

# Test connection
echo "🧪 Testing connection to backend..."
echo "=================================="
if curl -s http://localhost:3001/api/categories > /dev/null 2>&1; then
  echo "✅ Backend is running on localhost:3001"
else
  echo "❌ Backend is NOT running!"
  echo "   Start with: cd backend && yarn start:dev"
fi

echo ""
if curl -s http://$IP:3001/api/categories > /dev/null 2>&1; then
  echo "✅ Backend is accessible from IP: $IP"
else
  echo "❌ Backend is NOT accessible from IP: $IP"
  echo "   Check firewall settings"
  echo "   Allow port 3001 through firewall"
fi

echo ""
echo "=================================="
echo "📱 Setup complete!"
echo "=================================="
echo ""
echo "For real Android device:"
echo "  1. Make sure phone and computer are on SAME network"
echo "  2. Backend is running: cd backend && yarn start:dev"
echo "  3. Start Expo: cd mobile && yarn start"
echo "  4. Scan QR code with Expo Go app on phone"
echo "  5. App will connect to: http://$IP:3001/api"
echo ""
echo "If connection fails:"
echo "  1. Check phone is on same WiFi"
echo "  2. Try disabling VPN on phone"
echo "  3. Check firewall allows port 3001"
echo ""
