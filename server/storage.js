const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'venueflow-assets-493813';

/**
 * Generates a signed URL for a file in Google Cloud Storage.
 */
async function getAssetUrl(fileName) {
  try {
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(fileName);

    // For production, we use signed URLs or make the bucket public.
    // For now, we assume public read for static assets.
    return `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
  } catch (error) {
    console.error('Error fetching asset from GCS:', error);
    return null;
  }
}

module.exports = { getAssetUrl };
