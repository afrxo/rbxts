#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const fullName = process.argv[2];

if (!fullName) {
  console.log("Usage: pnpm new <name>");
  console.log("");
  console.log("Examples:");
  console.log("  pnpm new my-game        # Creates a game");
  console.log("  pnpm new @repo/my-utils # Creates a library");
  console.log("  pnpm new @custom/utils  # Creates a library");
  process.exit(1);
}

// Parse the package name - scoped packages are libraries, everything else is a game
let scope = null;
let shortName = fullName;
let type = "game";

if (fullName.startsWith("@")) {
  const match = fullName.match(/^@([^/]+)\/(.+)$/);
  if (!match) {
    console.error("Error: Scoped package name must be in format @scope/name");
    process.exit(1);
  }
  scope = match[1];
  shortName = match[2];
  type = "package";
}

// Validate short name
if (!shortName || !/^[a-z0-9-]+$/.test(shortName)) {
  console.error(
    "Error: Package name must be lowercase alphanumeric with hyphens only"
  );
  process.exit(1);
}

const packagesDir = path.join(__dirname, "..", "packages");
const packageDir = path.join(packagesDir, shortName);

if (fs.existsSync(packageDir)) {
  console.error(`Error: Package directory "${shortName}" already exists`);
  process.exit(1);
}

// Templates
const gamePackageJson = {
  name: shortName,
  version: "1.0.0",
  private: true,
  scripts: {
    serve: "rojo serve",
    build: "shx rm -rf out && rbxtsc --verbose",
    watch: "rbxtsc -w --verbose",
    predev: "pnpm build",
    dev: "concurrently -n rojo,rbxtsc -c blue,yellow 'pnpm serve' 'pnpm watch'"
  },
  devDependencies: {
    "@rbxts/compiler-types": "3.0.0-types.0",
    "@rbxts/types": "^1.0.896",
    "roblox-ts": "^3.0.0",
    "typescript": "^5.9.3",
    "shx": "^0.4.0",
  },
  dependencies: {},
};

const gameTsConfig = {
  extends: "../../tsconfig.base.json",
  compilerOptions: {
    baseUrl: "src",
    rootDir: "src",
		outDir: "out",
    typeRoots: ["node_modules/@rbxts", "node_modules/@repo"],
  },
};

const gameProjectJson = {
  name: shortName,
  tree: {
    $className: "DataModel",
    HttpService: {
      $className: "HttpService",
      $properties: {
        HttpEnabled: true,
      },
    },
    ReplicatedStorage: {
      $className: "ReplicatedStorage",
      TS: {
        $path: "out/shared",
      },
      rbxts_include: {
        node_modules: {
          $className: "Folder",
          "@rbxts": {
            $path: "node_modules/@rbxts",
          }
        },
        $path: "include",
      },
    },
    ServerScriptService: {
      $className: "ServerScriptService",
      TS: {
        $path: "out/server",
      },
    },
    SoundService: {
      $className: "SoundService",
      $properties: {
        RespectFilteringEnabled: true,
      },
    },
    StarterPlayer: {
      $className: "StarterPlayer",
      StarterPlayerScripts: {
        $className: "StarterPlayerScripts",
        TS: {
          $path: "out/client",
        },
      },
    },
    Workspace: {
      $className: "Workspace",
      $properties: {
        FilteringEnabled: true,
      },
    },
  },
  globIgnorePaths: ["**/package.json", "**/tsconfig.json"],
};

const libraryPackageJson = {
  name: fullName,
  version: "1.0.0",
  description: "",
  main: "out/init.lua",
  types: "out/index.d.ts",
  scripts: {
    build: "rbxtsc",
    watch: "rbxtsc -w",
    prepublishOnly: "pnpm run build",
  },
  keywords: [],
  author: "",
  license: "ISC",
  files: ["out", "!**/*.tsbuildinfo"],
  publishConfig: {
    access: "public",
  },
  dependencies: {},
  peerDependencies: {},
  devDependencies: {
    "@rbxts/compiler-types": "3.0.0-types.0",
    "@rbxts/types": "^1.0.896",
    "roblox-ts": "^3.0.0",
    "typescript": "^5.9.3",
  },
};

