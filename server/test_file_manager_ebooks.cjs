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
  console.log('=== TESTING FILE MANAGER, E-BOOKS & YOUTUBE VIDEO ===\n');

  // 1. Login as teacher
  const teacherLogin = await request('POST', '/api/auth/login', {
    email: 'ramanujan@loops-college.edu',
    password: 'password123'
  });
  const teacherToken = teacherLogin.body.token;
  console.log('✔ Teacher authenticated (User ID:', teacherLogin.body.user.id, ')');

  // 2. Test Teacher Folders
  console.log('\nTesting GET /api/teacher/folders...');
  const foldersRes = await request('GET', '/api/teacher/folders', null, teacherToken);
  const folders = Array.isArray(foldersRes.body) ? foldersRes.body : (foldersRes.body.folders || []);
  if (foldersRes.status === 200 && folders.length > 0) {
    console.log(`✔ Found ${folders.length} resource folders:`);
    folders.forEach(f => console.log(`  📁 [${f.id}] ${f.name}`));
  } else {
    console.error('✘ Failed to get folders:', foldersRes);
    process.exit(1);
  }

  console.log('\nTesting POST /api/teacher/folders (Create Folder)...');
  const createFolderRes = await request('POST', '/api/teacher/folders', {
    name: 'Operating Systems & Concurrency',
    courseId: 'crs-c-lang',
    color: '#059669'
  }, teacherToken);

  if ((createFolderRes.status === 200 || createFolderRes.status === 201) && createFolderRes.body.folder) {
    console.log(`✔ Created Folder: "${createFolderRes.body.folder.name}" (ID: ${createFolderRes.body.folder.id})`);
  } else {
    console.error('✘ Failed to create folder:', createFolderRes);
    process.exit(1);
  }

  // 3. Test Teacher Resources
  console.log('\nTesting GET /api/teacher/resources...');
  const resourcesRes = await request('GET', '/api/teacher/resources', null, teacherToken);
  const resources = Array.isArray(resourcesRes.body) ? resourcesRes.body : (resourcesRes.body.resources || []);
  if (resourcesRes.status === 200 && resources.length > 0) {
    console.log(`✔ Found ${resources.length} teacher resources`);
  } else {
    console.error('✘ Failed to get resources:', resourcesRes);
    process.exit(1);
  }

  console.log('\nTesting POST /api/teacher/resources (Upload/Add Resource)...');
  const addResourceRes = await request('POST', '/api/teacher/resources', {
    title: 'Pointer Arithmetic & Memory Leaks Lab Sheet',
    courseId: 'crs-c-lang',
    subject: 'C Programming',
    topic: 'Pointers',
    folderId: 'fld-c-lang',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    isDownloadable: true,
    visibility: 'published',
    description: 'Hands-on laboratory manual for valgrind diagnostics and dynamic array reallocation.'
  }, teacherToken);

  let newResourceId = null;
  if ((addResourceRes.status === 200 || addResourceRes.status === 201) && addResourceRes.body.resource) {
    newResourceId = addResourceRes.body.resource.id;
    console.log(`✔ Added Resource: "${addResourceRes.body.resource.title}" (ID: ${newResourceId})`);
  } else {
    console.error('✘ Failed to add resource:', addResourceRes);
    process.exit(1);
  }

  // Move resource
  console.log('\nTesting PATCH /api/teacher/resources/:id (Move to new folder)...');
  const moveRes = await request('PATCH', `/api/teacher/resources/${newResourceId}`, {
    folderId: 'fld-general'
  }, teacherToken);
  if (moveRes.status === 200 && moveRes.body.resource.folderId === 'fld-general') {
    console.log('✔ Resource moved to folder "fld-general" successfully');
  } else {
    console.error('✘ Failed to move resource:', moveRes);
    process.exit(1);
  }

  // 4. Test Academic E-Books
  console.log('\nTesting GET /api/library/ebooks...');
  const ebooksRes = await request('GET', '/api/library/ebooks');
  if (ebooksRes.status === 200 && ebooksRes.body.ebooks) {
    console.log(`✔ Found ${ebooksRes.body.ebooks.length} published e-books:`);
    ebooksRes.body.ebooks.forEach(eb => {
      console.log(`  📚 [${eb.id}] "${eb.title}" by ${eb.author} (${eb.subject}, ${eb.fileSize})`);
    });
  } else {
    console.error('✘ Failed to get ebooks:', ebooksRes);
    process.exit(1);
  }

  // Test E-Book Search & Filter
  console.log('\nTesting GET /api/library/ebooks?subject=C Programming&search=Guide...');
  const searchRes = await request('GET', '/api/library/ebooks?subject=C%20Programming&search=Guide');
  if (searchRes.status === 200 && searchRes.body.ebooks.length > 0) {
    console.log(`✔ Search returned ${searchRes.body.ebooks.length} result: "${searchRes.body.ebooks[0].title}"`);
  } else {
    console.error('✘ Ebook search failed:', searchRes);
    process.exit(1);
  }

  // Test E-Book Download counter increment
  const firstEBookId = ebooksRes.body.ebooks[0].id;
  const initialDownloads = ebooksRes.body.ebooks[0].downloads || 0;
  console.log(`\nTesting GET /api/library/ebooks/${firstEBookId} (Download & detail)...`);
  const getEbookRes = await request('GET', `/api/library/ebooks/${firstEBookId}`);
  if (getEbookRes.status === 200 && getEbookRes.body.ebook.downloads === initialDownloads + 1) {
    console.log(`✔ E-Book download counter incremented to ${getEbookRes.body.ebook.downloads}`);
  } else {
    console.error('✘ E-Book counter increment failed:', getEbookRes);
    process.exit(1);
  }

  // 5. Verify NeuralNine YouTube Video for les-c-2
  console.log('\nTesting GET /api/courses/crs-c-lang/lessons/les-c-2/youtube-videos...');
  const ytRes = await request('GET', '/api/courses/crs-c-lang/lessons/les-c-2/youtube-videos');
  if (ytRes.status === 200 && ytRes.body.videos) {
    console.log(`✔ Found ${ytRes.body.videos.length} YouTube video(s) for Variables lesson:`);
    const neuralNineVideo = ytRes.body.videos.find(v => v.youtubeVideoId === 'PDzKufPL51Q');
    if (neuralNineVideo) {
      console.log('✔ VERIFIED: Real NeuralNine YouTube Video present!');
      console.log(`  Title: ${neuralNineVideo.title}`);
      console.log(`  Video ID: ${neuralNineVideo.youtubeVideoId}`);
      console.log(`  Channel: ${neuralNineVideo.channelTitle}`);
      console.log(`  Embed URL: https://www.youtube.com/embed/${neuralNineVideo.youtubeVideoId}`);
    } else {
      console.error('✘ NeuralNine video PDzKufPL51Q NOT found in response:', ytRes.body.videos);
      process.exit(1);
    }
  } else {
    console.error('✘ Failed to get lesson YouTube videos:', ytRes);
    process.exit(1);
  }

  console.log('\n=============================================');
  console.log('✔ ALL FILE MANAGER & E-BOOK TESTS PASSED!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('Unhandled error in test:', err);
  process.exit(1);
});
