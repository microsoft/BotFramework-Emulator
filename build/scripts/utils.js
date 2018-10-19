function getEnvVar(varName, defaultValue) {
  const varValue = process.env[varName] || defaultValue;
  if (!varValue) {
    throw new Error(`No value found for required env variable: ${varName}. Please provide a value and retry.`);
  }
  return varValue;
}

module.exports = {
  getEnvVar
};
