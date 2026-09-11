import assert from 'assert';
import http from 'http';

// Test runner helper
async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// Log in helper
async function login(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  if (!res.data.token) {
    throw new Error(`Login failed for ${email}: ${JSON.stringify(res.data)}`);
  }
  return res.data.token;
}

async function runTests() {
  console.log('🚀 Starting YouTube Educational Videos & Features Integration Tests...\n');

  // 1. Authenticate users
  console.log('🔑 Authenticating test users...');
  const studentToken = await login('aarav.sharma@example.edu', 'password123');
  const teacherToken = await login('ramanujan@loops-college.edu', 'password123');
  const adminToken = await login('admin@loops-college.edu', 'password123');
  console.log('✅ Tokens acquired for Student, Teacher, and Admin.\n');

  const studentAuth = { Authorization: `Bearer ${studentToken}` };
  const teacherAuth = { Authorization: `Bearer ${teacherToken}` };
  const adminAuth = { Authorization: `Bearer ${adminToken}` };

  // TEST 1: Student gets approved YouTube videos for C Programming Lesson 2
  console.log('--- TEST 1: Student fetching verified YouTube videos for lesson ---');
  const cLessonRes = await request('/api/courses/crs-c-lang/lessons/les-c-2/youtube-videos', {
    headers: studentAuth
  });
  assert.strictEqual(cLessonRes.status, 200);
  assert.strictEqual(cLessonRes.data.success, true);
  assert.ok(Array.isArray(cLessonRes.data.videos));
  assert.ok(cLessonRes.data.videos.length >= 2, 'Should have at least Bro Code & Neso Academy');
  
  // Verify primary NeuralNine video
  const primaryVideo = cLessonRes.data.videos[0];
  assert.strictEqual(primaryVideo.youtubeVideoId, 'PDzKufPL51Q');
  assert.strictEqual(primaryVideo.status, 'approved');
  console.log(`✅ Student fetched ${cLessonRes.data.videos.length} videos. Primary: "${primaryVideo.title}" (${primaryVideo.youtubeVideoId})`);

  // Verify pending video is NOT visible to student
  const pendingCheck = cLessonRes.data.videos.find(v => v.youtubeVideoId === 'udr_j2QkF-E');
  assert.strictEqual(pendingCheck, undefined, 'Pending video should not be visible to student');
  console.log('✅ Verified unapproved/pending videos are hidden from students.\n');

  // TEST 2: Student Mark as Watched & Watch Progress Tracking
  console.log('--- TEST 2: Watch Progress & Completion Tracking ---');
  const progressRes = await request('/api/courses/crs-c-lang/lessons/les-c-2/youtube-progress', {
    method: 'POST',
    headers: studentAuth,
    body: {
      youtubeVideoId: 'EITg8K3tKzg',
      status: 'watched',
      progressPercentage: 100
    }
  });
  assert.strictEqual(progressRes.status, 200);
  assert.strictEqual(progressRes.data.success, true);
  assert.strictEqual(progressRes.data.progress.status, 'watched');

  // Verify that fetching the video list now returns watched status
  const refreshedVideosRes = await request('/api/courses/crs-c-lang/lessons/les-c-2/youtube-videos', {
    headers: studentAuth
  });
  const watchedVideo = refreshedVideosRes.data.videos.find(v => v.youtubeVideoId === 'EITg8K3tKzg');
  assert.ok(watchedVideo.progress);
  assert.strictEqual(watchedVideo.progress.status, 'watched');
  console.log('✅ Video watch progress persisted and tied to student identity.\n');

  // TEST 3: AI Notebook Creator - Read, Write & AI Generation
  console.log('--- TEST 3: AI Notebook Creator ---');
  const saveNotebookRes = await request('/api/courses/crs-c-lang/lessons/les-c-2/notebook', {
    method: 'POST',
    headers: studentAuth,
    body: {
      youtubeVideoId: 'EITg8K3tKzg',
      importantPoints: ['C uses preprocessors before assembly', 'main() returns an exit status code to OS'],
      definitions: [{ term: 'GCC', meaning: 'GNU Compiler Collection' }],
      codeSnippets: ['int main() { printf("Hello"); return 0; }'],
      doubts: ['Why return 0 instead of 1?'],
      summaryNotes: 'Essential foundations of C program execution lifecycle.'
    }
  });
  assert.strictEqual(saveNotebookRes.status, 200);
  assert.strictEqual(saveNotebookRes.data.success, true);
  console.log('✅ Student notebook notes saved successfully.');

  const getNotebookRes = await request('/api/courses/crs-c-lang/lessons/les-c-2/notebook', {
    headers: studentAuth
  });
  assert.strictEqual(getNotebookRes.status, 200);
  assert.strictEqual(getNotebookRes.data.success, true);
  assert.ok(getNotebookRes.data.notebook.importantPoints.length >= 2);
  console.log('✅ Student notebook successfully retrieved from database.');

  const aiGenRes = await request('/api/courses/crs-c-lang/lessons/les-c-2/notebook/ai-generate', {
    method: 'POST',
    headers: studentAuth,
    body: {
      lessonTitle: 'Foundations of C: Compilers, Registers & Syntax',
      videoTitle: 'C Programming Full Course for Beginners'
    }
  });
  assert.strictEqual(aiGenRes.status, 200);
  assert.strictEqual(aiGenRes.data.success, true);
  assert.ok(aiGenRes.data.summary);
  assert.ok(Array.isArray(aiGenRes.data.quiz) && aiGenRes.data.quiz.length >= 2);
  console.log(`✅ AI Notebook generator produced summary and ${aiGenRes.data.quiz.length} self-check quiz questions.\n`);

  // TEST 4: Teacher Portal Video Management (Add, Edit, Delete, Toggle)
  console.log('--- TEST 4: Teacher Portal Video Management ---');
  // Add new video
  const addRes = await request('/api/teacher/youtube-videos', {
    method: 'POST',
    headers: teacherAuth,
    body: {
      courseId: 'crs-python',
      lessonId: 'les-py-101',
      youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      title: 'Python Tutorial for Beginners [Full Course]',
      topic: 'Python Basics & Variables',
      channelTitle: 'Programming with Mosh',
      duration: '1h 00m',
      description: 'Comprehensive Python introduction from variables to execution.'
    }
  });
  assert.strictEqual(addRes.status, 201);
  assert.strictEqual(addRes.data.success, true);
  const newVideoId = addRes.data.video.id;
  assert.strictEqual(addRes.data.video.youtubeVideoId, '_uQrJ0TkZlc');
  console.log(`✅ Teacher added new video: ID ${newVideoId} (${addRes.data.video.title})`);

  // Edit video
  const editRes = await request(`/api/teacher/youtube-videos/${newVideoId}`, {
    method: 'PUT',
    headers: teacherAuth,
    body: {
      title: 'Python Tutorial for Beginners - Updated Title',
      isActive: false
    }
  });
  assert.strictEqual(editRes.status, 200);
  assert.strictEqual(editRes.data.video.title, 'Python Tutorial for Beginners - Updated Title');
  assert.strictEqual(editRes.data.video.isActive, false);
  console.log('✅ Teacher updated video title and toggled active status.');

  // Delete video
  const deleteRes = await request(`/api/teacher/youtube-videos/${newVideoId}`, {
    method: 'DELETE',
    headers: teacherAuth
  });
  assert.strictEqual(deleteRes.status, 200);
  assert.strictEqual(deleteRes.data.success, true);
  console.log('✅ Teacher successfully removed video resource.\n');

  // TEST 5: Admin Video Content Governance & Approval
  console.log('--- TEST 5: Admin Video Content Governance ---');
  const adminListRes = await request('/api/admin/youtube-resources', {
    headers: adminAuth
  });
  assert.strictEqual(adminListRes.status, 200);
  assert.strictEqual(adminListRes.data.success, true);
  assert.ok(adminListRes.data.videos.length > 0);

  // Find the pending video (udr_j2QkF-E)
  const pendingVideo = adminListRes.data.videos.find(v => v.youtubeVideoId === 'udr_j2QkF-E');
  assert.ok(pendingVideo, 'Pending video should exist in admin list');
  console.log(`Found pending video: "${pendingVideo.title}" (Status: ${pendingVideo.status})`);

  // Approve it
  const approveRes = await request(`/api/admin/youtube-resources/${pendingVideo.id}/status`, {
    method: 'PUT',
    headers: adminAuth,
    body: {
      status: 'approved',
      isActive: true
    }
  });
  assert.strictEqual(approveRes.status, 200);
  assert.strictEqual(approveRes.data.video.status, 'approved');
  console.log('✅ Admin approved pending video.');

  // Now verify that student CAN see it!
  const studentCheckAfterApproval = await request('/api/courses/crs-c-lang/lessons/les-c-8/youtube-videos', {
    headers: studentAuth
  });
  const nowVisible = studentCheckAfterApproval.data.videos.find(v => v.youtubeVideoId === 'udr_j2QkF-E');
  assert.ok(nowVisible, 'Approved video should now be visible to student');
  console.log('✅ Student can now access newly approved video.\n');

  // TEST 6: AI Tutor Context Awareness with Lesson & Video
  console.log('--- TEST 6: AI Assistant Lesson & Video Prompts ---');
  const aiPrompts = [
    'Explain this video',
    'Give me notes',
    'Quiz me on this topic',
    'Explain this in simple terms',
    'Give me important points'
  ];

  for (const prompt of aiPrompts) {
    const aiRes = await request('/api/ai/ask', {
      method: 'POST',
      headers: studentAuth,
      body: {
        query: prompt,
        pageContext: {
          path: '/courses',
          courseTitle: 'C Systems & Low-Level Memory',
          lessonTitle: 'Foundations of C: Compilers, Registers & Syntax',
          videoTitle: 'C Programming Full Course for Beginners'
        }
      }
    });
    assert.strictEqual(aiRes.status, 200);
    assert.ok(aiRes.data.reply && aiRes.data.reply.length > 30);
    console.log(`  ✓ Quick Prompt "${prompt}" -> Contextual response received (${aiRes.data.reply.length} chars)`);
  }
  console.log('✅ AI Assistant accurately handles all 5 lesson/video quick prompt pills.\n');

  console.log('🎉 ALL YOUTUBE LEARNING TESTS PASSED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
