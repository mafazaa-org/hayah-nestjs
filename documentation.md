# Hayah Backend Development Documentation

This document tracks the implementation progress and details of each completed phase in the Hayah Backend project.

---

## Phase 1: Project Setup & Architecture ✅

**Status:** Completed  
**Date Completed:** January 2025

### Overview
Phase 1 establishes the foundational architecture of the NestJS backend application, including configuration management, validation, and error handling.

### Objectives Completed

#### 1. Initialize NestJS Project ✅
- **Status:** Already completed
- **Description:** Basic NestJS project structure was initialized with core dependencies.

#### 2. Configuration Module (`@nestjs/config`) ✅

**Files Modified:**
- `src/app.module.ts`

**Implementation Details:**
- Configured `ConfigModule` as a global module using `ConfigModule.forRoot()`
- Enabled global access to configuration across all modules
- Configured environment file loading with priority: `.env.local` → `.env`
- Enabled configuration caching for improved performance

**Code Implementation:**
```typescript
// src/app.module.ts
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),
  ],
  // ...
})
```

**Benefits:**
- Environment variables accessible via `ConfigService` anywhere in the application
- Centralized configuration management
- Support for environment-specific configuration files

#### 3. Validation Pipes & Global Exception Filters ✅

**Files Modified:**
- `src/main.ts`

**Files Created:**
- `src/common/filters/all-exceptions.filter.ts`

**Implementation Details:**

##### 3.1 Global Validation Pipe
- Configured `ValidationPipe` globally in the application bootstrap
- **Key Features:**
  - `whitelist: true` - Automatically strips unknown properties from incoming DTOs
  - `forbidNonWhitelisted: true` - Rejects requests with unknown properties (returns 400 error)
  - `transform: true` - Automatically transforms payloads to DTO instances
  - `enableImplicitConversion: true` - Converts primitive types automatically (e.g., string to number)

**Code Implementation:**
```typescript
// src/main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

**Benefits:**
- Automatic validation of all incoming requests
- Type safety through DTO transformation
- Prevents data pollution from unknown properties
- Consistent validation behavior across all endpoints

##### 3.2 Global Exception Filter
- Created `AllExceptionsFilter` to handle all application exceptions
- **Features:**
  - Catches all exceptions (both `HttpException` and unexpected errors)
  - Normalizes error responses to a consistent format
  - Logs exceptions with full context (method, URL, stack trace)
  - Handles both string and object error messages
  - Provides detailed error information (status code, timestamp, path, method)

**Code Implementation:**
```typescript
// src/common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    // ... implementation details
  }
}
```

**Error Response Format:**
```json
{
  "statusCode": 404,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/999",
  "method": "GET",
  "message": "User not found"
}
```

**Benefits:**
- Consistent error response format across the entire API
- Comprehensive error logging for debugging
- Graceful handling of unexpected errors
- Better developer experience with detailed error information

### Directory Structure

```
src/
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts  (NEW)
├── app.module.ts                     (MODIFIED)
├── main.ts                           (MODIFIED)
├── app.controller.ts
└── app.service.ts
```

### Dependencies Used

All required dependencies were already installed:
- `@nestjs/config` - Configuration management
- `class-validator` - Validation decorators
- `class-transformer` - Object transformation

### Configuration Files

**Environment Variables:**
- Application uses `.env.local` (priority) or `.env` files
- Port configuration: `process.env.PORT ?? 3000`

### Testing

- All implementations are production-ready
- Exception filter tested with various exception types
- Validation pipe tested with DTO validation decorators

### Next Steps

After completing Phase 1, the application has:
- ✅ Global configuration management
- ✅ Automatic request validation
- ✅ Centralized error handling

**Ready for:** Phase 2 - Project Structure & Module Setup

---

## Phase 2: Project Structure & Module Setup

**Status:** Completed  
**Date Completed:** January 2025

### Overview
Phase 2 focuses on establishing a clean, scalable project structure based on feature-driven modules. It introduces the `src/features` directory, base feature folders (auth, users, folders, lists, tasks, statuses, tags, comments, attachments, notifications), and placeholder DTOs/entities to be wired to the database schema in later phases.

### Objectives Completed

#### 1. Create Base Folder Structure ✅

- **Status:** Completed
- **Description:** Core top-level folders were created to separate concerns and prepare for future work.

**Folders Created:**
- `src/features` — Feature-based modules (auth, users, folders, lists, tasks, statuses, tags, comments, attachments, notifications)
- `src/common` — Shared utilities, filters, guards, decorators, etc.
- `src/config` — Configuration-related files (to be filled later)
- `src/database` — Database-related files (Prisma schema, migrations, etc.)

#### 2. Create Feature Folders & Base Files ✅

- **Status:** Completed
- **Description:** Each core feature now has its own folder with module, controller, and service files, along with DTO and entity subfolders.

**Features Implemented:**
- `src/features/auth`
- `src/features/users`
- `src/features/folders`
- `src/features/lists`
- `src/features/tasks`
- `src/features/statuses`
- `src/features/tags`
- `src/features/comments`
- `src/features/attachments`
- `src/features/notifications`

Each feature folder includes:
- `*.module.ts` — NestJS module definition
- `*.controller.ts` — HTTP route handling
- `*.service.ts` — Business logic layer
- `dto/` — Placeholder DTOs for create, update, and response shapes
- `entities/` — Placeholder entity interface/type for the feature

**Integration with App Module:**
- `src/app.module.ts` was updated to import and register all feature modules in the `imports` array so they are part of the main application context.

#### 3. Create Base Entity/DTO Structure (Placeholders) ✅

- **Status:** Completed
- **Description:** For each feature, basic DTO and entity placeholders were created. These are intentionally minimal and will be fleshed out once the database schema is finalized in later phases.

**Placeholder Structure:**
- DTOs:
  - `create-*.dto.ts`
  - `update-*.dto.ts`
  - `*-response.dto.ts`
- Entities:
  - `*.entity.ts` (interface or type representing the core domain object)

**Notes:**
- DTO and entity files currently contain simple placeholder classes/interfaces with comments indicating they will be implemented after the database schema is defined.
- This allows controllers and services to be wired up with types without blocking on database design.

### Directory Structure (High-Level)

```text
src/
├── common/
│   └── filters/
│       └── all-exceptions.filter.ts
├── config/
│   └── .gitkeep
├── database/
│   └── .gitkeep
├── features/
│   ├── auth/
│   ├── users/
│   ├── folders/
│   ├── lists/
│   ├── tasks/
│   ├── statuses/
│   ├── tags/
│   ├── comments/
│   ├── attachments/
│   └── notifications/
├── app.module.ts
├── main.ts
├── app.controller.ts
└── app.service.ts
```

### Benefits

- Clear, feature-based organization that scales as the project grows
- Separation of concerns between configuration, database, common utilities, and features
- All core features are scaffolded and ready for implementation once the database layer is in place
- Reduces friction for future phases (database setup, auth, business logic) by having modules/controllers/services already wired

---

## Phase 3: Database Connection & Setup

**Status:** Completed  
**Date Completed:** January 2026

### Overview
Phase 3 configures the database connection using TypeORM for development, wires it into the NestJS application via `ConfigModule` and `TypeOrmModule`, and introduces a configurable schema with sensible fallbacks.

### Objectives Completed

#### 1. Install and Configure TypeORM for PostgreSQL ✅

**Files Modified:**
- `package.json`
- `src/app.module.ts`

**Files Created/Updated:**
- `src/config/database.config.ts`
- `src/database/README.md`

**Implementation Details:**
- Added TypeORM and NestJS integration packages (`typeorm`, `@nestjs/typeorm`).
- Registered `databaseConfig` with `ConfigModule.forRoot({ load: [databaseConfig], ... })` so database options are managed via the configuration system.
- Configured PostgreSQL as the database driver with environment-driven connection settings.

**Key Configuration (`database.config.ts`):**
- `type: 'postgres'` — Uses PostgreSQL as the primary database.
- `host`, `port`, `username`, `password`, `database` are read from environment variables with local development defaults:
  - `DB_HOST || 'localhost'`
  - `DB_PORT || '5432'`
  - `DB_USERNAME || 'postgres'`
  - `DB_PASSWORD || 'postgres'`
  - `DB_NAME || 'mydb'`
- `entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')]` — Automatically discovers all entity files across the `src` tree.
- `schema: process.env.DB_SCHEMA || 'hayah_db' || 'public'`
  - Primary schema is provided via `DB_SCHEMA`.
  - If `DB_SCHEMA` is not set, it falls back to the project-specific schema (`hayah_db`), and from there to the default `public` schema when needed.
- `synchronize: process.env.NODE_ENV !== 'production'`
  - Enables automatic schema synchronization for development.
  - Disabled in production to prevent destructive schema changes.
- `logging: process.env.NODE_ENV === 'development'`
  - Enables SQL logging only in development for easier debugging.
- `ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false`
  - Allows toggling SSL for hosted PostgreSQL instances (e.g., cloud providers) while remaining disabled locally.

#### 2. Integrate TypeORM via `AppModule` ✅

**Files Modified:**
- `src/app.module.ts`

**Implementation Details:**
- `ConfigModule.forRoot` is configured as:
  - `isGlobal: true` — Makes configuration available across the entire app.
  - `envFilePath: ['.env.local', '.env']` — Loads environment variables with `.env.local` taking precedence.
  - `cache: true` — Caches configuration lookups for performance.
  - `load: [databaseConfig]` — Registers the `database` configuration namespace.
- `TypeOrmModule.forRootAsync` is used to bootstrap the TypeORM connection using `ConfigService`:
  - Injects `ConfigService`.
  - Uses `configService.get('database')` to retrieve the full `TypeOrmModuleOptions` from `database.config.ts`.
  - Keeps all connection details centralized in the configuration layer.

#### 3. Environment Variables and Local Setup ✅

**Files Modified:**
- `src/database/README.md`

**Implementation Details:**
- Documented required environment variables for local development:
  - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL`
  - `PORT`, `NODE_ENV`
- Described how to:
  - Start the application (`npm run start:dev`) and verify TypeORM connection logs.
  - Create the development database (`hayah_db`) via SQL or `createdb`.
- Clarified TypeORM behavior in development:
  - Auto-synchronization of entities to the database schema.
  - Auto-discovery of entities and SQL logging.

### Benefits

- **Config-driven database setup:** All connection options (including schema and SSL) are managed centrally via `ConfigModule` and environment variables.
- **Safe development workflow:** Automatic schema synchronization and query logging are enabled only for non-production environments.
- **Schema flexibility:** Supports a dedicated application schema (`hayah_db`) with fallback behavior when a custom schema is not defined, making it easier to adapt to different database setups (local vs. shared instances).

---

## Phase 4: Database Schema Design (ERD Implementation)

**Status:** Completed  
**Date Completed:** January 2026

### Overview

Phase 4 implements the complete Entity-Relationship Diagram (ERD) for the Hayah application using TypeORM. All database entities have been created with their columns, relationships, constraints, and cascade behaviors. This phase establishes the foundation for all data persistence in the application, supporting features like user management, workspace organization, task management, collaboration, and activity tracking.

### Objectives Completed

#### 1. Complete Entity Implementation ✅

**Total Entities Created:** 27 TypeORM entities across all feature modules

**Implementation Approach:**
- All entities use TypeORM decorators (`@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.)
- PostgreSQL-compatible column types (`text`, `uuid`, `timestamp`, `jsonb`, `integer`, `boolean`, `bigint`, `date`)
- Consistent naming conventions: snake_case for database columns, camelCase for TypeScript properties
- Automatic timestamp management via `@CreateDateColumn` and `@UpdateDateColumn`
- UUID primary keys for all entities using `@PrimaryGeneratedColumn('uuid')`

#### 2. Relationship Implementation ✅

All relationship types have been implemented:
- **One-To-One:** `User` ↔ `UserSettings`
- **One-To-Many:** Numerous parent-child relationships (e.g., `User` → `Comment[]`, `List` → `Task[]`, `Task` → `Subtask[]`)
- **Many-To-One:** Foreign key relationships throughout the schema
- **Many-To-Many:** Implemented via explicit join tables (e.g., `Assignment` for `User` ↔ `Task`, `TaskTag` for `Task` ↔ `Tag`, `ListMember` for `User` ↔ `List`)

**Cascade Behaviors:**
- `CASCADE`: Automatically deletes related entities when parent is deleted (e.g., deleting a `Task` deletes all `Comment`s, `Attachment`s, `Subtask`s)
- `SET NULL`: Sets foreign key to null when parent is deleted (e.g., deleting a `Status` sets `status_id` to null on related `Task`s)
- Proper handling of optional relationships with `nullable: true`

### Entities Created

#### Core User & Authentication Entities

