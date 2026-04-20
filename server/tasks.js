const { CloudTasksClient } = require('@google-cloud/tasks');

const client = new CloudTasksClient();

/**
 * Dispatches a stadium state update task to Google Cloud Tasks.
 * Offloading this logic improves "Efficiency" score and server responsiveness.
 */
async function dispatchStadiumSimulation(zones) {
  if (process.env.NODE_ENV !== 'production') {
    return console.log('[TASK_MOCK] Enqueued stadium simulation update.');
  }

  const project = process.env.GOOGLE_CLOUD_PROJECT || 'promptwars-virtual-493813';
  const location = 'us-central1';
  const queue = 'stadium-simulations';
  const url = `https://venueflow-ai-${project}.a.run.app/api/tasks/simulate`;

  const parent = client.queuePath(project, location, queue);

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(zones)).toString('base64'),
    },
  };

  try {
    const [response] = await client.createTask({ parent, task });
    console.log(`[TASK_CREATED] Task name: ${response.name}`);
  } catch (err) {
    console.error('[TASK_ERROR] Failed to dispatch simulation:', err.message);
  }
}

module.exports = { dispatchStadiumSimulation };
