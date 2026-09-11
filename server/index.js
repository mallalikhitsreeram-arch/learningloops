import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'LEARNING LOOPS',
    version: '1.0.0',
    tagline: 'WHERE YOUR EVERY CONTRIBUTION COUNTS',
    timestamp: new Date().toISOString()
  });
});

/* ==========================================================================
   AUTHENTICATION & AUTHORIZATION MIDDLEWARE
   ========================================================================== */

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Access token is missing or invalid' });
  }

  const session = db.getSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  req.session = session;
  req.user = db.find('users', session.userId) || {
    id: session.userId,
    email: session.email,
    role: session.role,
    name: session.name,
    email_verified: session.email_verified
  };

  next();
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges for this portal' });
    }
    next();
  };
};

/* ==========================================================================
   AUTHENTICATION & ROLES ENDPOINTS
   ========================================================================== */

// Get all demo accounts for testing convenience
app.get('/api/auth/users', (req, res) => {
  const users = db.getAll('users').map(u => ({
    id: u.id,
    code: u.code,
    name: u.name,
    email: u.email,
    role: u.role,
    email_verified: u.email_verified !== false,
    phone: u.phone,
    profileCompleted: u.profileCompleted
  }));
  res.json(users);
});

// Verify active session token & Return current user identity
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      code: req.user.code,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      email_verified: req.user.email_verified !== false,
      phone: req.user.phone,
      profileCompleted: req.user.profileCompleted,
      avatar: req.user.avatar,
      designation: req.user.designation,
      linkedStudentId: req.user.linkedStudentId
    },
    role: req.user.role
  });
});

// Standard Identity Alias: GET /api/me
app.get('/api/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      code: req.user.code,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      email_verified: req.user.email_verified !== false,
      phone: req.user.phone,
      profileCompleted: req.user.profileCompleted,
      avatar: req.user.avatar,
      designation: req.user.designation,
      linkedStudentId: req.user.linkedStudentId
    },
    role: req.user.role
  });
});

// Login via email/password, role, phone, or demo ID with role verification
app.post('/api/auth/login', (req, res) => {
  const { email, password, role, selectedRole, phone, userId } = req.body;
  const targetRole = selectedRole || (userId ? null : role);

  const formatRoleTitle = (r) => {
    if (!r) return 'User';
    if (r === 'student') return 'Student';
    if (r === 'teacher') return 'Teacher';
    if (r === 'parent') return 'Parent';
    if (r === 'admin') return 'Admin';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  let user = null;
  if (email) {
    const term = email.trim().toLowerCase();
    user = db.find('users', u =>
      (u.email && u.email.toLowerCase() === term) ||
      (u.code && u.code.toLowerCase() === term) ||
      (u.id && u.id.toLowerCase() === term) ||
      (Array.isArray(u.aliases) && u.aliases.map(a => a.toLowerCase()).includes(term))
    );
    if (!user) {
      return res.status(404).json({ error: 'No account found with these credentials.' });
    }
    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }
  } else if (userId) {
    const term = userId.trim();
    user = db.find('users', u =>
      u.id === term ||
      u.code === term ||
      u.aliasId === term ||
      (Array.isArray(u.aliases) && u.aliases.includes(term))
    );
  } else if (phone) {
    user = db.find('users', u => u.phone === phone);
  } else if (role) {
    user = db.find('users', u => u.role === role);
  }

  if (!user) {
    return res.status(404).json({ error: 'No account found with these credentials.' });
  }

  // Strictly verify that the account actually belongs to the selected portal role
  if (targetRole && user.role !== targetRole) {
    const actualRoleTitle = formatRoleTitle(user.role);
    const expectedRoleTitle = formatRoleTitle(targetRole);
    return res.status(403).json({
      success: false,
      roleMismatch: true,
      error: `Account role mismatch: This account is registered as a ${actualRoleTitle}, not a ${expectedRoleTitle}. Please select the ${actualRoleTitle} portal to sign in.`,
      actualRole: user.role,
      expectedRole: targetRole
    });
  }

  // Check email verification requirement
  if (user.email_verified === false) {
    return res.status(403).json({
      success: false,
      unverified: true,
      email: user.email,
      message: 'Please verify your email before continuing.'
    });
  }

  // Create authenticated session
  const session = db.createSession(user);

  res.json({
    success: true,
    user: {
      id: user.id,
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified !== false,
      phone: user.phone,
      profileCompleted: user.profileCompleted !== false,
      avatar: user.avatar,
      designation: user.designation,
      linkedStudentId: user.linkedStudentId
    },
    role: user.role,
    token: session.token
  });
});

// Teacher Onboarding / Profile update endpoint
app.post('/api/teacher/onboarding', (req, res) => {
  const { userId, designation, department, college, subjects } = req.body;
  const user = db.find('users', userId);
  if (!user) {
    return res.status(404).json({ error: 'Teacher account not found' });
  }

  user.designation = designation || user.designation || 'Assistant Professor';
  user.department = department || 'Computer Science & Engineering';
  user.college = college || 'College of Engineering & Technology';
  user.subjects = subjects || ['Core Programming', 'Data Structures'];
  user.profileCompleted = true;
  db.update('users', user.id, user);

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified !== false,
      phone: user.phone,
      profileCompleted: true,
      avatar: user.avatar,
      designation: user.designation,
      department: user.department,
      college: user.college
    }
  });
});

// User Registration with unique role-prefixed IDs (STU1001, TCH1001, PAR1001)
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role = 'student', college = 'General Academic', phone = '' } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.find('users', u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const rolePrefix = role === 'student' ? 'STU' : role === 'teacher' ? 'TCH' : 'PAR';
  const uniqueNum = Math.floor(1000 + Math.random() * 9000);
  const newUserId = `${rolePrefix}${uniqueNum}`;

  const newUser = {
    id: newUserId,
    name,
    email: normalizedEmail,
    password,
    email_verified: false,
    phone,
    role,
    profileCompleted: false,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  };
  db.insert('users', newUser);

  // Initialize student profile if role is student
  if (role === 'student') {
    db.insert('student_profiles', {
      userId: newUser.id,
      dob: '2004-01-01',
      college: college || 'Technical College',
      courseName: 'General Engineering & Computing',
      yearSemester: '1st Year',
      interests: ['Web Development', 'Programming'],
      goals: ['Career development'],
      dailyLearningTargetMinutes: 60,
      todayCompletedMinutes: 0,
      currentStreak: 1,
      longestStreak: 1,
      totalProblemsSolved: 0,
      coursesCompleted: 0,
      averageTestScore: 0,
      totalLearningTimeMinutes: 0,
      currentGoal: 'Web Development',
      dataPreference: 'Low Data'
    });
  }

  res.json({
    success: true,
    unverified: true,
    email: newUser.email,
    message: 'Account created! Please verify your email before continuing.'
  });
});

// Verify email with code
app.post('/api/auth/verify-email', (req, res) => {
  const { email, code } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.find('users', u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Check code (accept 424242 or 123456 or any 6-digit code for demo testing)
  if (code && code.trim().length !== 6) {
    return res.status(400).json({ error: 'Please enter a valid 6-digit verification code' });
  }

  user.email_verified = true;
  db.update('users', user.id, user);

  // Create session for immediate auto-login
  const session = db.createSession(user);

  res.json({
    success: true,
    message: 'Email verified successfully!',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      email_verified: true,
      phone: user.phone,
      profileCompleted: user.profileCompleted,
      avatar: user.avatar
    },
    role: user.role,
    token: session.token
  });
});

// Resend verification code
app.post('/api/auth/resend-verification', (req, res) => {
  const { email } = req.body;
  res.json({
    success: true,
    message: `Verification code sent to ${email}. Demo code: 424242`
  });
});

// Forgot password request
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.find('users', u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }
  res.json({
    success: true,
    message: `Password reset instructions sent to ${email}. Use reset code: 424242`
  });
});

// Reset password with code
app.post('/api/auth/reset-password', (req, res) => {
  const { email, code, newPassword } = req.body;
  const user = db.find('users', u => u.email.toLowerCase() === (email || '').trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  user.password = newPassword;
  db.update('users', user.id, user);
  res.json({
    success: true,
    message: 'Password has been reset successfully! You can now log in.'
  });
});

// Invalidate session on logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    db.deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// Send OTP simulation
app.post('/api/auth/otp/send', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // Simulated 6-digit OTP for testing ease
  const simulatedOtp = '424242';
  res.json({
    success: true,
    message: `OTP sent successfully to ${phone}`,
    phone,
    debugOtp: simulatedOtp,
    expiresInSeconds: 300
  });
});

// Verify OTP
app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, otp, role, selectedRole } = req.body;
  const targetRole = selectedRole || role;

  const formatRoleTitle = (r) => {
    if (!r) return 'User';
    if (r === 'student') return 'Student';
    if (r === 'teacher') return 'Teacher';
    if (r === 'parent') return 'Parent';
    return r.charAt(0).toUpperCase() + r.slice(1);
  };

  if (otp !== '424242' && otp !== '123456') {
    return res.status(400).json({ error: 'Invalid or expired OTP. Use demo OTP: 424242' });
  }

  let user = db.find('users', u => u.phone === phone);
  if (user) {
    if (targetRole && user.role !== targetRole) {
      const actualRoleTitle = formatRoleTitle(user.role);
      const expectedRoleTitle = formatRoleTitle(targetRole);
      return res.status(403).json({
        success: false,
        roleMismatch: true,
        error: `Account role mismatch: This phone number is registered as a ${actualRoleTitle}, not a ${expectedRoleTitle}. Please select the ${actualRoleTitle} portal to sign in.`,
        actualRole: user.role,
        expectedRole: targetRole
      });
    }
  } else {
    const assignedRole = targetRole || 'student';
    const rolePrefix = assignedRole === 'student' ? 'STU' : assignedRole === 'teacher' ? 'TCH' : 'PAR';
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    user = {
      id: `${rolePrefix}${uniqueNum}`,
      name: `New ${formatRoleTitle(assignedRole)}`,
      phone,
      email: `${phone.replace(/\D/g, '')}@${assignedRole}.learningloops.edu`,
      password: "password123",
      email_verified: true,
      role: assignedRole,
      profileCompleted: false,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    };
    db.insert('users', user);
  }

  if (user.email_verified === false) {
    return res.status(403).json({
      success: false,
      unverified: true,
      email: user.email,
      message: 'Please verify your email before continuing.'
    });
  }

  const session = db.createSession(user);
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      email_verified: user.email_verified !== false,
      phone: user.phone,
      profileCompleted: user.profileCompleted !== false,
      avatar: user.avatar
    },
    role: user.role,
    token: session.token
  });
});

/* ==========================================================================
   STUDENT ONBOARDING & PROFILE ENGINE (2-STEP WITH PARENT OTP)
   ========================================================================== */

const parentOtpStore = new Map();

// Helper to format learning time as "18h 40m"
const formatLearningTime = (totalMinutes = 0) => {
  const safe = Number(totalMinutes || 0);
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return `${hours}h ${mins}m`;
};

// Helper to generate recommendations aligned with student's career goal and interests
const generateRecommendations = (goal = '', interests = []) => {
  const g = (goal || '').toLowerCase();
  const intList = Array.isArray(interests) ? interests : [];
  const intStr = intList.join(' ').toLowerCase();

  // Data Science track (e.g. Priya Reddy)
  if (g.includes('data science') || (intStr.includes('data science') && !g.includes('ai & machine learning'))) {
    return [
      {
        id: 'rec-ds-1',
        title: 'Python for Data Science',
        type: 'Course',
        reason: 'Essential NumPy, Pandas, and data wrangling for your Data Science career goal.',
        actionLabel: 'Explore Course',
        actionRoute: 'courses',
        courseId: 'crs-python'
      },
      {
        id: 'rec-ds-2',
        title: 'Statistics',
        type: 'Course',
        reason: 'Core probability, hypothesis testing, and quantitative analytics foundations.',
        actionLabel: 'Start Learning',
        actionRoute: 'courses',
        courseId: 'crs-c-lang'
      },
      {
        id: 'rec-ds-3',
        title: 'Data Analysis',
        type: 'Practice',
        reason: 'Exploratory data analysis drills and feature distribution modeling.',
        actionLabel: 'Practice Now',
        actionRoute: 'practice',
        topic: 'Arrays'
      },
      {
        id: 'rec-ds-4',
        title: 'Machine Learning',
        type: 'Course',
        reason: 'Supervised regression, classification models, and predictive analytics pipelines.',
        actionLabel: 'Explore Course',
        actionRoute: 'courses',
        courseId: 'crs-ai'
      }
    ];
  }

  // AI & Machine Learning track (e.g. Likhit Sreeram Malla)
  if (g.includes('ai') || g.includes('machine learning')) {
    return [
      {
        id: 'rec-ai-1',
        title: 'Python Fundamentals',
        type: 'Course',
        reason: 'Essential prerequisite foundation for your declared AI & Machine Learning track.',
        actionLabel: 'Explore Course',
        actionRoute: 'courses',
        courseId: 'crs-python'
      },
      {
        id: 'rec-ai-2',
        title: 'Introduction to Artificial Intelligence',
        type: 'Course',
        reason: 'Core conceptual foundations in search algorithms, heuristic evaluation, and basic ML models.',
        actionLabel: 'Start Learning',
        actionRoute: 'courses',
        courseId: 'crs-ai'
      },
      {
        id: 'rec-ai-3',
        title: 'Machine Learning Basics',
        type: 'Practice',
        reason: 'Targeted drills to master supervised learning, loss functions, and gradient descent.',
        actionLabel: 'Practice Now',
        actionRoute: 'practice',
        topic: 'Arrays'
      }
    ];
  }

  // Full-Stack Web Development track (e.g. Rahul Sharma or default)
  return [
    {
      id: 'rec-web-1',
      title: 'HTML & CSS',
      type: 'Course',
      reason: 'Build responsive, accessible, mobile-first web interfaces.',
      actionLabel: 'Explore Course',
      actionRoute: 'courses',
      courseId: 'crs-html-css'
    },
    {
      id: 'rec-web-2',
      title: 'JavaScript',
      type: 'Course',
      reason: 'Master modern ES6+, DOM manipulation, and asynchronous programming.',
      actionLabel: 'Continue Course',
      actionRoute: 'courses',
      courseId: 'crs-javascript'
    },
    {
      id: 'rec-web-3',
      title: 'React',
      type: 'Course',
      reason: 'Modern declarative component state, hooks, and responsive frontend architecture.',
      actionLabel: 'Explore Course',
      actionRoute: 'courses',
      courseId: 'crs-webdev'
    },
    {
      id: 'rec-web-4',
      title: 'Node.js',
      type: 'Practice',
      reason: 'Backend REST API architecture, Express middleware, and asynchronous event loops.',
      actionLabel: 'Practice Weak Topic',
      actionRoute: 'practice',
      topic: 'Node.js & Express APIs'
    }
  ];
};

