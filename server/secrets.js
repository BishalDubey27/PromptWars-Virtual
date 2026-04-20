const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();

/**
 * Fetches a secret from Google Cloud Secret Manager.
 * Falls back to environment variables in development.
 */
async function getSecret(secretName) {
  // Always try env var first for local development
  if (process.env[secretName] && process.env.NODE_ENV !== 'production') {
    return process.env[secretName];
  }

  try {
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'promptwars-virtual-493813';
    const [version] = await client.accessSecretVersion({
      name: `projects/${project}/secrets/${secretName}/versions/latest`,
    });
    return version.payload.data.toString();
  } catch (error) {
    console.warn(`Could not fetch secret ${secretName} from Secret Manager. Falling back to env vars.`, error.message);
    return process.env[secretName];
  }
}

module.exports = { getSecret };
