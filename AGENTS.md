# Memory

## Project Overview

See

# Imported from README.md

# budget

A budget tracking application built with React, TanStack Router, and Convex.

## Features

- **TypeScript** - Type safety across the entire stack
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service
- **Clerk** - Authentication
- **Recharts** - Data visualization
- **Oxlint + Oxfmt** - Linting and formatting
- **Turborepo** - Monorepo build system

## Getting Started

Install dependencies:

```bash
pnpm install
```

Set up Convex:

```bash
pnpm run dev:setup
```

Follow the prompts to create a new Convex project. Then copy environment variables from `packages/backend/.env.local` to `apps/*/.env`.

Start the dev server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) to see the app.

## Git Hooks and Formatting

```bash
pnpm run check        # lint and format fix
pnpm run lint:check   # lint and format check
```

## Project Structure

```
budget/
├── apps/
│   └── web/           # React + TanStack Router frontend
├── packages/
│   ├── backend/       # Convex functions and schema
│   ├── config/        # Shared configuration
│   └── env/           # Environment variable handling
```

## Available Scripts

- `pnpm run dev` - Start all apps in development mode
- `pnpm run build` - Build all apps
- `pnpm run dev:web` - Start only the web app
- `pnpm run dev:server` - Start only the backend
- `pnpm run dev:setup` - Set up and configure Convex
- `pnpm run deploy:backend` - Deploy Convex backend
- `pnpm run check-types` - Check TypeScript types
- `pnpm run check` - Run Oxlint and Oxfmt
