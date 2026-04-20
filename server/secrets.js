const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

let client = null;

/**
 * Fetches a secret from Google Cloud Secret Manager.
 * Resiliently falls back to environment variables.
 */
async function getSecret(secretName) {
  // 1. FAST PATH: Return environment variable if available and NOT in production
  if (process.env[secretName] && (process.env.NODE_ENV !== 'production')) {
    return process.env[secretName];
  }

  // 2. PRODUCTION/GCP PATH: Try Secret Manager
  // Lazy-initialize client only when needed to prevent local auth hangs
  if (!client && process.env.NODE_ENV === 'production') {
    try {
      client = new SecretManagerServiceClient();
    } catch (e) {
      console.warn('[SECRET_MANAGER] Lazy-init failed:', e.message);
    }
  }

  if (client) {
    try {
      const project = process.env.GOOGLE_CLOUD_PROJECT || 'promptwars-virtual-493813';
      const [version] = await client.accessSecretVersion({
        name: `projects/${project}/secrets/${secretName}/versions/latest`,
      });
      return version.payload.data.toString();
    } catch (error) {
      console.warn(`[GCP_SECRET] Failed fetching ${secretName}:`, error.message);
    }
  }

  // 3. FINAL FALLBACK: Always try environment variable
  return process.env[secretName];
}

module.exports = { getSecret };
