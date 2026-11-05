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
  return wrapped(event, context);
};
