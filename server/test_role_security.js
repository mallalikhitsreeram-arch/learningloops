// Automated Test Suite for Role-Based Portal Access & Data Isolation
import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING ROLE-BASED ACCESS CONTROL (RBAC) TESTS   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function testPass(desc) {
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  }

  function testFail(desc, err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message || err}`);
    failed++;
  }

  // --- Helper: Login ---
  async function login(email, password, selectedRole) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, selectedRole })
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  // --- TEST 1: Student Access & Isolation ---
  console.log('--- TEST 1: Student Portal Access & Boundary Checks ---');
  try {
    const stu1 = await login('aarav.sharma@example.edu', 'password123', 'student');
    assert.strictEqual(stu1.status, 200, 'Student login should succeed');
    assert.strictEqual(stu1.data.role, 'student', 'Role must be student');
    testPass('Student A (Aarav) successfully authenticated with role STUDENT');

    const token = stu1.data.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 1a. Can access own dashboard
    const ownDash = await fetch(`${BASE_URL}/api/student/dashboard/${stu1.data.user.id}`, { headers: authHeader });
    assert.strictEqual(ownDash.status, 200, 'Student should access own dashboard');
    const ownDashData = await ownDash.json();
    assert.strictEqual(ownDashData.user.name, 'Likhit Sreeram Malla');
    testPass('Student can access own dashboard (/api/student/dashboard/usr-student-1)');

    // 1b. Can access /api/student/me
    const studentMe = await fetch(`${BASE_URL}/api/student/me`, { headers: authHeader });
    assert.strictEqual(studentMe.status, 200, 'Student can access /api/student/me');
    testPass('Student can access token-resolved /api/student/me');

    // 1c. CANNOT access Student B dashboard
    const otherDash = await fetch(`${BASE_URL}/api/student/dashboard/usr-student-2`, { headers: authHeader });
    assert.strictEqual(otherDash.status, 403, 'Student A must NOT access Student B dashboard');
    testPass('ACCESS DENIED: Student A cannot access Student B dashboard (HTTP 403)');

    // 1d. CANNOT access Teacher portal APIs
    const teachRes = await fetch(`${BASE_URL}/api/teacher/classes/usr-teacher-1`, { headers: authHeader });
    assert.strictEqual(teachRes.status, 403, 'Student must NOT access teacher classes');
    testPass('ACCESS DENIED: Student cannot access Teacher portal (/api/teacher/classes) (HTTP 403)');

    // 1e. CANNOT access Parent portal APIs
    const parentRes = await fetch(`${BASE_URL}/api/parent/child-progress/usr-parent-1`, { headers: authHeader });
    assert.strictEqual(parentRes.status, 403, 'Student must NOT access parent child-progress');
    testPass('ACCESS DENIED: Student cannot access Parent portal (/api/parent/child-progress) (HTTP 403)');

    // 1f. CANNOT access Admin portal APIs
    const adminRes = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeader });
    assert.strictEqual(adminRes.status, 403, 'Student must NOT access admin overview');
    testPass('ACCESS DENIED: Student cannot access Admin portal (/api/admin/overview) (HTTP 403)');
  } catch (err) {
    testFail('TEST 1 Failed', err);
  }

  // --- TEST 2: Teacher Access & Isolation ---
  console.log('\n--- TEST 2: Teacher Portal Access & Boundary Checks ---');
  try {
    const tch = await login('ramanujan@loops-college.edu', 'password123', 'teacher');
    assert.strictEqual(tch.status, 200, 'Teacher login should succeed');
    assert.strictEqual(tch.data.role, 'teacher', 'Role must be teacher');
    testPass('Teacher (Prof. Ramanujan) successfully authenticated with role TEACHER');

    const token = tch.data.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 2a. Can access own classes
    const ownClasses = await fetch(`${BASE_URL}/api/teacher/classes/${tch.data.user.id}`, { headers: authHeader });
    assert.strictEqual(ownClasses.status, 200, 'Teacher should access own classes');
    testPass('Teacher can access own classes (/api/teacher/classes/usr-teacher-1)');

    // 2b. Cannot access another teacher classes
    const otherClasses = await fetch(`${BASE_URL}/api/teacher/classes/usr-teacher-2`, { headers: authHeader });
    assert.strictEqual(otherClasses.status, 403, 'Teacher cannot access another teacher classes');
    testPass('ACCESS DENIED: Teacher cannot access another teacher classes (HTTP 403)');

    // 2c. Cannot access Parent portal
    const parentRes = await fetch(`${BASE_URL}/api/parent/child-progress/usr-parent-1`, { headers: authHeader });
    assert.strictEqual(parentRes.status, 403, 'Teacher cannot access parent portal');
    testPass('ACCESS DENIED: Teacher cannot access Parent portal (HTTP 403)');

    // 2d. Cannot access Admin portal
    const adminRes = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeader });
    assert.strictEqual(adminRes.status, 403, 'Teacher cannot access admin overview');
    testPass('ACCESS DENIED: Teacher cannot access Admin portal (HTTP 403)');
  } catch (err) {
    testFail('TEST 2 Failed', err);
  }

  // --- TEST 3: Parent Access & Isolation ---
  console.log('\n--- TEST 3: Parent Portal Access & Boundary Checks ---');
  try {
    const par = await login('rajesh.sharma@example.com', 'password123', 'parent');
    assert.strictEqual(par.status, 200, 'Parent login should succeed');
    assert.strictEqual(par.data.role, 'parent', 'Role must be parent');
    testPass('Parent (Rajesh Sharma) successfully authenticated with role PARENT');

    const token = par.data.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 3a. Can access linked child progress
    const childProg = await fetch(`${BASE_URL}/api/parent/child-progress/${par.data.user.id}`, { headers: authHeader });
    assert.strictEqual(childProg.status, 200, 'Parent should access child progress');
    const childData = await childProg.json();
    assert.strictEqual(childData.student.id, 'usr-student-1', 'Linked student must be Aarav Sharma');
    testPass('Parent can access linked child progress (/api/parent/child-progress/usr-parent-1)');

    // 3b. Cannot access another parent's child progress
    const otherParent = await fetch(`${BASE_URL}/api/parent/child-progress/usr-parent-other`, { headers: authHeader });
    assert.strictEqual(otherParent.status, 403, 'Parent cannot access other parent monitoring');
    testPass('ACCESS DENIED: Parent cannot access another parent portal (HTTP 403)');

    // 3c. Cannot access Teacher portal
    const teachRes = await fetch(`${BASE_URL}/api/teacher/classes/usr-teacher-1`, { headers: authHeader });
    assert.strictEqual(teachRes.status, 403, 'Parent cannot access teacher portal');
    testPass('ACCESS DENIED: Parent cannot access Teacher portal (HTTP 403)');

    // 3d. Cannot access Admin portal
    const adminRes = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeader });
    assert.strictEqual(adminRes.status, 403, 'Parent cannot access admin overview');
    testPass('ACCESS DENIED: Parent cannot access Admin portal (HTTP 403)');
  } catch (err) {
    testFail('TEST 3 Failed', err);
  }

  // --- TEST 4: Admin Access ---
  console.log('\n--- TEST 4: Admin Portal Access & Management ---');
  try {
    const adm = await login('admin@loops-college.edu', 'password123', 'admin');
    assert.strictEqual(adm.status, 200, 'Admin login should succeed');
    assert.strictEqual(adm.data.role, 'admin', 'Role must be admin');
    testPass('Admin (Dr. Arvind Mehta) successfully authenticated with role ADMIN');

    const token = adm.data.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };

    // 4a. Can access Admin overview
    const overview = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeader });
    assert.strictEqual(overview.status, 200, 'Admin can access overview');
    const overviewData = await overview.json();
    assert.ok(overviewData.counts.totalUsers > 0, 'Total users count must be > 0');
    testPass(`Admin overview loaded successfully: ${overviewData.counts.totalUsers} total users`);

    // 4b. Can access Admin users list
    const usersRes = await fetch(`${BASE_URL}/api/admin/users`, { headers: authHeader });
    assert.strictEqual(usersRes.status, 200, 'Admin can list users');
    const users = await usersRes.json();
    assert.ok(Array.isArray(users) && users.length >= 4, 'Users list returned');
    testPass(`Admin user accounts list retrieved (${users.length} accounts)`);
  } catch (err) {
    testFail('TEST 4 Failed', err);
  }

  // --- TEST 5: Logout & Session Invalidation ---
  console.log('\n--- TEST 5: Logout & Token Revocation ---');
  try {
    const loginRes = await login('aarav.sharma@example.edu', 'password123', 'student');
    const token = loginRes.data.token;
    const authHeader = { 'Authorization': `Bearer ${token}` };

    // Verify token works
    const check1 = await fetch(`${BASE_URL}/api/me`, { headers: authHeader });
    assert.strictEqual(check1.status, 200, 'Token should be active before logout');

    // Call logout endpoint
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: authHeader
    });
    assert.strictEqual(logoutRes.status, 200, 'Logout request should succeed');

    // Subsequent call with revoked token must fail with 401
    const check2 = await fetch(`${BASE_URL}/api/me`, { headers: authHeader });
    assert.strictEqual(check2.status, 401, 'Revoked token must be rejected with HTTP 401');
    testPass('Session successfully invalidated on logout; subsequent requests rejected with HTTP 401');
  } catch (err) {
    testFail('TEST 5 Failed', err);
  }

  // --- TEST 6: Student A vs Student B Data Isolation ---
  console.log('\n--- TEST 6: Student A vs Student B Data Isolation ---');
  try {
    // Student A (Aarav Sharma)
    const stuA = await login('aarav.sharma@example.edu', 'password123', 'student');
    const tokenA = stuA.data.token;
    const dashA = await fetch(`${BASE_URL}/api/student/dashboard/${stuA.data.user.id}`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const dataA = await dashA.json();
    assert.strictEqual(dataA.user.name, 'Likhit Sreeram Malla');
    assert.strictEqual(dataA.user.id, 'usr-student-1');

    // Student B (Rahul Sharma)
    const stuB = await login('rahul.sharma@example.edu', 'password123', 'student');
    const tokenB = stuB.data.token;
    const dashB = await fetch(`${BASE_URL}/api/student/dashboard/${stuB.data.user.id}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dataB = await dashB.json();
    assert.strictEqual(dataB.user.name, 'Rahul Sharma');
    assert.strictEqual(dataB.user.id, 'usr-student-2');

    // Verify Student B cannot see Student A data
    assert.notStrictEqual(dataA.user.name, dataB.user.name);
    assert.notStrictEqual(dataA.user.id, dataB.user.id);

    // Student B tries to fetch Student A data
    const breachAttempt = await fetch(`${BASE_URL}/api/student/dashboard/${stuA.data.user.id}`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert.strictEqual(breachAttempt.status, 403, 'Student B cannot query Student A data');
    testPass('Data Isolation Verified: Student B cannot access Student A private information (HTTP 403)');
  } catch (err) {
    testFail('TEST 6 Failed', err);
  }

  // --- TEST 7: Login Role Mismatch Validation ---
  console.log('\n--- TEST 7: Login Portal Role Validation ---');
  try {
    // Student trying to login via Teacher portal
    const mismatch1 = await login('aarav.sharma@example.edu', 'password123', 'teacher');
    assert.strictEqual(mismatch1.status, 403, 'Login must be rejected with 403 when portal role mismatches');
    assert.strictEqual(mismatch1.data.roleMismatch, true, 'Response must flag roleMismatch');
    testPass('Login Rejected: Student account cannot login via Teacher Portal (HTTP 403)');

    // Teacher trying to login via Parent portal
    const mismatch2 = await login('ramanujan@loops-college.edu', 'password123', 'parent');
    assert.strictEqual(mismatch2.status, 403, 'Login must be rejected with 403 when portal role mismatches');
    assert.strictEqual(mismatch2.data.roleMismatch, true, 'Response must flag roleMismatch');
    testPass('Login Rejected: Teacher account cannot login via Parent Portal (HTTP 403)');
  } catch (err) {
    testFail('TEST 7 Failed', err);
  }

  console.log('\n====================================================');
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