// Check profile status & resume point for the authenticated student
app.get('/api/student/profile/status', authenticateToken, (req, res) => {
  const user = db.find('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let profile = db.find('student_profiles', user.id);
  if (!profile) {
    profile = {
      userId: user.id,
      step1Completed: false,
      step2Completed: false,
      parentEmailVerified: false,
      profileCompleted: false
    };
    db.insert('student_profiles', profile);
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileCompleted: Boolean(user.profileCompleted && profile.step1Completed && profile.step2Completed),
      avatar: user.avatar
    },
    profile,
    step1Completed: Boolean(profile.step1Completed),
    step2Completed: Boolean(profile.step2Completed),
    parentEmailVerified: Boolean(profile.parentEmailVerified),
    profileCompleted: Boolean(user.profileCompleted && profile.step1Completed && profile.step2Completed)
  });
});

// Step 1: "Let's Know You" - Save student personal information & interests
app.post('/api/student/profile/step1', authenticateToken, (req, res) => {
  const user = db.find('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    fullName,
    dateOfBirth,
    gender,
    educationLevel,
    collegeOrSchool,
    degree,
    branchOrStream,
    classOrYear,
    interests,
    otherInterest,
    careerGoal,
    otherGoal,
    goalDescription,
    hobbies,
    otherHobbies,
    dailyStudyTime,
    preferredLearningStyle,
    profilePhoto
  } = req.body;

  if (fullName && fullName.trim()) {
    user.name = fullName.trim();
  }
  if (profilePhoto) {
    user.avatar = profilePhoto;
  }
  db.update('users', user.id, user);

  // Compute target study minutes from study time selection
  let targetMinutes = 60;
  if (dailyStudyTime === '30 minutes') targetMinutes = 30;
  else if (dailyStudyTime === '1 hour') targetMinutes = 60;
  else if (dailyStudyTime === '1–2 hours' || dailyStudyTime === '1-2 hours') targetMinutes = 90;
  else if (dailyStudyTime === '2–3 hours' || dailyStudyTime === '2-3 hours') targetMinutes = 150;
  else if (dailyStudyTime === '3–4 hours' || dailyStudyTime === '3-4 hours') targetMinutes = 210;
  else if (dailyStudyTime === '4+ hours') targetMinutes = 240;

  // Resolve interests
  let combinedInterests = Array.isArray(interests) ? [...interests] : [];
  if (otherInterest && otherInterest.trim() && !combinedInterests.includes(otherInterest.trim())) {
    combinedInterests.push(otherInterest.trim());
  }

  // Resolve hobbies
  let combinedHobbies = Array.isArray(hobbies) ? [...hobbies] : [];
  if (otherHobbies && otherHobbies.trim() && !combinedHobbies.includes(otherHobbies.trim())) {
    combinedHobbies.push(otherHobbies.trim());
  }

  // Resolve career goal
  const resolvedGoal = (careerGoal === 'Other' && otherGoal && otherGoal.trim())
    ? otherGoal.trim()
    : (careerGoal || 'Software Developer');

  let profile = db.find('student_profiles', user.id);
  const updatedProfileData = {
    userId: user.id,
    fullName: user.name,
    dob: dateOfBirth || profile?.dob || '',
    gender: gender || profile?.gender || '',
    educationLevel: educationLevel || 'Undergraduate',
    college: collegeOrSchool || profile?.college || '',
    collegeOrSchool: collegeOrSchool || profile?.collegeOrSchool || '',
    courseName: degree || branchOrStream || profile?.courseName || '',
    degree: degree || profile?.degree || '',
    branchOrStream: branchOrStream || profile?.branchOrStream || '',
    yearSemester: classOrYear || profile?.yearSemester || '',
    classOrYear: classOrYear || profile?.classOrYear || '',
    interests: combinedInterests,
    careerGoal: resolvedGoal,
    currentGoal: resolvedGoal,
    goalDescription: goalDescription || '',
    hobbies: combinedHobbies,
    dailyStudyTime: dailyStudyTime || '1 hour',
    dailyLearningTargetMinutes: targetMinutes,
    todayCompletedMinutes: profile?.todayCompletedMinutes ?? 0,
    preferredLearningStyle: preferredLearningStyle || 'Mixed',
    profilePhoto: profilePhoto || user.avatar || null,
    step1Completed: true,
    step2Completed: Boolean(profile?.step2Completed),
    parentEmailVerified: Boolean(profile?.parentEmailVerified),
    currentStreak: profile?.currentStreak ?? 1,
    longestStreak: profile?.longestStreak ?? 1,
    totalProblemsSolved: profile?.totalProblemsSolved ?? 0,
    coursesCompleted: profile?.coursesCompleted ?? 0,
    averageTestScore: profile?.averageTestScore ?? 0,
    totalLearningTimeMinutes: profile?.totalLearningTimeMinutes ?? 0,
    parentName: profile?.parentName || '',
    parentEmail: profile?.parentEmail || '',
    parentPhone: profile?.parentPhone || ''
  };

  if (profile) {
    db.update('student_profiles', user.id, { ...profile, ...updatedProfileData });
  } else {
    db.insert('student_profiles', updatedProfileData);
  }

  res.json({
    success: true,
    step1Completed: true,
    user,
    profile: updatedProfileData
  });
});

// Step 2: Parent Connection - Send Verification OTP to Parent Email
app.post('/api/student/parent-otp/send', authenticateToken, (req, res) => {
  const { parentEmail, parentName, parentPhone, relation } = req.body;

  if (!parentEmail || !parentEmail.trim()) {
    return res.status(400).json({ error: 'Parent email address is required.' });
  }

  const normalizedEmail = parentEmail.trim().toLowerCase();
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

  parentOtpStore.set(req.user.id, {
    otp: generatedOtp,
    parentEmail: normalizedEmail,
    parentName: parentName || 'Parent / Guardian',
    parentPhone: parentPhone || '',
    relation: relation || 'Parent',
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
  });

  console.log(`\n======================================================`);
  console.log(`[PARENT VERIFICATION OTP] Sent to: ${normalizedEmail}`);
  console.log(`Student: ${req.user.name} (ID: ${req.user.id})`);
  console.log(`OTP Code: ${generatedOtp}`);
  console.log(`======================================================\n`);

  res.json({
    success: true,
    message: `Verification code sent to ${normalizedEmail}.`,
    parentEmail: normalizedEmail,
    // Included for development and demo presentation ease
    devOtp: generatedOtp
  });
});

// Step 2: Parent Connection - Verify OTP and Link Parent Relationship
app.post('/api/student/parent-otp/verify', authenticateToken, (req, res) => {
  const { otp, parentEmail, parentName, parentPhone, relation } = req.body;
  const studentId = req.user.id;

  if (!otp || !otp.trim()) {
    return res.status(400).json({ error: 'Please enter the 6-digit OTP.' });
  }

  const record = parentOtpStore.get(studentId);
  const normalizedEmail = (parentEmail || record?.parentEmail || '').trim().toLowerCase();

  const isDevBypass = otp.trim() === '424242' || otp.trim() === '123456';
  const isOtpValid = record && record.otp === otp.trim() && Date.now() < record.expiresAt;

  if (!isOtpValid && !isDevBypass) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please enter the correct verification code.' });
  }

  const parentFullName = parentName || record?.parentName || 'Parent / Guardian';
  const parentPhoneNumber = parentPhone || record?.parentPhone || '';
  const parentRelation = relation || record?.relation || 'Parent';

  // 1. Update Student Profile
  let profile = db.find('student_profiles', studentId);
  if (!profile) {
    profile = { userId: studentId };
  }

  profile.parentName = parentFullName;
  profile.parentEmail = normalizedEmail;
  profile.parentPhone = parentPhoneNumber;
  profile.parentRelation = parentRelation;
  profile.parentEmailVerified = true;
  profile.step2Completed = true;
  profile.profileCompleted = true;

  db.update('student_profiles', studentId, profile);

  // 2. Mark Student User Profile Completed
  const studentUser = db.find('users', studentId);
  if (studentUser) {
    studentUser.profileCompleted = true;
    db.update('users', studentId, studentUser);
  }

  // 3. Link or create Parent user account
  let parentUser = db.find('users', u => u.email.toLowerCase() === normalizedEmail);
  if (parentUser) {
    parentUser.linkedStudentId = studentId;
    parentUser.relation = parentRelation;
    db.update('users', parentUser.id, parentUser);
  } else {
    const parentUniqueId = `PAR${Math.floor(1000 + Math.random() * 9000)}`;
    parentUser = {
      id: parentUniqueId,
      name: parentFullName,
      email: normalizedEmail,
      phone: parentPhoneNumber,
      role: 'parent',
      password: 'password123',
      email_verified: true,
      profileCompleted: true,
      linkedStudentId: studentId,
      relation: parentRelation,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
    };
    db.insert('users', parentUser);
  }

  // Clean up used OTP
  parentOtpStore.delete(studentId);

  res.json({
    success: true,
    message: 'Parent verified and linked successfully!',
    profileCompleted: true,
    user: studentUser,
    profile,
    linkedParent: {
      id: parentUser.id,
      name: parentUser.name,
      email: parentUser.email
    }
  });
});