const libraryTsConfig = {
  extends: "../../tsconfig.base.json",
  compilerOptions: {
    declaration: true,
    rootDir: "src",
		outDir: "out",
		tsBuildInfoFile: "out/tsconfig.tsbuildinfo",
    typeRoots: ["node_modules/@rbxts", "../../node_modules/@rbxts"]
  },
};

const libraryProjectJson = {
  name: shortName,
  tree: {
    $path: "out",
  },
};

// Source file templates
const gameClientSource = `// Client-side entry point
print("Hello from ${shortName} client!");
`;

const gameServerSource = `// Server-side entry point
print("Hello from ${shortName} server!");
`;

const gameSharedSource = `// Shared module
export function hello() {
	return "Hello from ${shortName} shared module!";
}
`;

const librarySource = `// ${shortName} library entry point
export function hello() {
	return "Hello from ${fullName}!";
}
`;

// Create directories and files
console.log(`Creating ${type}: ${fullName}`);

if (type === "game") {
  // Create game structure
  fs.mkdirSync(path.join(packageDir, "src", "client"), { recursive: true });
  fs.mkdirSync(path.join(packageDir, "src", "server"), { recursive: true });
  fs.mkdirSync(path.join(packageDir, "src", "shared"), { recursive: true });

  fs.writeFileSync(
    path.join(packageDir, "package.json"),
    JSON.stringify(gamePackageJson, null, 2)
  );
  fs.writeFileSync(
    path.join(packageDir, "tsconfig.json"),
    JSON.stringify(gameTsConfig, null, 2)
  );
  fs.writeFileSync(
    path.join(packageDir, "default.project.json"),
    JSON.stringify(gameProjectJson, null, 2)
  );
  fs.writeFileSync(
    path.join(packageDir, "src", "client", "main.client.ts"),
    gameClientSource
  );
  fs.writeFileSync(
    path.join(packageDir, "src", "server", "main.server.ts"),
    gameServerSource
  );
  fs.writeFileSync(
    path.join(packageDir, "src", "shared", "module.ts"),
    gameSharedSource
  );

  console.log(`
Created game "${shortName}" with structure:
  packages/${shortName}/
  ├── package.json
  ├── tsconfig.json
  ├── default.project.json
  └── src/
      ├── client/main.client.ts
      ├── server/main.server.ts
      └── shared/module.ts

Next steps:
  1. Run "pnpm install" to install dependencies
  2. Run "pnpm --filter ${shortName} build" to build
  3. Run "pnpm --filter ${shortName} dev" for development
`);
} else {
  // Create library structure
  fs.mkdirSync(path.join(packageDir, "src"), { recursive: true });

  fs.writeFileSync(
      path.join(packageDir, "package.json"),
      JSON.stringify(libraryPackageJson, null, 2)
    );
  fs.writeFileSync(
    path.join(packageDir, "tsconfig.json"),
    JSON.stringify(libraryTsConfig, null, 2)
  );
  fs.writeFileSync(
    path.join(packageDir, "default.project.json"),
    JSON.stringify(libraryProjectJson, null, 2)
  );
  fs.writeFileSync(path.join(packageDir, "src", "index.ts"), librarySource);

  console.log(`
Created library "${fullName}" with structure:
  packages/${shortName}/
  ├── package.json
  ├── tsconfig.json
  ├── default.project.json
  └── src/
      └── index.ts

Next steps:
  1. Run "pnpm install" to install dependencies
  2. Run "pnpm --filter ${fullName} build" to build
  3. Run "pnpm --filter ${fullName} watch" for development

To use in other packages:
  1. Add "${fullName}": "workspace:*" to dependencies in package.json
  2. Run "pnpm install"
  3. Import: import { hello } from "${fullName}";
`);
}
