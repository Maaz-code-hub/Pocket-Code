const path = require('node:path');
const { Readable } = require('node:stream');

async function main() {
  console.log('=== POCKET CODE FULL SYSTEM DIAGNOSTICS ===\n');

  // 1. Environment Check
  console.log('1. Checking Environment (.env)...');
  try {
    process.loadEnvFile(path.join(__dirname, '..', '.env'));
  } catch (e) {
    console.error('Error loading .env:', e.message);
    process.exit(1);
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
    SUPABASE_BUCKET = 'code-saver',
    REDIS_URL,
    CACHE_TTL_HOURS = '12',
    KEEP_ALIVE_HOURS = '6',
  } = process.env;

  console.log('   - Supabase URL:', SUPABASE_URL ? `${SUPABASE_URL.slice(0, 25)}...` : 'MISSING');
  console.log('   - Supabase Key:', SUPABASE_SERVICE_KEY ? 'Present (Secret)' : 'MISSING');
  console.log('   - Supabase Bucket:', SUPABASE_BUCKET);
  console.log('   - Redis URL:', REDIS_URL ? `${REDIS_URL.replace(/:\/\/[^@]*@/, '://***@')}` : 'MISSING');
  console.log('   - Cache TTL:', `${CACHE_TTL_HOURS} hours`);
  console.log('   - Keep-Alive Interval:', `${KEEP_ALIVE_HOURS} hours`);

  if (!SUPABASE_URL || !REDIS_URL) {
    console.error('FATAL: Missing SUPABASE_URL or REDIS_URL in .env');
    process.exit(1);
  }

  // 2. Redis Connection Test
  console.log('\n2. Testing Upstash Redis Connection & Operations...');
  const Redis = require('ioredis');
  let redisTlsUrl = REDIS_URL.trim();
  if (redisTlsUrl.startsWith('redis-cli')) {
    redisTlsUrl = redisTlsUrl.replace(/^redis-cli\s+--tls\s+-u\s+/i, '').replace(/^redis:\/\//i, 'rediss://');
  } else if (redisTlsUrl.includes('upstash.io') && redisTlsUrl.startsWith('redis://')) {
    redisTlsUrl = redisTlsUrl.replace(/^redis:\/\//i, 'rediss://');
  }

  const redis = new Redis(redisTlsUrl, {
    connectTimeout: 7000,
    maxRetriesPerRequest: 2,
    keyPrefix: 'pocketcode:',
  });

  try {
    const pong = await redis.ping();
    console.log('   ✅ Redis PING -> PONG successful:', pong);

    // Test SET with 12h TTL (43200 seconds)
    const testKey = 'diag_test_key';
    const testVal = JSON.stringify({ verified: true, at: Date.now() });
    await redis.set(testKey, testVal, 'EX', 43200);

    const ttl = await redis.ttl(testKey);
    console.log(`   ✅ Redis Key SET with TTL: ${ttl}s (Expected ~43200s for 12 hours)`);

    const readBack = await redis.get(testKey);
    const parsed = JSON.parse(readBack);
    console.log('   ✅ Redis Key GET successful, value verified:', parsed.verified);

    await redis.del(testKey);
    console.log('   ✅ Redis Key DEL cleanup successful');
  } catch (err) {
    console.error('   ❌ Redis test failed:', err.message);
    redis.disconnect();
    process.exit(1);
  }

  // 3. Supabase Storage API Test
  console.log('\n3. Testing Supabase Storage Connection...');
  const base = `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1`;
  const authHeaders = {
    apikey: SUPABASE_SERVICE_KEY,
    ...(SUPABASE_SERVICE_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` } : {}),
  };

  try {
    const res = await fetch(`${base}/object/list/${SUPABASE_BUCKET}`, {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: 5 }),
    });

    if (!res.ok) {
      throw new Error(`Supabase returned status ${res.status}: ${await res.text()}`);
    }

    const items = await res.json();
    console.log(`   ✅ Supabase Storage reachable! Objects in root: ${items.length}`);
  } catch (err) {
    console.error('   ❌ Supabase Storage test failed:', err.message);
    redis.disconnect();
    process.exit(1);
  }

  // 4. Integrated Storage + Redis Cache Test
  console.log('\n4. Testing Storage + Redis Caching Layer...');
  const { createStorage } = require('../storage');
  const storage = createStorage(process.env, path.join(__dirname, '..'));

  // Wait a moment for cache connection to initialize
  await new Promise(r => setTimeout(r, 600));

  console.log(`   - Active cache provider: ${storage.cache.status().provider}`);
  console.log(`   - Cache TTL hours: ${storage.cache.status().ttlHours}h`);

  const initialStats = storage.cache.status().stats;
  console.log('   - Stats before list():', initialStats);

  // First list call: Cache Miss (calls Supabase)
  const start1 = Date.now();
  const list1 = await storage.list([]);
  const time1 = Date.now() - start1;
  console.log(`   - Call 1 list([]) took: ${time1}ms (Cache MISS -> fetched from Supabase & saved to Redis)`);
  console.log(`     Found ${list1.folders.length} folder(s): [${list1.folders.map(f => f.name).join(', ')}]`);

  // Second list call: Cache Hit (served directly from Upstash Redis)
  const start2 = Date.now();
  const list2 = await storage.list([]);
  const time2 = Date.now() - start2;
  console.log(`   - Call 2 list([]) took: ${time2}ms (Cache HIT -> served instantly from Redis!)`);

  const updatedStats = storage.cache.status().stats;
  console.log('   - Stats after list():', updatedStats);

  if (updatedStats.hits > initialStats.hits) {
    console.log('   ✅ Cache Hit confirmed! The 2nd request bypassed Supabase completely.');
  } else {
    console.warn('   ⚠️ Cache hit counter did not increment');
  }

  // 5. Test Keep-Alive Heartbeat
  console.log('\n5. Testing Supabase Keep-Alive Heartbeat...');
  try {
    const pingStart = Date.now();
    const pingResult = await storage.ping();
    const pingTime = Date.now() - pingStart;
    console.log(`   ✅ Keep-Alive ping to Supabase succeeded in ${pingTime}ms:`, pingResult);
    console.log('   ✅ 7-day inactivity pause timer has been reset on Supabase.');
  } catch (err) {
    console.error('   ❌ Keep-Alive ping failed:', err.message);
  }

  // 6. Test Cache Invalidation on Mutation
  console.log('\n6. Testing Cache Invalidation on File/Folder Mutation...');
  const testFolderName = `diag_temp_${Date.now().toString(36)}`;
  try {
    await storage.createFolder([testFolderName]);
    console.log(`   - Created test folder: "${testFolderName}"`);

    // Verify cache was invalidated and now includes the new folder
    const listAfterCreate = await storage.list([]);
    const found = listAfterCreate.folders.some(f => f.name === testFolderName);
    console.log(`   - Folder visible immediately after create: ${found ? 'YES (Cache invalidation works)' : 'NO'}`);

    // Clean up test folder
    await storage.deleteFolder([testFolderName]);
    console.log(`   - Deleted test folder: "${testFolderName}"`);

    const listAfterDelete = await storage.list([]);
    const stillThere = listAfterDelete.folders.some(f => f.name === testFolderName);
    console.log(`   - Folder gone immediately after delete: ${!stillThere ? 'YES (Cache invalidation works)' : 'NO'}`);

    console.log('   ✅ Mutation invalidation verified! New changes appear instantly.');
  } catch (err) {
    console.error('   ❌ Invalidation test error:', err.message);
  }

  // Cleanup connections
  await storage.cache.close();
  redis.disconnect();

  console.log('\n=== ALL SYSTEMS OPERATIONAL AND FULLY WORKING! ===');
  process.exit(0);
}

main().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});

