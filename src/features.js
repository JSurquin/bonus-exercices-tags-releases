// Feature flags par version
const FEATURES = {
  "1.0.0": ["basic-auth", "user-list"],
  "1.1.0": ["basic-auth", "user-list", "search"],
  "1.2.0": ["basic-auth", "user-list", "search", "export-csv"],
  "1.3.0": ["basic-auth", "user-list", "search", "export-csv", "dark-mode"],
  "1.3.1": ["basic-auth", "user-list", "search", "export-csv", "dark-mode"],
  "1.3.2": ["basic-auth", "user-list", "search", "export-csv", "dark-mode"],
};

function getFeaturesForVersion(version) {
  return FEATURES[version] || FEATURES["1.0.0"];
}

function isFeatureEnabled(version, feature) {
  return getFeaturesForVersion(version).includes(feature);
}

module.exports = { FEATURES, getFeaturesForVersion, isFeatureEnabled };
