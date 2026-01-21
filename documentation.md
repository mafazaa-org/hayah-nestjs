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

## Phase 6-16: Feature Implementation Phases

**Status:** Not Started

*Additional phases will be documented as they are completed.*

---

## Notes

- All completed phases are marked with ✅
- Each phase builds upon previous phases
- Implementation follows NestJS best practices
- Code follows TypeScript strict typing conventions
