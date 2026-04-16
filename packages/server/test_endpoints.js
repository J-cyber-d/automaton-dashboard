const endpoints = [
  '/api/memory/working',
  '/api/memory/episodic',
  '/api/memory/semantic',
  '/api/memory/procedural',
  '/api/memory/relationships',
  '/api/memory/stats',
  '/api/soul/current',
  '/api/soul/history',
  '/api/soul/diff?from=1&to=2',
  '/api/heartbeat/schedule',
  '/api/heartbeat/history',
  '/api/heartbeat/wake-events',
  '/api/children',
  '/api/children/123/lifecycle',
  '/api/security/policy-decisions',
  '/api/security/modifications',
  '/api/security/stats',
  '/api/chat/history',
  '/api/settings',
  '/api/settings/constitution',
  '/api/settings/skills',
  '/api/settings/tools',
  '/api/settings/models'
];

async function run() {
  let allGood = true;
  for (const ep of endpoints) {
    try {
      const resp = await fetch('http://localhost:4820' + ep);
      if (!resp.ok) {
        console.error(`Endpoint ${ep} failed with status:`, resp.status);
        allGood = false;
        continue;
      }
      const data = await resp.json();
      console.log(`Endpoint ${ep} success:`, Object.keys(data).length > 0 || Array.isArray(data) ? 'data returned' : 'empty JSON');
    } catch (e) {
      console.error(`Endpoint ${ep} fetch error:`, e.message);
      allGood = false;
    }
  }

  // test POST
  try {
    const postResp = await fetch('http://localhost:4820/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello' })
    });
    const postData = await postResp.json();
    console.log('POST /api/chat/send success:', postData.success ? 'true' : postData.error);
  } catch (e) {
    console.error(`POST /api/chat/send error:`, e.message);
  }

  if (allGood) console.log('ALL TESTS PASSED');
  process.exit();
}
run();