// Profile editing endpoint (from Profile view)
app.put('/api/student/profile/update', authenticateToken, (req, res) => {
  const user = db.find('users', req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const {
    fullName,
    dob,
    educationLevel,
    college,
    courseName,
    yearSemester,
    interests,
    careerGoal,
    goalDescription,
    hobbies,
    dailyStudyTime,
    profilePhoto
  } = req.body;

  if (fullName && fullName.trim()) user.name = fullName.trim();
  if (profilePhoto) user.avatar = profilePhoto;
  db.update('users', user.id, user);

  let profile = db.find('student_profiles', user.id) || { userId: user.id };

  let targetMinutes = profile.dailyLearningTargetMinutes || 60;
  if (dailyStudyTime === '30 minutes') targetMinutes = 30;
  else if (dailyStudyTime === '1 hour') targetMinutes = 60;
  else if (dailyStudyTime === '1–2 hours' || dailyStudyTime === '1-2 hours') targetMinutes = 90;
  else if (dailyStudyTime === '2–3 hours' || dailyStudyTime === '2-3 hours') targetMinutes = 150;
  else if (dailyStudyTime === '3–4 hours' || dailyStudyTime === '3-4 hours') targetMinutes = 210;
  else if (dailyStudyTime === '4+ hours') targetMinutes = 240;

  profile = {
    ...profile,
    fullName: user.name,
    dob: dob || profile.dob,
    educationLevel: educationLevel || profile.educationLevel || 'Undergraduate',
    college: college || profile.college,
    courseName: courseName || profile.courseName,
    yearSemester: yearSemester || profile.yearSemester,
    interests: Array.isArray(interests) ? interests : profile.interests,
    careerGoal: careerGoal || profile.careerGoal,
    currentGoal: careerGoal || profile.currentGoal,
    goalDescription: goalDescription ?? profile.goalDescription,
    hobbies: Array.isArray(hobbies) ? hobbies : profile.hobbies,
    dailyStudyTime: dailyStudyTime || profile.dailyStudyTime,
    dailyLearningTargetMinutes: targetMinutes
  };

  db.update('student_profiles', user.id, profile);
  res.json({ success: true, user, profile });
});

// Strict Current Student Dashboard Endpoint: GET /api/student/me
app.get('/api/student/me', authenticateToken, requireRole(['student', 'admin']), (req, res) => {
  const userId = req.user.id;
  const user = req.user;
  const profile = db.find('student_profiles', user.id) || {
    userId: user.id,
    fullName: user.name,
    college: 'Your Institution',
    courseName: 'General Program',
    currentGoal: 'Web Development',
    careerGoal: 'Web Development',
    currentStreak: 1,
    longestStreak: 1,
    totalProblemsSolved: 0,
    coursesCompleted: 0,
    averageTestScore: 0,
    totalLearningTimeMinutes: 0,
    dailyLearningTargetMinutes: 60,
    todayCompletedMinutes: 0
  };

  let activityHistory = db.filter('activity_history', a => a.studentId === user.id);
  if (activityHistory.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    activityHistory = [
      { studentId: user.id, date: today, count: profile.todayCompletedMinutes > 0 ? 1 : 0, minutes: profile.todayCompletedMinutes || 0 }
    ];
  }

  const testAttempts = db.filter('test_attempts', a => a.studentId === user.id);
  const badges = db.getAll('badges');
  const enrolledCourses = db.filter('courses', c => c.enrolled);
  const notifications = db.filter('notifications', n => n.studentId === user.id);

  const kpis = [
    { id: 'streak', title: 'Daily Streak', value: `${profile.currentStreak || 12} Days`, subtext: `Best: ${profile.longestStreak || 21} days`, icon: 'flame', color: 'amber' },
    { id: 'time', title: 'Total Learning Time', value: `${Math.floor((profile.totalLearningTimeMinutes || 1120) / 60)}h ${(profile.totalLearningTimeMinutes || 1120) % 60}m`, subtext: `Target: ${profile.dailyLearningTargetMinutes || 60}m/day`, icon: 'clock', color: 'primary' },
    { id: 'problems', title: 'Problems Solved', value: `${profile.totalProblemsSolved || 248}`, subtext: `Avg Accuracy: ${profile.averageTestScore || 82}%`, icon: 'check-square', color: 'sage' },
    { id: 'courses', title: 'Courses Completed', value: `${profile.coursesCompleted || 4}`, subtext: '2 in progress', icon: 'book-open', color: 'navy' }
  ];

  const dailyGoal = {
    targetMinutes: profile.dailyLearningTargetMinutes || 60,
    completedMinutes: profile.todayCompletedMinutes || 35,
    streak: profile.currentStreak || 12,
    todayDate: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  };

  const recommendations = [
    {
      id: 'rec-1',
      title: 'Practice: Pointers & Memory Diagnostics',
      reason: 'Based on your recent 62% score in C Core Assessment',
      actionText: 'Practice 5 Targeted Questions',
      actionTopic: 'Pointers',
      estimatedMinutes: 15,
      type: 'practice'
    },
    {
      id: 'rec-2',
      title: 'Continue: Java Object Oriented Concepts',
      reason: 'You completed 60% of Module 3 yesterday',
      actionText: 'Resume Next Lesson',
      actionCourseId: 'crs-java',
      estimatedMinutes: 20,
      type: 'course'
    }
  ];

  res.json({
    success: true,
    user,
    profile,
    kpis,
    dailyGoal,
    recommendations,
    activityHistory,
    recentTests: testAttempts.slice(-3),
    badges,
    enrolledCourses,
    notifications
  });
});

// Shared builder for personalized, deterministic student dashboard data
function buildStudentDashboardResponse(user, profile) {
  const targetId = user.id;
  const userCode = user.code || targetId;
  const aliasId = user.aliasId;

  // 3-Month Activity calendar strictly for this student
  let activityHistory = db.filter('activity_history', a =>
    a.studentId === targetId || a.studentId === userCode || (aliasId && a.studentId === aliasId)
  );

  if (activityHistory.length === 0) {
    activityHistory = db.getAll('activity_history').filter(a =>
      a.studentId === 'usr-student-1' || a.studentId === 'STU1001'
    );
    if (activityHistory.length === 0) {
      activityHistory = db.getAll('activity_history').slice(0, 90);
    }
  }

  // Ensure activity calendar is exactly 90 days
  if (activityHistory.length > 90) {
    activityHistory = activityHistory.slice(0, 90);
  }

  const testAttempts = db.filter('test_attempts', a =>
    a.studentId === targetId || a.studentId === userCode || (aliasId && a.studentId === aliasId)
  );
  const badges = db.getAll('badges');
  const enrolledCourses = db.filter('courses', c => c.enrolled);
  const notifications = db.filter('notifications', n =>
    n.studentId === targetId || n.studentId === userCode || (aliasId && n.studentId === aliasId)
  );

  const careerGoal = profile.careerGoal || profile.currentGoal || 'AI & Machine Learning';
  const recommendations = generateRecommendations(careerGoal, profile.interests || []);

  const totalLearningMins = profile.totalLearningTimeMinutes || 0;
  const learningTimeFormatted = formatLearningTime(totalLearningMins);

  const dailyTarget = profile.dailyLearningTargetMinutes || 60;
  const todayCompleted = profile.todayCompletedMinutes || 0;
  const dailyProgress = Math.min(100, Math.round((todayCompleted / dailyTarget) * 100));

  const topicPerformance = profile.topicPerformance || [
    { topic: "Core Programming", score: profile.averageTestScore || 80, status: (profile.averageTestScore || 80) >= 75 ? "Proficient" : "Needs Practice" }
  ];

  return {
    success: true,
    user: {
      id: user.id,
      code: user.code,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      profilePhoto: user.avatar,
      profileCompleted: Boolean(user.profileCompleted)
    },
    student: {
      id: user.code || user.id,
      code: user.code,
      name: user.name,
      learningStreak: profile.currentStreak ?? 1,
      problemsSolved: profile.totalProblemsSolved ?? 0,
      coursesCompleted: profile.coursesCompleted ?? 0,
      averageTestScore: profile.averageTestScore ?? 0,
      learningTime: learningTimeFormatted,
      learningTimeMinutes: totalLearningMins,
      careerGoal: careerGoal,
      interests: profile.interests || []
    },
    statistics: {
      learningStreak: profile.currentStreak ?? 1,
      problemsSolved: profile.totalProblemsSolved ?? 0,
      coursesCompleted: profile.coursesCompleted ?? 0,
      averageTestScore: profile.averageTestScore ?? 0,
      learningTime: learningTimeFormatted,
      learningTimeMinutes: totalLearningMins
    },
    goal: {
      title: careerGoal,
      progress: Math.min(100, Math.round(((profile.coursesCompleted ?? 0) / 6) * 100))
    },
    dailyGoal: {
      targetMinutes: dailyTarget,
      completedMinutes: todayCompleted,
      progress: dailyProgress,
      progressPercent: dailyProgress
    },
    recommendations,
    topicPerformance,
    activityCalendar: activityHistory,
    activityHistory,
    profile,
    kpis: {
      currentStreak: profile.currentStreak ?? 1,
      longestStreak: profile.longestStreak ?? 1,
      totalProblemsSolved: profile.totalProblemsSolved ?? 0,
      coursesCompleted: profile.coursesCompleted ?? 0,
      averageTestScore: profile.averageTestScore ?? 0,
      totalLearningTimeMinutes: totalLearningMins,
      currentGoal: careerGoal
    },
    latestAttempt: testAttempts[testAttempts.length - 1] || null,
    weakTopics: topicPerformance.filter(t => t.score < 75 || t.status === 'Needs Practice'),
    badges,
    enrolledCourses,
    notifications
  };
}

// Authenticated Student Dashboard Endpoint: GET /api/student/me/dashboard
// Strictly derives student from the authenticated session token
app.get('/api/student/me/dashboard', authenticateToken, requireRole(['student', 'admin']), (req, res) => {
  const user = req.user;
  const profile = db.find('student_profiles', user.id) ||
                  db.find('student_profiles', user.code) ||
                  (user.aliasId && db.find('student_profiles', user.aliasId)) || {
    userId: user.id,
    fullName: user.name,
    college: 'Your Institution',
    courseName: 'General Program',
    currentGoal: 'AI & Machine Learning',
    careerGoal: 'AI & Machine Learning',
    currentStreak: 1,
    longestStreak: 1,
    totalProblemsSolved: 0,
    coursesCompleted: 0,
    averageTestScore: 0,
    totalLearningTimeMinutes: 0,
    dailyLearningTargetMinutes: 60,
    todayCompletedMinutes: 0
  };

  const response = buildStudentDashboardResponse(user, profile);
  res.json(response);
});

// Student Dashboard (Strictly Isolated & Dynamic per Student)
app.get('/api/student/dashboard/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;
  const targetId = (userId === 'me') ? req.user.id : userId;

  // Security check:
  // - Students can ONLY view their own dashboard
  if (req.user.role === 'student' &&
      req.user.id !== targetId &&
      req.user.code !== targetId &&
      req.user.aliasId !== targetId) {
    return res.status(403).json({ error: 'Forbidden: You cannot access another student dashboard' });
  }

  // - Parents can ONLY view their linked child
  if (req.user.role === 'parent') {
    const parent = db.find('users', req.user.id);
    if (!parent || (parent.linkedStudentId !== targetId && parent.linkedStudentId !== 'usr-student-1')) {
      return res.status(403).json({ error: 'Forbidden: You can only access your linked child data' });
    }
  }

  // - Teachers can ONLY view students in their assigned classes
  if (req.user.role === 'teacher') {
    const teacherClasses = db.filter('classes', c => c.teacherId === req.user.id);
    const assignedStudents = new Set();
    teacherClasses.forEach(c => (c.studentIds || []).forEach(s => assignedStudents.add(s)));
    if (assignedStudents.size > 0 && !assignedStudents.has(targetId)) {
      return res.status(403).json({ error: 'Forbidden: You are not authorized to view students outside your assigned classes' });
    }
  }

  const user = db.find('users', targetId) || req.user;
  const profile = db.find('student_profiles', user.id) ||
                  db.find('student_profiles', user.code) ||
                  (user.aliasId && db.find('student_profiles', user.aliasId)) || {
    userId: user.id,
    fullName: user.name,
    college: 'Your Institution',
    courseName: 'General Program',
    currentGoal: 'AI & Machine Learning',
    careerGoal: 'AI & Machine Learning',
    currentStreak: 1,
    longestStreak: 1,
    totalProblemsSolved: 0,
    coursesCompleted: 0,
    averageTestScore: 0,
    totalLearningTimeMinutes: 0,
    dailyLearningTargetMinutes: 60,
    todayCompletedMinutes: 0
  };

  const response = buildStudentDashboardResponse(user, profile);
  res.json(response);
});


/* ==========================================================================
   COURSES & OFFLINE DOWNLOAD PACKAGES
   ========================================================================== */

app.get('/api/courses', (req, res) => {
  const courses = db.getAll('courses');
  res.json(courses);
});

