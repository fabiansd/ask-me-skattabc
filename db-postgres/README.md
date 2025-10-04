# Database Setup Documentation

This directory contains the PostgreSQL database setup for local development using Podman/Docker.

## Directory Structure

```
db-postgres/
├── README.md                    # This file
├── podman-compose.yml          # Podman container setup
├── docker-compose.yml          # Docker container setup (if needed)
├── prisma/
│   └── schema.prisma           # Database schema definition
├── migrations/                 # Prisma migration files
│   ├── migration_lock.toml
│   └── [timestamp]_migration_name/
│       └── migration.sql
└── init-scripts/
    └── init.sql               # Test data initialization
```

## How the Local Database Setup Works

### 1. Container Configuration (podman-compose.yml)
- **Image**: `postgres:15` (standard PostgreSQL)
- **Database**: `ask_me_skattabc_dev`
- **Port**: `5433` (to avoid conflicts with system postgres on 5432)
- **Credentials**: `postgres` / `devpassword`
- **Volume**: Persistent data storage in `postgres_dev_data`

### 2. Schema Management (Prisma)
- **Schema File**: `db-postgres/prisma/schema.prisma`
- **Migrations**: Generated in `db-postgres/migrations/`
- **Client**: Generated for the main app to use

### 3. Test Data (init-scripts/init.sql)
- Automatically loaded after migrations run
- Creates test users: `testuser1`, `googleuser`, `admin`, `fabian`, `default`
- Includes sample query history and feedback data
- Uses `ON CONFLICT DO NOTHING` to prevent duplicates

## Environment Configuration

### Local Development (.env)
```bash
DATABASE_URL="postgresql://postgres:devpassword@localhost:5433/ask_me_skattabc_dev"
```

### Production (Fly.io secrets)
```bash
DATABASE_URL="postgres://postgres:password@host:5432/production_db"
```

## npm Scripts Integration

The database setup is integrated into the main app's package.json:

### Automated Setup
```bash
npm run dev                # Start database + app (recommended)
```
**Process:**
1. `podman-compose up -d` - Start PostgreSQL container
2. `npx prisma migrate dev` - Run migrations (creates tables)
3. Load `init-scripts/init.sql` - Insert test data
4. Start Next.js app

### Manual Controls
```bash
npm run dev:db:setup      # Database setup only
npm run dev:db:stop       # Stop database container
npm run dev:app           # App only (assumes DB running)
```

## Troubleshooting & Maintenance

### Container Management
```bash
# Check if container is running
podman ps

# View container logs
podman logs db-postgres-postgres-dev-1

# Connect to database directly
psql "postgresql://postgres:devpassword@localhost:5433/ask_me_skattabc_dev"

# Reset database completely
podman-compose down
podman volume rm db-postgres_postgres_dev_data
npm run dev:db:setup
```

### Schema Changes
```bash
# After modifying schema.prisma
cd db-postgres
npx prisma migrate dev --name describe_your_change

# Or from project root
npx prisma migrate dev --schema=db-postgres/prisma/schema.prisma
```

### Updating Test Data
1. Edit `init-scripts/init.sql`
2. Reset database: `npm run dev:db:stop && npm run dev:db:setup`

## Production Deployment

### Database Migrations
Handled via GitHub Actions workflow that triggers on changes to `db-postgres/migrations/`:

```yaml
on:
  push:
    branches: [main]
    paths: ['db-postgres/migrations/**']
```

### Environment Variables
- **GitHub Secrets**: For CI/CD migrations
- **Fly.io Secrets**: For runtime database access

## Historical Context

### Why This Setup?
- **Podman**: Works on company Macs without Docker Desktop
- **Local Database**: Faster development, isolated test data
- **Automated Setup**: `npm run dev` does everything
- **Clean Separation**: Database config isolated from main app

### Migration from Proxy Setup
Previously used Fly.io database proxy for development:
```bash
flyctl proxy 5432:5432 --app skatt-abc-db
```

New setup provides:
- ✅ No network dependency
- ✅ Consistent test data
- ✅ Faster startup
- ✅ Isolated development environment

### Key Decisions
1. **Port 5433**: Avoids conflicts with system PostgreSQL
2. **Separate .env**: Database config isolated from main app
3. **ON CONFLICT DO NOTHING**: Prevents duplicate data on re-runs
4. **Podman over Docker**: Better for corporate environments

## Re-setup After 6 Months

If you're reading this in 6 months and need to set up again:

1. **Install Podman** (if not already):
   ```bash
   brew install podman
   podman machine init && podman machine start
   ```

2. **Start everything**:
   ```bash
   npm run dev
   ```

3. **If it fails**, check:
   - Is Podman machine running? `podman machine list`
   - Any port conflicts? `lsof -i :5433`
   - Environment variables set? Check `.env` file

4. **Nuclear option** (if corrupted):
   ```bash
   podman-compose -f db-postgres/podman-compose.yml down
   podman volume prune
   npm run dev:db:setup
   ```

The setup is designed to be self-contained and reproducible. The `npm run dev` command should handle everything automatically.