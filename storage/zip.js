// Minimal streaming ZIP writer (no dependencies). Each file is deflated when
// that makes it smaller, otherwise stored. Fine for archives under 4 GB.
const zlib = require('node:zlib');

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosTime(ms) {
  const d = new Date(ms || Date.now());
  const year = Math.max(d.getFullYear(), 1980);
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1),
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

function createZip(out) {
  const central = [];
  let offset = 0;

  const write = (buf) => new Promise((resolve, reject) => {
    offset += buf.length;
    if (out.write(buf)) return resolve();
    out.once('drain', resolve);
    out.once('error', reject);
  });

  async function add(name, data, mtime) {
    const isDir = data === null;
    const nameBuf = Buffer.from(isDir ? `${name}/` : name);
    let method = 0, body = Buffer.alloc(0), crc = 0, size = 0;
    if (!isDir) {
      size = data.length;
      crc = crc32(data);
      const deflated = zlib.deflateRawSync(data);
      [method, body] = deflated.length < data.length ? [8, deflated] : [0, data];
    }
    const { time, date } = dosTime(mtime);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 names
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(size, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    local.writeUInt16LE(0, 28);

    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(method, 10);
    cen.writeUInt16LE(time, 12);
    cen.writeUInt16LE(date, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(body.length, 20);
    cen.writeUInt32LE(size, 24);
    cen.writeUInt16LE(nameBuf.length, 28);
    cen.writeUInt32LE(isDir ? 0x10 : 0, 38);
    cen.writeUInt32LE(offset, 42);
    central.push(Buffer.concat([cen, nameBuf]));

    await write(Buffer.concat([local, nameBuf]));
    if (body.length) await write(body);
  }

  async function finish() {
    const cd = Buffer.concat(central);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054b50, 0);
    end.writeUInt16LE(central.length, 8);
    end.writeUInt16LE(central.length, 10);
    end.writeUInt32LE(cd.length, 12);
    end.writeUInt32LE(offset, 16);
    await write(cd);
    await write(end);
  }

  return { add, finish };
}

module.exports = { createZip };