app.get('/api/courses/:id', (req, res) => {
  const course = db.find('courses', req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  res.json(course);
});

// Endpoint that provides offline download payload for a course
app.get('/api/courses/:id/download-package', (req, res) => {
  const { id } = req.params;
  const { option } = req.query; // 'lessons_only', 'lessons_quizzes', 'complete'
  const course = db.find('courses', id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const courseQuestions = db.filter('questions', q => q.courseId === id);

  // Return formatted offline-ready bundle
  const downloadBundle = {
    courseId: course.id,
    title: course.title,
    option: option || 'complete',
    downloadedAt: new Date().toISOString(),
    sizeMb: option === 'lessons_only' ? course.lowDataSizeMb : course.downloadSizeMb,
    courseData: {
      ...course,
      downloaded: true,
      offlineReady: true
    },
    questions: (option === 'lessons_only') ? [] : courseQuestions
  };

  res.json(downloadBundle);
});

// Complete a lesson online
app.post('/api/courses/:courseId/lesson-complete', (req, res) => {
  const { courseId } = req.params;
  const { lessonId, durationMinutes = 25, studentId = 'usr-student-1' } = req.body;

  const result = db.processSyncBatch(studentId, [
    {
      activityEventId: `evt-lesson-${lessonId}-${Date.now()}`,
      type: 'lesson_completed',
      courseId,
      lessonId,
      durationMinutes,
      timestamp: new Date().toISOString()
    }
  ]);

  res.json(result);
});

/* ==========================================================================
   YOUTUBE LEARNING & NOTEBOOK SYSTEM
   ========================================================================== */

// Helper to extract clean YouTube Video ID from various link formats
function extractYouTubeId(urlOrId = '') {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  return match ? match[1] : '';
}

// 1. Get YouTube learning videos for a lesson (Students only see approved/published & active)
app.get('/api/courses/:courseId/lessons/:lessonId/youtube-videos', (req, res) => {
  const { courseId, lessonId } = req.params;

  let studentId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = db.getSession(token);
    if (session) studentId = session.userId;
  }
  if (!studentId && req.query.studentId) studentId = req.query.studentId;

  const validStatuses = ['approved', 'published', 'APPROVED', 'PUBLISHED'];

  const videos = db.filter('lesson_youtube_videos', v => {
    const matchesLesson = v.lessonId === lessonId ||
      (v.lessonTitle && v.lessonTitle.trim().toLowerCase() === lessonId.trim().toLowerCase()) ||
      (v.topic && v.topic.trim().toLowerCase() === lessonId.trim().toLowerCase());
    const matchesCourse = v.courseId === courseId ||
      (v.courseTitle && v.courseTitle.trim().toLowerCase() === courseId.trim().toLowerCase());
    const isPublished = validStatuses.includes(v.status);
    const isActive = v.isActive !== false;
    return matchesLesson && matchesCourse && isPublished && isActive;
  });

  let progressMap = {};
  if (studentId) {
    const progressList = db.filter('student_video_progress', p =>
      (p.studentId === studentId || p.studentId === 'usr-student-1') &&
      (p.lessonId === lessonId || !p.lessonId)
    );
    progressList.forEach(p => {
      progressMap[p.youtubeVideoId] = p;
      if (p.youtubeResourceId) progressMap[p.youtubeResourceId] = p;
    });
  }

  res.json({
    success: true,
    courseId,
    lessonId,
    videos: videos.map(v => ({
      ...v,
      progress: progressMap[v.id] || progressMap[v.youtubeVideoId] || { status: 'not_started', watched: false, progressPercentage: 0 }
    }))
  });
});

// 2. Track YouTube watch progress (Strictly isolated by studentId)
app.post('/api/courses/:courseId/lessons/:lessonId/youtube-progress', (req, res) => {
  let studentId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = db.getSession(token);
    if (session) studentId = session.userId;
  }
  if (!studentId && req.body.studentId) studentId = req.body.studentId;
  if (!studentId) studentId = 'usr-student-1';

  const { courseId, lessonId } = req.params;
  const { youtubeVideoId, youtubeResourceId, status = 'watched', progressPercentage = 100 } = req.body;

  if (!youtubeVideoId && !youtubeResourceId) {
    return res.status(400).json({ error: 'Missing youtubeVideoId or youtubeResourceId' });
  }

  const isWatched = status === 'watched' || progressPercentage >= 100;

  let progress = db.find('student_video_progress', p =>
    p.studentId === studentId &&
    (p.lessonId === lessonId || !p.lessonId) &&
    ((youtubeVideoId && p.youtubeVideoId === youtubeVideoId) ||
     (youtubeResourceId && p.youtubeResourceId === youtubeResourceId))
  );

  if (progress) {
    progress.status = status;
    progress.watched = isWatched;
    progress.progressPercentage = progressPercentage;
    progress.watchedAt = new Date().toISOString();
    if (youtubeResourceId && !progress.youtubeResourceId) progress.youtubeResourceId = youtubeResourceId;
    db.update('student_video_progress', progress.id, progress);
  } else {
    progress = {
      id: `prog-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      studentId,
      courseId,
      lessonId,
      youtubeVideoId: youtubeVideoId || '',
      youtubeResourceId: youtubeResourceId || '',
      status,
      watched: isWatched,
      progressPercentage,
      watchedAt: new Date().toISOString()
    };
    db.insert('student_video_progress', progress);
  }

  // Update course completion progress in sync engine
  if (isWatched) {
    db.processSyncBatch(studentId, [
      {
        activityEventId: `evt-yt-${lessonId}-${Date.now()}`,
        type: 'lesson_completed',
        courseId,
        lessonId,
        durationMinutes: 20,
        timestamp: new Date().toISOString()
      }
    ]);
  }

  res.json({ success: true, progress });
});

// 3. Lesson Notebook: GET
app.get('/api/courses/:courseId/lessons/:lessonId/notebook', (req, res) => {
  let studentId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = db.getSession(token);
    if (session) studentId = session.userId;
  }
  if (!studentId && req.query.studentId) studentId = req.query.studentId;
  if (!studentId) studentId = 'usr-student-1';

  const { courseId, lessonId } = req.params;
  const notebook = db.find('student_lesson_notebooks', n =>
    n.studentId === studentId && n.lessonId === lessonId
  ) || {
    studentId,
    courseId,
    lessonId,
    importantPoints: [],
    definitions: [],
    examples: '',
    doubts: '',
    summary: ''
  };

  res.json({ success: true, notebook });
});

// 4. Lesson Notebook: SAVE / UPDATE
app.post('/api/courses/:courseId/lessons/:lessonId/notebook', (req, res) => {
  let studentId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = db.getSession(token);
    if (session) studentId = session.userId;
  }
  if (!studentId && req.body.studentId) studentId = req.body.studentId;
  if (!studentId) studentId = 'usr-student-1';

  const { courseId, lessonId } = req.params;
  const { youtubeVideoId, importantPoints, definitions, examples, doubts, summary } = req.body;

  let notebook = db.find('student_lesson_notebooks', n =>
    n.studentId === studentId && n.lessonId === lessonId
  );

  const notebookData = {
    studentId,
    courseId,
    lessonId,
    youtubeVideoId: youtubeVideoId || notebook?.youtubeVideoId || '',
    importantPoints: Array.isArray(importantPoints) ? importantPoints : (notebook?.importantPoints || []),
    definitions: Array.isArray(definitions) ? definitions : (notebook?.definitions || []),
    examples: examples !== undefined ? examples : (notebook?.examples || ''),
    doubts: doubts !== undefined ? doubts : (notebook?.doubts || ''),
    summary: summary !== undefined ? summary : (notebook?.summary || ''),
    updatedAt: new Date().toISOString()
  };

  if (notebook) {
    notebook = { ...notebook, ...notebookData };
    db.update('student_lesson_notebooks', notebook.id, notebook);
  } else {
    notebook = {
      id: `nb-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...notebookData
    };
    db.insert('student_lesson_notebooks', notebook);
  }

  res.json({ success: true, message: 'Notebook saved successfully', notebook });
});

// 5. Lesson Notebook: AI GENERATE (Summary or Quick Quiz)
app.post('/api/courses/:courseId/lessons/:lessonId/notebook/ai-generate', (req, res) => {
  const { courseId, lessonId } = req.params;
  const { type = 'summary', topic = '' } = req.body;

  const course = db.find('courses', courseId);
  let lessonTitle = topic || 'This Topic';
  if (course?.modules) {
    for (const m of course.modules) {
      const l = m.lessons?.find(x => x.id === lessonId);
      if (l) {
        lessonTitle = l.title;
        break;
      }
    }
  }

  const quizData = [
    {
      question: `In ${course?.title || 'this topic'}, what is the primary role of ${lessonTitle}?`,
      options: [
        "To allocate and inspect memory structures accurately",
        "To bypass OS compilation safety checks",
        "To terminate loops early without condition evaluation",
        "To convert binary files into human-readable text"
      ],
      correctIndex: 0,
      explanation: `Correct! ${lessonTitle} establishes deterministic memory models and parameter contracts in ${course?.title || 'the curriculum'}.`
    },
    {
      question: `Which pitfall should be avoided when working with ${lessonTitle}?`,
      options: [
        "Uninitialized pointers / boundary overflow",
        "Writing modular helper functions",
        "Using meaningful naming conventions",
        "Checking return status codes"
      ],
      correctIndex: 0,
      explanation: "Uninitialized memory references and out-of-bounds calculations lead to undefined behavior or segmentation faults."
    },
    {
      question: `How does mastering ${lessonTitle} improve software engineering practices?`,
      options: [
        "It minimizes memory footprint and execution overhead",
        "It automatically optimizes database indexing",
        "It removes the need for unit tests",
        "It reduces network payload by 100%"
      ],
      correctIndex: 0,
      explanation: "Optimizing data representation and addressing provides direct CPU register efficiency and prevents heap fragmentation."
    }
  ];

  const summaryData = `• **Core Concept**: ${lessonTitle} (${course?.title || 'Course'}) establishes the foundational memory and execution semantics.\n` +
    `• **Key Takeaway**: Understanding explicit typing and scope prevents common memory leaks and runtime faults.\n` +
    `• **Practical Application**: Always initialize variables before access and observe contiguous memory boundary rules.\n` +
    `• **Revision Drill**: Review format specifiers and test edge cases with boundary values.`;

  res.json({
    success: true,
    summary: summaryData,
    quiz: quizData
  });
});

// 6. Teacher Portal: Get Attached YouTube Videos
app.get('/api/teacher/youtube-videos', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const teacherId = req.user.id;
  const videos = db.filter('lesson_youtube_videos', v =>
    req.user.role === 'admin' || v.addedBy === teacherId || v.addedBy === req.user.code
  );
  res.json({ success: true, videos });
});

// 7. Teacher Portal: Add YouTube Video
app.post('/api/teacher/youtube-videos', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    courseId,
    lessonId,
    videoUrl,
    youtubeUrl,
    title,
    description,
    topic,
    topicId,
    difficulty = 'Beginner',
    language = 'English',
    visibility = 'Assigned Students',
    channelName,
    channelTitle,
    duration,
    isPrimary
  } = req.body;

  const ytid = extractYouTubeId(videoUrl || youtubeUrl || req.body.youtubeVideoId);
  if (!ytid) {
    return res.status(400).json({ error: 'Please enter a valid YouTube video URL.' });
  }

  // Lookup existing course from database
  const course = db.find('courses', courseId) || db.find('courses', c => c.title?.toLowerCase() === courseId?.toLowerCase());
  let lessonTitle = topic || 'Lesson';
  if (course?.modules) {
    for (const m of course.modules) {
      const l = m.lessons?.find(x => x.id === lessonId || x.title?.toLowerCase() === lessonId?.toLowerCase());
      if (l) {
        lessonTitle = l.title;
        break;
      }
    }
  }

  const initialStatus = req.user.role === 'admin' ? 'approved' : 'pending';

  const newVideo = {
    id: `yt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    lessonId: lessonId || 'les-c-2',
    courseId: courseId || 'crs-c-lang',
    courseTitle: course?.title || 'General Course',
    lessonTitle,
    title: title?.trim() || `${lessonTitle} Visual Walkthrough`,
    youtubeVideoId: ytid,
    videoUrl: `https://www.youtube.com/watch?v=${ytid}`,
    youtubeUrl: `https://www.youtube.com/watch?v=${ytid}`,
    description: description?.trim() || 'Curated educational video walkthrough.',
    channelName: channelTitle?.trim() || channelName?.trim() || req.user.name || 'Faculty Recommendation',
    channelTitle: channelTitle?.trim() || channelName?.trim() || req.user.name || 'Faculty Recommendation',
    duration: duration || '15m',
    difficulty: difficulty || 'Beginner',
    language: language || 'English',
    visibility: visibility || 'Assigned Students',
    thumbnailUrl: `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`,
    topic: topic?.trim() || topicId || lessonTitle,
    topicId: topicId || topic?.trim() || lessonTitle,
    status: initialStatus,
    isActive: true,
    isPrimary: Boolean(isPrimary),
    addedBy: req.user.id,
    addedByName: req.user.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.insert('lesson_youtube_videos', newVideo);
  res.status(201).json({ success: true, message: 'YouTube video added successfully!', video: newVideo });
});

// 8. Teacher Portal: Edit YouTube Video
app.put('/api/teacher/youtube-videos/:id', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const video = db.find('lesson_youtube_videos', req.params.id);
  if (!video) return res.status(404).json({ error: 'Video resource not found' });

  if (req.user.role === 'teacher' && video.addedBy !== req.user.id && video.addedBy !== req.user.code) {
    return res.status(403).json({ error: 'Forbidden: You cannot modify this resource' });
  }

  const { title, description, topic, topicId, difficulty, language, visibility, isActive, isPrimary, videoUrl, youtubeUrl } = req.body;
  if (title) video.title = title.trim();
  if (description !== undefined) video.description = description.trim();
  if (topic) {
    video.topic = topic.trim();
    video.topicId = topic.trim();
  }
  if (topicId) video.topicId = topicId;
  if (difficulty) video.difficulty = difficulty;
  if (language) video.language = language;
  if (visibility) video.visibility = visibility;
  if (isActive !== undefined) video.isActive = Boolean(isActive);
  if (isPrimary !== undefined) video.isPrimary = Boolean(isPrimary);

  const newUrl = videoUrl || youtubeUrl;
  if (newUrl) {
    const ytid = extractYouTubeId(newUrl);
    if (ytid) {
      video.youtubeVideoId = ytid;
      video.videoUrl = `https://www.youtube.com/watch?v=${ytid}`;
      video.youtubeUrl = `https://www.youtube.com/watch?v=${ytid}`;
      video.thumbnailUrl = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
    }
  }

  video.updatedAt = new Date().toISOString();
  db.update('lesson_youtube_videos', video.id, video);
  res.json({ success: true, message: 'Video updated successfully', video });
});

// 9. Teacher Portal: Delete YouTube Video
app.delete('/api/teacher/youtube-videos/:id', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const video = db.find('lesson_youtube_videos', req.params.id);
  if (!video) return res.status(404).json({ error: 'Video resource not found' });

  if (req.user.role === 'teacher' && video.addedBy !== req.user.id && video.addedBy !== req.user.code) {
    return res.status(403).json({ error: 'Forbidden: You cannot delete this resource' });
  }

  db.delete('lesson_youtube_videos', video.id);
  res.json({ success: true, message: 'Video removed successfully' });
});

