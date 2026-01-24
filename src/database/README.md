# Database Setup

This directory is reserved for database-related files such as Prisma schema, migrations, and seeding scripts.

## TypeORM Configuration (Development)

TypeORM is configured for development use. The configuration is located in `src/config/database.config.ts`.

### Environment Variables

Create a `.env.local` or `.env` file in the project root with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=hayah_db
DB_SSL=false

# Application Configuration
PORT=3000
NODE_ENV=development

# Email (optional – for notification emails)
# Set MAIL_ENABLED=true and SMTP credentials to enable.
# MAIL_ENABLED=false
# MAIL_HOST=smtp.example.com
# MAIL_PORT=587
# MAIL_USER=
# MAIL_PASSWORD=
# MAIL_FROM=Hayah <noreply@example.com>
```

### Features

- **Auto-synchronization**: Schema is automatically synchronized in development mode (`synchronize: true` when `NODE_ENV !== 'production'`)
- **Entity Auto-discovery**: Entities are automatically discovered from `src/**/*.entity{.ts,.js}` pattern
- **Logging**: SQL queries are logged in development mode
- **PostgreSQL**: Configured for PostgreSQL database

### Testing Database Connection

To test the database connection, start the application:

```bash
npm run start:dev
```

If the connection is successful, you should see TypeORM connection logs in the console. If there are connection errors, check:

1. PostgreSQL is running
2. Database credentials are correct
3. Database `hayah_db` exists (or create it manually)
4. Environment variables are set correctly

### Creating the Database

If the database doesn't exist, create it using PostgreSQL:

```sql
CREATE DATABASE hayah_db;
```

Or using psql command line:

```bash
createdb hayah_db
```
