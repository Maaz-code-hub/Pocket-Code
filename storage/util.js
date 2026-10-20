const { Transform } = require('node:stream');

function httpError(status, message) { return Object.assign(new Error(message), { status }); }

// Names the app uses internally; hidden from listings and not allowed as user names.
const KEEP = '.keep';
const TRASH = '.trash';
const isReserved = (name) => name === KEEP || name === TRASH || name.startsWith('.upload-');

// Pass-through stream that counts bytes and errors once maxBytes is exceeded.
function limitStream(maxBytes) {
  const t = new Transform({
    transform(chunk, _enc, cb) {
      t.bytes += chunk.length;
      if (t.bytes > maxBytes) return cb(httpError(413, 'File too large'));
      cb(null, chunk);
    },
  });
  t.bytes = 0;
  return t;
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const c of stream) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = { httpError, limitStream, streamToBuffer, KEEP, TRASH, isReserved };
