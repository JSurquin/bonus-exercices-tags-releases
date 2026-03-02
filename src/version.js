// Gestion de version de l'application
const CURRENT_VERSION = "1.3.2";

function parseVersion(versionString) {
  const [major, minor, patch] = versionString.split(".").map(Number);
  return { major, minor, patch };
}

function bumpVersion(version, type) {
  const v = parseVersion(version);
  if (type === "major") return `${v.major + 1}.0.0`;
  if (type === "minor") return `${v.major}.${v.minor + 1}.0`;
  if (type === "patch") return `${v.major}.${v.minor}.${v.patch + 1}`;
  throw new Error(`Unknown bump type: ${type}`);
}

function isCompatible(v1, v2) {
  const a = parseVersion(v1);
  const b = parseVersion(v2);
  return a.major === b.major;
}

module.exports = { CURRENT_VERSION, parseVersion, bumpVersion, isCompatible };
