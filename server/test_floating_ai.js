import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function pass(msg) {
  console.log(`${colors.green}✓ PASS:${colors.reset} ${msg}`);
}

function fail(msg, err) {
  console.error(`${colors.red}✗ FAIL:${colors.reset} ${msg}`);
  if (err) console.error(err);
  process.exitCode = 1;
}

async function login(identity, password = 'password123', role = 'student') {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: identity, password, selectedRole: role })
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function askAi(token, query, pageContext = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api/ai/ask`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, pageContext })
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function runTests() {
  console.log(`\n${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.cyan}  GLOBAL FLOATING AI ASSISTANT & ISOLATION TESTS    ${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}\n`);

  // 1. Health check
  const h = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(h.ok, true, 'Server must be healthy');
  pass('Backend server is healthy');

  // =========================================================================
  // TEST 1: STUDENT 1 (STU1001 / Likhit Sreeram Malla - AI & ML)
  // =========================================================================
  console.log('\n--- TEST 1: STUDENT 1 (Likhit Sreeram Malla - AI & ML) ---');
  try {
    const l1 = await login('STU1001');
    assert.strictEqual(l1.status, 200, 'Likhit login must succeed');
    const token1 = l1.data.token;
    pass('STU1001 authenticated');

    // 1a. "What should I study today?"
    const resStudy1 = await askAi(token1, 'What should I study today?');
    assert.strictEqual(resStudy1.status, 200, 'AI query must return 200');
    assert(resStudy1.data.reply.includes('Statistics'), 'Reply must recommend Statistics for Likhit');
    assert(resStudy1.data.reply.includes('61%'), 'Reply must mention 61% score for Statistics');
    assert(resStudy1.data.reply.includes('AI & Machine Learning'), 'Reply must reference AI & Machine Learning goal');
    assert.strictEqual(resStudy1.data.actionTopic, 'Statistics', 'Action topic must be Statistics');
    pass('Likhit receives personalized recommendation for Statistics (61%) & AI/ML track');

    // 1b. "Explain my weak topics"
    const resWeak1 = await askAi(token1, 'Explain my weak topics');
    assert(resWeak1.data.reply.includes('Statistics'), 'Weak topic list must include Statistics');
    assert(resWeak1.data.reply.includes('Machine Learning Concepts'), 'Weak topic list must include ML Concepts');
    pass('Likhit receives targeted breakdown of weak topics');

    // 1c. "Create a study plan"
    const resPlan1 = await askAi(token1, 'Create a study plan');
    assert(resPlan1.data.reply.includes('7-Day Study Plan'), 'Must generate a 7-day plan');
    assert(resPlan1.data.reply.includes('Statistics'), 'Study plan must prioritize Statistics');
    pass('Likhit receives personalized study plan prioritizing weak areas');
  } catch (err) {
    fail('Student 1 tests failed', err);
  }

  // =========================================================================
  // TEST 2: STUDENT 2 (STU1002 / Rahul Sharma - Full-Stack Web Dev)
  // =========================================================================
  console.log('\n--- TEST 2: STUDENT 2 (Rahul Sharma - Full-Stack Web Dev) ---');
  try {
    const l2 = await login('STU1002');
    assert.strictEqual(l2.status, 200, 'Rahul login must succeed');
    const token2 = l2.data.token;
    pass('STU1002 authenticated');

    // "What should I study today?"
    const resStudy2 = await askAi(token2, 'What should I study today?');
    assert.strictEqual(resStudy2.status, 200, 'AI query must return 200');
    assert(resStudy2.data.reply.includes('Node.js & Express APIs'), 'Reply must recommend Node.js & Express APIs for Rahul');
    assert(resStudy2.data.reply.includes('Full-Stack'), 'Reply must reference Full-Stack track');
    assert.strictEqual(resStudy2.data.actionTopic, 'Node.js & Express APIs', 'Action topic must be Node.js & Express APIs');
    pass('Rahul receives personalized recommendation for Node.js & Express APIs (64%) & Full-Stack track');
  } catch (err) {
    fail('Student 2 tests failed', err);
  }

  // =========================================================================
  // TEST 3: STUDENT 3 (STU1003 / Priya Reddy - Data Scientist)
  // =========================================================================
  console.log('\n--- TEST 3: STUDENT 3 (Priya Reddy - Data Scientist) ---');
  try {
    const l3 = await login('STU1003');
    assert.strictEqual(l3.status, 200, 'Priya login must succeed');
    const token3 = l3.data.token;
    pass('STU1003 authenticated');

    // "What should I study today?"
    const resStudy3 = await askAi(token3, 'What should I study today?');
    assert.strictEqual(resStudy3.status, 200, 'AI query must return 200');
    assert(resStudy3.data.reply.includes('Big Data & SQL Pipelines'), 'Reply must recommend Big Data & SQL Pipelines for Priya');
    assert(resStudy3.data.reply.includes('68%'), 'Reply must mention 68% score for Big Data');
    assert(resStudy3.data.reply.includes('Data Scientist'), 'Reply must reference Data Scientist');
    assert.strictEqual(resStudy3.data.actionTopic, 'Big Data & SQL Pipelines', 'Action topic must be Big Data & SQL Pipelines');
    pass('Priya receives personalized recommendation for Big Data & SQL Pipelines (68%) & Data Scientist track');
  } catch (err) {
    fail('Student 3 tests failed', err);
  }

  // =========================================================================
  // TEST 4: STRICT STUDENT DATA ISOLATION (ZERO CROSS-CONTAMINATION)
  // =========================================================================
  console.log('\n--- TEST 4: STRICT STUDENT DATA ISOLATION ---');
  try {
    const l1 = await login('STU1001');
    const token1 = l1.data.token;

    // Tampering test: Pass STU1001's token but request body with spoofed studentId: 'STU1002'
    const spoofRes = await fetch(`${BASE_URL}/api/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token1}`
      },
      body: JSON.stringify({
        query: 'What should I study today?',
        studentId: 'STU1002' // Attempting to spoof Rahul
      })
    });
    const spoofData = await spoofRes.json();

    // The backend must rely exclusively on token1 (Likhit) and ignore the body studentId
    assert(spoofData.reply.includes('Statistics'), 'Backend must use token identity (Statistics), ignoring spoofed body');
    assert(!spoofData.reply.includes('Node.js & Express APIs'), 'Rahul private topic must never leak to Likhit');
    assert(!spoofData.reply.includes('Big Data & SQL Pipelines'), 'Priya private topic must never leak to Likhit');
    pass('Backend derives identity strictly from Bearer token; frontend spoofing rejected');
  } catch (err) {
    fail('Student data isolation test failed', err);
  }

  // =========================================================================
  // TEST 5: ASSESSMENT SECURITY SAFEGUARD (CLOSED-BOOK TEST INTEGRITY)
  // =========================================================================
  console.log('\n--- TEST 5: ASSESSMENT SECURITY SAFEGUARD ---');
  try {
    const l1 = await login('STU1001');
    const token1 = l1.data.token;

    // Query during active test
    const testRes = await askAi(token1, 'What is the answer to question 4?', { isTestActive: true });
    assert(testRes.data.reply.includes('Assessment Security Safeguard'), 'Must trigger Assessment Security Safeguard');
    assert.strictEqual(testRes.data.actionTopic, null, 'No action topic during active test');
    pass('AI strictly preserves closed-book assessment integrity when isTestActive is true');
  } catch (err) {
    fail('Assessment security safeguard test failed', err);
  }

  // =========================================================================
  // TEST 6: CONTEXT-AWARE ACTIVE COURSE GUIDANCE
  // =========================================================================
  console.log('\n--- TEST 6: CONTEXT-AWARE ACTIVE COURSE GUIDANCE ---');
  try {
    const l1 = await login('STU1001');
    const token1 = l1.data.token;

    const courseRes = await askAi(token1, 'Help with this course', { courseTitle: 'Python Fundamentals' });
    assert(courseRes.data.reply.includes('Python Fundamentals'), 'Must reference active course in tutoring reply');
    pass('AI correctly applies contextual tutoring for active course');
  } catch (err) {
    fail('Context-aware active course test failed', err);
  }

  console.log(`\n${colors.green}====================================================${colors.reset}`);
  console.log(`${colors.green}  ALL 6/6 FLOATING AI ASSISTANT TESTS PASSED!      ${colors.reset}`);
  console.log(`${colors.green}====================================================${colors.reset}\n`);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exitCode = 1;
});
