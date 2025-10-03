# PostgreSQL Development Setup

## Prisma Schema Update Workflow

When you need to add a column or modify the database schema:

### 1. Update Prisma Schema
Edit `prisma/schema.prisma` with your changes:
```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  newField String? // Your new field
}
```

### 2. Local Development
```bash
# Start local postgres
cd postgres && ./docker-run

# Generate migration
npx prisma migrate dev --name add_new_field

# This creates a migration file and applies it to your local DB
```

### 3. Production Deployment
```bash
# Connect to production DB via proxy
flyctl proxy 5432:5432 --app skatt-abc-db

# In another terminal, deploy migration
npx prisma migrate deploy

# Update Prisma client
npx prisma generate
```

### 4. Alternative: Direct Schema Pull
If production DB has manual changes:
```bash
# Pull schema from production
npx prisma db pull

# Generate new Prisma client
npx prisma generate
```

## Local Development Commands

```bash
# Start local postgres (port 5433)
cd postgres && ./docker-run

# Connect to local DB
psql -h localhost -p 5433 -U postgres -d ask_me_skattabc_dev

# Stop local postgres
cd postgres && docker-compose down
```

## Environment Variables

### Local Development (.env.local)
```bash
DATABASE_URL="postgresql://postgres:dev_password@localhost:5433/ask_me_skattabc_dev"
```

### Production (via proxy)
```bash
DATABASE_URL="postgres://postgres:llxxEOVwpmVIL0C@localhost:5432/ask_me_skattabc_young_violet_4122"
```

## Safety Tips

- **Always test migrations locally first**
- **Backup production DB before schema changes**
- **Use `prisma migrate deploy` for production, not `prisma migrate dev`**
- **Keep your Prisma schema in sync with your database**