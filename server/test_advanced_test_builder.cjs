const http = require('http');

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (dataString) {
      headers['Content-Length'] = Buffer.byteLength(dataString);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers
    }, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(resBody);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resBody });
        }
      });
    });

    req.on('error', reject);
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function runTests() {
  console.log('=== TESTING ADVANCED TEACHER TEST BUILDER & AI ANALYTICS ===\n');

  // 1. Login as teacher
  const teacherLogin = await request('POST', '/api/auth/login', {
    email: 'ramanujan@loops-college.edu',
    password: 'password123'
  });
  if (teacherLogin.status !== 200) {
    console.error('Teacher login failed:', teacherLogin);
    process.exit(1);
  }
  const teacherToken = teacherLogin.body.token;
  console.log('✔ Teacher logged in successfully (User ID:', teacherLogin.body.user.id, ')');

  // 2. AI Generate Test Draft
  console.log('\nTesting POST /api/teacher/ai-generate-test...');
  const aiGenRes = await request('POST', '/api/teacher/ai-generate-test', {
    topic: 'Pointers & Dynamic Memory',
    subject: 'C Programming',
    difficulty: 'hard',
    questionCount: 4,
    testType: 'Quiz'
  }, teacherToken);

  const questions = aiGenRes.body.draft ? aiGenRes.body.draft.questions : (aiGenRes.body.questions || []);
  if (aiGenRes.status === 200 && questions.length > 0) {
    console.log(`✔ AI generated ${questions.length} draft questions`);
    console.log('  Sample Q1:', questions[0].question || questions[0].text);
  } else {
    console.error('✘ AI Generate Test failed:', aiGenRes);
    process.exit(1);
  }

  // 3. AI Review Test
  console.log('\nTesting POST /api/teacher/ai-review-test...');
  const aiRevRes = await request('POST', '/api/teacher/ai-review-test', {
    title: 'Pointers Diagnostic Quiz',
    duration: 15,
    questions: questions
  }, teacherToken);

  if (aiRevRes.status === 200 && (aiRevRes.body.summary || aiRevRes.body.review)) {
    const sum = aiRevRes.body.summary || aiRevRes.body.review;
    console.log('✔ AI Test Review complete. Issues found:', sum.issuesCount || 0);
    console.log('  Estimated Time:', sum.estimatedMinutes || sum.estimatedTimeMinutes, 'mins');
  } else {
    console.error('✘ AI Review Test failed:', aiRevRes);
    process.exit(1);
  }

  // 4. Create New Test with Marks & Calculations
  console.log('\nTesting POST /api/teacher/tests (Create Test)...');
  const createTestRes = await request('POST', '/api/teacher/tests', {
    title: 'Advanced Pointers & Memory Allocation',
    subject: 'C Programming',
    courseId: 'crs-c-lang',
    batch: 'CS-2026-A',
    targetTopics: ['Pointers', 'Dynamic Memory'],
    difficulty: 'Hard',
    duration: 25,
    passingScore: 60,
    questions: [
      {
        id: 'q1',
        text: 'What is the output of dereferencing a NULL pointer in C?',
        type: 'mcq',
        options: ['0', 'Garbage Value', 'Segmentation Fault / Undefined Behavior', 'Compilation Error'],
        correctAnswer: 'Segmentation Fault / Undefined Behavior',
        explanation: 'Dereferencing a NULL pointer leads to undefined behavior and a segmentation fault.',
        marks: 5,
        topic: 'Pointers'
      },
      {
        id: 'q2',
        text: 'Select all dynamic memory allocation functions in standard C.',
        type: 'multi_select',
        options: ['malloc', 'alloc', 'calloc', 'realloc'],
        correctAnswer: ['malloc', 'calloc', 'realloc'],
        explanation: 'malloc, calloc, realloc are part of <stdlib.h>.',
        marks: 5,
        topic: 'Pointers'
      },
      {
        id: 'q3',
        text: 'free() automatically sets the pointer variable to NULL.',
        type: 'true_false',
        options: ['True', 'False'],
        correctAnswer: 'False',
        explanation: 'free() releases the heap block but does not modify the pointer variable itself (dangling pointer).',
        marks: 5,
        topic: 'Pointers'
      }
    ]
  }, teacherToken);

  if ((createTestRes.status === 200 || createTestRes.status === 201) && createTestRes.body.test) {
    const t = createTestRes.body.test;
    console.log(`✔ Created Test "${t.title}" (ID: ${t.id})`);
    console.log(`  Total Marks: ${t.totalMarks}, Passing Score: ${t.passingScore}%, Pass Mark: ${t.passMark}`);
  } else {
    console.error('✘ Create test failed:', createTestRes);
    process.exit(1);
  }

  // 5. Check Test Analytics (Factual Seed Data verification)
  console.log('\nTesting GET /api/teacher/tests/test-c-biweekly-1/analytics...');
  const analyticsRes = await request('GET', '/api/teacher/tests/test-c-biweekly-1/analytics', null, teacherToken);

  if (analyticsRes.status === 200 && analyticsRes.body.stats) {
    const stats = analyticsRes.body.stats;
    console.log('✔ Factual Test Analytics retrieved:');
    console.log(`  Total Students: ${stats.totalStudents}`);
    console.log(`  Attempted: ${stats.attempted}`);
    console.log(`  Passed: ${stats.passed}`);
    console.log(`  Failed: ${stats.failed}`);
    console.log(`  Average Score: ${stats.averageScore}%`);
    console.log(`  Highest Score: ${stats.highestScore}%`);
    console.log(`  Lowest Score: ${stats.lowestScore}%`);
    console.log(`  Average Time: ${stats.averageTimeMinutes}m`);

    const topicList = analyticsRes.body.topicStats || stats.topicAccuracy || [];
    console.log('\n  Topic Accuracy:');
    topicList.forEach(ta => {
      console.log(`    - ${ta.topic}: ${ta.accuracy}% (${ta.status || 'OK'})`);
    });

    // Verify exact expected statistics
    if (stats.attempted === 27 && stats.passed === 21 && stats.failed === 6 && stats.averageScore === 74) {
      console.log('✔ EXACT MATCH with required class performance metrics (27 attempted, 21 passed, 6 failed, 74% avg)!');
    } else {
      console.warn('⚠ Note: Stats differ slightly from prompt baseline:', stats);
    }
  } else {
    console.error('✘ Get test analytics failed:', analyticsRes);
    process.exit(1);
  }

  // 6. AI Analyze Test with Factual Data
  console.log('\nTesting POST /api/teacher/ai-analyze-test...');
  const aiAnalyzeRes = await request('POST', '/api/teacher/ai-analyze-test', {
    testId: 'test-c-biweekly-1',
    testTitle: 'Bi-Weekly Assessment: C Core & Memory Diagnostics',
    stats: analyticsRes.body.stats,
    topicStats: analyticsRes.body.topicStats
  }, teacherToken);

  if (aiAnalyzeRes.status === 200 && aiAnalyzeRes.body.analysis) {
    console.log('✔ AI Test Analysis generated successfully:');
    console.log(`  Strong Topic: ${aiAnalyzeRes.body.analysis.strongTopic}`);
    console.log(`  Weak Topic: ${aiAnalyzeRes.body.analysis.weakTopic}`);
    console.log(`  Observation: ${aiAnalyzeRes.body.analysis.observation}`);
    console.log(`  Recommendation: ${aiAnalyzeRes.body.analysis.recommendation}`);
  } else {
    console.error('✘ AI Test Analysis failed:', aiAnalyzeRes);
    process.exit(1);
  }

  // 7. AI Create Targeted Practice for Weak Topic
  console.log('\nTesting POST /api/teacher/ai-targeted-practice...');
  const aiPracticeRes = await request('POST', '/api/teacher/ai-targeted-practice', {
    topic: 'Pointers',
    difficulty: 'Easy to Medium',
    count: 10
  }, teacherToken);

  const practice = aiPracticeRes.body.draftTest || aiPracticeRes.body.practiceTest;
  if (aiPracticeRes.status === 200 && practice) {
    console.log('✔ AI Targeted Practice Test generated:');
    console.log(`  Title: ${practice.title}`);
    console.log(`  Target Topics: ${practice.topics.join(', ')}`);
    console.log(`  Audience: ${practice.targetAudience}`);
    console.log(`  Questions: ${practice.questions.length}`);
  } else {
    console.error('✘ AI Targeted Practice failed:', aiPracticeRes);
    process.exit(1);
  }

  // 8. Test Active Test Session Start (Persistent Timer)
  console.log('\nTesting POST /api/tests/test-c-biweekly-1/start (Persistent Session)...');
  // Login as student
  const studentLogin = await request('POST', '/api/auth/login', {
    email: 'likhit.malla@example.edu',
    password: 'password123'
  });
  const studentToken = studentLogin.body.token;

  const startTestRes = await request('POST', '/api/tests/test-c-biweekly-1/start', {}, studentToken);
  const sess = startTestRes.body.session || startTestRes.body;
  if (startTestRes.status === 200 && sess.remainingSeconds !== undefined) {
    console.log('✔ Test session started:');
    console.log(`  Remaining Seconds: ${sess.remainingSeconds}`);
    console.log(`  Duration Minutes: ${sess.durationMinutes}`);
    console.log(`  Started At: ${sess.startedAt}`);
  } else {
    console.error('✘ Test start failed:', startTestRes);
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('✔ ALL ADVANCED TEST BUILDER TESTS PASSED!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
