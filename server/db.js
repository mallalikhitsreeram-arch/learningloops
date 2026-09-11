import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialData } from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'learning_loops_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        // Ensure sessions array exists
        if (!this.data.sessions) {
          this.data.sessions = [];
        }
        // Ensure all existing users have password and email_verified
        if (Array.isArray(this.data.users)) {
          for (const user of this.data.users) {
            if (!user.password) user.password = "password123";
            if (user.email_verified === undefined) user.email_verified = true;
          }
          // Ensure unverified student exists
          if (!this.data.users.find(u => u.id === 'usr-student-unverified')) {
            this.data.users.push({
              id: "usr-student-unverified",
              code: "STU1004",
              name: "Kiran Dev (Unverified)",
              email: "unverified@student.learningloops.edu",
              password: "password123",
              email_verified: false,
              phone: "+91 98765 99999",
              role: "student",
              profileCompleted: false,
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
            });
          }
          // Ensure admin user exists
          if (!this.data.users.find(u => u.id === 'usr-admin-1' || u.role === 'admin')) {
            this.data.users.push({
              id: "usr-admin-1",
              code: "ADM1001",
              name: "Dr. Arvind Mehta (Admin)",
              email: "admin@loops-college.edu",
              password: "password123",
              email_verified: true,
              phone: "+91 91234 50000",
              role: "admin",
              designation: "Chief Academic Officer & Platform Admin",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
            });
          }
          // Ensure student accounts and profiles match seeded data
          for (const seededUser of initialData.users) {
            const existing = this.data.users.find(u => u.id === seededUser.id || u.code === seededUser.code);
            if (existing) {
              existing.name = seededUser.name;
              existing.email = seededUser.email;
              existing.code = seededUser.code;
              existing.aliasId = seededUser.aliasId;
              existing.aliases = seededUser.aliases;
              existing.avatar = seededUser.avatar;
              existing.role = seededUser.role;
              existing.profileCompleted = seededUser.profileCompleted;
            } else {
              this.data.users.push(seededUser);
            }
          }

          // Ensure student_profiles exist for all seeded students
          if (!this.data.student_profiles) this.data.student_profiles = [];
          for (const seededProfile of initialData.student_profiles) {
            const pIndex = this.data.student_profiles.findIndex(p => p.userId === seededProfile.userId || p.code === seededProfile.code);
            if (pIndex !== -1) {
              this.data.student_profiles[pIndex] = { ...this.data.student_profiles[pIndex], ...seededProfile };
            } else {
              this.data.student_profiles.push(seededProfile);
            }
          }

          // Ensure activity_history has entries for all seeded students
          if (!this.data.activity_history || this.data.activity_history.length < 90) {
            this.data.activity_history = initialData.activity_history;
          } else {
            const studentIds = ['usr-student-1', 'usr-student-2', 'usr-student-3', 'STU1001', 'STU1002', 'STU1003'];
            for (const sId of studentIds) {
              const hasEntries = this.data.activity_history.some(a => a.studentId === sId);
              if (!hasEntries) {
                const newEntries = initialData.activity_history.filter(a => a.studentId === sId);
                this.data.activity_history.push(...newEntries);
              }
            }
          }

          // Ensure course modules are populated
          if (Array.isArray(this.data.courses)) {
            for (const seededCourse of initialData.courses) {
              const existingCourse = this.data.courses.find(c => c.id === seededCourse.id);
              if (existingCourse) {
                if (!existingCourse.modules || existingCourse.modules.length === 0) {
                  existingCourse.modules = seededCourse.modules;
                }
              } else {
                this.data.courses.push(seededCourse);
              }
            }
          }

          // Ensure lesson_youtube_videos collection exists and includes seeded items
          if (!this.data.lesson_youtube_videos) this.data.lesson_youtube_videos = [];
          for (const v of initialData.lesson_youtube_videos || []) {
            const existingIdx = this.data.lesson_youtube_videos.findIndex(x => x.id === v.id);
            if (existingIdx === -1) {
              if (v.id === 'yt-c-var-neuralnine') {
                this.data.lesson_youtube_videos.unshift(v);
              } else {
                this.data.lesson_youtube_videos.push(v);
              }
            } else {
              this.data.lesson_youtube_videos[existingIdx] = v;
            }
          }

          // Ensure resource_folders collection exists
          if (!this.data.resource_folders || this.data.resource_folders.length === 0) {
            this.data.resource_folders = initialData.resource_folders || [];
          } else {
            for (const f of initialData.resource_folders || []) {
              if (!this.data.resource_folders.find(x => x.id === f.id)) {
                this.data.resource_folders.push(f);
              }
            }
          }

          // Ensure library_ebooks collection exists
          if (!this.data.library_ebooks || this.data.library_ebooks.length === 0) {
            this.data.library_ebooks = initialData.library_ebooks || [];
          } else {
            for (const eb of initialData.library_ebooks || []) {
              if (!this.data.library_ebooks.find(x => x.id === eb.id)) {
                this.data.library_ebooks.push(eb);
              }
            }
          }

          // Ensure resources collection has updated folders & metadata
          if (!this.data.resources || this.data.resources.length === 0) {
            this.data.resources = initialData.resources || [];
          } else {
            for (const r of initialData.resources || []) {
              const rIdx = this.data.resources.findIndex(x => x.id === r.id);
              if (rIdx === -1) {
                this.data.resources.push(r);
              } else {
                this.data.resources[rIdx] = { ...this.data.resources[rIdx], ...r };
              }
            }
          }

          // Ensure test_attempts has full seeded class data
          if (!this.data.test_attempts || this.data.test_attempts.length < 20) {
            this.data.test_attempts = initialData.test_attempts || [];
          }

          // Ensure tests have totalMarks and passingPercentage
          if (Array.isArray(this.data.tests)) {
            for (const t of this.data.tests) {
              if (!t.totalMarks) t.totalMarks = t.totalQuestions || t.questionIds?.length || 8;
              if (!t.passingPercentage) t.passingPercentage = t.passingScore || 60;
            }
          }

          // Ensure student_video_progress collection exists
          if (!this.data.student_video_progress) {
            this.data.student_video_progress = initialData.student_video_progress || [];
          }

          // Ensure student_lesson_notebooks collection exists
          if (!this.data.student_lesson_notebooks) {
            this.data.student_lesson_notebooks = initialData.student_lesson_notebooks || [];
          }

          // Sync user codes
          const codeMap = {
            'usr-student-1': 'STU1001',
            'usr-student-2': 'STU1002',
            'usr-student-3': 'STU1003',
            'usr-student-unverified': 'STU1004',
            'usr-teacher-1': 'TCH1001',
            'usr-teacher-2': 'TCH1002',
            'usr-parent-1': 'PAR1001',
            'usr-admin-1': 'ADM1001'
          };
          for (const u of this.data.users) {
            if (!u.code && codeMap[u.id]) {
              u.code = codeMap[u.id];
            }
          }
        }
        this.save();
      } catch (err) {
        console.error('Error loading db file, resetting to initial seed:', err);
        this.reset();
      }
    } else {
      this.reset();
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(initialData));
    this.save();
  }

  save() {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to save DB file:', err);
    }
  }

  getAll(table) {
    return this.data[table] || [];
  }

  filter(table, predicate) {
    return (this.data[table] || []).filter(predicate);
  }

  find(table, predicateOrId) {
    const list = this.data[table] || [];
    if (typeof predicateOrId === 'function') {
      return list.find(predicateOrId);
    }
    return list.find(item =>
      item.id === predicateOrId ||
      item.userId === predicateOrId ||
      item.code === predicateOrId ||
      item.aliasId === predicateOrId ||
      item.aliasUserId === predicateOrId ||
      (Array.isArray(item.aliases) && item.aliases.includes(predicateOrId))
    );
  }

  insert(table, item) {
    if (!this.data[table]) {
      this.data[table] = [];
    }
    this.data[table].push(item);
    this.save();
    return item;
  }

  update(table, id, updates) {
    if (!this.data[table]) return null;
    const index = this.data[table].findIndex(item =>
      item.id === id ||
      item.userId === id ||
      item.code === id ||
      item.aliasId === id ||
      item.aliasUserId === id
    );
    if (index !== -1) {
      this.data[table][index] = { ...this.data[table][index], ...updates };
      this.save();
      return this.data[table][index];
    }
    return null;
  }

  delete(table, id) {
    if (!this.data[table]) return false;
    const initialLen = this.data[table].length;
    this.data[table] = this.data[table].filter(item => item.id !== id);
    if (this.data[table].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Session Management
  createSession(user) {
    if (!this.data.sessions) this.data.sessions = [];
    const token = `sess-${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const session = {
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      email_verified: user.email_verified !== false,
      createdAt: new Date().toISOString()
    };
    this.data.sessions.push(session);
    this.save();
    return session;
  }

  getSession(token) {
    if (!token || !this.data.sessions) return null;
    return this.data.sessions.find(s => s.token === token) || null;
  }

  deleteSession(token) {
    if (!token || !this.data.sessions) return false;
    const prevLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    if (this.data.sessions.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Idempotent synchronization engine
  processSyncBatch(studentId, events = []) {
    const results = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Get student profile
    const profile = this.find('student_profiles', studentId) || this.find('student_profiles', 'usr-student-1');

    for (const evt of events) {
      const eventId = evt.activityEventId || evt.id;
      if (!eventId) {
        results.push({ eventId: 'unknown', status: 'failed', error: 'Missing activityEventId' });
        continue;
      }

      // Check for duplicate in sync_events
      const existing = (this.data.sync_events || []).find(e => e.activityEventId === eventId);
      if (existing) {
        results.push({
          eventId,
          status: 'already_synced',
          message: 'Duplicate event safely resolved via idempotency key.',
          syncedAt: existing.syncedAt
        });
        continue;
      }

      // Process new event
      try {
        if (evt.type === 'lesson_completed') {
          // Increment learning minutes
          const addedMinutes = evt.durationMinutes || 25;
          profile.todayCompletedMinutes = Math.min(120, (profile.todayCompletedMinutes || 0) + addedMinutes);
          profile.totalLearningTimeMinutes = (profile.totalLearningTimeMinutes || 0) + addedMinutes;

          // Update course lesson status
          if (evt.courseId && evt.lessonId) {
            const course = this.find('courses', evt.courseId);
            if (course && course.modules) {
              for (const mod of course.modules) {
                const lesson = (mod.lessons || []).find(l => l.id === evt.lessonId);
                if (lesson) {
                  lesson.status = 'completed';
                }
              }
            }
          }

          // Update today's activity history
          this._updateActivityHistory(todayStr, addedMinutes, 0, 1);
        } else if (evt.type === 'offline_quiz_attempt' || evt.type === 'exam_submission') {
          // Store attempt
          const newAttempt = {
            id: evt.attemptId || `att-${Date.now()}`,
            studentId,
            testId: evt.testId,
            testTitle: evt.testTitle || 'Offline Practice Assessment',
            scorePercentage: evt.scorePercentage,
            rawScore: evt.rawScore,
            totalMarks: evt.totalMarks,
            correctCount: evt.correctCount,
            incorrectCount: evt.incorrectCount,
            skippedCount: evt.skippedCount || 0,
            timeTakenSeconds: evt.timeTakenSeconds || 600,
            attemptDate: evt.timestamp || new Date().toISOString(),
            performanceRating: evt.scorePercentage >= 80 ? 'Excellent Performance' : (evt.scorePercentage >= 60 ? 'Good Effort' : 'Needs Practice'),
            topicBreakdown: evt.topicBreakdown || [
              { topic: "General Practice", accuracy: evt.scorePercentage, questions: evt.totalMarks, status: evt.scorePercentage >= 70 ? "Strong" : "Needs Practice" }
            ],
            recommendations: evt.recommendations || []
          };
          this.insert('test_attempts', newAttempt);

          // Update metrics
          profile.totalProblemsSolved = (profile.totalProblemsSolved || 0) + (evt.correctCount || 0);
          profile.averageTestScore = Math.round(((profile.averageTestScore || 80) + evt.scorePercentage) / 2);
          const addedMinutes = Math.round((evt.timeTakenSeconds || 600) / 60);
          profile.todayCompletedMinutes = Math.min(120, (profile.todayCompletedMinutes || 0) + addedMinutes);
          profile.totalLearningTimeMinutes = (profile.totalLearningTimeMinutes || 0) + addedMinutes;

          // Update today's activity
          this._updateActivityHistory(todayStr, addedMinutes, evt.correctCount || 0, 0, {
            title: newAttempt.testTitle,
            score: newAttempt.scorePercentage
          });
        } else if (evt.type === 'practice_solved') {
          profile.totalProblemsSolved = (profile.totalProblemsSolved || 0) + (evt.count || 1);
          this._updateActivityHistory(todayStr, 10, evt.count || 1, 0);
        }

        // Record in sync_events to prevent future duplication
        const syncRecord = {
          activityEventId: eventId,
          studentId,
          type: evt.type,
          payload: evt,
          syncedAt: new Date().toISOString(),
          status: 'synced'
        };
        this.insert('sync_events', syncRecord);

        // Check streak update
        if (profile.todayCompletedMinutes >= (profile.dailyLearningTargetMinutes || 60) * 0.5) {
          // Guaranteed streak continuity
          profile.currentStreak = Math.max(profile.currentStreak || 12, 12);
        }

        // Save updated profile
        this.update('student_profiles', profile.userId, profile);

        results.push({
          eventId,
          status: 'synced',
          message: 'Activity synchronized and persisted successfully.',
          syncedAt: syncRecord.syncedAt
        });
      } catch (err) {
        console.error('Error processing sync event:', err);
        results.push({ eventId, status: 'failed', error: err.message });
      }
    }

    this.save();
    return {
      success: true,
      processedCount: results.length,
      results,
      updatedProfile: profile
    };
  }

  _updateActivityHistory(dateStr, minutes, problems, lessons, testTaken = null) {
    if (!this.data.activity_history) this.data.activity_history = [];
    const entry = this.data.activity_history.find(h => h.date === dateStr);
    if (entry) {
      entry.learningTimeMinutes = (entry.learningTimeMinutes || 0) + minutes;
      entry.problemsSolved = (entry.problemsSolved || 0) + problems;
      entry.lessonsCompleted = (entry.lessonsCompleted || 0) + lessons;
      if (testTaken) entry.testTaken = testTaken;
      // Calculate level based on minutes
      if (entry.learningTimeMinutes >= 60) entry.level = 4;
      else if (entry.learningTimeMinutes >= 40) entry.level = 3;
      else if (entry.learningTimeMinutes >= 20) entry.level = 2;
      else if (entry.learningTimeMinutes > 0) entry.level = 1;
    } else {
      this.data.activity_history.push({
        date: dateStr,
        dayOfWeek: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
        level: minutes >= 40 ? 3 : (minutes >= 20 ? 2 : 1),
        learningTimeMinutes: minutes,
        problemsSolved: problems,
        lessonsCompleted: lessons,
        testTaken
      });
    }
  }
}

export const db = new Database();
