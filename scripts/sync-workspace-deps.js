#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const packagesDir = path.join(__dirname, "..", "packages");

function getPackageJson(pkgPath) {
  const pkgJsonPath = path.join(pkgPath, "package.json");
  if (!fs.existsSync(pkgJsonPath)) return null;
  return JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
}

function savePackageJson(pkgPath, data) {
  const pkgJsonPath = path.join(pkgPath, "package.json");
  fs.writeFileSync(pkgJsonPath, JSON.stringify(data, null, 2) + "\n");
}

function resolveWorkspacePkg(depName, allPackages) {
  // Find the package folder that matches the dependency name
  for (const [folderName, pkgJson] of Object.entries(allPackages)) {
    if (pkgJson && pkgJson.name === depName) {
      return { folderName, pkgJson };
    }
  }
  return null;
}

function syncDeps() {
  // Read all packages first
  const folders = fs.readdirSync(packagesDir).filter((f) => {
    const fullPath = path.join(packagesDir, f);
    return fs.statSync(fullPath).isDirectory();
  });

  const allPackages = {};
  for (const folder of folders) {
    allPackages[folder] = getPackageJson(path.join(packagesDir, folder));
  }

  // Process each package
  for (const folder of folders) {
    const pkgPath = path.join(packagesDir, folder);
    const pkgJson = allPackages[folder];
    if (!pkgJson) continue;

    const deps = pkgJson.dependencies || {};
    const workspaceDeps = Object.entries(deps).filter(([, version]) =>
      version.startsWith("workspace:")
    );

    if (workspaceDeps.length === 0) continue;

    let modified = false;
    const depsToAdd = {};

    for (const [depName] of workspaceDeps) {
      const resolved = resolveWorkspacePkg(depName, allPackages);
      if (!resolved) {
        console.log(`  Warning: Could not resolve ${depName}`);
        continue;
      }

      const workspacePkgDeps = resolved.pkgJson.dependencies || {};

      for (const [transitiveDep, transitiveVersion] of Object.entries(workspacePkgDeps)) {
        // Skip other workspace dependencies
        if (transitiveVersion.startsWith("workspace:")) continue;

        // Check if already present
        if (!deps[transitiveDep]) {
          depsToAdd[transitiveDep] = transitiveVersion;
          modified = true;
        }
      }
    }

    if (modified) {
      console.log(`\n${pkgJson.name} (${folder}):`);
      for (const [dep, version] of Object.entries(depsToAdd)) {
        console.log(`  + ${dep}@${version}`);
        pkgJson.dependencies[dep] = version;
      }

      // Sort dependencies alphabetically
      pkgJson.dependencies = Object.keys(pkgJson.dependencies)
        .sort()
        .reduce((acc, key) => {
          acc[key] = pkgJson.dependencies[key];
          return acc;
        }, {});

      savePackageJson(pkgPath, pkgJson);
    }
  }

  console.log("\nDone! Run `pnpm install` to install the new dependencies.");
}

syncDeps();