**1. UserEntity** (`users`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `email` (text, unique)
  - `password_hash` (text)
  - `name` (text, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - One-To-One: `settings` → `UserSettingsEntity`
  - One-To-Many: `filterPresets` → `FilterPresetEntity[]`
  - One-To-Many: `comments` → `CommentEntity[]`
  - One-To-Many: `attachments` → `AttachmentEntity[]`
  - One-To-Many: `notifications` → `NotificationEntity[]`
  - One-To-Many: `assignments` → `AssignmentEntity[]`
  - One-To-Many: `listMemberships` → `ListMemberEntity[]`
  - One-To-Many: `activities` → `ActivityEntity[]`
  - One-To-Many: `views` → `ViewEntity[]`
- **File:** `src/features/users/entities/user.entity.ts`

**2. UserSettingsEntity** (`user_settings`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key, unique index)
  - `timezone` (text, nullable)
  - `language` (text, nullable)
  - `notification_preferences` (jsonb, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - One-To-One: `user` ↔ `UserEntity` (unique constraint on `user_id`)
- **File:** `src/features/users/entities/user-settings.entity.ts`

**3. AuthEntity** (`auth`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `refresh_token` (text, unique)
  - `expires_at` (timestamp)
  - `revoked` (boolean)
  - `revoked_at` (timestamp, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `user` → `UserEntity`
- **File:** `src/features/auth/entities/auth.entity.ts`

#### Workspace & Organization Entities

**4. WorkspaceEntity** (`workspaces`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `owner_id` (UUID, Foreign Key)
  - `name` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `owner` → `UserEntity` (CASCADE delete)
  - One-To-Many: `folders` → `FolderEntity[]`
  - One-To-Many: `lists` → `ListEntity[]`
  - One-To-Many: `tags` → `TagEntity[]`
- **File:** `src/features/workspaces/entities/workspace.entity.ts`

**5. FolderEntity** (`folders`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `workspace_id` (UUID, Foreign Key)
  - `parent_folder_id` (UUID, Foreign Key, nullable) - Self-referencing for nested folders
  - `name` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `workspace` → `WorkspaceEntity` (CASCADE delete)
  - Many-To-One: `parent` → `FolderEntity` (self-referencing, CASCADE delete, nullable)
  - One-To-Many: `children` → `FolderEntity[]` (self-referencing, supports 100+ nesting levels)
  - One-To-Many: `lists` → `ListEntity[]`
- **Special Features:**
  - Self-referencing relationship enables infinite nesting depth (practically limited to 100+ levels)
- **File:** `src/features/folders/entities/folder.entity.ts`

**6. ListEntity** (`lists`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `folder_id` (UUID, Foreign Key, nullable)
  - `workspace_id` (UUID, Foreign Key)
  - `name` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `folder` → `FolderEntity` (CASCADE delete, nullable)
  - Many-To-One: `workspace` → `WorkspaceEntity` (CASCADE delete)
  - One-To-Many: `statuses` → `StatusEntity[]`
  - One-To-Many: `tasks` → `TaskEntity[]`
  - One-To-Many: `iterations` → `IterationEntity[]`
  - One-To-Many: `customFields` → `CustomFieldEntity[]`
  - One-To-Many: `views` → `ViewEntity[]`
  - One-To-Many: `filterPresets` → `FilterPresetEntity[]`
  - One-To-Many: `listMembers` → `ListMemberEntity[]`
- **File:** `src/features/lists/entities/list.entity.ts`

**7. ListMemberEntity** (`list_members`) - Join Table for Many-To-Many
- **Columns:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `list_id` (UUID, Foreign Key)
  - `role` (text enum: 'owner' | 'editor' | 'viewer')
  - `created_at` (timestamp)
- **Relationships:**
  - Many-To-One: `user` → `UserEntity` (CASCADE delete)
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
  - Realizes Many-To-Many: `User` ↔ `List` (shared lists with permissions)
- **File:** `src/features/lists/entities/list-member.entity.ts`

#### Task Management Entities

**8. TaskEntity** (`tasks`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `list_id` (UUID, Foreign Key)
  - `status_id` (UUID, Foreign Key, nullable)
  - `priority_id` (UUID, Foreign Key, nullable)
  - `title` (text)
  - `description` (text, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
  - Many-To-One: `status` → `StatusEntity` (SET NULL on delete, nullable)
  - Many-To-One: `priority` → `TaskPriorityEntity` (nullable)
  - One-To-Many: `assignments` → `AssignmentEntity[]`
  - One-To-Many: `subtasks` → `SubtaskEntity[]`
  - One-To-Many: `comments` → `CommentEntity[]`
  - One-To-Many: `attachments` → `AttachmentEntity[]`
  - One-To-Many: `taskTags` → `TaskTagEntity[]`
  - One-To-Many: `taskIterations` → `TaskIterationEntity[]`
  - One-To-Many: `taskDependencies` → `TaskDependencyEntity[]`
  - One-To-Many: `checklists` → `ChecklistEntity[]`
  - One-To-Many: `taskCustomFieldValues` → `TaskCustomFieldValueEntity[]`
  - One-To-Many: `activities` → `ActivityEntity[]`
- **File:** `src/features/tasks/entities/task.entity.ts`

**9. StatusEntity** (`statuses`) - Kanban Board Columns
- **Columns:**
  - `id` (UUID, Primary Key)
  - `list_id` (UUID, Foreign Key)
  - `name` (text)
  - `order_index` (integer, default: 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
  - One-To-Many: `tasks` → `TaskEntity[]`
- **File:** `src/features/statuses/entities/status.entity.ts`

**10. TaskPriorityEntity** (`task_priorities`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `name` (text)
  - `color` (text, nullable)
  - `order_index` (integer, default: 0)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - One-To-Many: `tasks` → `TaskEntity[]`
- **File:** `src/features/tasks/entities/task-priority.entity.ts`

**11. AssignmentEntity** (`assignments`) - Join Table for Many-To-Many
- **Columns:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `task_id` (UUID, Foreign Key)
  - `assigned_at` (timestamp)
- **Relationships:**
  - Many-To-One: `user` → `UserEntity` (CASCADE delete)
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Realizes Many-To-Many: `User` ↔ `Task` (task assignments)
- **File:** `src/features/tasks/entities/assignment.entity.ts`

**12. SubtaskEntity** (`subtasks`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `title` (text)
  - `is_completed` (boolean)
  - `order_index` (integer)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (parent task, CASCADE delete)
- **File:** `src/features/tasks/entities/subtask.entity.ts`

**13. TaskDependencyEntity** (`task_dependencies`) - Directed Graph
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `depends_on_task_id` (UUID, Foreign Key)
  - `type` (text enum: 'blocks' | 'blocked_by')
  - `created_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (dependent task, CASCADE delete)
  - Many-To-One: `dependsOnTask` → `TaskEntity` (dependency target, CASCADE delete)
  - Represents directed Many-To-Many between tasks (task dependencies graph)
- **File:** `src/features/tasks/entities/task-dependency.entity.ts`

#### Tags & Labels

**14. TagEntity** (`tags`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `workspace_id` (UUID, Foreign Key)
  - `name` (text)
  - `color` (text, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `workspace` → `WorkspaceEntity` (CASCADE delete)
  - One-To-Many: `taskTags` → `TaskTagEntity[]`
- **File:** `src/features/tags/entities/tag.entity.ts`

**15. TaskTagEntity** (`task_tags`) - Join Table for Many-To-Many
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `tag_id` (UUID, Foreign Key)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Many-To-One: `tag` → `TagEntity` (CASCADE delete)
  - Realizes Many-To-Many: `Task` ↔ `Tag` (task labeling)
- **File:** `src/features/tasks/entities/task-tag.entity.ts`

#### Iterations & Sprints

**16. IterationEntity** (`iterations`) - Optional Feature
- **Columns:**
  - `id` (UUID, Primary Key)
  - `list_id` (UUID, Foreign Key)
  - `name` (text)
  - `start_date` (date, nullable)
  - `end_date` (date, nullable)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
  - One-To-Many: `taskIterations` → `TaskIterationEntity[]`
- **File:** `src/features/lists/entities/iteration.entity.ts`

**17. TaskIterationEntity** (`task_iterations`) - Join Table for Many-To-Many (Optional)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `iteration_id` (UUID, Foreign Key)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Many-To-One: `iteration` → `IterationEntity` (CASCADE delete)
  - Realizes Many-To-Many: `Task` ↔ `Iteration` (sprint planning)
- **File:** `src/features/tasks/entities/task-iteration.entity.ts`

#### Checklists

**18. ChecklistEntity** (`task_checklists`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `title` (text)
  - `order_index` (integer)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - One-To-Many: `checklistItems` → `ChecklistItemEntity[]`
- **File:** `src/features/tasks/entities/checklist.entity.ts`

**19. ChecklistItemEntity** (`checklist_items`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `checklist_id` (UUID, Foreign Key)
  - `title` (text)
  - `is_completed` (boolean)
  - `order_index` (integer)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `checklist` → `ChecklistEntity` (CASCADE delete)
- **File:** `src/features/tasks/entities/checklist-item.entity.ts`

#### Custom Fields

**20. CustomFieldEntity** (`custom_fields`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `list_id` (UUID, Foreign Key)
  - `name` (text)
  - `type` (text - enum: text/number/date/dropdown)
  - `config` (jsonb, nullable) - Stores field configuration
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
  - One-To-Many: `taskCustomFieldValues` → `TaskCustomFieldValueEntity[]`
- **File:** `src/features/lists/entities/custom-field.entity.ts`

**21. TaskCustomFieldValueEntity** (`task_custom_field_values`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `custom_field_id` (UUID, Foreign Key)
  - `value` (jsonb) - Flexible storage for different field types
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Many-To-One: `customField` → `CustomFieldEntity` (CASCADE delete)
- **File:** `src/features/tasks/entities/task-custom-field-value.entity.ts`

#### Collaboration & Activity

**22. CommentEntity** (`comments`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `user_id` (UUID, Foreign Key)
  - `content` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Many-To-One: `user` → `UserEntity` (author, CASCADE delete)
- **File:** `src/features/comments/entities/comment.entity.ts`

**23. AttachmentEntity** (`attachments`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `user_id` (UUID, Foreign Key)
  - `filename` (text)
  - `url` (text)
  - `mime_type` (text, nullable)
  - `size` (bigint)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Many-To-One: `user` → `UserEntity` (uploader, CASCADE delete)
- **File:** `src/features/attachments/entities/attachment.entity.ts`

**24. ActivityEntity** (`activities`) - History/Tracking
- **Columns:**
  - `id` (UUID, Primary Key)
  - `task_id` (UUID, Foreign Key)
  - `user_id` (UUID, Foreign Key)
  - `action_type` (text)
  - `old_value` (jsonb, nullable)
  - `new_value` (jsonb, nullable)
  - `created_at` (timestamp)
- **Relationships:**
  - Many-To-One: `task` → `TaskEntity` (CASCADE delete)
  - Many-To-One: `user` → `UserEntity` (actor, CASCADE delete)
- **File:** `src/features/tasks/entities/activity.entity.ts`

**25. NotificationEntity** (`notifications`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `type` (text)
  - `title` (text)
  - `message` (text)
  - `related_id` (text, nullable) - Reference to related entity
  - `is_read` (boolean)
  - `created_at` (timestamp)
- **Relationships:**
  - Many-To-One: `user` → `UserEntity` (CASCADE delete)
- **File:** `src/features/notifications/entities/notification.entity.ts`

#### Views & Filters

**26. ViewEntity** (`views`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `list_id` (UUID, Foreign Key)
  - `user_id` (UUID, Foreign Key)
  - `name` (text)
  - `type` (text enum: 'kanban' | 'table' | 'calendar')
  - `config` (jsonb, nullable) - Stores view configuration
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
  - Many-To-One: `user` → `UserEntity` (owner, CASCADE delete)
- **File:** `src/features/lists/entities/view.entity.ts`

**27. FilterPresetEntity** (`filter_presets`)
- **Columns:**
  - `id` (UUID, Primary Key)
  - `user_id` (UUID, Foreign Key)
  - `list_id` (UUID, Foreign Key)
  - `name` (text)
  - `filter_config` (jsonb) - Stores filter configuration
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
- **Relationships:**
  - Many-To-One: `user` → `UserEntity` (CASCADE delete)
  - Many-To-One: `list` → `ListEntity` (CASCADE delete)
- **File:** `src/features/lists/entities/filter-preset.entity.ts`

### Key Implementation Details

#### 1. Primary Keys & Identifiers
- All entities use UUID primary keys via `@PrimaryGeneratedColumn('uuid')`
- Provides globally unique identifiers, beneficial for distributed systems
- Prevents sequential ID enumeration attacks

#### 2. Timestamps
- Automatic `created_at` via `@CreateDateColumn`
- Automatic `updated_at` via `@UpdateDateColumn`
- Consistent timestamp management across all entities

#### 3. Foreign Key Constraints
- All relationships use `@JoinColumn` to specify foreign key column names
- Consistent naming: `{entity}_id` format (e.g., `user_id`, `task_id`, `list_id`)
- Cascade behaviors properly configured:
  - `onDelete: 'CASCADE'` for dependent entities (deleting parent removes children)
  - `onDelete: 'SET NULL'` for optional relationships (deleting status doesn't delete tasks)

#### 4. Relationship Patterns

**One-To-One:**
- `User` ↔ `UserSettings`: Unique constraint on `user_id` ensures one-to-one mapping
- Implemented with `@OneToOne` decorator and `@Index` for uniqueness

**One-To-Many / Many-To-One:**
- Standard parent-child relationships throughout
- Bidirectional relationships with inverse side defined via function references

**Many-To-Many:**
- Implemented via explicit join table entities (not TypeORM's implicit `@ManyToMany`)
- Provides full control over join table columns and additional metadata
- Examples: `AssignmentEntity`, `TaskTagEntity`, `TaskIterationEntity`, `ListMemberEntity`

**Self-Referencing:**
- `FolderEntity` supports nested folder hierarchies via self-referencing `parent` relationship
- Enables infinite nesting depth (practically 100+ levels)

**Directed Graph:**
- `TaskDependencyEntity` creates a directed graph of task dependencies
- Uses two Many-To-One relationships to the same entity (`TaskEntity`)

#### 5. Data Types & PostgreSQL Features

**Column Types:**
- `text`: For all string columns (PostgreSQL text type, no length limit)
- `uuid`: For all primary and foreign keys
- `timestamp`: For date/time columns
- `date`: For date-only columns (used in `IterationEntity`)
- `integer`: For numeric values (order_index, etc.)
- `bigint`: For large numeric values (file size in `AttachmentEntity`)
- `boolean`: For true/false flags
- `jsonb`: For flexible JSON storage (configs, preferences, values)

**PostgreSQL-Specific Features:**
- `jsonb` columns used for flexible data storage (view configs, filter configs, custom field values)
- UUID extension implicitly used for primary keys
- Indexes: Unique index on `user_settings.user_id` for one-to-one relationship

#### 6. Nullability & Optional Relationships
- Careful use of `nullable: true` for optional fields and relationships
- Examples:
  - `Task.status` is nullable (SET NULL on status deletion)
  - `Task.priority` is nullable (optional priority)
  - `List.folder` is nullable (lists can exist without folders)
  - `Folder.parent` is nullable (root folders have no parent)

### Directory Structure

```
src/features/
├── users/
│   └── entities/
│       ├── user.entity.ts
│       └── user-settings.entity.ts
├── auth/
│   └── entities/
│       └── auth.entity.ts
├── workspaces/
│   └── entities/
│       └── workspace.entity.ts
├── folders/
│   └── entities/
│       └── folder.entity.ts
├── lists/
│   └── entities/
│       ├── list.entity.ts
│       ├── list-member.entity.ts
│       ├── iteration.entity.ts
│       ├── custom-field.entity.ts
│       ├── view.entity.ts
│       └── filter-preset.entity.ts
├── statuses/
│   └── entities/
│       └── status.entity.ts
├── tasks/
│   └── entities/
│       ├── task.entity.ts
│       ├── task-priority.entity.ts
│       ├── assignment.entity.ts
│       ├── subtask.entity.ts
│       ├── task-tag.entity.ts
│       ├── task-iteration.entity.ts
│       ├── task-dependency.entity.ts
│       ├── checklist.entity.ts
│       ├── checklist-item.entity.ts
│       ├── task-custom-field-value.entity.ts
│       └── activity.entity.ts
├── tags/
│   └── entities/
│       └── tag.entity.ts
├── comments/
│   └── entities/
│       └── comment.entity.ts
├── attachments/
│   └── entities/
│       └── attachment.entity.ts
└── notifications/
    └── entities/
        └── notification.entity.ts
```

### Benefits

**1. Type Safety:**
- Full TypeScript type safety across all entities
- IntelliSense support for all properties and relationships
- Compile-time checking of relationship definitions

**2. Developer Experience:**
- Auto-discovery of entities via TypeORM's glob pattern
- Automatic schema synchronization in development
- SQL logging enabled in development for debugging

**3. Data Integrity:**
- Foreign key constraints enforced at database level
- Cascade delete behaviors prevent orphaned records
- Unique constraints prevent duplicate data

**4. Flexibility:**
- JSONB columns allow flexible configuration storage
- Self-referencing relationships support complex hierarchies
- Optional relationships enable flexible data models

**5. Scalability:**
- UUID primary keys support distributed systems
- Proper indexing strategy (via TypeORM decorators)
- Efficient relationship loading with TypeORM query builder

### Production Phase Recommendations

#### TypeORM vs Prisma: Analysis and Recommendation

**Current Implementation (TypeORM):**
- ✅ Fully implemented and working
- ✅ Deep NestJS integration via `@nestjs/typeorm`
- ✅ Mature and stable (years in production)
- ✅ Active Record and Data Mapper patterns supported
- ✅ Powerful query builder
- ✅ Migration support via TypeORM CLI
- ⚠️ Less type-safe than Prisma (though still good with TypeScript)
- ⚠️ More boilerplate for complex queries
- ⚠️ Manual migration file generation

**Prisma Alternative:**
- ✅ Excellent type safety and developer experience
- ✅ Auto-generated migrations
- ✅ Superior Prisma Studio (database GUI)
- ✅ Better performance (query engine)
- ✅ Excellent documentation and tooling
- ❌ Requires migration from TypeORM entities to Prisma schema
- ❌ Different query API (requires adaptation)
- ❌ Additional dependency and learning curve

#### Recommendation: **Continue with TypeORM for Production**

**Rationale:**

1. **Already Fully Implemented:**
   - All 27 entities are implemented and working
   - Relationships are correctly defined and tested
   - No breaking changes needed

2. **Production-Ready:**
   - TypeORM is battle-tested in production environments
   - Excellent NestJS integration
   - Active community and maintenance

3. **Migration to Prisma Would Require:**
   - Rewriting all entities as Prisma schema definitions
   - Converting all service layer queries to Prisma Client API
   - Generating and testing new migrations
   - Potential downtime during migration
   - Learning curve for the team

4. **TypeORM is Sufficient:**
   - Provides all needed features (relationships, migrations, query building)
   - TypeScript support is good (not perfect, but adequate)
   - Performance is acceptable for most use cases
   - Can be optimized with proper indexing and query optimization

**However, if Migration to Prisma is Desired:**

**Scenario:** You want to migrate to Prisma for better type safety and developer experience.

**Approach:**
1. **Keep TypeORM in Development:** Continue using TypeORM for active development
2. **Parallel Prisma Setup:** Introduce Prisma alongside TypeORM
3. **Gradual Migration:** 
   - Start with new features using Prisma
   - Migrate existing entities incrementally
   - Use both ORMs during transition period
4. **Full Migration:** Once all entities are migrated, remove TypeORM

**Prisma Setup Steps (if chosen):**
1. Install Prisma: `npm install prisma @prisma/client`
2. Initialize Prisma: `npx prisma init`
3. Define schema: Convert TypeORM entities to Prisma schema format
4. Generate migrations: `npx prisma migrate dev`
5. Generate client: `npx prisma generate`
6. Create Prisma service: NestJS module for Prisma Client
7. Update services: Convert queries from TypeORM to Prisma Client

**Best Practice for Production:**
1. **Disable `synchronize`:** Already configured (`NODE_ENV !== 'production'`)
2. **Use Migrations:** Generate TypeORM migrations for all schema changes
3. **Add Indexes:** Review query patterns and add appropriate indexes
4. **Connection Pooling:** Configure connection pool limits for production
5. **Query Optimization:** Use TypeORM query builder for complex queries
6. **Monitoring:** Add database query logging and performance monitoring

**Future Considerations:**
- If the application grows significantly and requires more advanced type safety
- If the team prefers Prisma's developer experience
- If performance becomes a bottleneck (Prisma's query engine can be faster)

**Conclusion:**
TypeORM is a solid choice for production. The current implementation is complete, well-structured, and production-ready. While Prisma offers some advantages, the migration cost and risk outweigh the benefits at this stage. Focus on optimizing the TypeORM implementation (migrations, indexes, query optimization) rather than migrating to a new ORM.

### Next Steps

After completing Phase 4, the application has:
- ✅ Complete database schema with 27 entities
- ✅ All relationships properly defined (One-To-One, One-To-Many, Many-To-One, Many-To-Many)
- ✅ Cascade behaviors configured for data integrity
- ✅ Ready for Phase 5 (Authorization & Authentication) implementation

**Ready for:** Phase 5 - Authorization & Authentication

---

## Phase 5: Authorization & Authentication

**Status:** Completed  
**Date Completed:** January 2026

### Overview

Phase 5 introduces a complete authentication and authorization layer on top of the existing TypeORM-based schema. It covers:

- User registration and login with secure password hashing
- JWT-based authentication (access tokens)
- Route protection via guards and a reusable `@CurrentUser` decorator
- User profile management (name, email, avatar placeholder)
- User settings (timezone, language, notification preferences)
- Optional flows for email verification and password reset

### Objectives Completed

#### 1. Auth Module (JWT-based Authentication) ✅

**Files Modified/Created:**
- `src/features/auth/auth.module.ts`
- `src/features/auth/auth.service.ts`
- `src/features/auth/auth.controller.ts`
- `src/features/auth/jwt.strategy.ts`
- `src/features/auth/jwt-auth.guard.ts`
- `src/common/decorators/current-user.decorator.ts`
- `src/features/auth/dto/create-auth.dto.ts`
- `src/features/auth/dto/auth-response.dto.ts`
- `src/features/auth/dto/verify-email.dto.ts`
- `src/features/auth/dto/request-password-reset.dto.ts`
- `src/features/auth/dto/reset-password.dto.ts`
- `src/app.module.ts` (AuthModule already imported as part of Phase 2)

**Implementation Details:**

##### 1.1 AuthModule Wiring
- Imported and configured:
  - `ConfigModule` for env-driven secrets and expiration
  - `PassportModule.register({ defaultStrategy: 'jwt' })`
  - `JwtModule.registerAsync` with `ConfigService`:
    - `secret` from `JWT_SECRET` (fallback `'dev-change-me'` for development)
    - `signOptions.expiresIn` from `JWT_EXPIRES_IN` (numeric seconds, default `3600`)
  - `TypeOrmModule.forFeature([UserEntity, AuthEntity])`
- Registered providers:
  - `AuthService`
  - `JwtStrategy`
- Exported `AuthService` for use by other modules if needed.

##### 1.2 DTOs & Response Shapes
- `CreateAuthDto`
  - `email` (validated as email)
  - `password` (string, `MinLength(8)`)
  - `name` (optional string)
- `AuthResponseDto`
  - `accessToken` (JWT access token)
  - `user` (object with `id`, `email`, `name | null`)

##### 1.3 AuthService – Register & Login

**Registration (`POST /auth/register`):**
- Checks for existing user by email; throws `ConflictException` if found.
- Hashes passwords using `bcrypt` with a salt (10 rounds).
- Creates a new `UserEntity` with:
  - `email`
  - `passwordHash`
  - `name` (nullable)
  - Email verification fields initialized (see below).
- Persists the user via `userRepository.save`.
- Generates a JWT access token via `JwtService.sign` with payload:
  - `sub`: user ID
  - `email`: user email
- Returns `AuthResponseDto` with token and basic user info.

**Login (`POST /auth/login`):**
- Looks up user by email.
- Validates password using `bcrypt.compare`.
- On failure, throws `UnauthorizedException` with generic “Invalid credentials”.
- On success, generates access token using the same signing logic as registration.
- Returns `AuthResponseDto`.

##### 1.4 JWT Strategy & Guard

- `JwtStrategy` (`src/features/auth/jwt.strategy.ts`):
  - Extends `PassportStrategy(Strategy)` from `passport-jwt`.
  - Extracts JWT from `Authorization: Bearer <token>` header.
  - Validates token with secret from `JWT_SECRET`.
  - `validate(payload)` returns:
    - `{ userId: payload.sub, email: payload.email }`, which becomes `request.user`.

- `JwtAuthGuard` (`src/features/auth/jwt-auth.guard.ts`):
  - Extends `AuthGuard('jwt')` (Passport).
  - Used with `@UseGuards(JwtAuthGuard)` to protect routes.

##### 1.5 Current User Decorator

- `@CurrentUser()` (`src/common/decorators/current-user.decorator.ts`):
  - Extracts `request.user` from the `ExecutionContext`.
  - Provides a convenient way to access the authenticated user payload in controllers.

##### 1.6 AuthController Endpoints

- `POST /auth/register`
  - Body: `CreateAuthDto`
  - Returns: `AuthResponseDto`

- `POST /auth/login`
  - Body: `CreateAuthDto` (email + password used)
  - Returns: `AuthResponseDto`

- `GET /auth/me`
  - Protected with `@UseGuards(JwtAuthGuard)`
  - Uses `@CurrentUser()` to return the JWT payload (`userId`, `email`).

These endpoints are fully integrated, validated via `class-validator`, and protected where appropriate using `JwtAuthGuard`.

#### 2. User Profile & Settings ✅

**Files Modified/Created:**
- `src/features/users/users.module.ts`
- `src/features/users/users.service.ts`
- `src/features/users/users.controller.ts`
- `src/features/users/entities/user.entity.ts` (extended for auth features)
- `src/features/users/entities/user-settings.entity.ts` (already present from Phase 4)
- `src/features/users/dto/update-user.dto.ts`
- `src/features/users/dto/change-password.dto.ts`
- `src/features/users/dto/update-user-settings.dto.ts`
- `src/features/users/dto/user-response.dto.ts`
- `src/features/users/dto/user-settings-response.dto.ts`

##### 2.1 UsersModule Integration

- Imports:
  - `TypeOrmModule.forFeature([UserEntity, UserSettingsEntity])`
  - `AuthModule` (to reuse JWT guard/decorator patterns where needed)
- Exports:
  - `UsersService`

##### 2.2 UserEntity Extensions

`UserEntity` (`src/features/users/entities/user.entity.ts`) was extended to support:

- Email verification fields:
  - `isEmailVerified` (boolean, default `false`)
  - `emailVerificationToken` (text, nullable)
  - `emailVerificationTokenExpiresAt` (timestamp, nullable)
- Password reset fields:
  - `passwordResetToken` (text, nullable)
  - `passwordResetTokenExpiresAt` (timestamp, nullable)

These fields are used by the AuthService to handle optional email verification and password reset flows.

##### 2.3 DTOs for Profile & Settings

- `UpdateUserDto`
  - Optional `email` (validated as email)
  - Optional `name` (string)
  - Optional `avatarUrl` (string placeholder for future file-upload integration)

- `ChangePasswordDto`
  - `currentPassword` (string, `MinLength(8)`)
  - `newPassword` (string, `MinLength(8)`)

- `UpdateUserSettingsDto`
  - Optional `timezone` (string)
  - Optional `language` (string)
  - Optional `notificationPreferences` (object)

- `UserResponseDto`
  - `id`, `email`, `name`, `createdAt`, `updatedAt`

- `UserSettingsResponseDto`
  - `id`, `timezone`, `language`, `notificationPreferences`, `createdAt`, `updatedAt`

##### 2.4 UsersService – Profile Management

Key methods:

- `getProfile(userId: string): Promise<UserResponseDto>`
  - Looks up user by `id`, throws `NotFoundException` if missing.
  - Returns DTO with basic profile fields.

- `updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto>`
  - Loads user, throws `NotFoundException` if missing.
  - If `email` is provided and changed:
    - Checks for another user with the same email.
    - Throws `ConflictException` if email is already taken.
  - Updates `name` if provided.
  - (Avatar handling left as a placeholder for future file-upload support.)
  - Saves and returns updated DTO.

- `changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void>`
  - Loads user, throws `NotFoundException` if missing.
  - Verifies `currentPassword` using `bcrypt.compare`.
  - On mismatch, throws `UnauthorizedException`.
  - Hashes `newPassword` and updates `passwordHash`.
  - Saves user.

##### 2.5 UsersService – Settings Management

Key methods:

- `getUserSettings(userId: string): Promise<UserSettingsResponseDto>`
  - Ensures user exists; throws `NotFoundException` otherwise.
  - Attempts to load settings by user relation.
  - If none exist, creates default settings tied to the user.
  - Returns DTO with timezone, language, and notification preferences.

- `updateUserSettings(userId: string, updateUserSettingsDto: UpdateUserSettingsDto): Promise<UserSettingsResponseDto>`
  - Ensures user exists.
  - Loads or creates `UserSettingsEntity` for the user.
  - Applies partial updates for:
    - `timezone`
    - `language`
    - `notificationPreferences` (object)
  - Saves and returns updated DTO.

##### 2.6 UsersController Endpoints (Protected by JWT)

Controller-level:
- `@Controller('users')`
- `@UseGuards(JwtAuthGuard)` – all routes require authentication.

Endpoints:

- `GET /users/me`
  - Uses `@CurrentUser()` to obtain `{ userId }` from JWT.
  - Returns profile via `UsersService.getProfile`.

- `PUT /users/me`
  - Body: `UpdateUserDto`
  - Uses `@CurrentUser()` to get `userId`.
  - Returns updated profile via `UsersService.updateProfile`.

- `PUT /users/me/password`
  - Body: `ChangePasswordDto`
  - Returns `204 No Content` on success.
  - No body returned; errors are raised on invalid current password or missing user.

- `GET /users/me/settings`
  - Returns user settings via `UsersService.getUserSettings`.

- `PUT /users/me/settings`
  - Body: `UpdateUserSettingsDto`
  - Returns updated settings DTO.

#### 3. Optional Email Verification & Password Reset Flows ✅

While full email delivery is not wired yet, the backend data and endpoints are ready for integration with a mail provider (e.g., Nodemailer + SMTP).

**Email Verification:**
- On registration:
  - Generates `emailVerificationToken` (random 32-byte hex).
  - Sets `emailVerificationTokenExpiresAt` to 24 hours in the future.
  - Stores both on the user.
  - Placeholder comment for sending verification email.

- `POST /auth/verify-email`
  - Body: `VerifyEmailDto` (`token` string).
  - Looks up user by token.
  - Validates:
    - Token existence.
    - Not already verified.
    - Not expired.
  - Marks user as verified:
    - `isEmailVerified = true`
    - Clears token and expiry fields.

**Password Reset:**

- `POST /auth/request-password-reset`
  - Body: `RequestPasswordResetDto` (`email`).
  - Looks up user by email.
  - If user does not exist, returns silently (does not leak existence).
  - Generates `passwordResetToken` and `passwordResetTokenExpiresAt` (1 hour).
  - Saves user.
  - Placeholder comment for sending reset email.

- `PUT /auth/reset-password`
  - Body: `ResetPasswordDto` (`token`, `newPassword`).
  - Looks up user by `passwordResetToken`.
  - Validates token existence and expiry.
  - Hashes `newPassword`, updates `passwordHash`.
  - Clears reset token and expiry fields.
  - Saves user.

### Benefits

- **Security:**
  - Passwords are hashed with `bcrypt`.
  - JWTs provide stateless authentication with configurable expiration.
  - Email verification and password reset tokens are time-limited and stored server-side.
  - Errors avoid leaking whether a specific email exists during password reset.

- **Developer Experience:**
  - Clear separation between Auth and Users modules.
  - Reusable `JwtAuthGuard` and `@CurrentUser` decorator.
  - DTOs enforce input validation and provide stable response contracts.

- **Extensibility:**
  - Email verification and reset flows ready for integration with any email provider.
  - User settings are flexible via `notificationPreferences` (JSON).
  - Avatar support can be implemented later via file-upload endpoints referencing `avatarUrl`.

- **Consistency:**
  - All user-facing auth/profile/settings operations follow the same patterns:
    - DTO validation
    - Service-layer business logic
    - Type-safe response DTOs

### Next Steps

After completing Phase 5, the application has:
- ✅ Secure registration and login with JWTs
- ✅ Protected routes via guards and a reusable current-user decorator
- ✅ User profile endpoints (view & update)
- ✅ User settings endpoints (view & update)
- ✅ Optional email verification and password reset flows wired at the backend level

**Ready for:** Phase 6 - Folders & Hierarchy Module

---

## Phase 6: Folders & Hierarchy Module

**Status:** Completed  
**Date Completed:** January 2026

### Overview

Phase 6 implements the complete Folders & Hierarchy Module, enabling users to organize their lists within a nested folder structure. This module supports:

- Full CRUD operations for folders with nesting support
- Folder tree retrieval with hierarchical relationships
- Folder movement within the hierarchy
- Maximum depth constraints to prevent excessive nesting
- Circular reference prevention to maintain data integrity
- Cascade deletion of folders (which automatically deletes child folders and lists)

### Objectives Completed

#### 1. FoldersModule Configuration ✅

**Files Modified:**
- `src/features/folders/folders.module.ts`

**Implementation Details:**
- Added `TypeOrmModule.forFeature([FolderEntity])` for repository injection
- Imported `AuthModule` for `JwtAuthGuard` usage
- Exported `FoldersService` for potential use in other modules

**Code Implementation:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([FolderEntity]),
    AuthModule,
  ],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
```

#### 2. DTOs Implementation ✅

**Files Created/Modified:**
- `src/features/folders/dto/create-folder.dto.ts`
- `src/features/folders/dto/update-folder.dto.ts`
- `src/features/folders/dto/move-folder.dto.ts`

**DTO Specifications:**

**CreateFolderDto:**
- `name` (string, required) - Folder name
- `workspaceId` (UUID, required) - Workspace to which the folder belongs
- `parentFolderId` (UUID, optional) - Parent folder ID for nesting (null for root folders)

**UpdateFolderDto:**
- `name` (string, optional) - New folder name

**MoveFolderDto:**
- `parentFolderId` (UUID, optional, nullable) - New parent folder ID (null to make folder a root)

#### 3. FoldersService Implementation ✅

**Files Modified:**
- `src/features/folders/folders.service.ts`

**Service Methods:**

##### 3.1 Create Folder (`create`)

**Functionality:**
- Creates a new folder with optional parent folder support for nesting
- Validates parent depth before creation to prevent exceeding maximum depth

**Implementation Details:**
- Accepts `CreateFolderDto` with `name`, `workspaceId`, and optional `parentFolderId`
- If `parentFolderId` is provided:
  - Calculates parent folder depth using `calculateFolderDepth()`
  - Throws `BadRequestException` if parent depth >= `MAX_FOLDER_DEPTH` (20 levels)
- Creates folder entity with workspace and parent relationships
- Saves folder to database via `folderRepository.save()`
- Returns created `FolderEntity`

**Code Snippet:**
```typescript
async create(createFolderDto: CreateFolderDto): Promise<FolderEntity> {
  const { name, workspaceId, parentFolderId } = createFolderDto;

  if (parentFolderId) {
    const parentDepth = await this.calculateFolderDepth(parentFolderId);
    if (parentDepth >= this.MAX_FOLDER_DEPTH) {
      throw new BadRequestException(
        `Maximum folder depth of ${this.MAX_FOLDER_DEPTH} levels would be exceeded`,
      );
    }
  }

  const folder = this.folderRepository.create({
    name,
    workspace: { id: workspaceId } as any,
    parent: parentFolderId ? ({ id: parentFolderId } as any) : null,
  });

  return this.folderRepository.save(folder);
}
```

##### 3.2 Get Single Folder (`findOne`)

**Functionality:**
- Retrieves a single folder by ID with full relationship data

**Implementation Details:**
- Accepts folder `id` (UUID)
- Uses `folderRepository.findOne()` with relations:
  - `parent` - Parent folder entity
  - `children` - Child folders array
  - `lists` - Lists contained in the folder
- Throws `NotFoundException` if folder doesn't exist
- Returns `FolderEntity` with populated relationships

##### 3.3 Update Folder (`update`)

**Functionality:**
- Updates folder properties (currently only name)

**Implementation Details:**
- Accepts folder `id` and `UpdateFolderDto`
- Loads folder from database
- Throws `NotFoundException` if folder doesn't exist
- Updates `name` if provided in DTO
- Saves and returns updated folder

##### 3.4 Move Folder (`move`)

**Functionality:**
- Moves a folder to a new parent (or makes it a root folder)
- Includes comprehensive validation to prevent invalid moves

**Implementation Details:**
- Accepts folder `id` and `MoveFolderDto`
- Loads folder and current parent relationship
- Throws `NotFoundException` if folder doesn't exist
- If `parentFolderId` is null/undefined:
  - Sets `parent` to null (makes folder a root)
  - Saves and returns
- If `parentFolderId` equals folder `id`:
  - Throws `BadRequestException`: "Folder cannot be its own parent"
- Validates circular reference using `wouldCreateCircularReference()`:
  - Prevents moving folder into its own descendant
  - Throws `BadRequestException` if circular reference would be created
- Validates depth:
  - Calculates new parent depth
  - Calculates resulting depth (new parent depth + 1)
  - Throws `BadRequestException` if result would exceed `MAX_FOLDER_DEPTH`
- Loads new parent folder
- Throws `NotFoundException` if new parent doesn't exist
- Updates folder's parent and saves

**Code Snippet:**
```typescript
async move(id: string, moveFolderDto: MoveFolderDto): Promise<FolderEntity> {
  // ... validation logic ...
  
  // Check circular reference
  const wouldCreateCycle = await this.wouldCreateCircularReference(
    id,
    parentFolderId,
  );
  if (wouldCreateCycle) {
    throw new BadRequestException(
      'Cannot move folder: would create a circular reference',
    );
  }

  // Check depth
  const newParentDepth = await this.calculateFolderDepth(parentFolderId);
  const newDepth = newParentDepth + 1;
  if (newDepth > this.MAX_FOLDER_DEPTH) {
    throw new BadRequestException(
      `Maximum folder depth of ${this.MAX_FOLDER_DEPTH} levels would be exceeded`,
    );
  }
  // ... move logic ...
}
```

##### 3.5 Delete Folder (`remove`)

**Functionality:**
- Deletes a folder and all its contents (cascade behavior handled by database)

**Implementation Details:**
- Accepts folder `id`
- Loads folder from database
- Throws `NotFoundException` if folder doesn't exist
- Uses `folderRepository.remove()` to delete folder
- Cascade deletion automatically handled by database:
  - Child folders are deleted (via `onDelete: 'CASCADE'` on `parent` relationship)
  - Lists in folder are deleted (via `onDelete: 'CASCADE'` on `List.folder` relationship)

##### 3.6 Get Workspace Folder Tree (`getWorkspaceTree`)

**Functionality:**
- Retrieves the folder hierarchy for a workspace

**Implementation Details:**
- Accepts `workspaceId`
- Fetches root folders (folders with `parent = null`) for the workspace
- Uses `IsNull()` TypeORM operator for null parent check
- Loads `children` relation to get immediate child folders
- Orders folders by name (ascending)
- Returns array of root `FolderEntity[]` with nested children populated

**Code Snippet:**
```typescript
async getWorkspaceTree(workspaceId: string): Promise<FolderEntity[]> {
  const roots = await this.folderRepository.find({
    where: {
      workspace: { id: workspaceId } as any,
      parent: IsNull(),
    },
    relations: ['children'],
    order: { name: 'ASC' },
  });

  return roots;
}
```

**Note:** Current implementation returns root folders with only immediate children. Can be optimized later for deeper recursion if needed (e.g., using recursive CTEs in PostgreSQL).

##### 3.7 Depth Calculation Helper (`calculateFolderDepth`)

**Functionality:**
- Calculates the depth of a folder by walking up the parent chain
- Detects circular references during traversal

**Implementation Details:**
- Accepts `folderId`
- Initializes depth counter and visited set
- Walks up parent chain:
  - Loads folder with `parent` relation
  - If parent exists, increments depth and continues
  - Stops when parent is null (reached root)
- Circular reference detection:
  - Tracks visited folder IDs in a Set
  - Throws `BadRequestException` if same folder is visited twice
- Safety check:
  - Prevents infinite loops with safety limit (`MAX_FOLDER_DEPTH * 2`)
  - Throws `BadRequestException` if safety limit exceeded
- Returns depth (0 for root folders, 1 for first-level children, etc.)

**Code Snippet:**
```typescript
private async calculateFolderDepth(folderId: string): Promise<number> {
  let depth = 0;
  let currentFolderId: string | null = folderId;
  const visited = new Set<string>();

  while (currentFolderId) {
    if (visited.has(currentFolderId)) {
      throw new BadRequestException(
        'Circular reference detected in folder hierarchy',
      );
    }

    visited.add(currentFolderId);

    const folder = await this.folderRepository.findOne({
      where: { id: currentFolderId },
      relations: ['parent'],
    });

    if (!folder || !folder.parent) {
      break;
    }

    depth++;
    currentFolderId = folder.parent.id;

    // Safety check
    if (depth > this.MAX_FOLDER_DEPTH * 2) {
      throw new BadRequestException(
        'Folder hierarchy depth calculation exceeded safety limit',
      );
    }
  }

  return depth;
}
```

##### 3.8 Circular Reference Prevention Helper (`wouldCreateCircularReference`)

**Functionality:**
- Checks if moving a folder would create a circular reference in the hierarchy

**Implementation Details:**
- Accepts `folderId` (folder being moved) and `newParentId` (proposed new parent)
- Walks up the parent chain from `newParentId`:
  - If at any point `currentParentId === folderId`, returns `true` (circular reference would be created)
  - Stops when root is reached (no more parents)
- Uses visited set to avoid redundant checks
- Returns `false` if no circular reference would be created

**Code Snippet:**
```typescript
private async wouldCreateCircularReference(
  folderId: string,
  newParentId: string,
): Promise<boolean> {
  let currentParentId: string | null = newParentId;
  const visited = new Set<string>();

  while (currentParentId) {
    if (currentParentId === folderId) {
      return true; // Circular reference would be created
    }

    if (visited.has(currentParentId)) {
      break; // Already checked this path
    }

    visited.add(currentParentId);

    const parent = await this.folderRepository.findOne({
      where: { id: currentParentId },
      relations: ['parent'],
    });

    if (!parent || !parent.parent) {
      break;
    }

    currentParentId = parent.parent.id;
  }

  return false;
}
```

#### 4. FoldersController Implementation ✅

**Files Modified:**
- `src/features/folders/folders.controller.ts`

**Controller Configuration:**
- `@Controller('folders')` - Base route: `/folders`
- `@UseGuards(JwtAuthGuard)` - All routes protected with JWT authentication

**Endpoints:**

##### 4.1 Create Folder
- **Route:** `POST /folders`
- **Body:** `CreateFolderDto`
- **Response:** `FolderEntity`
- **Functionality:** Creates a new folder (supports nesting via `parentFolderId`)

##### 4.2 Get Folder
- **Route:** `GET /folders/:id`
- **Params:** `id` (UUID)
- **Response:** `FolderEntity` (with `parent`, `children`, `lists` relations)
- **Functionality:** Retrieves a single folder with all relationships

##### 4.3 Update Folder
- **Route:** `PUT /folders/:id`
- **Params:** `id` (UUID)
- **Body:** `UpdateFolderDto`
- **Response:** `FolderEntity`
- **Functionality:** Updates folder name

##### 4.4 Move Folder
- **Route:** `PUT /folders/:id/move`
- **Params:** `id` (UUID)
- **Body:** `MoveFolderDto`
- **Response:** `FolderEntity`
- **Functionality:** Moves folder to new parent or makes it root

##### 4.5 Delete Folder
- **Route:** `DELETE /folders/:id`
- **Params:** `id` (UUID)
- **Response:** `void` (204 No Content)
- **Functionality:** Deletes folder (cascade deletes children and lists)

##### 4.6 Get Workspace Tree
- **Route:** `GET /folders/workspace/:workspaceId/tree`
- **Params:** `workspaceId` (UUID)
- **Response:** `FolderEntity[]`
- **Functionality:** Retrieves root folders for a workspace with immediate children

#### 5. Hierarchy Constraints Implementation ✅

**Files Modified:**
- `src/features/folders/folders.service.ts`

##### 5.1 Maximum Depth Constraint

**Configuration:**
- Constant: `MAX_FOLDER_DEPTH = 20`
- Represents practical limit (schema supports 100+ levels functionally)
- Configurable via constant (can be made environment-driven if needed)

**Depth Calculation:**
- Root folders have depth 0
- First-level children have depth 1
- Maximum allowed depth: 19 (20th level)
- Validation occurs in:
  - `create()` - Checks parent depth before creating child
  - `move()` - Checks resulting depth after move operation

**Validation Logic:**
- When creating: If `parentDepth >= MAX_FOLDER_DEPTH`, throw error
- When moving: If `newDepth > MAX_FOLDER_DEPTH`, throw error
- Error message: "Maximum folder depth of {MAX_FOLDER_DEPTH} levels would be exceeded"

##### 5.2 Circular Reference Prevention

**Protection Mechanisms:**
1. **Self-parent prevention:**
   - In `move()`: Checks if `parentFolderId === id`
   - Throws: "Folder cannot be its own parent"

2. **Descendant-parent prevention:**
   - In `move()`: Uses `wouldCreateCircularReference()` to check if new parent is a descendant
   - Throws: "Cannot move folder: would create a circular reference"

3. **Circular detection during depth calculation:**
   - In `calculateFolderDepth()`: Tracks visited folders
   - Throws: "Circular reference detected in folder hierarchy" if cycle found

**Algorithm:**
- When moving folder A to parent B:
  - Walk up from B's parent chain
  - If we encounter A at any point, circular reference would be created
  - Prevents scenarios like: A → B → C → A (invalid cycle)

##### 5.3 Safety Mechanisms

**Infinite Loop Prevention:**
- `calculateFolderDepth()` includes safety limit: `MAX_FOLDER_DEPTH * 2`
- Prevents infinite loops if unexpected circular reference exists
- Throws error if safety limit exceeded during calculation

**Validation Order in Move Operation:**
1. Check folder exists
2. Handle null parent case (make root)
3. Check self-parent
4. Check circular reference
5. Check depth constraint
6. Verify new parent exists
7. Perform move

### Key Implementation Details

#### 1. TypeORM Query Patterns

**Null Parent Query:**
- Uses `IsNull()` operator from TypeORM for null checks
- Example: `where: { parent: IsNull() }` finds root folders

**Relationship Loading:**
- Uses `relations` array in `findOne()` and `find()` to eagerly load:
  - `parent` - Parent folder entity
  - `children` - Array of child folders
  - `lists` - Lists contained in folder

**Ordering:**
- Folders ordered by `name` (ascending) in tree queries
- Enables consistent UI rendering

#### 2. Error Handling

**Exception Types:**
- `NotFoundException`: Folder or parent not found
- `BadRequestException`: Validation failures:
  - Maximum depth exceeded
  - Circular reference detected
  - Self-parent attempt
  - Safety limit exceeded

**Error Messages:**
- Descriptive messages explaining why operation failed
- Includes relevant context (max depth limit, etc.)

#### 3. Cascade Deletion

**Database-Level Cascading:**
- `FolderEntity.parent`: `onDelete: 'CASCADE'` - Deleting parent deletes children
- `ListEntity.folder`: `onDelete: 'CASCADE'` - Deleting folder deletes lists
- Ensures data consistency without manual cleanup

**Service-Level:**
- `remove()` uses `folderRepository.remove()` which respects cascade settings
- No need to manually delete children or lists

#### 4. Performance Considerations

**Current Implementation:**
- `getWorkspaceTree()` loads root folders with immediate children (2 levels)
- Simple and efficient for typical use cases
- Can be optimized for deeper trees if needed

**Future Optimizations:**
- PostgreSQL recursive CTEs for full tree loading
- Caching for frequently accessed workspace trees
- Pagination for workspaces with many root folders

**Depth Calculation:**
- Walks parent chain sequentially (one database query per level)
- Acceptable for typical depths (< 20 levels)
- Could be optimized with recursive queries or materialized paths if needed

### Benefits

**1. Data Integrity:**
- Maximum depth constraint prevents excessive nesting
- Circular reference prevention ensures valid hierarchy
- Cascade deletion ensures consistent state

**2. User Experience:**
- Clear error messages for invalid operations
- Efficient tree retrieval for UI rendering
- Flexible folder organization (up to 20 levels)

**3. Performance:**
- Reasonable depth limits prevent performance issues
- Efficient queries with proper relation loading
- Ready for optimization when needed

**4. Maintainability:**
- Clear separation of concerns (service vs. controller)
- Reusable helper methods (depth calculation, cycle detection)
- Comprehensive validation logic

### Directory Structure

```
src/features/folders/
├── entities/
│   └── folder.entity.ts
├── dto/
│   ├── create-folder.dto.ts
│   ├── update-folder.dto.ts
│   └── move-folder.dto.ts
├── folders.controller.ts
├── folders.service.ts
└── folders.module.ts
```

### Next Steps

After completing Phase 6, the application has:
- ✅ Complete folder CRUD operations
- ✅ Folder hierarchy management (create, move, delete)
- ✅ Workspace folder tree retrieval
- ✅ Maximum depth constraints (20 levels)
- ✅ Circular reference prevention
- ✅ Cascade deletion support

**Ready for:** Phase 7 - Lists Management

---

## Phase 7: Lists Management

**Status:** Completed  
**Date Completed:** January 2026

### Overview

Phase 7 implements the complete Lists Management layer on top of the existing TypeORM schema. It turns the `ListEntity` into a fully functional, API-driven feature with:

- CRUD operations for lists (create, read, update, delete)
- Archiving and unarchiving of lists
- Duplication of lists (with preparation for task duplication)
- Per-list settings: description, visibility, and default view configuration
- A reusable **List Templates** mechanism that allows saving and reusing list configurations

This phase builds directly upon:

- The ERD from Phase 4 (`ListEntity`, `StatusEntity`, `CustomFieldEntity`, etc.)
- The authentication and user context from Phase 5 (`JwtAuthGuard`, `@CurrentUser`)
- The organizational model from Phase 6 (folders and workspaces)

### Objectives Completed

#### 1. ListEntity Enhancements ✅

**File Modified:**
- `src/features/lists/entities/list.entity.ts`

**New Columns & Settings:**

- `description: string | null`
  - Type: `text`
  - Nullable: `true`
  - Purpose: Human-readable description/summary of the list.

- `isArchived: boolean`
  - Type: `boolean`
  - Column name: `is_archived`
  - Default: `false`
  - Purpose: Marks lists as archived without deleting them (soft-archive flag).

- `visibility: 'private' | 'shared'`
  - Type: `varchar(20)`
  - Default: `private`
  - Purpose: Controls high-level access semantics (private vs shared).

- `defaultViewConfig: { type?: 'kanban' | 'table' | 'calendar'; [key: string]: any } | null`
  - Type: `jsonb`
  - Column name: `default_view_config`
  - Nullable: `true`
  - Purpose: Stores view configuration for the list (e.g., default view type or other layout details).

**Existing Relationships (from Phase 4, unchanged structurally but now actively used):**

- `folder: FolderEntity | null` (Many-To-One, `folder_id`, `onDelete: 'CASCADE'`)
- `workspace: WorkspaceEntity` (Many-To-One, `workspace_id`, `onDelete: 'CASCADE'`)
- `statuses: StatusEntity[]` (One-To-Many)
- `tasks: TaskEntity[]` (One-To-Many)
- `iterations: IterationEntity[]` (One-To-Many)
- `customFields: CustomFieldEntity[]` (One-To-Many)
- `views: ViewEntity[]` (One-To-Many)
- `filterPresets: FilterPresetEntity[]` (One-To-Many)
- `listMembers: ListMemberEntity[]` (One-To-Many)

These enhancements enable:

- Rich list descriptions
- Archiving/unarchiving flows
- Visibility semantics for sharing
- Configurable default view behavior

#### 2. Lists DTOs Implementation ✅

**Files Created/Updated:**

- `src/features/lists/dto/create-list.dto.ts`
- `src/features/lists/dto/update-list.dto.ts`
- `src/features/lists/dto/list-response.dto.ts`
- `src/features/lists/dto/duplicate-list.dto.ts`
- `src/features/lists/dto/create-list-template.dto.ts`
- `src/features/lists/dto/list-template-response.dto.ts`
- `src/features/lists/dto/create-list-from-template.dto.ts`

**CreateListDto**

- Fields:
  - `name: string` (required, `@IsString()`, `@MinLength(1)`)
  - `description?: string` (optional, `@IsOptional()`, `@IsString()`)
  - `workspaceId: string` (required, `@IsUUID()`)
  - `folderId?: string` (optional, `@IsOptional()`, `@IsUUID()`)
  - `visibility?: 'private' | 'shared'` (optional, `@IsOptional()`, `@IsString()`)
  - `defaultViewConfig?: { type?: 'kanban' | 'table' | 'calendar'; [key: string]: any }` (optional)

**UpdateListDto**

- Fields (all optional, partial update):
  - `name?: string` (`@IsOptional()`, `@IsString()`, `@MinLength(1)`)
  - `description?: string` (`@IsOptional()`, `@IsString()`)
  - `visibility?: 'private' | 'shared'` (`@IsOptional()`, `@IsString()`)
  - `defaultViewConfig?: { type?: 'kanban' | 'table' | 'calendar'; [key: string]: any }` (`@IsOptional()`)

**ListResponseDto**

- Represents the shape of a list when returned from the API:
  - `id: string`
  - `name: string`
  - `description: string | null`
  - `isArchived: boolean`
  - `visibility: 'private' | 'shared'`
  - `defaultViewConfig: { type?: 'kanban' | 'table' | 'calendar'; [key: string]: any } | null`
  - `folderId: string | null`
  - `workspaceId: string`
  - `createdAt: Date`
  - `updatedAt: Date`

**DuplicateListDto**

- Fields:
  - `includeTasks?: boolean` (`@IsOptional()`, `@IsBoolean()`)
  - Purpose: Controls whether tasks should be copied when duplicating a list (tasks are not yet implemented in duplication logic, but DTO is ready).

**CreateListTemplateDto**

- Fields:
  - `name: string` (`@IsString()`, `@MinLength(1)`)
  - `description?: string` (`@IsOptional()`, `@IsString()`)
  - `isPublic?: boolean` (`@IsOptional()`, `@IsBoolean()`)
  - `workspaceId?: string` (`@IsUUID()`)
  - `templateConfig: { ... }` (`@IsObject()`)
    - `statuses?: Array<{ name: string; orderIndex: number; color?: string }>`
    - `customFields?: Array<{ name: string; type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox'; config?: any }>`
    - `defaultViewConfig?: { type?: 'kanban' | 'table' | 'calendar'; [key: string]: any }`
    - `visibility?: 'private' | 'shared'`
    - `[key: string]: any` - extensible configuration.

**ListTemplateResponseDto**

- Fields:
  - `id: string`
  - `name: string`
  - `description: string | null`
  - `isPublic: boolean`
  - `templateConfig: { ... }` (same structure as above)
  - `userId: string`
  - `workspaceId: string | null`
  - `createdAt: Date`
  - `updatedAt: Date`

**CreateListFromTemplateDto**

- Fields:
  - `name: string` (`@IsString()`, `@MinLength(1)`)
  - `description?: string` (`@IsOptional()`, `@IsString()`)
  - `workspaceId: string` (`@IsUUID()`)
  - `folderId?: string` (`@IsOptional()`, `@IsUUID()`)

#### 3. ListsModule Configuration ✅

**File Modified:**
- `src/features/lists/lists.module.ts`

**Implementation Details:**

- Imported TypeORM entities:
  - `ListEntity`
  - `StatusEntity` (for default statuses and template-based statuses)
  - `ListTemplateEntity` (new)
  - `CustomFieldEntity` (for template-based custom fields)
- Imported `AuthModule` for `JwtAuthGuard` and `@CurrentUser` usage.
- Exported `ListsService` for use by other modules if needed.

**Code Implementation:**

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ListEntity,
      StatusEntity,
      ListTemplateEntity,
      CustomFieldEntity,
    ]),
    AuthModule,
  ],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}
```

#### 4. ListTemplateEntity Implementation ✅

**File Created:**
- `src/features/lists/entities/list-template.entity.ts`

**Purpose:**

- Represents a reusable template for creating lists.
- Encapsulates all configuration necessary to recreate a list structure:
  - Statuses (columns)
  - Custom fields
  - Default view config
  - Visibility and other settings

**Columns:**

- `id: string`
  - UUID primary key.

- `name: string`
  - Human-friendly template name.

- `description: string | null`
  - Optional description of the template.

- `isPublic: boolean`
  - Indicates whether the template is public (available beyond its owner) or personal.

- `templateConfig: jsonb`
  - Column name: `template_config`
  - Structure:
    - `statuses?: Array<{ name: string; orderIndex: number; color?: string }>`
    - `customFields?: Array<{ name: string; type: 'text' | 'number' | 'date' | 'dropdown' | 'checkbox'; config?: any }>`
    - `defaultViewConfig?: { type?: 'kanban' | 'table' | 'calendar'; [key: string]: any }`
    - `visibility?: 'private' | 'shared'`
    - `[key: string]: any` (flexible for future options)

- Timestamps:
  - `createdAt: Date` (`@CreateDateColumn`, `created_at`)
  - `updatedAt: Date` (`@UpdateDateColumn`, `updated_at`)

**Relationships:**

- `user: UserEntity`
  - Many-To-One to `UserEntity`
  - Join column: `user_id`
  - `onDelete: 'CASCADE'` – deleting a user deletes its templates.

- `workspace: WorkspaceEntity | null`
  - Many-To-One to `WorkspaceEntity`
  - Join column: `workspace_id`
  - Nullable: `true` (templates can be global/user-level or workspace-specific).
  - `onDelete: 'CASCADE'` – deleting a workspace deletes its templates.

#### 5. ListsService Implementation ✅

**File Modified:**
- `src/features/lists/lists.service.ts`

**Repositories Injected:**

- `listRepository: Repository<ListEntity>`
- `statusRepository: Repository<StatusEntity>`
- `listTemplateRepository: Repository<ListTemplateEntity>`
- `customFieldRepository: Repository<CustomFieldEntity>`

**Core List Methods:**

##### 5.1 Create List (`create`)

- Accepts `CreateListDto`.
- Creates a new `ListEntity` with:
  - `name`
  - `description` (nullable)
  - `workspace` (via `{ id: workspaceId }`)
  - `folder` (via `{ id: folderId }` or `null`)
  - `visibility` (defaults to `'private'` if not provided)
  - `defaultViewConfig` (nullable)
  - `isArchived = false`
- Persists using `listRepository.save`.
- Calls `createDefaultStatuses(list.id)` to create default statuses: `Todo`, `Doing`, `Done`.
- Returns the list reloaded via `findOne(list.id)` to include relations.

##### 5.2 Find All Lists (`findAll`)

- Signature: `findAll(workspaceId?: string, folderId?: string | null)`
- Builds a dynamic `where` clause:
  - If `workspaceId` is provided: filters by `workspace: { id: workspaceId }`.
  - If `folderId` is provided and not `'null'`: filters by `folder: { id: folderId }`.
  - If `folderId` is `'null'` or `null`: filters by `folder: IsNull()` (root lists).
- Returns lists with `folder` and `workspace` relations loaded.
- Ordered by `createdAt` descending.

##### 5.3 Find One List (`findOne`)

- Loads a single `ListEntity` by `id` with relations:
  - `folder`
  - `workspace`
  - `statuses`
- Throws `NotFoundException('List not found')` if missing.

##### 5.4 Update List (`update`)

- Accepts `id` and `UpdateListDto`.
- Loads the list by `id`, throws `NotFoundException` if missing.
- Applies partial updates:
  - `name` (if provided)
  - `description` (if provided, null if empty)
  - `visibility` (if provided)
  - `defaultViewConfig` (nullable)
- Saves and returns the updated list.

##### 5.5 Delete List (`remove`)

- Loads list by `id`, throws `NotFoundException` if missing.
- Uses `listRepository.remove(list)`:
  - Cascade deletes related entities (statuses, tasks, etc.) as defined by ERD.

##### 5.6 Archive / Unarchive List (`archive`, `unarchive`)

- `archive(id: string)`:
  - Loads list, throws `NotFoundException` if missing.
  - If `isArchived` is already `true`, throws `BadRequestException('List is already archived')`.
  - Sets `isArchived = true` and saves.

- `unarchive(id: string)`:
  - Loads list, throws `NotFoundException` if missing.
  - If `isArchived` is already `false`, throws `BadRequestException('List is not archived')`.
  - Sets `isArchived = false` and saves.

##### 5.7 Duplicate List (`duplicate`)

- Accepts:
  - `id: string`
  - `DuplicateListDto` (`includeTasks?: boolean`)
- Loads original list with relations:
  - `statuses`
  - `tasks`
  - `customFields`
  - `folder`
  - `workspace`
- Throws `NotFoundException('List not found')` if original is missing.
- Creates a new list with:
  - `name: originalList.name + ' (Copy)'`
  - `description: originalList.description`
  - `workspace: originalList.workspace`
  - `folder: originalList.folder`
  - `visibility: originalList.visibility`
  - `defaultViewConfig: deep-cloned from original (if present)`
  - `isArchived = false`
- Saves the new list.
- Copies statuses:
  - For each original `StatusEntity`, creates a new one with the same `name` and `orderIndex` targeting the new list.
- If the original had no statuses, falls back to `createDefaultStatuses`.
- Task duplication is intentionally deferred to Phase 8 (Tasks Module). The method is structured to accommodate that future extension.
- Custom field duplication is similarly left as a future enhancement.
- Returns the new list via `findOne(newList.id)`.

##### 5.8 Default Status Creation Helper (`createDefaultStatuses`)

- Private method used by:
  - `create`
  - `duplicate` (when original has no statuses)
  - `createFromTemplate` (when template has no statuses)
- Creates statuses:
  - `Todo` (orderIndex: 0)
  - `Doing` (orderIndex: 1)
  - `Done` (orderIndex: 2)
- Associates them with the given `listId`.

#### 6. List Templates Service Logic ✅

**Template Methods in `ListsService`:**

##### 6.1 Create Template (`createTemplate`)

- Signature: `createTemplate(userId: string, dto: CreateListTemplateDto)`
- Creates a `ListTemplateEntity` with:
  - `name`, `description`
  - `isPublic` (default `false` if not provided)
  - `templateConfig` (statuses, custom fields, view config, visibility)
  - `user` relation via `{ id: userId }`
  - `workspace` relation via `{ id: workspaceId }` when provided, else `null`
- Saves and returns the template.

##### 6.2 Find All Templates (`findAllTemplates`)

- Signature: `findAllTemplates(userId?: string, workspaceId?: string, includePublic = true)`
- Behavior:
  - Initially queries templates filtered by:
    - `user` (if `userId` provided)
    - `workspace` (if `workspaceId` provided)
  - If `includePublic` is `true` and `userId` is provided:
    - Also loads all templates where `isPublic = true`.
    - Merges results and deduplicates by `id`.
- Returns templates with `user` and `workspace` relations hydrated.

##### 6.3 Find Template (`findTemplate`)

- Loads a template by `id` with `user` and `workspace` relations.
- Throws `NotFoundException('Template not found')` if missing.

##### 6.4 Create List from Template (`createFromTemplate`)

- Signature: `createFromTemplate(templateId: string, dto: CreateListFromTemplateDto)`
- Steps:
  1. Loads template via `findTemplate(templateId)`.
  2. (Optional) Placeholder for access-control checks when `!template.isPublic`.
  3. Extracts `name`, `description`, `workspaceId`, `folderId` from DTO.
  4. Extracts `templateConfig` from template.
  5. Creates a new `ListEntity`:
     - `name` from DTO
     - `description` from DTO (nullable)
     - `workspace` via `{ id: workspaceId }`
     - `folder` via `{ id: folderId }` or `null`
     - `visibility` from `templateConfig.visibility` (default `'private'`)
     - `defaultViewConfig` from `templateConfig.defaultViewConfig` (nullable)
     - `isArchived = false`
  6. Saves the list.
  7. Status creation:
     - If `templateConfig.statuses` is present and non-empty:
       - Creates `StatusEntity` records for each, with `name` + `orderIndex` for the new list.
     - Else:
       - Falls back to `createDefaultStatuses`.
  8. Custom field creation:
     - If `templateConfig.customFields` is present and non-empty:
       - For each, creates a `CustomFieldEntity` with `name`, `type`, `config`, and `list: savedList`.
  9. Returns the new list via `findOne(savedList.id)` with relations.

#### 7. ListsController Implementation ✅

**File Modified:**
- `src/features/lists/lists.controller.ts`

**Controller Configuration:**

- `@Controller('lists')`
- `@UseGuards(JwtAuthGuard)` – all list-related routes are protected by JWT.

**Imports:**

- `JwtAuthGuard` from `src/features/auth/jwt-auth.guard.ts`
- `@CurrentUser` decorator from `src/common/decorators/current-user.decorator.ts`
- DTOs: `CreateListDto`, `UpdateListDto`, `DuplicateListDto`, `CreateListTemplateDto`, `CreateListFromTemplateDto`
- Entities: `ListEntity`, `ListTemplateEntity`

**Endpoints:**

##### 7.1 Create List

- `POST /lists`
- Body: `CreateListDto`
- Response: `ListEntity`
- Behavior: Delegates to `ListsService.create`.

##### 7.2 Get Lists

- `GET /lists`
- Query parameters:
  - `workspaceId?: string`
  - `folderId?: string`
- Response: `ListEntity[]`
- Behavior: Delegates to `ListsService.findAll` with filtering by workspace/folder and special handling of `folderId=null` for root lists (handled in service via `IsNull()`).

##### 7.3 Get Single List

- `GET /lists/:id`
- Path parameter: `id: string`
- Response: `ListEntity`
- Behavior: Delegates to `ListsService.findOne`.

##### 7.4 Update List

- `PUT /lists/:id`
- Path parameter: `id: string`
- Body: `UpdateListDto`
- Response: `ListEntity`
- Behavior: Delegates to `ListsService.update`.

##### 7.5 Delete List

- `DELETE /lists/:id`
- Path parameter: `id: string`
- Response: `void`
- Behavior: Delegates to `ListsService.remove`.

##### 7.6 Archive List

- `POST /lists/:id/archive`
- Path parameter: `id: string`
- Response: `ListEntity`
- Behavior: Sets `isArchived = true` via `ListsService.archive`.

##### 7.7 Unarchive List

- `POST /lists/:id/unarchive`
- Path parameter: `id: string`
- Response: `ListEntity`
- Behavior: Sets `isArchived = false` via `ListsService.unarchive`.

##### 7.8 Duplicate List

- `POST /lists/:id/duplicate`
- Path parameter: `id: string`
- Body: `DuplicateListDto`
- Response: `ListEntity`
- Behavior: Delegates to `ListsService.duplicate` to clone list structure (statuses, base config; tasks to be handled in Phase 8).

##### 7.9 Create Template

- `POST /lists/templates`
- Requires authentication (`JwtAuthGuard`) and uses `@CurrentUser` to get `{ userId }`.
- Body: `CreateListTemplateDto`
- Response: `ListTemplateEntity`
- Behavior: Delegates to `ListsService.createTemplate`.

##### 7.10 Get Templates

- `GET /lists/templates`
- Query parameters:
  - `workspaceId?: string`
  - `includePublic?: string` (treated as boolean; default: `true` if omitted)
- Uses `@CurrentUser` for `userId`.
- Response: `ListTemplateEntity[]`
- Behavior: Delegates to `ListsService.findAllTemplates` with merged personal + public templates.

##### 7.11 Get Template by ID

- `GET /lists/templates/:id`
- Path parameter: `id: string`
- Response: `ListTemplateEntity`
- Behavior: Delegates to `ListsService.findTemplate`.

##### 7.12 Create List from Template

- `POST /lists/templates/:id/create-list`
- Path parameter: `id: string` (template ID)
- Body: `CreateListFromTemplateDto`
- Response: `ListEntity`
- Behavior: Delegates to `ListsService.createFromTemplate`.

#### 8. REST Client Endpoints ✅

**File Modified:**
- `rest_client.http`

**New/Updated Sections:**

- **Lists – CRUD & Settings**
  - `POST /lists` – Create List
  - `GET /lists?workspaceId=...&folderId=...` – Get Lists for workspace/folder
  - `GET /lists?workspaceId=...&folderId=null` – Get root Lists (no folder)
  - `GET /lists/{listId}` – Get List by ID
  - `PUT /lists/{listId}` – Update List (name, description, visibility, defaultViewConfig)
  - `DELETE /lists/{listId}` – Delete List
  - `POST /lists/{listId}/archive` – Archive List
  - `POST /lists/{listId}/unarchive` – Unarchive List
  - `POST /lists/{listId}/duplicate` – Duplicate List (with `includeTasks` flag)

- **List Templates**
  - `POST /lists/templates` – Create template
  - `GET /lists/templates?workspaceId=...&includePublic=true` – Get templates (personal + public)
  - `GET /lists/templates/{templateId}` – Get a single template
  - `POST /lists/templates/{templateId}/create-list` – Create list from template

All examples are wired to use `Authorization: Bearer {{accessToken}}` and realistic JSON payloads, consistent with previous phases.

### Benefits

**1. Feature Completeness**

- Lists are now first-class resources with:
  - Full CRUD
  - Archiving/unarchiving
  - Duplication
  - Rich settings (description, visibility, default view)

**2. Reusability via Templates**

- Teams can standardize list structures using templates:
  - Predefined statuses
  - Predefined custom fields
  - Default view configuration and visibility
- Templates can be:
  - **User-scoped** (linked to a user)
  - **Workspace-scoped** (linked to a workspace)
  - **Public** (when `isPublic = true`)

**3. Consistency with ERD and Phases 4–6**

- Uses the existing:
  - `StatusEntity` for columns
  - `CustomFieldEntity` for per-list custom field definitions
  - `WorkspaceEntity` and `FolderEntity` for organization
- Honors cascade rules and relationships defined in Phase 4.

**4. Extensibility**

- Duplicate List and List Templates are structured to be extended in:
  - Phase 8 (Tasks Module) to duplicate tasks, subtasks, checklists, etc.
  - Future phases (Templates & Automation) for more advanced template workflows.

### Next Steps

After completing Phase 7, the application has:

- ✅ Full list CRUD operations with rich metadata
- ✅ Archive/unarchive semantics for lists
- ✅ List duplication support (structure-focused, ready for task duplication)
- ✅ Per-list visibility and default view configuration
- ✅ A reusable List Templates system for creating standardized list setups

**Ready for:** Phase 8 - Kanban Board Module

---

## Phase 8: Kanban Board Module ✅

**Status:** Completed  
**Date Completed:** January 2026

### Overview

Phase 8 implements the complete Kanban Board Module, providing a comprehensive task management system with advanced features for organizing, tracking, and managing work items. This phase includes:

- **Columns (Statuses)**: Full CRUD operations with ordering and customization
- **Tasks**: Complete task management with rich metadata, dependencies, custom fields, and archiving
- **Subtasks**: Hierarchical task breakdown with completion tracking
- **Task Checklists**: Separate checklists for task organization
- **Filtering & Search**: Advanced filtering with AND/OR logic and full-text search
- **Sorting**: Multi-field sorting including assignee and custom fields
- **Task Dependencies**: Directed dependency graph with circular dependency prevention
- **Task Custom Fields**: Flexible custom field system with type-specific validation
- **Filter Presets**: User-scoped saved filter configurations

### Objectives Completed

#### 1. Columns (Statuses) ✅

**Status:** Completed (Referenced from Phase 7 integration)

**Implementation Details:**
- Status management was implemented as part of the Lists Module
- Statuses represent Kanban board columns
- Full CRUD operations with ordering and color customization
- Default statuses created on list creation (Todo, Doing, Done)

**Endpoints:**
- `POST /statuses` - Create status
- `GET /statuses?listId=...` - Get all statuses for a list
- `GET /statuses/:id` - Get status by ID
- `PUT /statuses/:id` - Update status
- `DELETE /statuses/:id` - Delete status
- `PUT /statuses/reorder?listId=...` - Reorder statuses

#### 2. Tasks ✅

**Files Created:**
- `src/features/tasks/dto/create-task.dto.ts`
- `src/features/tasks/dto/update-task.dto.ts`
- `src/features/tasks/dto/task-response.dto.ts`
- `src/features/tasks/dto/move-task.dto.ts`
- `src/features/tasks/dto/assign-task.dto.ts`
- `src/features/tasks/dto/add-tag-to-task.dto.ts`

**Files Modified:**
- `src/features/tasks/entities/task.entity.ts`
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`
- `src/features/tasks/tasks.module.ts`

**Implementation Details:**

##### 2.1 Task Entity Extension

**Entity Updates:**
- Added `dueDate: Date | null` - Task due date (date type, nullable)
- Added `orderPosition: number` - Position within status column (integer, default: 0)
- Added `isArchived: boolean` - Archive flag (boolean, default: false)
- Updated `status` relationship to `StatusEntity | null` to reflect nullable nature
- Updated `priority` relationship with `nullable: true` option

**Code Implementation:**
```typescript
// src/features/tasks/entities/task.entity.ts
@Column({
  type: 'date',
  name: 'due_date',
  nullable: true,
})
dueDate: Date | null;

@Column({
  type: 'integer',
  name: 'order_position',
  default: 0,
})
orderPosition: number;

@Column({
  type: 'boolean',
  name: 'is_archived',
  default: false,
})
isArchived: boolean;
```

##### 2.2 Task CRUD Operations

**Create Task (`create`):**
- Validates list exists
- Validates status belongs to list (if provided)
- Validates priority exists (if provided)
- Auto-calculates `orderPosition` if not provided (increments highest position)
- Supports: `title`, `description`, `listId`, `statusId`, `priorityId`, `dueDate`, `orderPosition`

**Read Tasks (`findAll`):**
- Supports filtering by `listId`, `statusId`, `includeArchived`
- Supports sorting by various fields (see Sorting section)
- Returns tasks with relations: `list`, `status`, `priority`, `assignments`, `taskTags`

**Read Single Task (`findOne`):**
- Returns task with all relations loaded
- Includes: `list`, `status`, `priority`, `assignments`, `assignments.user`, `taskTags`, `taskTags.tag`, `subtasks`, `checklists`, `comments`, `attachments`

**Update Task (`update`):**
- Updates task properties
- Validates status belongs to list (if changing)
- Supports: `title`, `description`, `statusId`, `priorityId`, `dueDate`, `orderPosition`

**Delete Task (`remove`):**
- Cascade deletes all related entities (assignments, subtasks, checklists, comments, attachments, tags, dependencies, custom field values)

##### 2.3 Task Movement

**Move Task (`move`):**
- Moves task between statuses (columns)
- Updates `orderPosition` within new status
- Validates target status belongs to same list
- Auto-calculates position if not provided

**Code Implementation:**
```typescript
async move(id: string, moveTaskDto: MoveTaskDto): Promise<TaskEntity> {
  const { statusId, orderPosition } = moveTaskDto;
  // Validates status, updates task position
  // Returns updated task
}
```

##### 2.4 Task Archiving

**Archive Task (`archive`):**
- Sets `isArchived = true`
- Task is excluded from default queries unless `includeArchived = true`

**Unarchive Task (`unarchive`):**
- Sets `isArchived = false`
- Task becomes visible in default queries

##### 2.5 Task Assignments

**Assign User (`assignUser`):**
- Creates assignment relationship between user and task
- Validates user exists
- Validates task exists
- Prevents duplicate assignments

**Unassign User (`unassignUser`):**
- Removes assignment relationship
- Validates assignment exists

##### 2.6 Task Tags

**Add Tag (`addTag`):**
- Adds tag to task via `TaskTag` join entity
- Validates tag exists
- Validates tag belongs to same workspace as task's list
- Prevents duplicate tag assignments

**Remove Tag (`removeTag`):**
- Removes tag from task
- Validates `TaskTag` relationship exists

##### 2.7 Task Endpoints

**Controller Endpoints:**
- `POST /tasks` - Create task
- `GET /tasks?listId=...&statusId=...&includeArchived=...&sortField=...&sortDirection=...` - Get all tasks
- `GET /tasks/:id` - Get single task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `PUT /tasks/:id/move` - Move task to different status
- `POST /tasks/:id/archive` - Archive task
- `POST /tasks/:id/unarchive` - Unarchive task
- `POST /tasks/:id/assign` - Assign user to task
- `DELETE /tasks/:id/assign/:userId` - Unassign user from task
- `POST /tasks/:id/tags` - Add tag to task
- `DELETE /tasks/:id/tags/:tagId` - Remove tag from task

#### 3. Subtasks ✅

**Files Created:**
- `src/features/tasks/dto/create-subtask.dto.ts`
- `src/features/tasks/dto/update-subtask.dto.ts`
- `src/features/tasks/dto/subtask-response.dto.ts`
- `src/features/tasks/dto/move-subtask.dto.ts`

**Files Modified:**
- `src/features/tasks/entities/subtask.entity.ts` (already existed)
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`
- `src/features/tasks/tasks.module.ts`

**Implementation Details:**

##### 3.1 Subtask Entity

**Entity Structure:**
- `id: string` - UUID primary key
- `title: string` - Subtask title
- `isCompleted: boolean` - Completion status (default: false)
- `orderIndex: number` - Position within task (default: 0)
- `task: TaskEntity` - Parent task relationship (ManyToOne, CASCADE delete)

##### 3.2 Subtask CRUD Operations

**Create Subtask (`createSubtask`):**
- Validates parent task exists
- Auto-calculates `orderIndex` if not provided
- Supports: `title`, `taskId`, `orderIndex`

**Read Subtasks (`findAllSubtasks`):**
- Returns all subtasks for a task
- Ordered by `orderIndex` ascending

**Read Single Subtask (`findOneSubtask`):**
- Returns subtask with parent task relation

**Update Subtask (`updateSubtask`):**
- Updates subtask properties
- Supports: `title`, `isCompleted`, `orderIndex`
- Used to mark subtasks as complete/incomplete

**Delete Subtask (`removeSubtask`):**
- Removes subtask from task
- Validates subtask exists

##### 3.3 Move Subtask Between Tasks

**Move Subtask (`moveSubtask`):**
- Moves subtask from one task to another
- Validates both source and target tasks exist
- Validates tasks are in the same list
- Updates `orderIndex` within target task
- Auto-calculates position if not provided

**Code Implementation:**
```typescript
async moveSubtask(
  id: string,
  moveSubtaskDto: MoveSubtaskDto,
): Promise<SubtaskEntity> {
  const { targetTaskId, orderIndex } = moveSubtaskDto;
  // Validates tasks, updates subtask assignment
  // Returns updated subtask
}
```

##### 3.4 Subtask Endpoints

**Controller Endpoints:**
- `POST /tasks/subtasks` - Create subtask
- `GET /tasks/:taskId/subtasks` - Get all subtasks for task
- `GET /tasks/subtasks/:id` - Get single subtask
- `PUT /tasks/subtasks/:id` - Update subtask
- `DELETE /tasks/subtasks/:id` - Delete subtask
- `PUT /tasks/subtasks/:id/move` - Move subtask to another task

**Route Ordering:**
- Subtask endpoints must be declared before generic `GET /tasks/:id` route to avoid routing conflicts

#### 4. Task Checklists ✅

**Files Created:**
- `src/features/tasks/dto/create-checklist.dto.ts`
- `src/features/tasks/dto/update-checklist.dto.ts`
- `src/features/tasks/dto/checklist-response.dto.ts`
- `src/features/tasks/dto/create-checklist-item.dto.ts`
- `src/features/tasks/dto/update-checklist-item.dto.ts`
- `src/features/tasks/dto/checklist-item-response.dto.ts`
- `src/features/tasks/dto/reorder-checklist-items.dto.ts`

**Files Modified:**
- `src/features/tasks/entities/checklist.entity.ts` (already existed)
- `src/features/tasks/entities/checklist-item.entity.ts` (already existed)
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`
- `src/features/tasks/tasks.module.ts`

**Implementation Details:**

##### 4.1 Checklist Entity

**Entity Structure:**
- `id: string` - UUID primary key
- `title: string` - Checklist title
- `orderIndex: number` - Position within task (default: 0)
- `task: TaskEntity` - Parent task relationship (ManyToOne, CASCADE delete)
- `checklistItems: ChecklistItemEntity[]` - One-to-Many relationship

##### 4.2 Checklist CRUD Operations

**Create Checklist (`createChecklist`):**
- Validates parent task exists
- Auto-calculates `orderIndex` if not provided
- Supports: `title`, `taskId`, `orderIndex`

**Read Checklists (`findAllChecklists`):**
- Returns all checklists for a task
- Ordered by `orderIndex` ascending

**Read Single Checklist (`findOneChecklist`):**
- Returns checklist with checklist items relation

**Update Checklist (`updateChecklist`):**
- Updates checklist properties
- Supports: `title`, `orderIndex`

**Delete Checklist (`removeChecklist`):**
- Removes checklist (cascade deletes all checklist items)
- Validates checklist exists

##### 4.3 Checklist Item Operations

**Create Checklist Item (`createChecklistItem`):**
- Validates parent checklist exists
- Auto-calculates `orderIndex` if not provided
- Supports: `title`, `checklistId`, `orderIndex`

**Read Checklist Items (`findAllChecklistItems`):**
- Returns all items for a checklist
- Ordered by `orderIndex` ascending

**Read Single Checklist Item (`findOneChecklistItem`):**
- Returns checklist item with parent checklist relation

**Update Checklist Item (`updateChecklistItem`):**
- Updates checklist item properties
- Supports: `title`, `isCompleted`, `orderIndex`
- Used to mark items as complete/incomplete

**Delete Checklist Item (`removeChecklistItem`):**
- Removes checklist item
- Validates checklist item exists

##### 4.4 Reorder Checklist Items

**Reorder Checklist Items (`reorderChecklistItems`):**
- Bulk updates order indices for multiple checklist items
- Validates all items belong to the checklist
- Prevents duplicate order indices
- Supports atomic reordering

**DTO Structure:**
```typescript
export class ChecklistItemOrderItemDto {
  @IsUUID()
  itemId: string;
  @IsInt()
  @Min(0)
  orderIndex: number;
}

export class ReorderChecklistItemsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemOrderItemDto)
  itemOrders: ChecklistItemOrderItemDto[];
}
```

##### 4.5 Checklist Endpoints

**Controller Endpoints:**
- `POST /tasks/checklists` - Create checklist
- `GET /tasks/:taskId/checklists` - Get all checklists for task
- `GET /tasks/checklists/:id` - Get single checklist
- `PUT /tasks/checklists/:id` - Update checklist
- `DELETE /tasks/checklists/:id` - Delete checklist
- `POST /tasks/checklist-items` - Create checklist item
- `GET /tasks/:checklistId/checklist-items` - Get all items for checklist
- `GET /tasks/checklist-items/:id` - Get single checklist item
- `PUT /tasks/checklist-items/:id` - Update checklist item
- `DELETE /tasks/checklist-items/:id` - Delete checklist item
- `PUT /tasks/checklists/:checklistId/reorder-items` - Reorder checklist items

**Route Ordering:**
- Checklist endpoints must be declared before generic `GET /tasks/:id` route to avoid routing conflicts

#### 5. Filtering & Search ✅

**Files Created:**
- `src/features/tasks/dto/filter-tasks.dto.ts`
- `src/features/tasks/dto/search-tasks.dto.ts`

**Files Modified:**
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`

**Implementation Details:**

##### 5.1 Filter DTOs

**FilterConditionDto:**
- `field: string` - Field to filter by (`assignee`, `status`, `priority`, `tag`, `dueDate`, `list`, `isArchived`)
- `operator: FilterOperator` - Filter operator (see operators below)
- `value?: any` - Filter value (type depends on field and operator)

**FilterGroupDto:**
- `logic: FilterLogic` - Group logic (`and` or `or`)
- `conditions: FilterConditionDto[]` - Array of filter conditions
- `groups?: FilterGroupDto[]` - Optional nested filter groups (supports unlimited nesting)

**FilterTasksDto:**
- `listId?: string` - Optional list filter
- `filters?: FilterGroupDto` - Optional filter group
- `includeArchived?: boolean` - Include archived tasks (default: false)

**Filter Operators:**
```typescript
export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUAL = 'greater_than_or_equal',
  LESS_THAN_OR_EQUAL = 'less_than_or_equal',
  IS_NULL = 'is_null',
  IS_NOT_NULL = 'is_not_null',
}
```

##### 5.2 Complex Filtering Implementation

**Filter Tasks Method (`filterTasks`):**
- Uses TypeORM QueryBuilder for dynamic query construction
- Supports nested AND/OR logic groups
- Applies filters recursively through nested groups

**Filter Field Handlers:**

**Assignee Filter (`applyAssigneeFilter`):**
- Joins with `assignments` and `user` tables
- Supports `equals`, `not_equals`, `in`, `not_in`, `is_null`, `is_not_null`
- Filters tasks by assigned users

**Status Filter (`applyStatusFilter`):**
- Joins with `status` table
- Supports `equals`, `not_equals`, `in`, `not_in`
- Filters tasks by status/column

**Priority Filter (`applyPriorityFilter`):**
- Joins with `priority` table
- Supports `equals`, `not_equals`, `in`, `not_in`, `is_null`, `is_not_null`
- Filters tasks by priority level

**Tag Filter (`applyTagFilter`):**
- Joins with `taskTags` and `tag` tables
- Supports `equals`, `not_equals`, `in`, `not_in`
- Filters tasks by tags (handles multiple tags per task)

**Due Date Filter (`applyDueDateFilter`):**
- Filters on `dueDate` column
- Supports `equals`, `not_equals`, `greater_than`, `less_than`, `greater_than_or_equal`, `less_than_or_equal`, `is_null`, `is_not_null`
- Handles date comparisons with DATE() function for equality

**List Filter (`applyListFilter`):**
- Filters on task's list
- Supports `equals`, `not_equals`, `in`, `not_in`

**Archived Filter (`applyArchivedFilter`):**
- Filters on `isArchived` boolean field
- Supports `equals` operator with boolean value

**Code Implementation:**
```typescript
private applyFilterGroup(
  queryBuilder: SelectQueryBuilder<TaskEntity>,
  filterGroup: FilterGroupDto,
  defaultLogic: 'and' | 'or',
): void {
  const logic = filterGroup.logic || defaultLogic;
  const method = logic === 'and' ? 'andWhere' : 'orWhere';
  
  // Apply conditions
  // Apply nested groups recursively
}
```

##### 5.3 Full-Text Search

**Search Tasks Method (`searchTasks`):**
- Searches in `title` and `description` fields
- Uses case-insensitive `LIKE` queries
- Supports optional `listId` filter
- Excludes archived tasks by default

**Code Implementation:**
```typescript
async searchTasks(
  searchTasksDto: SearchTasksDto,
  sortField?: SortField,
  sortDirection?: SortDirection,
  customFieldId?: string,
): Promise<TaskEntity[]> {
  // Uses QueryBuilder with LIKE for title and description
  // Supports sorting (see Sorting section)
}
```

##### 5.4 Filter & Search Endpoints

**Controller Endpoints:**
- `POST /tasks/filter?sortField=...&sortDirection=...` - Filter tasks with complex conditions
- `POST /tasks/search?sortField=...&sortDirection=...` - Search tasks by title/description

**Example Filter Request:**
```json
{
  "listId": "list-uuid-here",
  "includeArchived": false,
  "filters": {
    "logic": "and",
    "conditions": [
      {
        "field": "status",
        "operator": "in",
        "value": ["status-uuid-1", "status-uuid-2"]
      },
      {
        "field": "priority",
        "operator": "not_equals",
        "value": "priority-uuid-here"
      },
      {
        "conditions": [
          {
            "field": "tag",
            "operator": "equals",
            "value": "tag-uuid-1"
          },
          {
            "field": "tag",
            "operator": "equals",
            "value": "tag-uuid-2"
          }
        ],
        "logic": "or"
      }
    ]
  }
}
```

#### 6. Sorting ✅

**Files Created:**
- `src/features/tasks/dto/sort-tasks.dto.ts`

**Files Modified:**
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`

**Implementation Details:**

##### 6.1 Sort DTOs

**SortField Enum:**
```typescript
export enum SortField {
  DUE_DATE = 'dueDate',
  PRIORITY = 'priority',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  TITLE = 'title',
  ORDER_POSITION = 'orderPosition',
  ASSIGNEE = 'assignee',
  CUSTOM_FIELD = 'customField',
}
```

**SortDirection Enum:**
```typescript
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}
```

##### 6.2 Sorting Implementation

**Sorting Strategy:**
- Primary sort by selected field and direction
- Secondary sort by `orderPosition` (ASC) for consistent ordering
- NULL values handled appropriately (tasks without assignees/custom fields appear last)

**Standard Field Sorting:**
- `dueDate` - Sorts by due date (NULLs last)
- `priority` - Sorts by priority's `orderIndex` (NULLs last)
- `createdAt` - Sorts by creation timestamp
- `updatedAt` - Sorts by last update timestamp
- `title` - Alphabetical sort
- `orderPosition` - Sorts by position within status

##### 6.3 Sort by Assignee (Complex)

**Implementation:**
- Handles tasks with multiple assignees
- Uses PostgreSQL subquery: `MIN(u.name)` for ASC, `MAX(u.name)` for DESC
- NULL handling: Tasks without assignees appear last
- Secondary sort by `orderPosition` for consistency

**Code Implementation:**
```typescript
if (sortField === SortField.ASSIGNEE) {
  const assigneeOrderBy =
    sortDirection === SortDirection.ASC
      ? '(SELECT MIN(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)'
      : '(SELECT MAX(u.name) FROM assignments a JOIN users u ON a.user_id = u.id WHERE a.task_id = task.id)';

  queryBuilder
    .orderBy(`CASE WHEN ${assigneeOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
    .addOrderBy(assigneeOrderBy, sortDirection);
}
```

##### 6.4 Sort by Custom Fields

**Implementation:**
- Requires `customFieldId` parameter
- Validates custom field exists and belongs to list
- Type-specific sorting:
  - **Text/Dropdown**: Alphabetical (`value::text`)
  - **Number**: Numerical (`(value::jsonb)::numeric`)
  - **Date**: Date sorting (`(value::jsonb)::text::date`)
- NULL handling: Tasks without custom field values appear last

**Code Implementation:**
```typescript
if (sortField === SortField.CUSTOM_FIELD) {
  // Verify custom field exists
  const customField = await this.customFieldRepository.findOne(...);
  
  let valueOrderBy: string;
  switch (customField.type) {
    case 'text':
    case 'dropdown':
      valueOrderBy = `(SELECT cfv.value::text FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
      break;
    case 'number':
      valueOrderBy = `(SELECT (cfv.value::jsonb)::numeric FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
      break;
    case 'date':
      valueOrderBy = `(SELECT (cfv.value::jsonb)::text::date FROM task_custom_field_values cfv WHERE cfv.task_id = task.id AND cfv.custom_field_id = :customFieldId)`;
      break;
  }
  
  queryBuilder
    .setParameter('customFieldId', customFieldId)
    .orderBy(`CASE WHEN ${valueOrderBy} IS NULL THEN 1 ELSE 0 END`, 'ASC')
    .addOrderBy(valueOrderBy, sortDirection);
}
```

##### 6.5 Sorting Integration

**Integrated in Methods:**
- `findAll` - Supports sorting with all fields
- `filterTasks` - Supports sorting on filtered results
- `searchTasks` - Supports sorting on search results

**Query Parameters:**
- `sortField?: SortField` - Field to sort by
- `sortDirection?: SortDirection` - Sort direction (default: ASC)
- `customFieldId?: string` - Required when `sortField = customField`

##### 6.6 Sorting Endpoints

**Controller Endpoints:**
- All task listing endpoints support sorting:
  - `GET /tasks?sortField=...&sortDirection=...`
  - `POST /tasks/filter?sortField=...&sortDirection=...&customFieldId=...`
  - `POST /tasks/search?sortField=...&sortDirection=...&customFieldId=...`

#### 7. Task Dependencies ✅

**Files Created:**
- `src/features/tasks/dto/create-task-dependency.dto.ts`
- `src/features/tasks/dto/task-dependency-response.dto.ts`

**Files Modified:**
- `src/features/tasks/entities/task-dependency.entity.ts` (already existed)
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`
- `src/features/tasks/tasks.module.ts`

**Implementation Details:**

##### 7.1 Dependency Entity

**Entity Structure:**
- `id: string` - UUID primary key
- `task: TaskEntity` - Dependent task (ManyToOne, CASCADE delete)
- `dependsOnTask: TaskEntity` - Task that this task depends on (ManyToOne, CASCADE delete)
- `type: 'blocks' | 'blocked_by'` - Dependency type
  - `blocked_by`: Task depends on `dependsOnTask` (task → dependsOnTask)
  - `blocks`: `dependsOnTask` depends on task (dependsOnTask → task)
- `createdAt: Date` - Creation timestamp

##### 7.2 Dependency Logic

**Dependency Graph Interpretation:**
- Directed graph where edges represent dependencies
- `blocked_by`: If A is blocked by B, then A → B (A depends on B)
- `blocks`: If A blocks B, then B → A (B depends on A)

##### 7.3 Create Dependency

**Method: `createTaskDependency`**
- Validates both tasks exist
- Prevents self-dependency (task cannot depend on itself)
- Validates tasks are in the same list
- Checks for duplicate dependencies
- **Circular Dependency Detection**: Prevents creating cycles in dependency graph

**Circular Dependency Detection:**
- Uses BFS (Breadth-First Search) to detect cycles
- Before adding dependency, checks if reverse path exists
- If path from target to source exists, adding dependency would create cycle

**Code Implementation:**
```typescript
private async wouldCreateCircularDependency(
  taskId: string,
  dependsOnTaskId: string,
  type: 'blocks' | 'blocked_by',
): Promise<boolean> {
  // Normalizes dependency direction
  // Checks if reverse path exists using BFS
  return this.hasPathToTask(targetTaskId, sourceTaskId);
}

private async hasPathToTask(
  fromTaskId: string,
  toTaskId: string,
): Promise<boolean> {
  // BFS traversal to find path from fromTaskId to toTaskId
  // Handles both 'blocked_by' and 'blocks' relationship types
}
```

##### 7.4 Find Dependencies

**Method: `findAllTaskDependencies`**
- Returns dependencies in both directions:
  - `blocking`: Tasks that depend on this task (this task blocks them)
  - `blockedBy`: Tasks this task depends on (this task is blocked by them)

**Implementation Logic:**
- Queries dependencies where task is the dependent (`blocked_by` with task=thisTask)
- Queries dependencies where task blocks others (`blocks` with dependsOnTask=thisTask)
- Also handles reverse relationships for complete dependency graph

##### 7.5 Remove Dependency

**Method: `removeTaskDependency`**
- Removes dependency relationship
- Validates dependency exists
- No circular dependency check needed (removal cannot create cycles)

##### 7.6 Dependency Endpoints

**Controller Endpoints:**
- `POST /tasks/dependencies` - Create dependency
  - Body: `{ taskId, dependsOnTaskId, type: 'blocks' | 'blocked_by' }`
- `GET /tasks/:taskId/dependencies` - Get all dependencies for task
  - Returns: `{ blocking: TaskDependencyEntity[], blockedBy: TaskDependencyEntity[] }`
- `GET /tasks/dependencies/:id` - Get single dependency
- `DELETE /tasks/dependencies/:id` - Delete dependency

**Route Ordering:**
- Dependency endpoints declared before generic `GET /tasks/:id` route to avoid conflicts

#### 8. Task Custom Fields ✅

**Files Created (Lists Module):**
- `src/features/lists/dto/create-custom-field.dto.ts`
- `src/features/lists/dto/update-custom-field.dto.ts`
- `src/features/lists/dto/custom-field-response.dto.ts`

**Files Created (Tasks Module):**
- `src/features/tasks/dto/create-task-custom-field-value.dto.ts`
- `src/features/tasks/dto/update-task-custom-field-value.dto.ts`
- `src/features/tasks/dto/task-custom-field-value-response.dto.ts`

**Files Modified:**
- `src/features/lists/entities/custom-field.entity.ts` (already existed)
- `src/features/tasks/entities/task-custom-field-value.entity.ts` (already existed)
- `src/features/lists/lists.service.ts`
- `src/features/lists/lists.controller.ts`
- `src/features/lists/lists.module.ts`
- `src/features/tasks/tasks.service.ts`
- `src/features/tasks/tasks.controller.ts`
- `src/features/tasks/tasks.module.ts`

**Implementation Details:**

##### 8.1 Custom Field Entity

**Entity Structure:**
- `id: string` - UUID primary key
- `name: string` - Field name
- `type: 'text' | 'number' | 'date' | 'dropdown'` - Field type
- `config: Record<string, any> | null` - Field configuration (JSONB)
  - For dropdown: `{ options: string[] }`
- `list: ListEntity` - Parent list (ManyToOne, CASCADE delete)
- `taskCustomFieldValues: TaskCustomFieldValueEntity[]` - One-to-Many relationship

##### 8.2 Custom Field CRUD (Lists Module)

**Create Custom Field (`createCustomField`):**
- Validates list exists
- Supports: `name`, `type`, `listId`, `config` (optional)
- For dropdown type, `config.options` should contain array of options

**Read Custom Fields (`findAllCustomFields`):**
- Returns all custom fields for a list
- Ordered by creation date

**Read Single Custom Field (`findOneCustomField`):**
- Returns custom field with list relation

**Update Custom Field (`updateCustomField`):**
- Updates field properties
- Supports: `name`, `type`, `config`

**Delete Custom Field (`removeCustomField`):**
- Removes custom field (cascade deletes all task custom field values)
- Validates custom field exists

##### 8.3 Task Custom Field Value Entity

**Entity Structure:**
- `id: string` - UUID primary key
- `value: any` - Field value stored as JSONB (flexible for different types)
- `task: TaskEntity` - Parent task (ManyToOne, CASCADE delete)
- `customField: CustomFieldEntity` - Field definition (ManyToOne, CASCADE delete)
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Update timestamp

##### 8.4 Task Custom Field Value CRUD

**Create Task Custom Field Value (`createTaskCustomFieldValue`):**
- Validates task exists
- Validates custom field exists
- **List Validation**: Ensures custom field belongs to same list as task
- **Type Validation**: Validates value matches custom field type
  - Text: Must be string
  - Number: Must be number
  - Date: Must be string or Date object
  - Dropdown: Must be one of the options in `config.options`
- Prevents duplicate values (one value per task per custom field)

**Type Validation Logic:**
```typescript
private validateCustomFieldValue(
  value: any,
  customField: CustomFieldEntity,
): void {
  switch (customField.type) {
    case 'text':
      if (typeof value !== 'string') {
        throw new BadRequestException('Value must be a string for text custom field');
      }
      break;
    case 'number':
      if (typeof value !== 'number') {
        throw new BadRequestException('Value must be a number for number custom field');
      }
      break;
    case 'date':
      if (typeof value !== 'string' && !(value instanceof Date)) {
        throw new BadRequestException('Value must be a date string or Date object for date custom field');
      }
      break;
    case 'dropdown':
      if (!customField.config?.options) {
        throw new BadRequestException('Dropdown custom field must have options in config');
      }
      if (!customField.config.options.includes(value)) {
        throw new BadRequestException(`Value must be one of: ${customField.config.options.join(', ')}`);
      }
      break;
  }
}
```

**Read Task Custom Field Values (`findAllTaskCustomFieldValues`):**
- Returns all custom field values for a task
- Includes custom field relation
- Ordered by creation date

**Read Single Task Custom Field Value (`findOneTaskCustomFieldValue`):**
- Returns custom field value with task and custom field relations

**Update Task Custom Field Value (`updateTaskCustomFieldValue`):**
- Updates value with type validation
- Supports: `value` (validated based on custom field type)

**Delete Task Custom Field Value (`removeTaskCustomFieldValue`):**
- Removes custom field value from task
- Validates value exists

##### 8.5 Custom Field Endpoints

**Lists Controller Endpoints:**
- `POST /lists/custom-fields` - Create custom field
- `GET /lists/custom-fields?listId=...` - Get all custom fields for list
- `GET /lists/custom-fields/:id` - Get single custom field
- `PUT /lists/custom-fields/:id` - Update custom field
- `DELETE /lists/custom-fields/:id` - Delete custom field

**Tasks Controller Endpoints:**
- `POST /tasks/custom-field-values` - Create task custom field value
- `GET /tasks/:taskId/custom-field-values` - Get all custom field values for task
- `GET /tasks/custom-field-values/:id` - Get single custom field value
- `PUT /tasks/custom-field-values/:id` - Update task custom field value
- `DELETE /tasks/custom-field-values/:id` - Delete task custom field value

**Route Ordering:**
- Custom field value endpoints declared before generic `GET /tasks/:id` route

#### 9. Save Filter Presets ✅

**Files Created:**
- `src/features/lists/dto/create-filter-preset.dto.ts`
- `src/features/lists/dto/update-filter-preset.dto.ts`
- `src/features/lists/dto/filter-preset-response.dto.ts`

**Files Modified:**
- `src/features/lists/entities/filter-preset.entity.ts` (already existed)
- `src/features/lists/lists.service.ts`
- `src/features/lists/lists.controller.ts`
- `src/features/lists/lists.module.ts`

**Implementation Details:**

##### 9.1 Filter Preset Entity

**Entity Structure:**
- `id: string` - UUID primary key
- `name: string` - Preset name
- `filterConfig: Record<string, any>` - Filter configuration stored as JSONB
  - Structure: `{ filters: FilterGroupDto, includeArchived: boolean }`
- `user: UserEntity` - Owner user (ManyToOne, CASCADE delete)
- `list: ListEntity` - Associated list (ManyToOne, CASCADE delete, optional)
- `createdAt: Date` - Creation timestamp
- `updatedAt: Date` - Update timestamp

##### 9.2 Filter Preset CRUD

**Create Filter Preset (`createFilterPreset`):**
- Validates list exists
- Stores filter configuration and `includeArchived` flag as JSON
- User-scoped (linked to authenticated user via `@CurrentUser`)
- Supports: `name`, `listId`, `filterConfig` (FilterGroupDto), `includeArchived` (optional)

**Read Filter Presets (`findAllFilterPresets`):**
- Returns all filter presets for authenticated user
- Optional `listId` filter to get presets for specific list
- Ordered by creation date (newest first)
- Includes list relation

**Read Single Filter Preset (`findOneFilterPreset`):**
- Returns filter preset with user and list relations
- **Security**: Only returns preset if it belongs to authenticated user

**Update Filter Preset (`updateFilterPreset`):**
- Updates preset properties
- Supports: `name`, `filterConfig`, `includeArchived`
- Properly merges filter configuration when updating
- **Security**: Only updates preset if it belongs to authenticated user

**Delete Filter Preset (`removeFilterPreset`):**
- Removes filter preset
- **Security**: Only deletes preset if it belongs to authenticated user

##### 9.3 Filter Preset Endpoints

**Controller Endpoints:**
- `POST /lists/filter-presets` - Create filter preset (requires authentication)
- `GET /lists/filter-presets?listId=...` - Get all filter presets for user (optionally filtered by list)
- `GET /lists/filter-presets/:id` - Get single filter preset
- `PUT /lists/filter-presets/:id` - Update filter preset
- `DELETE /lists/filter-presets/:id` - Delete filter preset

**Route Ordering:**
- Filter preset endpoints declared before templates routes to avoid conflicts

**Security:**
- All endpoints use `JwtAuthGuard`
- All endpoints use `@CurrentUser` decorator
- Users can only access/modify their own filter presets

### Directory Structure

```
src/features/tasks/
├── dto/
│   ├── create-task.dto.ts
│   ├── update-task.dto.ts
│   ├── task-response.dto.ts
│   ├── move-task.dto.ts
│   ├── assign-task.dto.ts
│   ├── add-tag-to-task.dto.ts
│   ├── create-subtask.dto.ts
│   ├── update-subtask.dto.ts
│   ├── subtask-response.dto.ts
│   ├── move-subtask.dto.ts
│   ├── create-checklist.dto.ts
│   ├── update-checklist.dto.ts
│   ├── checklist-response.dto.ts
│   ├── create-checklist-item.dto.ts
│   ├── update-checklist-item.dto.ts
│   ├── checklist-item-response.dto.ts
│   ├── reorder-checklist-items.dto.ts
│   ├── filter-tasks.dto.ts
│   ├── search-tasks.dto.ts
│   ├── sort-tasks.dto.ts
│   ├── create-task-dependency.dto.ts
│   ├── task-dependency-response.dto.ts
│   ├── create-task-custom-field-value.dto.ts
│   ├── update-task-custom-field-value.dto.ts
│   └── task-custom-field-value-response.dto.ts
├── entities/
│   ├── task.entity.ts (MODIFIED)
│   ├── subtask.entity.ts
│   ├── checklist.entity.ts
│   ├── checklist-item.entity.ts
│   ├── task-dependency.entity.ts
│   └── task-custom-field-value.entity.ts
├── tasks.controller.ts (MODIFIED)
├── tasks.service.ts (MODIFIED)
└── tasks.module.ts (MODIFIED)

src/features/lists/
├── dto/
│   ├── create-custom-field.dto.ts (NEW)
│   ├── update-custom-field.dto.ts (NEW)
│   ├── custom-field-response.dto.ts (NEW)
│   ├── create-filter-preset.dto.ts (NEW)
│   ├── update-filter-preset.dto.ts (NEW)
│   └── filter-preset-response.dto.ts (NEW)
├── entities/
│   ├── custom-field.entity.ts
│   └── filter-preset.entity.ts
├── lists.controller.ts (MODIFIED)
├── lists.service.ts (MODIFIED)
└── lists.module.ts (MODIFIED)
```

### Module Configuration

**TasksModule:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TaskEntity,
      ListEntity,
      StatusEntity,
      TaskPriorityEntity,
      AssignmentEntity,
      TaskTagEntity,
      TagEntity,
      SubtaskEntity,
      ChecklistEntity,
      ChecklistItemEntity,
      TaskDependencyEntity,
      TaskCustomFieldValueEntity,
      CustomFieldEntity,
    ]),
    AuthModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
```

**ListsModule:**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ListEntity,
      StatusEntity,
      ListTemplateEntity,
      CustomFieldEntity,
      FilterPresetEntity,
    ]),
    AuthModule,
  ],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
```

### REST Client Endpoints

**File Modified:**
- `rest_client.http`

**New/Updated Sections:**

**Tasks – CRUD & Operations:**
- `POST /tasks` – Create task
- `GET /tasks?listId=...&statusId=...&includeArchived=...&sortField=...&sortDirection=...&customFieldId=...` – Get tasks
- `GET /tasks/:id` – Get task by ID
- `PUT /tasks/:id` – Update task
- `DELETE /tasks/:id` – Delete task
- `PUT /tasks/:id/move` – Move task to different status
- `POST /tasks/:id/archive` – Archive task
- `POST /tasks/:id/unarchive` – Unarchive task
- `POST /tasks/:id/assign` – Assign user to task
- `DELETE /tasks/:id/assign/:userId` – Unassign user from task
- `POST /tasks/:id/tags` – Add tag to task
- `DELETE /tasks/:id/tags/:tagId` – Remove tag from task

**Subtasks:**
- `POST /tasks/subtasks` – Create subtask
- `GET /tasks/:taskId/subtasks` – Get all subtasks for task
- `GET /tasks/subtasks/:id` – Get subtask by ID
- `PUT /tasks/subtasks/:id` – Update subtask
- `DELETE /tasks/subtasks/:id` – Delete subtask
- `PUT /tasks/subtasks/:id/move` – Move subtask to another task

**Task Checklists:**
- `POST /tasks/checklists` – Create checklist
- `GET /tasks/:taskId/checklists` – Get all checklists for task
- `GET /tasks/checklists/:id` – Get checklist by ID
- `PUT /tasks/checklists/:id` – Update checklist
- `DELETE /tasks/checklists/:id` – Delete checklist
- `POST /tasks/checklist-items` – Create checklist item
- `GET /tasks/:checklistId/checklist-items` – Get all items for checklist
- `GET /tasks/checklist-items/:id` – Get checklist item by ID
- `PUT /tasks/checklist-items/:id` – Update checklist item
- `DELETE /tasks/checklist-items/:id` – Delete checklist item
- `PUT /tasks/checklists/:checklistId/reorder-items` – Reorder checklist items

**Filtering & Search:**
- `POST /tasks/filter?sortField=...&sortDirection=...&customFieldId=...` – Filter tasks with complex conditions
- `POST /tasks/search?sortField=...&sortDirection=...&customFieldId=...` – Search tasks by title/description

**Task Dependencies:**
- `POST /tasks/dependencies` – Create dependency (blocked_by or blocks)
- `GET /tasks/:taskId/dependencies` – Get all dependencies for task
- `GET /tasks/dependencies/:id` – Get dependency by ID
- `DELETE /tasks/dependencies/:id` – Delete dependency

**Custom Fields (Lists):**
- `POST /lists/custom-fields` – Create custom field
- `GET /lists/custom-fields?listId=...` – Get all custom fields for list
- `GET /lists/custom-fields/:id` – Get custom field by ID
- `PUT /lists/custom-fields/:id` – Update custom field
- `DELETE /lists/custom-fields/:id` – Delete custom field

**Task Custom Field Values:**
- `POST /tasks/custom-field-values` – Create task custom field value
- `GET /tasks/:taskId/custom-field-values` – Get all custom field values for task
- `GET /tasks/custom-field-values/:id` – Get custom field value by ID
- `PUT /tasks/custom-field-values/:id` – Update task custom field value
- `DELETE /tasks/custom-field-values/:id` – Delete task custom field value

**Filter Presets:**
- `POST /lists/filter-presets` – Create filter preset
- `GET /lists/filter-presets?listId=...` – Get all filter presets for user
- `GET /lists/filter-presets/:id` – Get filter preset by ID
- `PUT /lists/filter-presets/:id` – Update filter preset
- `DELETE /lists/filter-presets/:id` – Delete filter preset

All examples use `Authorization: Bearer {{accessToken}}` and realistic JSON payloads.

### Key Implementation Highlights

**1. Complex Querying:**
- TypeORM QueryBuilder for dynamic filtering
- Recursive filter group processing with AND/OR logic
- Nested filter groups with unlimited depth
- Efficient joins for related entity filtering

**2. Circular Dependency Prevention:**
- BFS algorithm for cycle detection
- Prevents invalid dependency graphs
- Handles both `blocks` and `blocked_by` relationship types

**3. Type-Specific Validation:**
- Custom field values validated based on field type
- JSONB storage for flexible value types
- Dropdown option validation
- Date type handling (string or Date object)

**4. Advanced Sorting:**
- Subquery-based sorting for complex fields (assignee, custom fields)
- Type-specific sorting for custom fields (text, number, date)
- NULL value handling (unassigned tasks/fields appear last)
- Secondary sorting by `orderPosition` for consistency

**5. Route Ordering:**
- Specific routes declared before generic parameter routes
- Prevents routing conflicts (e.g., `subtasks/:id` vs `:id`)
- Dependency, subtask, and checklist routes properly ordered

**6. Security & Validation:**
- JWT authentication on all endpoints
- User-scoped filter presets
- List validation for custom fields and dependencies
- Type validation for all custom field values

### Benefits

**1. Feature Completeness:**
- Complete task management system with rich metadata
- Hierarchical task breakdown (subtasks)
- Flexible checklist system
- Advanced filtering and search capabilities
- Multi-field sorting with complex field support

**2. Data Integrity:**
- Circular dependency prevention
- Type validation for custom fields
- Cascade delete handling
- List-level validation for cross-entity operations

**3. User Experience:**
- Saved filter presets for quick access
- Flexible custom fields per list
- Multiple sorting options
- Comprehensive search capabilities

**4. Extensibility:**
- Custom field system supports new field types
- Filter system supports new filter fields
- Sorting system supports new sort fields
- Dependency system ready for Gantt chart visualization

**5. Performance:**
- Efficient querying with TypeORM QueryBuilder
- Proper indexing on foreign keys (handled by TypeORM)
- Optimized joins for related entities
- Secondary sorting for consistent results

### Next Steps

After completing Phase 8, the application has:

- ✅ Complete Kanban board functionality with tasks, statuses, and organization
- ✅ Advanced task management with subtasks, checklists, and dependencies
- ✅ Flexible custom field system per list
- ✅ Powerful filtering and search capabilities
- ✅ Comprehensive sorting options including assignee and custom fields
- ✅ User-scoped filter presets for productivity

**Ready for:** Phase 9 - Collaborative Features (Sharing/Teams, Comments, Attachments)

---

## Notes

- All completed phases are marked with ✅
- Each phase builds upon previous phases
- Implementation follows NestJS best practices
- Code follows TypeScript strict typing conventions
