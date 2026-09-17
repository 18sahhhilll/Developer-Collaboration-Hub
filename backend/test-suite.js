/**
 * Comprehensive Test Suite for Developer Collaboration Hub
 * Tests: Backend API endpoints, Frontend build, Data integrity, Badge system
 * 
 * Run: node test-suite.js
 */

const BASE = 'http://localhost:5000/api';
const results = [];
let testUser = null;
let authToken = null;

// Unique test user credentials
const TEST_EMAIL = `testbot_${Date.now()}@test.com`;
const TEST_PASS = 'TestBot@12345!';
const TEST_NAME = 'Test Bot';
const TEST_USERNAME = `testbot_${Date.now()}`.slice(0, 20);

function log(category, name, status, detail = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  results.push({ category, name, status, detail });
  console.log(`  ${emoji} [${category}] ${name}${detail ? ' — ' + detail : ''}`);
}

async function request(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  let data = null;
  const text = await res.text();
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data, ok: res.ok };
}

// ─── TEST GROUPS ──────────────────────────────────────────────

async function testHealthCheck() {
  try {
    const res = await request('GET', '/health');
    if (res.ok && res.data?.status === 'ok') {
      log('Server', 'Health check endpoint', 'PASS');
    } else {
      log('Server', 'Health check endpoint', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Server', 'Health check endpoint', 'FAIL', e.message);
  }
}

async function testCORS() {
  try {
    const res = await fetch(`${BASE}/health`, {
      method: 'OPTIONS',
      headers: { 'Origin': 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' },
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    if (allowOrigin === 'http://localhost:5173') {
      log('Server', 'CORS allows localhost:5173', 'PASS');
    } else {
      log('Server', 'CORS allows localhost:5173', 'FAIL', `Got: ${allowOrigin}`);
    }
  } catch (e) {
    log('Server', 'CORS allows localhost:5173', 'FAIL', e.message);
  }
}

async function testAuthRegistration() {
  try {
    const res = await request('POST', '/auth/register', {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASS,
      username: TEST_USERNAME,
    });
    if (res.ok && res.data?.token) {
      authToken = res.data.token;
      log('Auth', 'User registration', 'PASS');
    } else if (res.status === 400) {
      log('Auth', 'User registration', 'WARN', res.data?.message || 'Validation error');
    } else {
      log('Auth', 'User registration', 'FAIL', res.data?.message || `Status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'User registration', 'FAIL', e.message);
  }
}

async function testAuthLogin() {
  try {
    const res = await request('POST', '/auth/login', {
      identifier: TEST_EMAIL,
      password: TEST_PASS,
    });
    if (res.ok && res.data?.token) {
      authToken = res.data.token;
      log('Auth', 'User login (email)', 'PASS');
    } else if ((res.status === 403 || res.status === 400) && res.data?.emailNotVerified) {
      log('Auth', 'User login (email) — correctly blocked unverified email (403)', 'PASS');
    } else {
      log('Auth', 'User login (email)', 'FAIL', res.data?.message || `Status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'User login (email)', 'FAIL', e.message);
  }
}

async function testAuthLoginByUsername() {
  try {
    const res = await request('POST', '/auth/login', {
      identifier: TEST_USERNAME,
      password: TEST_PASS,
    });
    if (res.ok && res.data?.token) {
      log('Auth', 'User login (username)', 'PASS');
    } else if ((res.status === 403 || res.status === 400) && res.data?.emailNotVerified) {
      log('Auth', 'User login (username) — correctly blocked unverified email (403)', 'PASS');
    } else {
      log('Auth', 'User login (username)', 'FAIL', res.data?.message || `Status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'User login (username)', 'FAIL', e.message);
  }
}

async function testAuthLoginBadPassword() {
  try {
    const res = await request('POST', '/auth/login', {
      identifier: TEST_EMAIL,
      password: 'wrong_password',
    });
    if (res.status === 400 || res.status === 401) {
      log('Auth', 'Login rejects bad password', 'PASS');
    } else {
      log('Auth', 'Login rejects bad password', 'FAIL', `Unexpected status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'Login rejects bad password', 'FAIL', e.message);
  }
}

async function testAuthMe() {
  try {
    const res = await request('GET', '/auth/me', null, authToken);
    if (res.ok && res.data?.email) {
      testUser = res.data;
      log('Auth', 'GET /auth/me (authenticated)', 'PASS');
    } else {
      log('Auth', 'GET /auth/me (authenticated)', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'GET /auth/me (authenticated)', 'FAIL', e.message);
  }
}

async function testAuthMeNoToken() {
  try {
    const res = await request('GET', '/auth/me');
    if (res.status === 401) {
      log('Auth', 'GET /auth/me rejects no token', 'PASS');
    } else {
      log('Auth', 'GET /auth/me rejects no token', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'GET /auth/me rejects no token', 'FAIL', e.message);
  }
}

async function testDuplicateRegistration() {
  try {
    const res = await request('POST', '/auth/register', {
      name: TEST_NAME,
      email: TEST_EMAIL,
      password: TEST_PASS,
      username: TEST_USERNAME + 'x',
    });
    if (res.status === 400) {
      log('Auth', 'Rejects duplicate email registration', 'PASS');
    } else {
      log('Auth', 'Rejects duplicate email registration', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Auth', 'Rejects duplicate email registration', 'FAIL', e.message);
  }
}

// ── Profile Tests ──

async function testGetProfile() {
  try {
    const res = await request('GET', '/users/profile', null, authToken);
    if (res.ok && res.data?.name) {
      log('Profile', 'GET own profile', 'PASS');
    } else {
      log('Profile', 'GET own profile', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'GET own profile', 'FAIL', e.message);
  }
}

async function testUpdateProfile() {
  try {
    const res = await request('PUT', '/users/profile', {
      bio: 'Test bot bio - automated testing',
      role: 'QA Engineer',
      skills: ['React', 'Node.js', 'CSS', 'Express'],
      availability: 'Available',
    }, authToken);
    if (res.ok && res.data?.bio === 'Test bot bio - automated testing') {
      log('Profile', 'Update profile (bio, role, skills)', 'PASS');
    } else {
      log('Profile', 'Update profile (bio, role, skills)', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'Update profile (bio, role, skills)', 'FAIL', e.message);
  }
}

async function testProfileStats() {
  try {
    const res = await request('GET', '/users/profile/stats', null, authToken);
    if (res.ok && typeof res.data?.projectsCreated === 'number') {
      log('Profile', 'GET profile stats', 'PASS');
    } else {
      log('Profile', 'GET profile stats', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'GET profile stats', 'FAIL', e.message);
  }
}

async function testProfileProjects() {
  try {
    const res = await request('GET', '/users/profile/projects?filter=all', null, authToken);
    if (res.ok && Array.isArray(res.data)) {
      log('Profile', 'GET profile projects', 'PASS');
    } else {
      log('Profile', 'GET profile projects', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'GET profile projects', 'FAIL', e.message);
  }
}

async function testOnboarding() {
  try {
    const res = await request('PUT', '/users/onboarding', {
      bio: 'Test bot bio',
      skills: ['React', 'Node.js'],
      skip: false,
    }, authToken);
    if (res.ok) {
      log('Profile', 'Complete onboarding', 'PASS');
    } else {
      log('Profile', 'Complete onboarding', 'FAIL', res.data?.message || `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'Complete onboarding', 'FAIL', e.message);
  }
}

// ── Badge Tests ──

async function testGetBadges() {
  try {
    const res = await request('GET', '/users/badges', null, authToken);
    if (res.ok && Array.isArray(res.data)) {
      log('Badges', `GET user badges (count: ${res.data.length})`, 'PASS');
    } else {
      log('Badges', 'GET user badges', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Badges', 'GET user badges', 'FAIL', e.message);
  }
}

async function testRefreshBadges() {
  try {
    const res = await request('POST', '/users/badges/refresh', {}, authToken);
    if (res.ok && Array.isArray(res.data?.badges)) {
      const newCount = res.data.newBadges?.length || 0;
      log('Badges', `Refresh badges (new: ${newCount}, total: ${res.data.badges.length})`, 'PASS');
      // Validate badge structure
      if (res.data.badges.length > 0) {
        const b = res.data.badges[0];
        const hasFields = b.id && b.title && b.icon && b.earnedAt;
        log('Badges', 'Badge schema validation (id, title, icon, earnedAt)', hasFields ? 'PASS' : 'FAIL',
          hasFields ? '' : `Missing fields in: ${JSON.stringify(b)}`);
      }
    } else {
      log('Badges', 'Refresh badges', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Badges', 'Refresh badges', 'FAIL', e.message);
  }
}

async function testBadgesNoAuth() {
  try {
    const res = await request('GET', '/users/badges');
    if (res.status === 401) {
      log('Badges', 'GET badges rejects unauthenticated', 'PASS');
    } else {
      log('Badges', 'GET badges rejects unauthenticated', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Badges', 'GET badges rejects unauthenticated', 'FAIL', e.message);
  }
}

// ── Project Tests ──

let testProjectId = null;

async function testCreateProject() {
  try {
    const res = await request('POST', '/projects', {
      title: `Test Project ${Date.now()}`,
      description: 'Automated test project for validation',
      techStack: ['React', 'Node.js'],
      teamSize: 3,
      rolesNeeded: ['Frontend Developer'],
    }, authToken);
    if (res.ok && res.data?._id) {
      testProjectId = res.data._id;
      log('Projects', 'Create project', 'PASS');
    } else {
      log('Projects', 'Create project', 'FAIL', res.data?.message || `Status: ${res.status}`);
    }
  } catch (e) {
    log('Projects', 'Create project', 'FAIL', e.message);
  }
}

async function testGetProjects() {
  try {
    const res = await request('GET', '/projects', null, authToken);
    if (res.ok && (Array.isArray(res.data) || Array.isArray(res.data?.projects))) {
      const projects = Array.isArray(res.data) ? res.data : res.data.projects;
      log('Projects', `GET all projects (count: ${projects.length})`, 'PASS');
    } else {
      log('Projects', 'GET all projects', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Projects', 'GET all projects', 'FAIL', e.message);
  }
}

async function testGetProjectById() {
  if (!testProjectId) {
    log('Projects', 'GET project by ID', 'SKIP', 'No test project created');
    return;
  }
  try {
    const res = await request('GET', `/projects/${testProjectId}`, null, authToken);
    if (res.ok && res.data?._id === testProjectId) {
      log('Projects', 'GET project by ID', 'PASS');
    } else {
      log('Projects', 'GET project by ID', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Projects', 'GET project by ID', 'FAIL', e.message);
  }
}

async function testUpdateProject() {
  if (!testProjectId) {
    log('Projects', 'Update project', 'SKIP', 'No test project created');
    return;
  }
  try {
    const res = await request('PUT', `/projects/${testProjectId}`, {
      description: 'Updated test project description',
    }, authToken);
    if (res.ok) {
      log('Projects', 'Update project', 'PASS');
    } else {
      log('Projects', 'Update project', 'FAIL', res.data?.message || `Status: ${res.status}`);
    }
  } catch (e) {
    log('Projects', 'Update project', 'FAIL', e.message);
  }
}



// ── Application Tests ──

async function testGetApplications() {
  try {
    const res = await request('GET', '/applications/my', null, authToken);
    if (res.ok && Array.isArray(res.data)) {
      log('Applications', `GET applications /my (count: ${res.data.length})`, 'PASS');
    } else {
      log('Applications', 'GET applications /my', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Applications', 'GET applications /my', 'FAIL', e.message);
  }
}

// ── Chat Tests ──

async function testGetChats() {
  try {
    const res = await request('GET', '/chat', null, authToken);
    if (res.ok && Array.isArray(res.data)) {
      log('Chat', `GET chats (count: ${res.data.length})`, 'PASS');
    } else {
      log('Chat', 'GET chats', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Chat', 'GET chats', 'FAIL', e.message);
  }
}

// ── Notification Tests ──

async function testGetNotifications() {
  try {
    const res = await request('GET', '/notifications', null, authToken);
    if (res.ok && Array.isArray(res.data)) {
      log('Notifications', `GET notifications (count: ${res.data.length})`, 'PASS');
    } else {
      log('Notifications', 'GET notifications', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Notifications', 'GET notifications', 'FAIL', e.message);
  }
}

// ── Skills Tests ──

async function testGetSkills() {
  try {
    const res = await request('GET', '/skills', null, authToken);
    if (res.ok && (Array.isArray(res.data) || res.data?.categories)) {
      log('Skills', `GET skills list (categories: ${Object.keys(res.data.categories || {}).length})`, 'PASS');
    } else {
      log('Skills', 'GET skills list', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Skills', 'GET skills list', 'FAIL', e.message);
  }
}

// ── Bookmark Tests ──

async function testBookmarks() {
  if (!testProjectId) {
    log('Bookmarks', 'Toggle bookmark', 'SKIP', 'No test project created');
    return;
  }
  try {
    // Toggle ON
    const res1 = await request('POST', `/users/bookmarks/${testProjectId}`, {}, authToken);
    if (res1.ok) {
      log('Bookmarks', 'Toggle bookmark ON', 'PASS');
    } else {
      log('Bookmarks', 'Toggle bookmark ON', 'FAIL', `Status: ${res1.status}`);
    }
    // Get bookmarks
    const res2 = await request('GET', '/users/bookmarks', null, authToken);
    if (res2.ok && Array.isArray(res2.data)) {
      log('Bookmarks', `GET bookmarks (count: ${res2.data.length})`, 'PASS');
    } else {
      log('Bookmarks', 'GET bookmarks', 'FAIL', `Status: ${res2.status}`);
    }
    // Toggle OFF
    const res3 = await request('POST', `/users/bookmarks/${testProjectId}`, {}, authToken);
    if (res3.ok) {
      log('Bookmarks', 'Toggle bookmark OFF', 'PASS');
    } else {
      log('Bookmarks', 'Toggle bookmark OFF', 'FAIL', `Status: ${res3.status}`);
    }
  } catch (e) {
    log('Bookmarks', 'Bookmarks', 'FAIL', e.message);
  }
}

// ── Security Tests ──

async function testSecurityHeaders() {
  try {
    const res = await fetch(`${BASE}/health`);
    const helmet = res.headers.get('x-content-type-options');
    const xframe = res.headers.get('x-frame-options');
    if (helmet === 'nosniff') {
      log('Security', 'X-Content-Type-Options: nosniff', 'PASS');
    } else {
      log('Security', 'X-Content-Type-Options header', 'FAIL', `Got: ${helmet}`);
    }
    if (xframe) {
      log('Security', 'X-Frame-Options header present', 'PASS');
    } else {
      log('Security', 'X-Frame-Options header', 'WARN', 'Not set');
    }
  } catch (e) {
    log('Security', 'Security headers', 'FAIL', e.message);
  }
}

async function testRateLimiting() {
  // Auth endpoints have a 20/15min limit - test that headers exist
  try {
    const res = await fetch(`${BASE}/auth/me`);
    const remaining = res.headers.get('ratelimit-remaining');
    if (remaining !== null) {
      log('Security', `Rate limiting active (remaining: ${remaining})`, 'PASS');
    } else {
      log('Security', 'Rate limiting headers', 'WARN', 'Headers not present');
    }
  } catch (e) {
    log('Security', 'Rate limiting', 'FAIL', e.message);
  }
}

// ── Public Profile Tests ──

async function testPublicProfileById() {
  if (!testUser?._id) {
    log('Profile', 'GET public profile by ID', 'SKIP', 'No user');
    return;
  }
  try {
    const res = await request('GET', `/users/profile/${testUser._id}`, null, authToken);
    if (res.ok && res.data?.name) {
      // Verify badges field is present in public profile
      const hasBadges = Array.isArray(res.data.badges);
      log('Profile', 'GET public profile by ID', 'PASS');
      log('Profile', 'Public profile includes badges array', hasBadges ? 'PASS' : 'FAIL');
    } else {
      log('Profile', 'GET public profile by ID', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'GET public profile by ID', 'FAIL', e.message);
  }
}

async function testPublicProfileByUsername() {
  try {
    const res = await request('GET', `/users/profile/${TEST_USERNAME}`, null, authToken);
    if (res.ok && res.data?.name) {
      log('Profile', 'GET public profile by username', 'PASS');
    } else {
      log('Profile', 'GET public profile by username', 'FAIL', `Status: ${res.status}`);
    }
  } catch (e) {
    log('Profile', 'GET public profile by username', 'FAIL', e.message);
  }
}

// ── Cleanup ──

async function cleanup() {
  // Delete the test project if created
  if (testProjectId) {
    try {
      await request('DELETE', `/projects/${testProjectId}`, null, authToken);
      log('Cleanup', 'Delete test project', 'PASS');
    } catch {
      log('Cleanup', 'Delete test project', 'WARN', 'Could not delete');
    }
  }
}

// ─── MAIN ──────────────────────────────────────────────────────

async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Developer Collaboration Hub — Comprehensive Test Suite');
  console.log('══════════════════════════════════════════════════════\n');

  console.log('▸ Server & CORS');
  await testHealthCheck();
  await testCORS();

  console.log('\n▸ Authentication');
  await testAuthRegistration();
  await testAuthLogin();
  await testAuthLoginByUsername();
  await testAuthLoginBadPassword();
  await testAuthMe();
  await testAuthMeNoToken();
  await testDuplicateRegistration();

  console.log('\n▸ Profile');
  await testGetProfile();
  await testUpdateProfile();
  await testOnboarding();
  await testProfileStats();
  await testProfileProjects();
  await testPublicProfileById();
  await testPublicProfileByUsername();

  console.log('\n▸ Badges');
  await testGetBadges();
  await testRefreshBadges();
  await testBadgesNoAuth();

  console.log('\n▸ Projects');
  await testCreateProject();
  await testGetProjects();
  await testGetProjectById();
  await testUpdateProject();

  console.log('\n▸ Applications');
  await testGetApplications();

  console.log('\n▸ Chat');
  await testGetChats();

  console.log('\n▸ Notifications');
  await testGetNotifications();

  console.log('\n▸ Skills');
  await testGetSkills();

  console.log('\n▸ Bookmarks');
  await testBookmarks();

  console.log('\n▸ Security');
  await testSecurityHeaders();
  await testRateLimiting();

  // Cleanup
  console.log('\n▸ Cleanup');
  await cleanup();

  // ── Summary ──
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} passed | ${failed} failed | ${warned} warnings | ${skipped} skipped`);
  console.log('══════════════════════════════════════════════════════\n');

  if (failed > 0) {
    console.log('  Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`    ❌ [${r.category}] ${r.name}${r.detail ? ' — ' + r.detail : ''}`);
    });
    console.log('');
  }

  // Output JSON for report
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total, passed, failed, warned, skipped },
    results,
  };
  
  const fs = await import('fs');
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  console.log('  📄 Full report saved to test-report.json\n');

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Test suite crashed:', e);
  process.exit(1);
});
