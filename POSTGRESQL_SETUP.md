# PostgreSQL Setup Guide

## Option 1: Docker (Recommended)

1. Start PostgreSQL using Docker:
```bash
docker run -d \
  --name money-tracker-db \
  -e POSTGRES_DB=money_tracker \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:14-alpine
```

2. Check if container is running:
```bash
docker ps | grep money-tracker-db
```

3. Stop/start container:
```bash
docker stop money-tracker-db
docker start money-tracker-db
```

## Option 2: Local Installation

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### macOS (Homebrew):
```bash
brew install postgresql
brew services start postgresql
```

### Windows:
Download and install from: https://www.postgresql.org/download/windows/

## Setup Database

After installation, create the database:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE money_tracker;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE money_tracker TO postgres;
\q
```

## Run Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

## Verify Connection

```bash
cd backend
npx prisma studio
```

This will open Prisma Studio at http://localhost:5555 where you can view/edit data.

## Troubleshooting

### Connection refused:
- Check if PostgreSQL is running: `sudo systemctl status postgresql` (Linux) or `docker ps` (Docker)
- Verify port 5432 is available: `lsof -i :5432`

### Database doesn't exist:
```bash
sudo -u postgres psql
CREATE DATABASE money_tracker;
\q
```

### Permission denied:
```bash
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE money_tracker TO postgres;
\q
```
