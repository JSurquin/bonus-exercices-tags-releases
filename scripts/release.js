#!/usr/bin/env node
// Script de release automatisé – à utiliser dans l'exercice 4
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const type = process.argv[2]; // patch | minor | major
if (!["patch", "minor", "major"].includes(type)) {
  console.error("Usage: node scripts/release.js [patch|minor|major]");
  process.exit(1);
}

// Lire la version actuelle
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

let newVersion;
if (type === "major") newVersion = `${major + 1}.0.0`;
else if (type === "minor") newVersion = `${major}.${minor + 1}.0`;
else newVersion = `${major}.${minor}.${patch + 1}`;

console.log(`Bumping version: ${pkg.version} → ${newVersion}`);

// Mettre à jour package.json
pkg.version = newVersion;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");

// Mettre à jour src/version.js
let versionJs = fs.readFileSync("src/version.js", "utf8");
versionJs = versionJs.replace(
  /const CURRENT_VERSION = "[^"]+"/,
  `const CURRENT_VERSION = "${newVersion}"`
);
fs.writeFileSync("src/version.js", versionJs);

console.log(`✅ Version bumped to ${newVersion}`);
console.log(`📝 Don't forget to:`);
console.log(`   1. Update CHANGELOG.md`);
console.log(`   2. git add . && git commit -m "chore(release): v${newVersion}"`);
console.log(`   3. git tag -a v${newVersion} -m "Release v${newVersion}"`);
console.log(`   4. git push && git push --tags`);
