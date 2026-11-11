const serverless = require('serverless-http');
const { requestHandler, storage } = require('../../server');

let initialized = false;
let initPromise = null;

async function ensureStorageInit() {
  if (initialized) return;
  if (!initPromise) {
    initPromise = Promise.resolve(storage.init ? storage.init() : null)
      .catch((err) => {
        console.warn('[Storage] Init warning:', err.message);
      })
      .finally(() => {
        initialized = true;
      });
  }
  return initPromise;
}

const wrapped = serverless(
  async (req, res) => {
    await ensureStorageInit();
    return requestHandler(req, res);
  },
  {
    binary: [
      'image/*',
      'application/zip',
      'application/octet-stream',
      'application/pdf',
      'application/vnd.*',
      'application/msword',
      'audio/*',
      'video/*',
    ],
  }
);

exports.handler = async (event, context) => {
  // Prevent serverless function from waiting for Redis / keep-alive socket teardown
  if (context) {
    context.callbackWaitsForEmptyEventLoop = false;
  }
  const response = await wrapped(event, context);
  // Intercept responses that would exceed AWS Lambda / Netlify 6MB response limit (6,291,556 bytes)
  if (response && typeof response.body === 'string' && response.body.length > 6000000) {
    console.error(`[Netlify] Response body size (${response.body.length} bytes) exceeds Lambda 6MB limit.`);
    return {
      statusCode: 413,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store',
      },
      body: JSON.stringify({
        error: 'Response payload exceeded serverless limit (6 MB). Use direct cloud storage or download files individually.',
      }),
    };
  }
  return response;
};