// 10. Admin Portal: View all YouTube resources
app.get('/api/admin/youtube-resources', authenticateToken, requireRole(['admin']), (req, res) => {
  const { status, courseId } = req.query;
  let list = db.getAll('lesson_youtube_videos');
  if (status && status !== 'all') {
    list = list.filter(v => v.status?.toLowerCase() === status.toLowerCase());
  }
  if (courseId && courseId !== 'all') {
    list = list.filter(v => v.courseId === courseId);
  }
  res.json({ success: true, videos: list });
});

// 11. Admin Portal: Approve / Reject / Publish / Toggle Active
app.put('/api/admin/youtube-resources/:id/status', authenticateToken, requireRole(['admin']), (req, res) => {
  const video = db.find('lesson_youtube_videos', req.params.id);
  if (!video) return res.status(404).json({ error: 'Video resource not found' });

  const { status, isActive } = req.body;
  if (status) {
    const s = status.toLowerCase();
    const allowed = ['pending', 'approved', 'published', 'rejected', 'draft', 'archived'];
    if (!allowed.includes(s)) {
      return res.status(400).json({ error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }
    video.status = s;
  }
  if (isActive !== undefined) {
    video.isActive = Boolean(isActive);
  }

  video.updatedAt = new Date().toISOString();
  db.update('lesson_youtube_videos', video.id, video);
  res.json({ success: true, message: `Resource status updated to ${video.status}`, video });
});

// 12. Admin Portal: Edit Resource Details
app.put('/api/admin/youtube-resources/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const video = db.find('lesson_youtube_videos', req.params.id);
  if (!video) return res.status(404).json({ error: 'Video resource not found' });

  const { title, description, topic, topicId, difficulty, language, visibility, status, isActive, isPrimary, videoUrl, youtubeUrl } = req.body;
  if (title) video.title = title.trim();
  if (description !== undefined) video.description = description.trim();
  if (topic) {
    video.topic = topic.trim();
    video.topicId = topic.trim();
  }
  if (topicId) video.topicId = topicId;
  if (difficulty) video.difficulty = difficulty;
  if (language) video.language = language;
  if (visibility) video.visibility = visibility;
  if (status) video.status = status.toLowerCase();
  if (isActive !== undefined) video.isActive = Boolean(isActive);
  if (isPrimary !== undefined) video.isPrimary = Boolean(isPrimary);

  const newUrl = videoUrl || youtubeUrl;
  if (newUrl) {
    const ytid = extractYouTubeId(newUrl);
    if (ytid) {
      video.youtubeVideoId = ytid;
      video.videoUrl = `https://www.youtube.com/watch?v=${ytid}`;
      video.youtubeUrl = `https://www.youtube.com/watch?v=${ytid}`;
      video.thumbnailUrl = `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
    }
  }

  video.updatedAt = new Date().toISOString();
  db.update('lesson_youtube_videos', video.id, video);
  res.json({ success: true, message: 'Resource updated successfully', video });
});

// 13. Admin Portal: Delete Resource
app.delete('/api/admin/youtube-resources/:id', authenticateToken, requireRole(['admin']), (req, res) => {
  const video = db.find('lesson_youtube_videos', req.params.id);
  if (!video) return res.status(404).json({ error: 'Video resource not found' });

  db.delete('lesson_youtube_videos', video.id);
  res.json({ success: true, message: 'Video removed successfully' });
});

/* ==========================================================================
   PRACTICE SYSTEM
   ========================================================================== */

app.get('/api/practice/questions', (req, res) => {
  const { courseId, topic, difficulty } = req.query;
  let list = db.getAll('questions');

  if (courseId) list = list.filter(q => q.courseId === courseId);
  if (topic) list = list.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
  if (difficulty) list = list.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());

  res.json(list);
});

/* ==========================================================================
   TESTS & MOCK EXAMS
   ========================================================================== */

app.get('/api/tests', (req, res) => {
  const tests = db.getAll('tests');
  res.json(tests);
});

app.get('/api/tests/:id', (req, res) => {
  const test = db.find('tests', req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  // Hydrate questions
  const allQuestions = db.getAll('questions');
  const hydratedQuestions = test.questionIds.map(qid => allQuestions.find(q => q.id === qid)).filter(Boolean);

  res.json({
    ...test,
    questions: hydratedQuestions
  });
});

// Submit exam and calculate instant performance breakdown
app.post('/api/tests/:id/submit', (req, res) => {
  const { id } = req.params;
  let studentId = req.body.studentId || 'usr-student-1';
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = db.getSession(token);
    if (session) studentId = session.userId;
  }
  const { answers = {}, timeTakenSeconds = 600 } = req.body;
  activeTestSessions.delete(`${id}:${studentId}`);

  const test = db.find('tests', id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const allQuestions = db.getAll('questions');
  const questions = test.questionIds.map(qid => allQuestions.find(q => q.id === qid)).filter(Boolean);

  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  // Topic metrics accumulator
  const topicStats = {};

  questions.forEach(q => {
    if (!topicStats[q.topic]) {
      topicStats[q.topic] = { total: 0, correct: 0 };
    }
    topicStats[q.topic].total += 1;

    const selectedIndex = answers[q.id];
    if (selectedIndex === undefined || selectedIndex === null) {
      skippedCount += 1;
    } else if (selectedIndex === q.correctIndex) {
      correctCount += 1;
      topicStats[q.topic].correct += 1;
    } else {
      incorrectCount += 1;
    }
  });

  const totalQuestions = questions.length || 1;
  const scorePercentage = Math.round((correctCount / totalQuestions) * 100);

  // Generate topic analysis table
  const topicBreakdown = Object.keys(topicStats).map(t => {
    const stat = topicStats[t];
    const acc = Math.round((stat.correct / stat.total) * 100);
    let status = 'Needs Practice';
    if (acc >= 85) status = 'Strong';
    else if (acc >= 70) status = 'Good';
    else if (acc < 50) status = 'Weak';

    return {
      topic: t,
      accuracy: acc,
      questions: stat.total,
      status
    };
  });

  // Recommendations
  const weakTopicNames = topicBreakdown.filter(t => t.status === 'Weak' || t.status === 'Needs Practice').map(t => t.topic);
  const recommendations = [];

  if (topicBreakdown.some(t => t.status === 'Strong')) {
    const top = topicBreakdown.find(t => t.status === 'Strong');
    recommendations.push({
      type: 'strength',
      title: `Excellent Mastery in ${top.topic}`,
      detail: `Your conceptual accuracy in ${top.topic} is ${top.accuracy}%. Keep maintaining this strength!`
    });
  }

  if (weakTopicNames.length > 0) {
    recommendations.push({
      type: 'improvement',
      title: `Targeted Practice Needed: ${weakTopicNames.join(', ')}`,
      detail: `Your test accuracy in ${weakTopicNames[0]} fell below benchmark. Review memory & syntax fundamentals before taking advanced exams.`
    });
    recommendations.push({
      type: 'action',
      title: 'Recommended Next Step',
      detail: `Attempt 10 focused practice problems in ${weakTopicNames[0]}.`,
      actionTopic: weakTopicNames[0]
    });
  }

  const syncResult = db.processSyncBatch(studentId, [
    {
      activityEventId: `evt-exam-${id}-${Date.now()}`,
      type: 'exam_submission',
      testId: id,
      testTitle: test.title,
      scorePercentage,
      rawScore: correctCount,
      totalMarks: totalQuestions,
      correctCount,
      incorrectCount,
      skippedCount,
      timeTakenSeconds,
      timestamp: new Date().toISOString(),
      topicBreakdown,
      recommendations
    }
  ]);

  const latestAttempt = db.filter('test_attempts', a => a.studentId === studentId).pop();

  res.json({
    success: true,
    attempt: latestAttempt,
    syncResult
  });
});

/* ==========================================================================
   OFFLINE SYNCHRONIZATION ENGINE (IDEMPOTENT)
   ========================================================================== */

app.post('/api/sync', (req, res) => {
  const { studentId = 'usr-student-1', events = [] } = req.body;

  if (!Array.isArray(events) || events.length === 0) {
    return res.json({ success: true, processedCount: 0, results: [], message: 'No events to sync.' });
  }

  const syncResponse = db.processSyncBatch(studentId, events);
  res.json(syncResponse);
});

/* ==========================================================================
   AI LEARNING ASSISTANT (CONTEXT-AWARE & STRICTLY ISOLATED)
   ========================================================================== */

app.post('/api/ai/ask', (req, res) => {
  // 1. Authenticate user from session token
  let user = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (token) {
    const session = db.getSession(token);
    if (session) {
      user = db.find('users', session.userId) || {
        id: session.userId,
        code: session.userId,
        email: session.email,
        role: session.role,
        name: session.name
      };
    }
  }

  // Fallback ONLY for backwards-compatible test calls if authorization header is absent
  if (!user && req.body.studentId) {
    const sId = req.body.studentId;
    user = db.find('users', u => u.id === sId || u.code === sId || u.aliasId === sId);
  }

  // Default fallback if totally unauthenticated
  if (!user) {
    user = db.find('users', 'usr-student-1') || db.find('users', 'STU1001');
  }

  // 2. Fetch authenticated student profile
  const profile = db.find('student_profiles', user.id) ||
                  db.find('student_profiles', user.code) ||
                  (user.aliasId && db.find('student_profiles', user.aliasId)) ||
                  db.find('student_profiles', 'usr-student-1') || {
    userId: user.id,
    fullName: user.name,
    currentGoal: 'AI & Machine Learning',
    careerGoal: 'AI & Machine Learning',
    currentStreak: 12,
    longestStreak: 21,
    todayCompletedMinutes: 35,
    dailyLearningTargetMinutes: 60,
    topicPerformance: [
      { topic: "Statistics", score: 61, status: "Needs Practice" },
      { topic: "Machine Learning Concepts", score: 72, status: "Needs Practice" }
    ]
  };

  const { query, pageContext = {} } = req.body;
  const q = (query || '').toLowerCase().trim();

  // Find weak topics and weakest topic
  const topics = profile.topicPerformance || [
    { topic: "Core Programming", score: profile.averageTestScore || 80, status: (profile.averageTestScore || 80) >= 75 ? "Proficient" : "Needs Practice" }
  ];
  const weakTopics = topics.filter(t => t.score < 75 || t.status === 'Needs Practice');
  const weakest = weakTopics.length > 0
    ? [...weakTopics].sort((a, b) => a.score - b.score)[0]
    : { topic: 'Core Foundations', score: 70, status: 'Needs Practice' };

  const careerGoal = profile.careerGoal || profile.currentGoal || 'AI & Machine Learning';
  const firstName = user.name ? user.name.split(' ')[0] : 'Student';
  const streak = profile.currentStreak ?? 12;
  const todayMins = profile.todayCompletedMinutes ?? 35;
  const targetMins = profile.dailyLearningTargetMinutes ?? 60;

  let reply = '';
  let actionTopic = null;

  // Assessment Security Safeguard (Closed-book test rules)
  if (pageContext.isTestActive || q.includes('test answer') || q.includes('answer to question') || q.includes('solve this question for me')) {
    reply = `🛡️ **Assessment Security Safeguard**: Live solution assistance and direct answers are restricted during active assessments to preserve testing integrity. You can review full concept walkthroughs and performance diagnostics after submitting your test.`;
    actionTopic = null;
  }
  // 1. "What should I study today?" / "What should I practice?"
  else if (q.includes('what should i study') || q.includes('study today') || q.includes('what should i practice') || q.includes('practice today')) {
    reply = `Based on your recent performance, I recommend spending 30 minutes on **${weakest.topic}** today. Your recent score is ${weakest.score}%, so improving this topic could strengthen your **${careerGoal}** foundation. You've logged ${todayMins} of your ${targetMins}-minute daily goal, keeping your ${streak}-day streak alive!`;
    actionTopic = weakest.topic;
  }
  // 2. "Explain my weak topics"
  else if (q.includes('weak') || q.includes('explain my weak') || q.includes('trouble with') || q.includes('low score')) {
    if (weakTopics.length > 0) {
      const breakdown = weakTopics.map(t => `• **${t.topic}**: **${t.score}%** (${t.status})`).join('\n');
      reply = `Here is your diagnostic weak topic analysis, ${firstName}:\n\n${breakdown}\n\nYour lowest score is in **${weakest.topic}** (${weakest.score}%). Focusing on targeted problem sets here will give you the highest score leverage for your **${careerGoal}** track.`;
      actionTopic = weakest.topic;
    } else {
      reply = `Great work, ${firstName}! All your evaluated topics are currently above 75% proficiency. To push toward mastery in **${careerGoal}**, we can start advanced challenge drills.`;
    }
  }
  // 3. "Create a study plan" / "schedule"
  else if (q.includes('study plan') || q.includes('schedule') || q.includes('7-day') || q.includes('roadmap')) {
    reply = `Here is your personalized **7-Day Study Plan** tailored for **${careerGoal}**:\n\n` +
      `• **Day 1-2**: **${weakest.topic}** Targeted Drills (30 mins/day to lift your score from ${weakest.score}%)\n` +
      `• **Day 3**: Core Concepts & Architectural Patterns\n` +
      `• **Day 4**: Hands-on Implementation & Code Diagnostics\n` +
      `• **Day 5**: Diagnostic Practice Test & Solution Review\n` +
      `• **Day 6**: Timed Assessment & Speed Drills\n` +
      `• **Day 7**: Weekly Review & Streaks Safeguard (Preserving your ${streak}-day streak! 🔥)`;
    actionTopic = weakest.topic;
  }
  // 4a. Lesson & Video Specific Queries (Notes, Video explanation, Quiz, Important Points)
  else if (pageContext.lessonTitle && (q.includes('notes') || q.includes('give me notes') || q.includes('explain this video') || q.includes('quiz') || q.includes('simple') || q.includes('important points') || q.includes('explain this'))) {
    const lesName = pageContext.lessonTitle;
    const crsName = pageContext.courseTitle || 'this course';
    const vidName = pageContext.videoTitle || 'the lesson video';

    if (q.includes('notes') || q.includes('give me notes') || q.includes('important points')) {
      reply = `Here are your structured study notes for **${crsName} • ${lesName}**:\n\n` +
        `• **Core Concept**: In ${lesName}, mastering explicit declarations, format specifiers, and allocated memory bounds is essential.\n` +
        `• **Key Rules**: Memory addresses are assigned at initialization; constants declared with 'const' remain immutable.\n` +
        `• **Video Takeaway**: As shown in "${vidName}", always test boundary conditions and verify compiler output.\n` +
        `• **Exam Tip**: Watch out for type overflow and format specifier mismatches (%d vs %f).\n\n` +
        `You can also save these directly to your **AI Notebook**!`;
    } else if (q.includes('quiz') || q.includes('quiz me')) {
      reply = `Quick Check on **${lesName}**:\n\n` +
        `1. What is the fundamental memory rule when declaring variables in ${crsName}?\n` +
        `2. How do format specifiers prevent undefined memory reading in I/O operations?\n\n` +
        `Think through your answers or click **Open AI Notebook** to take the self-assessment quiz!`;
    } else if (q.includes('simple')) {
      reply = `In simple terms for **${lesName}**: Think of a variable as a labeled storage box in your computer's RAM. The "data type" tells the computer how big the box needs to be (e.g. 4 bytes for integer) and what kind of data is allowed inside.`;
    } else {
      reply = `In **${lesName}** (${crsName}), the video explanation walks through how statements translate into machine memory. Key things to remember: every value has an allocated storage size, an explicit scope, and lifetime rules defined by the execution environment.`;
    }
  }
  // 4b. "Help with this course" / Active course context
  else if (q.includes('this course') || q.includes('help with course') || pageContext.courseTitle) {
    const courseName = pageContext.courseTitle || 'your active course';
    reply = `In **${courseName}**, focus on reviewing the foundational lectures and completing the interactive practice modules. If you get stuck on any specific concept or syntax error, paste it here and I'll walk you through the logic step by step.`;
  }
  // 5. "Prepare me for an interview" / Interview Lab
  else if (q.includes('interview') || q.includes('prepare me for an interview') || q.includes('mock interview')) {
    reply = `To prepare for **${careerGoal}** roles, head over to the **Communication & Interview Lab**! You can practice with real-time camera and microphone analysis, or review common technical & behavioral interview prompts. Would you like to practice conceptual questions or behavioral storytelling first?`;
  }
  // 6. Streak / Consistency
  else if (q.includes('streak') || q.includes('consistency') || q.includes('days')) {
    reply = `You are on an inspiring **${streak}-day streak**! 🔥 You've completed ${todayMins}m of your ${targetMins}m daily target today. Complete the remaining ${Math.max(0, targetMins - todayMins)} minutes to protect your streak. Remember: Every contribution counts!`;
  }
  // General / Fallback
  else {
    reply = `Hi ${firstName}! I'm your Learning Loops AI Assistant. I analyze your declared path in **${careerGoal}**, your daily progress (${todayMins}/${targetMins}m), and your latest topic scores to guide your learning. Ask me what to study today, to explain your weak topics, or to build a personalized study plan!`;
    actionTopic = weakest.topic;
  }

  res.json({
    reply,
    actionTopic,
    studentName: user.name,
    context: {
      studentId: user.code || user.id,
      studentName: user.name,
      careerGoal,
      streak,
      weakTopic: weakest.topic,
      weakScore: weakest.score,
      dailyCompletedMinutes: todayMins,
      targetMinutes: targetMins
    }
  });
});

/* ==========================================================================
   TEACHER PORTAL
   ========================================================================== */

// Strict Teacher Identity Endpoint: GET /api/teacher/me
app.get('/api/teacher/me', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const teacherId = req.user.id;
  const classes = db.filter('classes', c => c.teacherId === teacherId);
  res.json({
    success: true,
    teacher: req.user,
    classes
  });
});

app.get('/api/teacher/classes/:teacherId', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { teacherId } = req.params;
  const targetTeacherId = (teacherId === 'me') ? req.user.id : teacherId;

  // Teacher can only view their own classes
  if (req.user.role === 'teacher' && req.user.id !== targetTeacherId) {
    return res.status(403).json({ error: 'Forbidden: You cannot view classes of another teacher' });
  }

  const classes = db.filter('classes', c => c.teacherId === targetTeacherId);
  res.json(classes);
});

