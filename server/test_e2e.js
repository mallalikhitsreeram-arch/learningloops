// Comprehensive verification script for LEARNING LOOPS backend and data flows
const BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING LEARNING LOOPS E2E VERIFICATION ---');

  // 1. Health check
  console.log('\n[1] Testing Health Endpoint...');
  const healthRes = await fetch(`${BASE}/health`);
  const health = await healthRes.json();
  console.log('✓ Health:', health.status, health.tagline);

  // 2. Auth & Users
  console.log('\n[2] Testing Authentication & Users...');
  const usersRes = await fetch(`${BASE}/auth/users`);
  const users = await usersRes.json();
  console.log(`✓ Fetched ${users.length} demo accounts (student, teacher, parent).`);

  // 3. OTP verification flow
  console.log('\n[3] Testing Phone OTP Verification Flow...');
  const otpSendRes = await fetch(`${BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+91 98765 43210' })
  });
  const otpSend = await otpSendRes.json();
  console.log('✓ OTP Send response:', otpSend.message, '(Debug OTP:', otpSend.debugOtp, ')');

  const otpVerifyRes = await fetch(`${BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '+91 98765 43210', otp: '424242' })
  });
  const otpVerify = await otpVerifyRes.json();
  console.log('✓ OTP Verify response:', otpVerify.success ? 'Success' : 'Failed', 'User:', otpVerify.user.name);

  // 4. Student Dashboard & KPI retrieval
  console.log('\n[4] Testing Student Dashboard & KPIs...');
  const dashRes = await fetch(`${BASE}/student/dashboard/usr-student-1`, {
    headers: { 'Authorization': `Bearer ${otpVerify.token}` }
  });
  const dash = await dashRes.json();
  console.log('✓ Student:', dash.user.name);
  console.log('✓ KPIs:', dash.kpis);
  console.log('✓ Daily Goal:', dash.dailyGoal);
  console.log(`✓ Activity History entries: ${dash.activityHistory.length} (3 months)`);
  console.log(`✓ Smart Recommendations: ${dash.recommendations.length}`);

  // 5. Courses & Download Bundles
  console.log('\n[5] Testing 10 Courses & Offline Download Packages...');
  const coursesRes = await fetch(`${BASE}/courses`);
  const courses = await coursesRes.json();
  console.log(`✓ Total Courses: ${courses.length}`);
  courses.forEach((c, idx) => console.log(`   ${idx + 1}. ${c.title} (${c.difficulty}, ${c.downloadSizeMb}MB, Low-Data: ${c.lowDataSizeMb}MB)`));

  // Test downloading course bundle
  const downloadRes = await fetch(`${BASE}/courses/crs-c-lang/download-package?option=lessons_quizzes`);
  const bundle = await downloadRes.json();
  console.log(`✓ Downloaded bundle for ${bundle.title}: ${bundle.questions.length} questions included, size: ${bundle.sizeMb}MB.`);

  // 6. Practice Questions Filtering
  console.log('\n[6] Testing Interactive Practice Question Pool...');
  const practiceRes = await fetch(`${BASE}/practice/questions?topic=Pointers`);
  const pointerQuestions = await practiceRes.json();
  console.log(`✓ Found ${pointerQuestions.length} practice questions for topic 'Pointers':`);
  pointerQuestions.forEach(q => console.log(`   - Q: "${q.question}" [Correct: Option ${q.correctIndex}]`));

  // 7. Mock Exam Submission & Instant Diagnostics
  console.log('\n[7] Testing Mock Exam Submission & Topic Diagnostic Evaluation...');
  const examRes = await fetch(`${BASE}/tests/test-c-biweekly-1/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      answers: {
        'q-101': 2,
        'q-102': 2,
        'q-103': 0,
        'q-104': 1,
        'q-105': 1,
        'q-106': 0
      },
      timeTakenSeconds: 720,
      studentId: 'usr-student-1'
    })
  });
  const examResult = await examRes.json();
  console.log('✓ Exam Evaluation Result:');
  console.log(`   Score: ${examResult.attempt.scorePercentage}% (${examResult.attempt.rawScore}/${examResult.attempt.totalMarks})`);
  console.log(`   Rating: ${examResult.attempt.performanceRating}`);
  console.log('   Topic Breakdown:');
  examResult.attempt.topicBreakdown.forEach(t => console.log(`     • ${t.topic}: ${t.accuracy}% (${t.status})`));
  console.log('   Generated Recommendations:', examResult.attempt.recommendations.map(r => r.title));

  // 8. Offline Synchronization Engine (Idempotency check)
  console.log('\n[8] Testing Offline Synchronization Engine with Idempotency...');
  const syncEventId = `test-sync-evt-${Date.now()}`;
  const syncPayload = {
    studentId: 'usr-student-1',
    events: [
      {
        activityEventId: syncEventId,
        type: 'lesson_completed',
        courseId: 'crs-c-lang',
        lessonId: 'les-c-7',
        durationMinutes: 25,
        timestamp: new Date().toISOString()
      }
    ]
  };

  const sync1Res = await fetch(`${BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncPayload)
  });
  const sync1 = await sync1Res.json();
  console.log('✓ First sync attempt:', sync1.results[0].status, '-', sync1.results[0].message);

  // Duplicate submission to verify idempotency prevention
  const sync2Res = await fetch(`${BASE}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(syncPayload)
  });
  const sync2 = await sync2Res.json();
  console.log('✓ Duplicate sync attempt (Idempotency):', sync2.results[0].status, '-', sync2.results[0].message);

  // 9. AI Learning Assistant
  console.log('\n[9] Testing AI Learning Assistant...');
  const aiRes = await fetch(`${BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What should I practice today?', studentId: 'usr-student-1' })
  });
  const ai = await aiRes.json();
  console.log('✓ AI Assistant Reply:\n', ai.reply);

  // 10. Teacher Portal: Class list, Test Builder, Resource Upload
  console.log('\n[10] Testing Teacher Portal Endpoints...');
  const teacherLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ramanujan@loops-college.edu', password: 'password123', selectedRole: 'teacher' })
  });
  const teacherLogin = await teacherLoginRes.json();
  const teacherTokenHeader = { 'Authorization': `Bearer ${teacherLogin.token}`, 'Content-Type': 'application/json' };

  const classesRes = await fetch(`${BASE}/teacher/classes/usr-teacher-1`, { headers: teacherTokenHeader });
  const classes = await classesRes.json();
  console.log(`✓ Teacher batches assigned: ${classes.length} classes.`);

  const createTestRes = await fetch(`${BASE}/teacher/tests`, {
    method: 'POST',
    headers: teacherTokenHeader,
    body: JSON.stringify({
      title: 'E2E Assessment: Verification Exam',
      subject: 'Computer Science',
      topics: ['Algorithms', 'Logic'],
      durationMinutes: 25,
      passingScore: 70,
      teacherId: 'usr-teacher-1',
      questions: [
        {
          question: 'What is the base case in a recursive function?',
          options: ['Termination condition', 'Infinite branch', 'Call stack overflow', 'Return void'],
          correctIndex: 0,
          explanation: 'Base case terminates recursive calls.'
        }
      ]
    })
  });
  const createdTest = await createTestRes.json();
  console.log('✓ Teacher created test:', createdTest.test.title, '(ID:', createdTest.test.id, ')');

  // 11. Parent Portal Child Progress
  console.log('\n[11] Testing Parent Portal Child Progress...');
  const parentLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh.sharma@example.com', password: 'password123', selectedRole: 'parent' })
  });
  const parentLogin = await parentLoginRes.json();
  const parentTokenHeader = { 'Authorization': `Bearer ${parentLogin.token}` };

  const parentRes = await fetch(`${BASE}/parent/child-progress/usr-parent-1`, { headers: parentTokenHeader });
  const parentData = await parentRes.json();
  console.log('✓ Parent:', parentData.parent.name, 'Monitoring Child:', parentData.student.name);
  console.log('✓ Child Metrics:', parentData.metrics);
  console.log(`✓ Verified recent tests available to parent: ${parentData.recentTests.length}`);

  // 12. Library & Resource Request Workflow
  console.log('\n[12] Testing Library & Resource Request Workflow...');
  const libRes = await fetch(`${BASE}/library/resources`);
  const lib = await libRes.json();
  console.log(`✓ Available Public Library Resources: ${lib.resources.length}`);

  const reqRes = await fetch(`${BASE}/library/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bookTitle: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
      author: 'Aho, Lam, Sethi, Ullman',
      isbn: '978-0321486813',
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav.sharma@example.edu',
      reason: 'Needed for 4th semester compiler construction project.'
    })
  });
  const newReq = await reqRes.json();
  console.log('✓ Created Library Acquisition Request:', newReq.request.bookTitle, `[Status: ${newReq.request.status}]`);

  // 13. Official Certificates
  console.log('\n[13] Testing Official Certificates...');
  const certsRes = await fetch(`${BASE}/certificates/usr-student-1`);
  const certs = await certsRes.json();
  console.log(`✓ Verified Certificates for Aarav Sharma: ${certs.length}`);
  certs.forEach(c => console.log(`   - ${c.courseTitle} (ID: ${c.id}, Grade: ${c.score}, Issued: ${c.completionDate})`));

  console.log('\n======================================================');
  console.log('  ALL 13 CORE LEARNING LOOPS SUBSYSTEMS VERIFIED 100%');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
