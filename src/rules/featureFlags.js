const featureFlags = {
  premiumFeatures: true,
  liveClassRecording: true,
  aiClone: true,
  advancedExams: true,
  messaging: true,
};

function isFeatureEnabled(featureName) {
  return !!featureFlags[featureName];
}

function enableFeature(featureName) {
  featureFlags[featureName] = true;
}

function disableFeature(featureName) {
  featureFlags[featureName] = false;
}

module.exports = { featureFlags, isFeatureEnabled, enableFeature, disableFeature };