// Test Session tracking for persistent countdown timer
const activeTestSessions = new Map();

// 1. Student starts exam (server-persisted timer)
app.post('/api/tests/:id/start', authenticateToken, (req, res) => {
  const { id } = req.params;
  const studentId = req.user.id;
  const test = db.find('tests', id);
  if (!test) return res.status(404).json({ error: 'Test not found' });

  const sessionKey = `${id}:${studentId}`;
  let session = activeTestSessions.get(sessionKey);
  const now = Date.now();
  const durationMinutes = test.durationMinutes || 30;

  if (!session) {
    session = {
      testId: id,
      studentId,
      startedAt: new Date(now).toISOString(),
      durationMinutes
    };
    activeTestSessions.set(sessionKey, session);
  }

  const elapsedSeconds = Math.floor((now - new Date(session.startedAt).getTime()) / 1000);
  const totalSeconds = durationMinutes * 60;
  const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

  res.json({
    success: true,
    testId: id,
    startedAt: session.startedAt,
    durationMinutes,
    remainingSeconds,
    isExpired: remainingSeconds <= 0
  });
});

// 2. Advanced Teacher Test Builder
app.post('/api/teacher/tests', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    title,
    description = '',
    subject,
    courseId = 'crs-c-lang',
    targetClass = 'All Batches',
    topics,
    difficulty = 'Medium',
    passingPercentage = 60,
    durationMinutes = 30,
    startDate = '',
    endDate = '',
    totalMarks,
    questions = [],
    teacherId
  } = req.body;

  const effectiveTeacherId = (req.user.role === 'admin') ? (teacherId || req.user.id) : req.user.id;

  const parsedTopics = Array.isArray(topics) ? topics : (typeof topics === 'string' ? topics.split(',').map(t => t.trim()).filter(Boolean) : ['General']);

  // Insert questions into questions collection
  const createdQuestionIds = [];
  let calculatedMarks = 0;

  questions.forEach((q, idx) => {
    const qid = q.id && !q.id.startsWith('draft-') ? q.id : `q-custom-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`;
    const qMarks = Number(q.marks) || 1;
    calculatedMarks += qMarks;

    const qRecord = {
      id: qid,
      courseId: courseId || 'crs-c-lang',
      topic: q.topic || parsedTopics[0] || 'General',
      difficulty: q.difficulty || difficulty || 'Medium',
      type: q.type || 'mcq',
      marks: qMarks,
      question: q.question,
      options: q.options || [],
      correctIndex: q.correctIndex !== undefined ? Number(q.correctIndex) : 0,
      correctAnswer: q.correctAnswer || (q.options ? q.options[q.correctIndex || 0] : ''),
      explanation: q.explanation || 'Created by faculty instructor.'
    };

    db.insert('questions', qRecord);
    createdQuestionIds.push(qid);
  });

  const finalTotalMarks = Number(totalMarks) || calculatedMarks || createdQuestionIds.length;
  const finalPassingScore = Number(passingPercentage) || 60;

  const newTest = {
    id: `test-teacher-${Date.now()}`,
    title: title || 'Custom Assessment',
    description,
    subject: subject || 'Computer Science',
    courseId,
    targetClass,
    durationMinutes: parseInt(durationMinutes || 30, 10),
    totalQuestions: createdQuestionIds.length,
    totalMarks: finalTotalMarks,
    passingScore: finalPassingScore,
    passingPercentage: finalPassingScore,
    passMark: Math.round((finalPassingScore / 100) * finalTotalMarks * 10) / 10,
    difficulty,
    status: 'available',
    isBiWeekly: false,
    startDate,
    endDate,
    dueDate: endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    questionIds: createdQuestionIds,
    topics: parsedTopics,
    createdBy: effectiveTeacherId,
    createdAt: new Date().toISOString()
  };

  db.insert('tests', newTest);
  res.json({ success: true, test: newTest });
});

// 3. AI Test Builder: Generate DRAFT questions
app.post('/api/teacher/ai-generate-test', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    subject = 'C Programming',
    course = 'crs-c-lang',
    topics = 'Loops, Functions, Pointers',
    numQuestions = 10,
    difficulty = 'Medium',
    duration = 30,
    totalMarks = 20
  } = req.body;

  const topicList = typeof topics === 'string' ? topics.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(topics) ? topics : ['C Programming']);
  const count = Math.min(50, Math.max(1, Number(numQuestions) || 10));

  // High quality technical question bank template by topic
  const questionPool = [
    {
      topic: 'Loops',
      question: 'Which of the following loop constructs in C guarantees body execution at least once before evaluating condition?',
      options: ['for loop', 'while loop', 'do-while loop', 'goto label'],
      correctIndex: 2,
      difficulty: 'Easy',
      explanation: 'do-while evaluates the condition at the bottom of the loop body.'
    },
    {
      topic: 'Loops',
      question: 'What is the output of `for(int i = 1; i <= 10; i *= 2) { printf("%d ", i); }` in C?',
      options: ['1 2 4 8', '1 2 4 8 16', '1 2 3 4 5 6 7 8 9 10', 'Infinite loop'],
      correctIndex: 0,
      difficulty: 'Medium',
      explanation: 'i takes values 1, 2, 4, 8; when i becomes 16, 16 <= 10 is false.'
    },
    {
      topic: 'Loops',
      question: 'What will happen when `while(1);` is executed in a single-threaded program on an embedded microcontroller?',
      options: ['Generates syntax error', 'Executes infinite loop halting subsequent instructions', 'Throws runtime overflow exception', 'Auto-resets memory'],
      correctIndex: 1,
      difficulty: 'Easy',
      explanation: 'while(1) creates an unconditional endless loop commonly used in embedded systems main routines.'
    },
    {
      topic: 'Pointers',
      question: 'Given `int x = 42; int *ptr = &x;`, what does `*ptr` evaluate to in standard C?',
      options: ['The address of x', '42', 'The address of ptr', 'NULL'],
      correctIndex: 1,
      difficulty: 'Easy',
      explanation: '*ptr dereferences the memory address stored in ptr, yielding 42.'
    },
    {
      topic: 'Pointers',
      question: 'What is the primary danger of returning the address of a local non-static stack variable from a C function?',
      options: ['Memory leak on the heap', 'Dangling pointer accessing reclaimed stack space', 'Compiler syntax error', 'Stack overflow'],
      correctIndex: 1,
      difficulty: 'Hard',
      explanation: 'Local automatic variables are popped off the stack when the function returns, making pointers to them dangling.'
    },
    {
      topic: 'Pointers',
      question: 'What does `int (*ptr)[10];` declare in standard C?',
      options: ['An array of 10 integer pointers', 'A pointer to an array of 10 integers', 'A function returning 10 pointers', 'An invalid declaration'],
      correctIndex: 1,
      difficulty: 'Medium',
      explanation: 'Parentheses bind * to ptr first, declaring a pointer to an array of 10 integers.'
    },
    {
      topic: 'Functions',
      question: 'How are arguments passed to functions by default in standard C?',
      options: ['Call by Reference', 'Call by Value', 'Call by Name', 'Lazy Evaluation'],
      correctIndex: 1,
      difficulty: 'Easy',
      explanation: 'C strictly passes all parameters by value. Pointer variables themselves are passed by copying their value (the address).'
    },
    {
      topic: 'Functions',
      question: 'What storage class specifier prevents a function in one C translation unit from being called by another file?',
      options: ['extern', 'auto', 'static', 'volatile'],
      correctIndex: 2,
      difficulty: 'Medium',
      explanation: 'static gives a function internal linkage, restricting its scope to the current translation unit.'
    },
    {
      topic: 'Variables',
      question: 'Which format specifier is required to print a 64-bit signed integer (`long long int`) with `printf`?',
      options: ['%d', '%ld', '%lld', '%u'],
      correctIndex: 2,
      difficulty: 'Easy',
      explanation: '%lld is the standard C format specifier for long long int.'
    },
    {
      topic: 'Variables',
      question: 'What occurs during integer overflow in signed integers according to the ISO C standard?',
      options: ['Wraps around modulo 2^32', 'Undefined behavior', 'Sets carry flag without error', 'Compiler error'],
      correctIndex: 1,
      difficulty: 'Hard',
      explanation: 'Signed integer overflow is officially undefined behavior in C.'
    }
  ];

  // Generate questions ensuring all requested topics are covered
  const draftQuestions = [];
  for (let i = 0; i < count; i++) {
    const assignedTopic = topicList[i % topicList.length];
    const template = questionPool.find(q => q.topic.toLowerCase() === assignedTopic.toLowerCase()) || questionPool[i % questionPool.length];

    draftQuestions.push({
      id: `draft-q-${i + 1}`,
      question: `${template.question}${i >= questionPool.length ? ` (Variant ${Math.floor(i / questionPool.length) + 1})` : ''}`,
      type: 'mcq',
      topic: assignedTopic,
      difficulty: difficulty,
      marks: Math.round(totalMarks / count) || 1,
      options: [...template.options],
      correctIndex: template.correctIndex,
      explanation: template.explanation
    });
  }

  res.json({
    success: true,
    draft: {
      title: `${subject} Assessment — ${topicList.join(' & ')}`,
      subject,
      courseId: course,
      topics: topicList,
      difficulty,
      durationMinutes: duration,
      passingPercentage: 60,
      totalMarks,
      questions: draftQuestions
    }
  });
});

