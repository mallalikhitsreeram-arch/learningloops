import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🚀 Starting Comprehensive Learning Loops Onboarding & Multi-User Isolation E2E Test...');

  // Helper request
  async function api(path, method = 'GET', body = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data: json };
  }

  // -------------------------------------------------------------
  // TEST 1: Student A (Rahul) Full Onboarding Flow
  // -------------------------------------------------------------
  console.log('\n--- TEST 1: Student A (Rahul) Full Onboarding Flow ---');
  const studentAEmail = `rahul.${Date.now()}@learningloops.dev`;
  
  // 1. Register Student A
  console.log('1. Registering Student A:', studentAEmail);
  const regA = await api('/api/auth/register', 'POST', {
    name: 'Rahul Sharma',
    email: studentAEmail,
    password: 'password123',
    role: 'student',
    phone: '+91 9876543210'
  });
  assert(regA.ok, 'Student A registration should succeed');
  assert.strictEqual(regA.data.unverified, true, 'New account should require email verification');

  // Verify email to get session token
  console.log('2. Verifying Student A email with OTP 424242...');
  const verifyEmailA = await api('/api/auth/verify-email', 'POST', {
    email: studentAEmail,
    code: '424242'
  });
  assert.strictEqual(verifyEmailA.ok, true, 'Email verification should succeed');
  const tokenA = verifyEmailA.data.token;
  const userA = verifyEmailA.data.user;
  assert(tokenA, 'Should receive session token after email verification');
  assert.strictEqual(userA.profileCompleted, false, 'New student profile should be incomplete');

  // 3. Check profile status (should indicate Step 1 pending)
  console.log('3. Checking Student A onboarding status...');
  const statusA1 = await api('/api/student/profile/status', 'GET', null, tokenA);
  assert.strictEqual(statusA1.ok, true);
  assert.strictEqual(statusA1.data.step1Completed, false, 'Step 1 should be incomplete initially');
  assert.strictEqual(statusA1.data.step2Completed, false, 'Step 2 should be incomplete initially');
  assert.strictEqual(statusA1.data.profileCompleted, false, 'Profile should be incomplete');

  // 4. Complete Step 1: "Let's Know You"
  console.log('4. Submitting Step 1 for Student A...');
  const step1A = await api('/api/student/profile/step1', 'POST', {
    fullName: 'Rahul Sharma',
    dateOfBirth: '2004-05-12',
    gender: 'Male',
    educationLevel: 'Undergraduate',
    collegeOrSchool: 'Nizamabad Engineering College',
    degree: 'B.Tech in Computer Science',
    branchOrStream: 'Computer Science & Engineering',
    classOrYear: '2nd Year',
    interests: ['Programming', 'Web Development'],
    careerGoal: 'Full-Stack Web Developer',
    goalDescription: 'Build high-performance web applications and join a leading product company',
    hobbies: ['Coding side projects', 'Chess & Strategy games'],
    dailyStudyTime: '1–2 hours' // should map to 90 target minutes
  }, tokenA);
  assert.strictEqual(step1A.ok, true, 'Step 1 submission should succeed');
  assert.strictEqual(step1A.data.step1Completed, true);
  assert.strictEqual(step1A.data.profile.dailyLearningTargetMinutes, 90, 'Daily target should be 90 minutes');

  // Verify resume status after Step 1
  const statusA2 = await api('/api/student/profile/status', 'GET', null, tokenA);
  assert.strictEqual(statusA2.data.step1Completed, true, 'Step 1 should now be completed');
  assert.strictEqual(statusA2.data.step2Completed, false, 'Step 2 should still be pending');

  // 5. Step 2: Send Parent OTP
  console.log('5. Requesting Parent OTP for Student A...');
  const parentAEmail = `sunita.${Date.now()}@example.com`;
  const sendOtpA = await api('/api/student/parent-otp/send', 'POST', {
    parentName: 'Sunita Sharma',
    parentEmail: parentAEmail,
    parentPhone: '+91 98490 12345',
    relation: 'Mother'
  }, tokenA);
  assert.strictEqual(sendOtpA.ok, true, 'OTP send should succeed');
  const otpA = sendOtpA.data.devOtp;
  assert(otpA, 'devOtp should be provided for testing');
  console.log(`   OTP generated: ${otpA}`);

  // 6. Verify Parent OTP
  console.log('6. Verifying Parent OTP for Student A...');
  const verifyA = await api('/api/student/parent-otp/verify', 'POST', {
    otp: otpA,
    parentEmail: parentAEmail,
    parentName: 'Sunita Sharma',
    parentPhone: '+91 98490 12345',
    relation: 'Mother'
  }, tokenA);
  assert.strictEqual(verifyA.ok, true, 'Parent OTP verification should succeed');
  assert.strictEqual(verifyA.data.profileCompleted, true, 'Profile should now be marked complete');
  assert.strictEqual(verifyA.data.profile.parentEmailVerified, true);
  assert.strictEqual(verifyA.data.profile.parentName, 'Sunita Sharma');

  // 7. Fetch Student A Dashboard
  console.log('7. Fetching Student A Dashboard...');
  const dashA = await api(`/api/student/dashboard/${userA.id}`, 'GET', null, tokenA);
  assert.strictEqual(dashA.ok, true, 'Dashboard fetch should succeed');
  assert.strictEqual(dashA.data.user.name, 'Rahul Sharma');
  assert.strictEqual(dashA.data.profile.college, 'Nizamabad Engineering College');
  assert.strictEqual(dashA.data.profile.currentGoal, 'Full-Stack Web Developer');
  assert.strictEqual(dashA.data.dailyGoal.targetMinutes, 90);
  assert.strictEqual(dashA.data.kpis.totalProblemsSolved, 0, 'New user should have 0 problems solved, NOT 248');
  assert.strictEqual(dashA.data.kpis.coursesCompleted, 0, 'New user should have 0 courses completed, NOT 4');
  console.log('   ✅ Student A dashboard strictly personalized and isolated!');

  // -------------------------------------------------------------
  // TEST 2: Student B (Priya) Multi-User Isolation
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Student B (Priya) Multi-User Isolation ---');
  const studentBEmail = `priya.${Date.now()}@learningloops.dev`;

  console.log('1. Registering Student B:', studentBEmail);
  const regB = await api('/api/auth/register', 'POST', {
    name: 'Priya Patel',
    email: studentBEmail,
    password: 'password123',
    role: 'student',
    phone: '+91 9123456789'
  });
  assert(regB.ok, 'Student B registration should succeed');

  const verifyEmailB = await api('/api/auth/verify-email', 'POST', {
    email: studentBEmail,
    code: '424242'
  });
  assert.strictEqual(verifyEmailB.ok, true);
  const tokenB = verifyEmailB.data.token;
  const userB = verifyEmailB.data.user;

  // Complete Step 1 with AI/ML track and different college
  console.log('2. Submitting Step 1 for Student B (AI / ML Engineer track)...');
  const step1B = await api('/api/student/profile/step1', 'POST', {
    fullName: 'Priya Patel',
    dateOfBirth: '2005-08-20',
    gender: 'Female',
    educationLevel: 'Undergraduate',
    collegeOrSchool: 'IIT Hyderabad',
    degree: 'B.Tech in Artificial Intelligence',
    branchOrStream: 'AI & Data Science',
    classOrYear: '1st Year',
    interests: ['AI & Machine Learning', 'Data Science', 'Mathematics'],
    careerGoal: 'AI / ML Engineer',
    goalDescription: 'Build foundation models and specialize in neural networks',
    hobbies: ['Robotics', 'Reading tech blogs'],
    dailyStudyTime: '2–3 hours' // should map to 150 target minutes
  }, tokenB);
  assert.strictEqual(step1B.ok, true);
  assert.strictEqual(step1B.data.profile.dailyLearningTargetMinutes, 150);

  // Complete Step 2 with parent OTP
  console.log('3. Verifying Parent OTP for Student B...');
  const parentBEmail = `ramesh.${Date.now()}@example.com`;
  const sendOtpB = await api('/api/student/parent-otp/send', 'POST', {
    parentName: 'Ramesh Patel',
    parentEmail: parentBEmail,
    parentPhone: '+91 98222 33333',
    relation: 'Father'
  }, tokenB);
  assert.strictEqual(sendOtpB.ok, true);

  const verifyB = await api('/api/student/parent-otp/verify', 'POST', {
    otp: sendOtpB.data.devOtp,
    parentEmail: parentBEmail,
    parentName: 'Ramesh Patel',
    parentPhone: '+91 98222 33333',
    relation: 'Father'
  }, tokenB);
  assert.strictEqual(verifyB.ok, true);

  // Fetch Student B Dashboard
  console.log('4. Fetching Student B Dashboard...');
  const dashB = await api(`/api/student/dashboard/${userB.id}`, 'GET', null, tokenB);
  assert.strictEqual(dashB.ok, true);
  assert.strictEqual(dashB.data.user.name, 'Priya Patel');
  assert.strictEqual(dashB.data.profile.college, 'IIT Hyderabad');
  assert.strictEqual(dashB.data.profile.currentGoal, 'AI / ML Engineer');
  assert.strictEqual(dashB.data.dailyGoal.targetMinutes, 150);

  // Verify recommendations tailored to AI/ML
  const hasAiRec = dashB.data.recommendations.some(r => r.title.toLowerCase().includes('python') || r.reason.toLowerCase().includes('ai'));
  assert.strictEqual(hasAiRec, true, 'Priya should receive AI/Python course recommendations');

  // Multi-user isolation assertions
  console.log('5. Asserting Strict Multi-User Isolation between Rahul and Priya...');
  assert.notStrictEqual(dashA.data.user.name, dashB.data.user.name, 'Students must have isolated names');
  assert.notStrictEqual(dashA.data.profile.college, dashB.data.profile.college, 'Colleges must be isolated');
  assert.notStrictEqual(dashA.data.profile.currentGoal, dashB.data.profile.currentGoal, 'Goals must be isolated');
  assert.notStrictEqual(dashA.data.profile.parentEmail, dashB.data.profile.parentEmail, 'Parents must be isolated');
  assert.notStrictEqual(dashA.data.dailyGoal.targetMinutes, dashB.data.dailyGoal.targetMinutes, 'Target minutes must be isolated');

  // Cross-user dashboard access denial (Student A cannot view Student B)
  console.log('6. Testing Cross-Tenant Security: Student A cannot fetch Student B dashboard...');
  const crossAccess = await api(`/api/student/dashboard/${userB.id}`, 'GET', null, tokenA);
  assert.strictEqual(crossAccess.status, 403, 'Cross-student access must be forbidden with 403');
  console.log('   ✅ Cross-student access correctly forbidden with 403!');

  // -------------------------------------------------------------
  // TEST 3: Resume Onboarding Test (Step 1 -> Close -> Resume Step 2)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Resume Onboarding Test ---');
  const studentCEmail = `resume.${Date.now()}@learningloops.dev`;
  const regC = await api('/api/auth/register', 'POST', {
    name: 'Ananya Roy',
    email: studentCEmail,
    password: 'password123',
    role: 'student'
  });
  const verifyEmailC = await api('/api/auth/verify-email', 'POST', {
    email: studentCEmail,
    code: '424242'
  });
  const tokenC = verifyEmailC.data.token;

  // Complete Step 1 only
  await api('/api/student/profile/step1', 'POST', {
    fullName: 'Ananya Roy',
    educationLevel: 'School',
    collegeOrSchool: 'Delhi Public School',
    classOrYear: 'Class 10',
    careerGoal: 'Software Developer',
    dailyStudyTime: '30 minutes'
  }, tokenC);

  // Check status simulates logging back in: should tell UI to resume at Step 2
  const statusC = await api('/api/student/profile/status', 'GET', null, tokenC);
  assert.strictEqual(statusC.data.step1Completed, true, 'Step 1 should be marked done');
  assert.strictEqual(statusC.data.step2Completed, false, 'Step 2 should be marked pending');
  assert.strictEqual(statusC.data.profileCompleted, false, 'Profile must still be incomplete');
  console.log('   ✅ Resume status correctly detected: Step 1 completed, Step 2 pending.');

  // -------------------------------------------------------------
  // TEST 4: Profile Editing Test (PUT /api/student/profile/update)
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Student Profile Editing Test ---');
  const updateRes = await api('/api/student/profile/update', 'PUT', {
    fullName: 'Rahul S. Sharma',
    careerGoal: 'Cloud & DevOps Engineer',
    dailyStudyTime: '2–3 hours',
    interests: ['Cloud Computing', 'Cybersecurity', 'Linux Architecture'],
    college: 'Nizamabad Institute of Technology'
  }, tokenA);

  assert.strictEqual(updateRes.ok, true, 'Profile update should succeed');
  assert.strictEqual(updateRes.data.profile.currentGoal, 'Cloud & DevOps Engineer');
  assert.strictEqual(updateRes.data.profile.college, 'Nizamabad Institute of Technology');
  assert.strictEqual(updateRes.data.profile.dailyLearningTargetMinutes, 150);

  // Fetch updated dashboard
  const updatedDashA = await api(`/api/student/dashboard/${userA.id}`, 'GET', null, tokenA);
  assert.strictEqual(updatedDashA.data.user.name, 'Rahul S. Sharma');
  assert.strictEqual(updatedDashA.data.profile.college, 'Nizamabad Institute of Technology');
  assert.strictEqual(updatedDashA.data.dailyGoal.targetMinutes, 150);
  console.log('   ✅ Profile editing successfully updated and reflected on the dashboard!');

  // -------------------------------------------------------------
  // TEST 5: Subsequent Login for Completed Student skips Onboarding
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Subsequent Login for Completed Student ---');
  const loginA = await api('/api/auth/login', 'POST', {
    email: studentAEmail,
    password: 'password123',
    selectedRole: 'student'
  });
  assert.strictEqual(loginA.ok, true);
  assert.strictEqual(loginA.data.user.profileCompleted, true, 'Completed student must have profileCompleted = true');
  console.log('   ✅ Completed student login directly flag profileCompleted = true (no re-onboarding)!');

  console.log('\n🎉 ALL ONBOARDING & DATA ISOLATION TESTS PASSED PERFECTLY!\n');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
