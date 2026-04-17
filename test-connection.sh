#!/bin/bash

echo "🔍 Testing API Connection..."
echo ""

# Test 1: Direct curl to backend
echo "Test 1: Direct connection to backend"
echo "====================================="
curl -s http://localhost:3001/api/categories || echo "❌ Connection failed"
echo ""

# Test 2: Login endpoint
echo "Test 2: Login endpoint"
echo "====================================="
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | head -1
echo ""

# Test 3: Android emulator URL
echo "Test 3: Android emulator URL"
echo "====================================="
curl -s http://10.0.2.2:3001/api/categories || echo "❌ Connection failed (expected - 10.0.2.2 only works from emulator)"
echo ""

# Check if backend is running
echo "Test 4: Backend status"
echo "====================================="
if curl -s http://localhost:3001/api > /dev/null 2>&1; then
  echo "✅ Backend is running"
else
  echo "❌ Backend is NOT running"
  echo ""
  echo "To start backend:"
  echo "  cd backend && yarn start:dev"
fi
echo ""

# Check if PostgreSQL is running
echo "Test 5: PostgreSQL status"
echo "====================================="
if docker ps | grep -q money-tracker-db; then
  echo "✅ PostgreSQL container is running"
elif pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
  echo "✅ PostgreSQL is running locally"
else
  echo "❌ PostgreSQL is NOT running"
  echo ""
  echo "To start PostgreSQL:"
  echo "  docker run -d --name money-tracker-db -e POSTGRES_DB=money_tracker -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:14-alpine"
fi
echo ""

echo "====================================="
echo "📱 For mobile app to work:"
echo "====================================="
echo ""
echo "1. Make sure backend is running on port 3001"
echo "2. Check mobile/.env contains correct URL:"
echo ""
cat mobile/.env 2>/dev/null || echo "   .env file not found!"
echo ""
echo "3. For Android emulator use:"
echo "   EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api"
echo ""
echo "4. For iOS simulator use:"
echo "   EXPO_PUBLIC_API_URL=http://localhost:3001/api"
echo ""
echo "5. For physical device use your computer's IP:"
echo "   EXPO_PUBLIC_API_URL=http://192.168.1.X:3001/api"
echo ""