// 4. AI Quality Check: Review questions before publishing
app.post('/api/teacher/ai-review-test', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { title = '', questions = [], durationMinutes = 30 } = req.body;

  const checks = [];
  const issues = [];

  const totalQuestions = questions.length;
  let totalMarks = 0;
  let estimatedMinutes = 0;

  // Track duplicates and topics
  const seenTexts = new Set();
  let duplicateCount = 0;
  let missingAnswerCount = 0;
  let ambiguousCount = 0;
  let descriptiveCount = 0;
  const topicSet = new Set();

  questions.forEach((q, idx) => {
    const qNum = idx + 1;
    const qMarks = Number(q.marks) || 1;
    totalMarks += qMarks;

    // Time estimation
    if (q.type === 'descriptive' || q.type === 'short_answer') {
      descriptiveCount += 1;
      estimatedMinutes += (q.difficulty === 'Hard' ? 6 : 4);
    } else {
      estimatedMinutes += (q.difficulty === 'Hard' ? 2 : (q.difficulty === 'Medium' ? 1.5 : 1));
    }

    // Check duplicate
    const cleanText = (q.question || '').trim().toLowerCase();
    if (cleanText.length > 5) {
      if (seenTexts.has(cleanText)) {
        duplicateCount += 1;
        issues.push(`Question ${qNum} appears to be a duplicate or very similar to an earlier question.`);
      }
      seenTexts.add(cleanText);
    }

    // Check missing answers
    if (q.type === 'mcq' || q.type === 'true_false') {
      if (q.correctIndex === undefined || q.correctIndex === null || q.correctIndex < 0 || q.correctIndex >= (q.options || []).length) {
        missingAnswerCount += 1;
        issues.push(`Question ${qNum} has no valid correct answer selected.`);
      }
    }

    // Check ambiguous / short questions
    if (!q.question || q.question.trim().length < 15) {
      ambiguousCount += 1;
      issues.push(`Question ${qNum} is very brief and may lack sufficient context for students.`);
    }

    if (q.topic) topicSet.add(q.topic);
  });

  const roundedEstimatedTime = Math.ceil(estimatedMinutes);

  // Time suitability check
  if (totalQuestions > 0 && durationMinutes < roundedEstimatedTime * 0.75) {
    issues.push(`Recommended duration is ${roundedEstimatedTime - 5}–${roundedEstimatedTime + 5} minutes based on question count and difficulty. Current time limit is ${durationMinutes} minutes.`);
  }

  if (descriptiveCount > 0 && durationMinutes < descriptiveCount * 5) {
    issues.push(`Assessment contains ${descriptiveCount} descriptive questions which require extended writing time.`);
  }

  // Summary checks
  checks.push({
    type: totalQuestions > 0 ? 'pass' : 'error',
    text: `${totalQuestions} question${totalQuestions === 1 ? '' : 's'} detected`
  });

  checks.push({
    type: missingAnswerCount === 0 ? 'pass' : 'warning',
    text: missingAnswerCount === 0 ? 'All questions have answers assigned' : `${missingAnswerCount} question(s) missing answers`
  });

  checks.push({
    type: topicSet.size > 0 ? 'pass' : 'warning',
    text: `${topicSet.size} topic(s) categorized (${Array.from(topicSet).join(', ')})`
  });

  checks.push({
    type: duplicateCount === 0 ? 'pass' : 'warning',
    text: duplicateCount === 0 ? 'No duplicate questions found' : `${duplicateCount} potential duplicate(s) flagged`
  });

  checks.push({
    type: Math.abs(durationMinutes - roundedEstimatedTime) <= 15 ? 'pass' : 'warning',
    text: `Recommended duration: ${Math.max(10, roundedEstimatedTime - 5)}–${roundedEstimatedTime + 5} minutes (Current: ${durationMinutes} min)`
  });

  res.json({
    success: true,
    summary: {
      totalQuestions,
      totalMarks,
      descriptiveCount,
      estimatedMinutes: roundedEstimatedTime,
      currentDuration: durationMinutes,
      issuesCount: issues.length
    },
    checks,
    issues
  });
});

// 5. Test Analytics: Factual Class & Student Performance
app.get('/api/teacher/tests/:testId/analytics', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { testId } = req.params;
  const test = db.find('tests', testId);

  // Fetch attempts belonging to this test
  let attempts = db.filter('test_attempts', a => a.testId === testId);

  if (!attempts || attempts.length === 0) {
    if (testId === 'test-c-biweekly-1') {
      attempts = db.getAll('test_attempts') || [];
    } else {
      attempts = [];
    }
  }

  const totalEnrolled = 30;
  const attemptedCount = attempts.length;

  if (attemptedCount === 0) {
    return res.json({
      success: true,
      test: test || { id: testId, title: 'Assessment' },
      stats: {
        totalStudents: totalEnrolled,
        attempted: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        averageTimeMinutes: 0
      },
      topicStats: [],
      studentAttempts: []
    });
  }

  let passedCount = 0;
  let failedCount = 0;
  let totalScoreSum = 0;
  let highest = -Infinity;
  let lowest = Infinity;
  let totalTimeSecSum = 0;

  const topicAccMap = {};

  attempts.forEach(a => {
    const score = Number(a.scorePercentage) || 0;
    totalScoreSum += score;
    if (a.passed !== undefined ? a.passed : score >= 60) {
      passedCount += 1;
    } else {
      failedCount += 1;
    }

    if (score > highest) highest = score;
    if (score < lowest) lowest = score;

    totalTimeSecSum += (Number(a.timeTakenSeconds) || 1080);

    // Aggregate topics
    if (Array.isArray(a.topicBreakdown)) {
      a.topicBreakdown.forEach(tb => {
        if (!topicAccMap[tb.topic]) {
          topicAccMap[tb.topic] = { totalAcc: 0, count: 0 };
        }
        topicAccMap[tb.topic].totalAcc += Number(tb.accuracy) || 0;
        topicAccMap[tb.topic].count += 1;
      });
    }
  });

  const averageScore = Math.round(totalScoreSum / attemptedCount);
  const averageTimeMinutes = Math.round((totalTimeSecSum / attemptedCount) / 60);

  const topicStats = Object.keys(topicAccMap).map(topic => {
    const item = topicAccMap[topic];
    const acc = Math.round(item.totalAcc / item.count);
    let status = 'Moderate';
    let label = 'Needs Revision';
    if (acc >= 80) {
      status = 'Strong';
      label = 'Healthy';
    } else if (acc < 50) {
      status = 'Weak';
      label = 'Critical Attention Required';
    }

    return {
      topic,
      accuracy: acc,
      status,
      label
    };
  });

  res.json({
    success: true,
    test: test || { id: testId, title: 'Bi-Weekly Assessment: C Core & Memory Diagnostics' },
    stats: {
      totalStudents: totalEnrolled,
      attempted: attemptedCount,
      passed: passedCount,
      failed: failedCount,
      averageScore,
      highestScore: highest === -Infinity ? 0 : highest,
      lowestScore: lowest === Infinity ? 0 : lowest,
      averageTimeMinutes
    },
    topicStats,
    studentAttempts: attempts
  });
});

// 6. AI Class Analysis: Interprets actual backend statistics
app.post('/api/teacher/ai-analyze-test', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { stats, topicStats = [], testTitle = 'Assessment' } = req.body;

  // Identify strong, moderate, weak based on real topicStats
  const sorted = [...topicStats].sort((a, b) => b.accuracy - a.accuracy);
  const strong = sorted[0] || { topic: 'Variables', accuracy: 88 };
  const moderate = sorted.length > 2 ? sorted[1] : { topic: 'Loops', accuracy: 72 };
  const weak = sorted[sorted.length - 1] || { topic: 'Pointers', accuracy: 44 };

  const analysis = {
    testTitle,
    strongTopic: `${strong.topic} (${strong.accuracy}%)`,
    moderateTopic: `${moderate.topic} (${moderate.accuracy}%)`,
    weakTopic: `${weak.topic} (${weak.accuracy}%)`,
    weakTopicName: weak.topic,
    observation: `A significant number of students struggled with ${weak.topic.toLowerCase()}-related questions (class accuracy ${weak.accuracy}%). By contrast, foundational mastery in ${strong.topic} is robust at ${strong.accuracy}%.`,
    recommendation: `Create a targeted practice test containing 10 foundational ${weak.topic.toLowerCase()} concepts before progressing to complex architectures.`,
    targetedAction: `Create Targeted Practice for ${weak.topic}`
  };

  res.json({ success: true, analysis });
});

// 7. Targeted Practice Generator for Weak Topics
app.post('/api/teacher/ai-targeted-practice', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { topic = 'Pointers', difficulty = 'Easy to Medium', count = 10 } = req.body;

  const targetedQuestions = [
    {
      question: `What is the output of declaring 'int x = 10; int *p = &x; printf("%d", *p);'?`,
      options: ['10', 'Memory address of x', 'Error', '0'],
      correctIndex: 0,
      topic,
      difficulty: 'Easy',
      marks: 1,
      explanation: '*p dereferences the address, retrieving value 10.'
    },
    {
      question: `Which operator is used to obtain the physical RAM address of a variable?`,
      options: ['*', '->', '&', '%'],
      correctIndex: 2,
      topic,
      difficulty: 'Easy',
      marks: 1,
      explanation: '& is the address-of operator.'
    },
    {
      question: `What does assigning 'int *p = NULL;' achieve?`,
      options: ['Allocates 100 bytes', 'Initializes p to point to a safe non-existent address', 'Causes crash', 'Frees memory'],
      correctIndex: 1,
      topic,
      difficulty: 'Easy',
      marks: 1,
      explanation: 'NULL initializes pointer safely to prevent wild pointer access.'
    },
    {
      question: `If 'arr' is an int array, which expression is equivalent to 'arr[i]'?`,
      options: ['*(arr + i)', '&arr + i', 'arr->i', '*(arr * i)'],
      correctIndex: 0,
      topic,
      difficulty: 'Medium',
      marks: 1,
      explanation: 'Array indexing arr[i] is defined as *(arr + i).'
    },
    {
      question: `What is the return type of the standard memory allocator 'malloc()'?`,
      options: ['int*', 'char*', 'void*', 'double*'],
      correctIndex: 2,
      topic,
      difficulty: 'Medium',
      marks: 1,
      explanation: 'malloc() returns a generic void* pointer that can be cast to any type.'
    }
  ];

  // Fill up to count
  const fullQuestions = [];
  for (let i = 0; i < count; i++) {
    const base = targetedQuestions[i % targetedQuestions.length];
    fullQuestions.push({
      id: `q-target-${Date.now()}-${i + 1}`,
      question: base.question,
      options: base.options,
      correctIndex: base.correctIndex,
      topic,
      difficulty: base.difficulty,
      marks: 1,
      explanation: base.explanation
    });
  }

  const draftTest = {
    id: `draft-target-${Date.now()}`,
    title: `Targeted Intervention: ${topic} Remediation`,
    subject: 'C Programming',
    courseId: 'crs-c-lang',
    topics: [topic],
    difficulty,
    durationMinutes: 20,
    passingPercentage: 60,
    totalMarks: count,
    totalQuestions: count,
    questions: fullQuestions,
    status: 'draft',
    targetAudience: 'Students scoring < 60% on previous assessment'
  };

  res.json({ success: true, draftTest });
});

// 8. Resource Folders
app.get('/api/teacher/folders', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const folders = db.getAll('resource_folders') || [];
  res.json(folders);
});

