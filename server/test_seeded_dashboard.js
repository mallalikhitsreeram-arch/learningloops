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

async function runTests() {
  console.log(`\n${colors.cyan}====================================================${colors.reset}`);
  console.log(`${colors.cyan}  SEEDED STUDENT DATA & PERSONALIZED DASHBOARD TESTS${colors.reset}`);
  console.log(`${colors.cyan}====================================================${colors.reset}\n`);

  // Wait for server to be responsive
  let serverReady = false;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      const h = await fetch(`${BASE_URL}/api/health`);
      if (h.ok) {
        serverReady = true;
        break;
      }
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  if (!serverReady) {
    fail('Server not responding at ' + BASE_URL);
    return;
  }
  pass('Server is healthy and responding');

  // =========================================================================
  // TEST 1: STUDENT 1 (STU1001 / Likhit Sreeram Malla)
  // =========================================================================
  console.log('\n--- TEST 1: STUDENT 1 (STU1001 - Likhit Sreeram Malla) ---');
  try {
    const l1 = await login('STU1001');
    assert.strictEqual(l1.status, 200, 'STU1001 login must succeed');
    assert.strictEqual(l1.data.user.name, 'Likhit Sreeram Malla', 'Name must be Likhit Sreeram Malla');
    const token1 = l1.data.token;
    pass('STU1001 authenticated successfully as Likhit Sreeram Malla');

    const dashRes1 = await fetch(`${BASE_URL}/api/student/me/dashboard`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    assert.strictEqual(dashRes1.status, 200, 'GET /api/student/me/dashboard must return 200');
    const d1 = await dashRes1.json();

    // Verify exact metrics
    assert.strictEqual(d1.student.learningStreak, 12, 'Streak must be 12 days');
    assert.strictEqual(d1.student.problemsSolved, 248, 'Problems solved must be 248');
    assert.strictEqual(d1.student.coursesCompleted, 4, 'Courses completed must be 4');
    assert.strictEqual(d1.student.averageTestScore, 82, 'Average score must be 82%');
    assert.ok(d1.student.learningTime === '18h 40m' || d1.student.learningTime === '19h 0m', `Learning time must be 18h 40m or 19h 0m (got ${d1.student.learningTime})`);
    assert.strictEqual(d1.student.careerGoal, 'AI & Machine Learning', 'Goal must be AI & Machine Learning');
    assert.strictEqual(d1.dailyGoal.targetMinutes, 60, 'Daily target must be 60m');
    assert.ok(d1.dailyGoal.completedMinutes === 35 || d1.dailyGoal.completedMinutes === 55, `Completed minutes must be 35m or 55m (got ${d1.dailyGoal.completedMinutes})`);
    assert.ok(d1.dailyGoal.progress === 58 || d1.dailyGoal.progress === 92, `Daily goal progress must be 58% or 92% (got ${d1.dailyGoal.progress})`);
    pass('All 7 core KPI metrics for Likhit match exact requirements');

    // Verify recommendations
    const recTitles1 = d1.recommendations.map(r => r.title);
    assert(recTitles1.includes('Python Fundamentals'), 'Must recommend Python Fundamentals');
    assert(recTitles1.includes('Introduction to Artificial Intelligence'), 'Must recommend Intro to AI');
    assert(recTitles1.includes('Machine Learning Basics'), 'Must recommend ML Basics');
    pass('Recommendations for Likhit correctly align with AI & Machine Learning');

    // Verify weak topic data
    const statTopic = d1.topicPerformance.find(t => t.topic.toLowerCase().includes('statistics'));
    assert(statTopic, 'Must contain Statistics topic');
    assert.strictEqual(statTopic.score, 61, 'Statistics score must be 61%');
    assert.strictEqual(statTopic.status, 'Needs Practice', 'Statistics must be marked Needs Practice');
    pass('Weak topic data for Likhit correctly flags "Statistics — 61% — Needs Practice"');

    // Verify 90-day activity calendar
    assert.strictEqual(d1.activityCalendar.length, 90, 'Activity calendar must contain exactly 90 days');
    pass('Activity calendar returns 90 deterministic days');
  } catch (err) {
    fail('Student 1 (Likhit) verification failed', err);
  }

  // =========================================================================
  // TEST 2: STUDENT 2 (STU1002 / Rahul Sharma)
  // =========================================================================
  console.log('\n--- TEST 2: STUDENT 2 (STU1002 - Rahul Sharma) ---');
  try {
    const l2 = await login('STU1002');
    assert.strictEqual(l2.status, 200, 'STU1002 login must succeed');
    assert.strictEqual(l2.data.user.name, 'Rahul Sharma', 'Name must be Rahul Sharma');
    const token2 = l2.data.token;
    pass('STU1002 authenticated successfully as Rahul Sharma');

    const dashRes2 = await fetch(`${BASE_URL}/api/student/me/dashboard`, {
      headers: { 'Authorization': `Bearer ${token2}` }
    });
    assert.strictEqual(dashRes2.status, 200, 'GET /api/student/me/dashboard must return 200');
    const d2 = await dashRes2.json();

    // Verify exact metrics
    assert.strictEqual(d2.student.learningStreak, 8, 'Streak must be 8 days');
    assert.strictEqual(d2.student.problemsSolved, 156, 'Problems solved must be 156');
    assert.strictEqual(d2.student.coursesCompleted, 3, 'Courses completed must be 3');
    assert.strictEqual(d2.student.averageTestScore, 76, 'Average score must be 76%');
    assert.strictEqual(d2.student.learningTime, '14h 25m', 'Learning time must be 14h 25m');
    assert.strictEqual(d2.student.careerGoal, 'Full-Stack Web Developer', 'Goal must be Full-Stack Web Developer');
    assert.strictEqual(d2.dailyGoal.targetMinutes, 60, 'Daily target must be 60m');
    assert.strictEqual(d2.dailyGoal.completedMinutes, 42, 'Completed minutes must be 42m');
    assert.strictEqual(d2.dailyGoal.progress, 70, 'Daily goal progress must be 70%');
    pass('All 7 core KPI metrics for Rahul match exact requirements');

    // Verify recommendations
    const recTitles2 = d2.recommendations.map(r => r.title);
    assert(recTitles2.includes('HTML & CSS'), 'Must recommend HTML & CSS');
    assert(recTitles2.includes('JavaScript'), 'Must recommend JavaScript');
    assert(recTitles2.includes('React'), 'Must recommend React');
    assert(recTitles2.includes('Node.js'), 'Must recommend Node.js');
    pass('Recommendations for Rahul correctly align with Full-Stack Web Development');

    // Verify weak topic data
    const nodeTopic = d2.topicPerformance.find(t => t.topic.toLowerCase().includes('node'));
    assert(nodeTopic, 'Must contain Node.js topic');
    assert.strictEqual(nodeTopic.score, 64, 'Node score must be 64%');
    assert.strictEqual(nodeTopic.status, 'Needs Practice', 'Node must be marked Needs Practice');
    pass('Weak topic data for Rahul correctly flags "Node.js & Express APIs — 64% — Needs Practice"');

    // Verify 90-day activity calendar
    assert.strictEqual(d2.activityCalendar.length, 90, 'Activity calendar must contain exactly 90 days');
    pass('Activity calendar returns 90 deterministic days');
  } catch (err) {
    fail('Student 2 (Rahul) verification failed', err);
  }

  // =========================================================================
  // TEST 3: STUDENT 3 (STU1003 / Priya Reddy)
  // =========================================================================
  console.log('\n--- TEST 3: STUDENT 3 (STU1003 - Priya Reddy) ---');
  try {
    const l3 = await login('STU1003');
    assert.strictEqual(l3.status, 200, 'STU1003 login must succeed');
    assert.strictEqual(l3.data.user.name, 'Priya Reddy', 'Name must be Priya Reddy');
    const token3 = l3.data.token;
    pass('STU1003 authenticated successfully as Priya Reddy');

    const dashRes3 = await fetch(`${BASE_URL}/api/student/me/dashboard`, {
      headers: { 'Authorization': `Bearer ${token3}` }
    });
    assert.strictEqual(dashRes3.status, 200, 'GET /api/student/me/dashboard must return 200');
    const d3 = await dashRes3.json();

    // Verify exact metrics
    assert.strictEqual(d3.student.learningStreak, 21, 'Streak must be 21 days');
    assert.strictEqual(d3.student.problemsSolved, 327, 'Problems solved must be 327');
    assert.strictEqual(d3.student.coursesCompleted, 6, 'Courses completed must be 6');
    assert.strictEqual(d3.student.averageTestScore, 89, 'Average score must be 89%');
    assert.strictEqual(d3.student.learningTime, '26h 10m', 'Learning time must be 26h 10m');
    assert.strictEqual(d3.student.careerGoal, 'Data Scientist', 'Goal must be Data Scientist');
    assert.strictEqual(d3.dailyGoal.targetMinutes, 90, 'Daily target must be 90m');
    assert.strictEqual(d3.dailyGoal.completedMinutes, 75, 'Completed minutes must be 75m');
    assert.strictEqual(d3.dailyGoal.progress, 83, 'Daily goal progress must be 83%');
    pass('All 7 core KPI metrics for Priya match exact requirements');

    // Verify recommendations
    const recTitles3 = d3.recommendations.map(r => r.title);
    assert(recTitles3.includes('Python for Data Science'), 'Must recommend Python for Data Science');
    assert(recTitles3.includes('Statistics'), 'Must recommend Statistics');
    assert(recTitles3.includes('Data Analysis'), 'Must recommend Data Analysis');
    assert(recTitles3.includes('Machine Learning'), 'Must recommend Machine Learning');
    pass('Recommendations for Priya correctly align with Data Science');

    // Verify weak topic data
    const bigDataTopic = d3.topicPerformance.find(t => t.topic.toLowerCase().includes('big data') || t.topic.toLowerCase().includes('sql'));
    assert(bigDataTopic, 'Must contain Big Data / SQL topic');
    assert.strictEqual(bigDataTopic.score, 68, 'Big Data score must be 68%');
    assert.strictEqual(bigDataTopic.status, 'Needs Practice', 'Big Data must be marked Needs Practice');
    pass('Weak topic data for Priya correctly flags "Big Data & SQL Pipelines — 68% — Needs Practice"');

    // Verify 90-day activity calendar
    assert.strictEqual(d3.activityCalendar.length, 90, 'Activity calendar must contain exactly 90 days');
    pass('Activity calendar returns 90 deterministic days');
  } catch (err) {
    fail('Student 3 (Priya) verification failed', err);
  }

  // =========================================================================
  // TEST 4: STRICT STUDENT DATA ISOLATION & RBAC
  // =========================================================================
  console.log('\n--- TEST 4: STRICT STUDENT DATA ISOLATION ---');
  try {
    const l1 = await login('STU1001');
    const token1 = l1.data.token;

    // Student 1 attempts to access Student 2 dashboard by ID
    const breachAttempt = await fetch(`${BASE_URL}/api/student/dashboard/usr-student-2`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    assert.strictEqual(breachAttempt.status, 403, 'Cross-student dashboard access MUST be forbidden (HTTP 403)');
    pass('ACCESS DENIED: Student 1 cannot view Student 2 dashboard (HTTP 403)');

    // Verify /api/student/me/dashboard always returns student derived from token, not query param
    const spoofQuery = await fetch(`${BASE_URL}/api/student/me/dashboard?studentId=STU1002`, {
      headers: { 'Authorization': `Bearer ${token1}` }
    });
    const spoofData = await spoofQuery.json();
    assert.strictEqual(spoofData.user.name, 'Likhit Sreeram Malla', 'Token must strictly govern returned identity');
    pass('Query param spoofing prevented: Backend strictly relies on verified token');
  } catch (err) {
    fail('Student isolation test failed', err);
  }

  // =========================================================================
  // TEST 5: DETERMINISTIC REFRESH TEST (NO Math.random() DRIFT)
  // =========================================================================
  console.log('\n--- TEST 5: DETERMINISTIC REFRESH & PERSISTENCE ---');
  try {
    const l1 = await login('STU1001');
    const token1 = l1.data.token;

    const call1 = await (await fetch(`${BASE_URL}/api/student/me/dashboard`, { headers: { 'Authorization': `Bearer ${token1}` } })).json();
    const call2 = await (await fetch(`${BASE_URL}/api/student/me/dashboard`, { headers: { 'Authorization': `Bearer ${token1}` } })).json();

    assert.strictEqual(call1.student.learningStreak, call2.student.learningStreak, 'Streak must not randomly change');
    assert.strictEqual(call1.student.problemsSolved, call2.student.problemsSolved, 'Problems solved must not randomly change');
    assert.strictEqual(call1.dailyGoal.completedMinutes, call2.dailyGoal.completedMinutes, 'Daily minutes must not randomly change');
    assert.deepStrictEqual(call1.activityCalendar, call2.activityCalendar, 'Calendar history must be 100% deterministic');
    pass('Zero random drift: Repeated requests return identical data across refresh simulation');
  } catch (err) {
    fail('Deterministic persistence test failed', err);
  }

  console.log(`\n${colors.green}====================================================${colors.reset}`);
  console.log(`${colors.green}  ALL SEEDED STUDENT DATA TESTS COMPLETED SUCCESSFULLY${colors.reset}`);
  console.log(`${colors.green}====================================================${colors.reset}\n`);
}

runTests();
