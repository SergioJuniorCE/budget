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

for project overview and

# Imported from package.json

{
"name": "budget",
"private": true,
"type": "module",
"scripts": {
"dev": "turbo dev",
"build": "turbo build",
"check-types": "turbo check-types",
"dev:native": "turbo -F native dev",
"dev:web": "turbo -F web dev",
"dev:server": "turbo -F @budget/backend dev",
"dev:setup": "turbo -F @budget/backend dev:setup",
"deploy:backend": "turbo -F @budget/backend deploy",
"check": "oxlint && oxfmt --write",
"lint:check": "oxlint && oxfmt --check"
},
"dependencies": {
"@budget/env": "workspace:_",
"dotenv": "catalog:",
"zod": "catalog:"
},
"devDependencies": {
"@budget/config": "workspace:_",
"@cloudflare/workers-types": "^4.20251213.0",
"lefthook": "^2.0.13",
"oxfmt": "^0.26.0",
"oxlint": "^1.41.0",
"turbo": "^2.6.3",
"typescript": "catalog:"
},
"packageManager": "pnpm@11.5.0"
}

for available npm/pnpm commands for this project.

## Code Style Guidelines

- Use descriptive variable names
- Follow existing patterns in the codebase
- Extract complex conditions into meaningful boolean variables

## Architecture Notes

Add important architectural decisions and patterns here.

## Common Workflows

Document frequently used workflows and commands here.