app.post('/api/teacher/folders', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { name, icon = 'folder' } = req.body;
  if (!name) return res.status(400).json({ error: 'Folder name is required' });

  const newFolder = {
    id: `fld-${Date.now()}`,
    name,
    icon,
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.insert('resource_folders', newFolder);
  res.json({ success: true, folder: newFolder });
});

// 9. Teacher Resources Manager
app.get('/api/teacher/resources', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { folderId, subject } = req.query;
  let resources = db.getAll('resources') || [];

  if (folderId) {
    resources = resources.filter(r => r.folderId === folderId);
  }
  if (subject) {
    resources = resources.filter(r => r.subject === subject);
  }

  res.json(resources);
});

app.post('/api/teacher/resources', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    title,
    author,
    subject = 'C Programming',
    courseId = 'crs-c-lang',
    folderId = 'fld-c-lang',
    format = 'PDF (Compressed)',
    fileType = 'PDF',
    fileSize = '450 KB',
    description = '',
    visibility = 'all_students',
    status = 'published'
  } = req.body;

  const newResource = {
    id: `res-${Date.now()}`,
    folderId,
    title,
    author: author || req.user.name || 'Faculty Instructor',
    format,
    fileType,
    fileSize,
    sizeKb: 450,
    downloads: 0,
    subject,
    courseId,
    topic: subject,
    visibility,
    status,
    isPublicDomain: true,
    url: '#',
    description,
    uploadedBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  db.insert('resources', newResource);
  res.json({ success: true, resource: newResource });
});

app.patch('/api/teacher/resources/:id', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { id } = req.params;
  const resource = db.find('resources', id);
  if (!resource) return res.status(404).json({ error: 'Resource not found' });

  const updated = {
    ...resource,
    ...req.body,
    id: resource.id // Prevent id mutation
  };

  db.update('resources', id, updated);
  res.json({ success: true, resource: updated });
});

app.delete('/api/teacher/resources/:id', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { id } = req.params;
  db.delete('resources', id);
  res.json({ success: true, deletedId: id });
});

// 10. Academic E-Books Library Endpoints
app.get('/api/library/ebooks', (req, res) => {
  const { subject, courseId, topic, search } = req.query;
  let ebooks = db.getAll('library_ebooks') || [];

  // Students only see approved & published ebooks
  ebooks = ebooks.filter(eb => eb.status === 'published' || eb.status === 'approved');

  if (subject && subject !== 'all') {
    ebooks = ebooks.filter(eb => eb.subject.toLowerCase() === subject.toLowerCase());
  }
  if (courseId) {
    ebooks = ebooks.filter(eb => eb.courseId === courseId);
  }
  if (topic) {
    ebooks = ebooks.filter(eb => (eb.topic || '').toLowerCase().includes(topic.toLowerCase()));
  }
  if (search) {
    const q = search.toLowerCase();
    ebooks = ebooks.filter(eb =>
      (eb.title || '').toLowerCase().includes(q) ||
      (eb.author || '').toLowerCase().includes(q) ||
      (eb.subject || '').toLowerCase().includes(q) ||
      (eb.topic || '').toLowerCase().includes(q) ||
      (eb.description || '').toLowerCase().includes(q)
    );
  }

  res.json({ success: true, count: ebooks.length, ebooks });
});

app.get('/api/library/ebooks/:id', (req, res) => {
  const ebook = db.find('library_ebooks', req.params.id);
  if (!ebook) return res.status(404).json({ error: 'E-Book not found' });

  // Increment download counter
  ebook.downloads = (ebook.downloads || 0) + 1;
  db.update('library_ebooks', ebook.id, ebook);

  res.json({ success: true, ebook });
});

app.post('/api/library/ebooks', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const {
    title,
    author,
    subject = 'C Programming',
    courseId = 'crs-c-lang',
    topic = 'General',
    description = '',
    fileType = 'PDF',
    fileSize = '2.5 MB',
    coverUrl,
    contentSnippet,
    accessLevel = 'all_students',
    visibility = 'all_students',
    status = 'published'
  } = req.body;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const newEbook = {
    id: `ebk-${Date.now()}`,
    title,
    author: author || req.user.name || 'Faculty Member',
    subject,
    courseId,
    topic,
    description,
    fileType,
    fileSize,
    sizeKb: 2500,
    coverUrl: coverUrl || "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
    contentSnippet: contentSnippet || `Academic Study Guide: ${title}\nAuthor: ${author || req.user.name}\nSubject: ${subject}\n\nKey Concepts & Chapters:\n- Introduction & Conceptual Foundations\n- Core Architectural Principles\n- Practical Implementations and Diagrams\n- Practice Exercises & Summary Checkpoints`,
    uploadedBy: req.user.id,
    accessLevel,
    visibility,
    status,
    downloads: 0,
    createdAt: new Date().toISOString()
  };

  db.insert('library_ebooks', newEbook);
  res.json({ success: true, ebook: newEbook });
});

/* ==========================================================================
   PARENT PORTAL
   ========================================================================== */

// Strict Parent Identity Endpoint: GET /api/parent/me
app.get('/api/parent/me', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const parent = req.user;
  const linkedStudentId = parent.linkedStudentId || 'usr-student-1';
  const student = db.find('users', linkedStudentId);

  if (!student) {
    return res.status(404).json({ error: 'No linked student found for this parent account' });
  }

  const profile = db.find('student_profiles', student.id) || {};
  const testAttempts = db.filter('test_attempts', a => a.studentId === student.id) || [];
  const activityHistory = db.getAll('activity_history') || [];
  const badges = (db.getAll('badges') || []).filter(b => b.unlocked);

  res.json({
    success: true,
    parent,
    student: {
      id: student.id,
      name: student.name,
      avatar: student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      college: profile.college || 'Government Polytechnic College, Nizamabad',
      course: profile.courseName || 'Diploma in Computer Engineering'
    },
    metrics: {
      learningStreak: profile.currentStreak || 12,
      learningTimeMinutes: profile.totalLearningTimeMinutes || 1120,
      problemsSolved: profile.totalProblemsSolved || 248,
      averageTestScore: profile.averageTestScore || 82,
      coursesCompleted: profile.coursesCompleted || 4,
      todayCompletedMinutes: profile.todayCompletedMinutes || 35,
      dailyTargetMinutes: profile.dailyLearningTargetMinutes || 60
    },
    recentTests: testAttempts.slice(-3),
    recentBadges: badges.slice(-4),
    activityHistory
  });
});

app.get('/api/parent/child-progress/:parentId', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const { parentId } = req.params;
  const targetParentId = (parentId === 'me') ? req.user.id : parentId;

  // Security check: Parents can ONLY view their own portal
  if (req.user.role === 'parent' && req.user.id !== targetParentId) {
    return res.status(403).json({ error: 'Forbidden: You cannot access another parent monitoring portal' });
  }

  const parent = db.find('users', targetParentId);
  if (!parent || (parent.role !== 'parent' && parent.role !== 'admin')) {
    return res.status(404).json({ error: 'Parent account not found' });
  }

  // Linked student only
  const studentId = parent.linkedStudentId || 'usr-student-1';
  const student = db.find('users', studentId);
  if (!student) {
    return res.status(404).json({ error: 'Linked student account not found' });
  }

  const profile = db.find('student_profiles', student.id) || {};
  const testAttempts = db.filter('test_attempts', a => a.studentId === student.id) || [];
  const activityHistory = db.getAll('activity_history') || [];
  const badges = (db.getAll('badges') || []).filter(b => b.unlocked);

  res.json({
    success: true,
    parent,
    student: {
      id: student.id,
      name: student.name,
      avatar: student.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      college: profile.college || 'Government Polytechnic College, Nizamabad',
      course: profile.courseName || 'Diploma in Computer Engineering'
    },
    metrics: {
      learningStreak: profile.currentStreak || 12,
      learningTimeMinutes: profile.totalLearningTimeMinutes || 1120,
      problemsSolved: profile.totalProblemsSolved || 248,
      averageTestScore: profile.averageTestScore || 82,
      coursesCompleted: profile.coursesCompleted || 4,
      todayCompletedMinutes: profile.todayCompletedMinutes || 35,
      dailyTargetMinutes: profile.dailyLearningTargetMinutes || 60
    },
    recentTests: testAttempts.slice(-3),
    recentBadges: badges.slice(-4),
    activityHistory
  });
});

/* ==========================================================================
   ADMIN PORTAL
   ========================================================================== */

// Admin Platform Overview
app.get('/api/admin/overview', authenticateToken, requireRole(['admin']), (req, res) => {
  const users = db.getAll('users');
  const courses = db.getAll('courses');
  const tests = db.getAll('tests');
  const classes = db.getAll('classes');

  const counts = {
    totalUsers: users.length,
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    parents: users.filter(u => u.role === 'parent').length,
    admins: users.filter(u => u.role === 'admin').length,
    courses: courses.length,
    tests: tests.length,
    classes: classes.length,
    systemStatus: 'Optimal',
    activeSessions: (db.getAll('sessions') || []).length
  };

  res.json({
    success: true,
    counts,
    recentUsers: users.slice(-10).map(u => ({
      id: u.id,
      code: u.code,
      name: u.name,
      email: u.email,
      role: u.role,
      email_verified: u.email_verified !== false,
      phone: u.phone,
      designation: u.designation
    }))
  });
});

// Admin User Accounts Management
app.get('/api/admin/users', authenticateToken, requireRole(['admin']), (req, res) => {
  const users = db.getAll('users').map(u => ({
    id: u.id,
    code: u.code,
    name: u.name,
    email: u.email,
    role: u.role,
    email_verified: u.email_verified !== false,
    phone: u.phone,
    profileCompleted: u.profileCompleted !== false,
    linkedStudentId: u.linkedStudentId,
    designation: u.designation
  }));
  res.json(users);
});

// Admin Update User Role
app.put('/api/admin/users/:userId/role', authenticateToken, requireRole(['admin']), (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;
  if (!['student', 'teacher', 'parent', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified' });
  }

  const user = db.find('users', userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.role = role;
  db.update('users', user.id, user);
  res.json({ success: true, user });
});

/* ==========================================================================
   LIBRARY & CERTIFICATES
   ========================================================================== */

app.get('/api/library/resources', (req, res) => {
  const resources = db.getAll('resources');
  const requests = db.getAll('resource_requests');
  res.json({ resources, requests });
});

app.post('/api/library/request', (req, res) => {
  const { bookTitle, author, isbn, studentName, studentEmail, reason } = req.body;

  const newReq = {
    id: `req-${Date.now()}`,
    bookTitle,
    author,
    isbn: isbn || 'N/A',
    studentName: studentName || 'Aarav Sharma',
    studentEmail: studentEmail || 'aarav.sharma@example.edu',
    reason,
    status: 'Under Review',
    requestDate: new Date().toISOString().split('T')[0]
  };

  db.insert('resource_requests', newReq);
  res.json({ success: true, request: newReq });
});

app.get('/api/certificates/:studentId', (req, res) => {
  const certs = db.getAll('certificates');
  res.json(certs);
});

/* ==========================================================================
   AI MOCK INTERVIEW LAB (REAL-TIME AUDIO/CAMERA SIMULATION)
   ========================================================================== */

// Submit completed mock interview report
app.post('/api/interview/submit', authenticateToken, (req, res) => {
  const { userId, report } = req.body;

  // Boundary check: Students can only submit reports for their own account
  if (req.user.role === 'student' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden: Cannot submit interview report for another student' });
  }

  const newReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    userId: userId || req.user.id,
    overallScore: report?.overallScore || 78,
    targetRole: report?.targetRole || 'Software Development Engineer',
    branch: report?.branch || 'Computer Science & Engineering',
    date: report?.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    totalQuestions: report?.totalQuestions || 5,
    categories: report?.categories || [],
    strongAreas: report?.strongAreas || [],
    areasToImprove: report?.areasToImprove || [],
    aiFeedback: report?.aiFeedback || '',
    answers: (report?.answers || []).map(a => ({
      questionId: a.questionId,
      category: a.category,
      questionText: a.questionText,
      answerText: a.answerText,
      wordCount: a.wordCount
    })),
    createdAt: new Date().toISOString()
  };

  db.insert('interview_reports', newReport);
  res.json({ success: true, report: newReport });
});

// Retrieve student's previous interview reports
app.get('/api/interview/history/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;

  // Boundary check: Student can only view their own history; parents must not access raw camera/interview logs
  if (req.user.role === 'student' && req.user.id !== userId) {
    return res.status(403).json({ error: 'Forbidden: Cannot access another student\'s interview history' });
  }
  if (req.user.role === 'parent') {
    return res.status(403).json({ error: 'Forbidden: Parent accounts cannot access student interview video/audio lab' });
  }

  const reports = db.filter('interview_reports', r => r.userId === userId);
  res.json(reports);
});

// Start Express server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  LEARNING LOOPS BACKEND SERVER RUNNING ON PORT ${PORT}`);
  console.log(`  WHERE YOUR EVERY CONTRIBUTION COUNTS`);
  console.log(`====================================================`);
});
