# Roblox-TS Monorepo

A TypeScript monorepo for Roblox game development using [roblox-ts](https://roblox-ts.com/), which compiles TypeScript to Luau.

## Overview

A monorepo template for organizing Roblox games and reusable library packages.

## Tech

- **Roblox-TS** v3.0.0 - TypeScript to Luau compiler
- **PNPM** - Package manager with workspace support

## Project Structure

```
roblox-ts-monorepo/
├── packages/
│   ├── <game>/            # Roblox game projects
│   └── <library>/         # Reusable libraries
├── scripts/
│   └── sync-workspace-deps.js  # Dependency sync utility
│   └── create-package.js  # Package initializer utility
├── pnpm-workspace.yaml    # PNPM workspace configuration
└── package.json           # Root package configuration
```

## Package Types

This monorepo contains two types of packages:

### Games

Roblox-TS game projects that compile to a full Roblox place structure with client/server/shared separation.

Games have a `src/` structure with:
- `client/` - Client code
- `server/` - Server code
- `shared/` - Shared modules

### Packages (Libraries)

Reusable roblox-ts libraries that can be imported by games or other packages. Packages export modules from `src/index.ts` and generate type definitions for consumers.

## Prerequisites

- [Node.js](https://nodejs.org/)
- [PNPM](https://pnpm.io/) package manager

```bash
npm install -g pnpm
```

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd roblox-ts-mono
   ```

2. Run the setup command:
   ```bash
   pnpm packages:setup
   ```
   This syncs workspace dependencies and installs all packages.

## Development

### Build all packages

```bash
pnpm build
```

### Build a specific package

```bash
pnpm --filter <package-name> build
pnpm --filter @repo/<library-name> build
```

### Watch mode (auto-rebuild on changes)

```bash
pnpm --filter <package-name> watch
```

### Clean node_modules

```bash
pnpm clean
```

### Clean and reinstall

```bash
pnpm clean:setup
```

## Workspace Dependencies

Packages reference each other using the `workspace:*` protocol:

```json
{
  "dependencies": {
    "@repo/<library-name>": "workspace:*"
  }
}
```

The `sync-workspace-deps.js` script automatically syncs transitive dependencies when running `pnpm packages:setup`.


## Adding New Packages

Use the `new` script to scaffold new packages. The type is inferred from the name:
- Scoped names (`@scope/name`) create **libraries**
- Unscoped names create **games**

### Create a Library

```bash
pnpm new @repo/my-utils
pnpm new @custom/something
```

Creates:
```
packages/my-utils/
├── package.json          # name: "@repo/my-utils"
├── tsconfig.json
├── default.project.json  # name: "my-utils"
└── src/
    └── index.ts
```

### Create a Game

```bash
pnpm new my-game
```

Creates:
```
packages/my-game/
├── package.json
├── tsconfig.json
├── default.project.json
└── src/
    ├── client/main.client.ts
    ├── server/main.server.ts
    └── shared/module.ts
```

After creating a package, run `pnpm packages:setup` to install dependencies.