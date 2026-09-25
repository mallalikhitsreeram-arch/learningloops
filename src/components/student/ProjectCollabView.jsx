import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderKanban, Users, Plus, X, CheckCircle, Clock, UserCheck, UserX,
  ChevronRight, Sparkles, Search, AlertCircle, Check, Send, Minus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ─── localStorage ──────────────────────────────────────────────────────────
const LS = {
  REQUESTS:    'll_project_requests',
  MEMBERS:     'll_project_members',
  MY_PROJ:     'll_my_projects',
  CUSTOM_PROJ: 'll_custom_projects',
};
const load = (k, d = []) => { try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(d)); } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

// ─── Mock projects ─────────────────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'p1', title: 'Smart Agriculture IoT', emoji: '🌱', color: '#27AE60',
    desc: 'Building a sensor-based smart irrigation system using Raspberry Pi and Python.',
    skills: ['Python', 'IoT', 'Data Science'], status: 'In Progress',
    members: ['Arjun Sharma', 'Priya Reddy'], maxMembers: 6,
    owner: 'Arjun Sharma', roles: ['Backend Dev', 'IoT Engineer', 'Data Analyst'],
    level: 'College',
  },
  {
    id: 'p2', title: 'EduBot – AI Study Assistant', emoji: '🤖', color: '#4A90E2',
    desc: 'An AI chatbot that helps students clear doubts 24/7 using NLP and Flask.',
    skills: ['NLP', 'Python', 'Flask', 'React'], status: 'Recruiting',
    members: ['Rahul Nair'], maxMembers: 4,
    owner: 'Rahul Nair', roles: ['Frontend Dev', 'ML Engineer'],
    level: 'College',
  },
  {
    id: 'p3', title: 'Campus Marketplace App', emoji: '🛒', color: '#9B59B6',
    desc: 'Buy and sell study materials, books, and notes within your campus community.',
    skills: ['React Native', 'Node.js', 'MongoDB'], status: 'In Progress',
    members: ['Sneha Patel', 'Rohan Mehta', 'Kavya Iyer'], maxMembers: 6,
    owner: 'Sneha Patel', roles: ['Backend Dev', 'UI/UX Designer'],
    level: 'College',
  },
  {
    id: 'p4', title: 'Mental Health Tracker', emoji: '💚', color: '#E74C3C',
    desc: 'A wellness app to help students track mood, stress levels, and daily habits.',
    skills: ['React', 'Firebase', 'UI/UX'], status: 'Recruiting',
    members: ['Deepa Kumar'], maxMembers: 4,
    owner: 'Deepa Kumar', roles: ['Frontend Dev', 'Firebase Dev'],
    level: 'Class 11–12 / College',
  },
  {
    id: 'p5', title: 'Open Source Math Library', emoji: '📐', color: '#F39C12',
    desc: 'Community-built mathematical utilities for students and developers.',
    skills: ['JavaScript', 'Algorithms', 'Testing'], status: 'Active',
    members: ['Vikram S', 'Nandita R', 'Suresh T'], maxMembers: 8,
    owner: 'Vikram S', roles: ['Algorithm Contributor', 'Test Engineer'],
    level: 'Any',
  },
  {
    id: 'p6', title: 'Career Path Visualizer', emoji: '🗺️', color: '#1ABC9C',
    desc: 'A visual tool to explore different career trajectories based on skills and interests.',
    skills: ['D3.js', 'React', 'Data'], status: 'Ideation',
    members: ['Ananya B'], maxMembers: 4,
    owner: 'Ananya B', roles: ['Frontend Dev', 'Data Curator'],
    level: 'College',
  },
];

const STATUS_COLORS = { 'In Progress': '#4A90E2', Recruiting: '#27AE60', Active: '#F39C12', Ideation: '#9B59B6' };

// ─── Real Platform Students (from StudentConnectionView & seedData) ────────
const EXISTING_PLATFORM_STUDENTS = [
  {
    id: 'u1',
    name: 'Arjun Sharma',
    level: 'Class 10',
    college: 'Delhi Public School',
    skills: ['Mathematics', 'Physics', 'Python'],
    interests: ['Coding', 'Robotics', 'IoT', 'Backend Developer'],
    bio: 'Love solving logic puzzles, IoT hardware, and building practical systems.'
  },
  {
    id: 'u2',
    name: 'Priya Reddy',
    level: 'Class 10',
    college: 'SVK College',
    skills: ['English', 'Science', 'Data Analysis'],
    interests: ['Writing', 'Biology', 'Data Science', 'Data Analyst', 'Research'],
    bio: 'Passionate about science communication, data analysis, and predictive modeling.'
  },
  {
    id: 'u3',
    name: 'Rahul Nair',
    level: 'Class 11',
    college: 'National Model School',
    skills: ['Chemistry', 'Biology', 'Python'],
    interests: ['Medicine', 'Research', 'AI/ML Engineer', 'Data Analyst'],
    bio: 'Aspiring researcher who loves computational biology and ML experiments.'
  },
  {
    id: 'u4',
    name: 'Sneha Patel',
    level: 'Class 10',
    college: 'St. Xavier High School',
    skills: ['Maths', 'CS', 'React Native'],
    interests: ['App Dev', 'AI', 'UI/UX Designer', 'Frontend Developer', 'Mobile'],
    bio: 'Building mobile apps and user interfaces — passionate about user experience.'
  },
  {
    id: 'u5',
    name: 'Vikram Suresh',
    level: 'Class 12',
    college: 'Kendriya Vidyalaya',
    skills: ['Physics', 'Maths', 'C++'],
    interests: ['Space', 'Engineering', 'Backend Developer', 'Algorithms', 'AI/ML'],
    bio: 'Interested in aerospace algorithms, numerical simulations, and systems engineering.'
  },
  {
    id: 'u6',
    name: 'Kavya Iyer',
    level: 'Class 11',
    college: 'St. Mary High School',
    skills: ['English', 'Social Sc', 'Technical Writing'],
    interests: ['History', 'Debate', 'Content', 'Documentation', 'UI/UX'],
    bio: 'Debate enthusiast, clear communicator, and project documentation coordinator.'
  },
  {
    id: 'usr-student-2',
    name: 'Rahul Sharma',
    level: 'Diploma 2nd Year',
    college: 'Govt Polytechnic Warangal',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    interests: ['Frontend Developer', 'Web Development', 'UI/UX Designer', 'React'],
    bio: 'Frontend developer passionate about building clean, accessible web interfaces.'
  }
];

const PREDEFINED_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'UI/UX Designer',
  'AI/ML Engineer',
  'Data Analyst',
  'Mobile Developer',
  'Cloud / DevOps',
  'QA / Tester'
];

// Helper to count words accurately
const countWords = (str = '') => {
  const trimmed = str.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
};

// ─── Join Request Modal ───────────────────────────────────────────────────────
const JoinRequestModal = ({ project, onClose, onSubmit }) => {
  const [role, setRole] = useState(project.roles[0] || '');
  const [skills, setSkills] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!skills.trim()) return;
    onSubmit({ projectId: project.id, projectTitle: project.title, role, skills, message, status: 'Pending', requestedAt: new Date().toLocaleDateString('en-IN') });
    setSent(true);
  };

  if (sent) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
        <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '40px 32px', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: 'var(--shadow-xl)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '14px' }}>✅</div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.2rem', marginBottom: '8px' }}>Request Sent!</div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Your request to join <strong>{project.title}</strong> has been sent to the project owner. You'll be notified when they respond.
          </div>
          <button className="btn-primary" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>Got it</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,41,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: '16px' }}>
      <div style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '20px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-xl)', animation: 'scaleIn 0.2s ease', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.1rem' }}>Request to Join</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{project.title}</div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Preferred Role</label>
            <select className="form-input" value={role} onChange={e => setRole(e.target.value)}>
              {project.roles.map(r => <option key={r}>{r}</option>)}
              <option>Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Your Skills *</label>
            <input className="form-input" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. Python, React, ML, Data Analysis" />
            {!skills.trim() && <div style={{ fontSize: '0.72rem', color: '#E74C3C', marginTop: '2px' }}>Required</div>}
          </div>
          <div>
            <label style={{ fontWeight: '600', fontSize: '0.82rem', display: 'block', marginBottom: '5px' }}>Why do you want to join? (optional)</label>
            <textarea className="form-input" rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder="Tell the team why you're a great fit..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onClose} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
            <button className="btn-primary" onClick={handleSend} style={{ flex: 2, justifyContent: 'center' }}>Send Request</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Start Project Creation Modal (CHANGE 1) ──────────────────────────────────
const CreateProjectModal = ({ onClose, onCreated, currentUser }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(['Frontend Developer', 'UI/UX Designer']);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [memberCount, setMemberCount] = useState(4);
  const [confirmed, setConfirmed] = useState(false);
  const [emoji, setEmoji] = useState('🚀');

  // Student discovery state
  const [showSimilarStudents, setShowSimilarStudents] = useState(false);
  const [invitedStudents, setInvitedStudents] = useState({});

  // Form submission feedback
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const wordCount = useMemo(() => countWords(description), [description]);
  const isWordCountValid = wordCount >= 100 && wordCount <= 150;
  const isRolesValid = selectedRoles.length > 0;
  const isMemberCountValid = Number(memberCount) >= 2 && Number(memberCount) <= 12;
  const isTitleValid = title.trim().length >= 3;
  const canSubmit = isTitleValid && isWordCountValid && isRolesValid && isMemberCountValid && confirmed;

  // Retrieve current student profile interests
  const currentStudentInterests = useMemo(() => {
    try {
      const p1 = JSON.parse(localStorage.getItem('ll_student_profile') || '{}');
      if (Array.isArray(p1?.interests) && p1.interests.length > 0) return p1.interests;
    } catch {}
    try {
      const p2 = JSON.parse(localStorage.getItem('ll_profile') || '{}');
      if (Array.isArray(p2?.interests) && p2.interests.length > 0) return p2.interests;
    } catch {}
    if (Array.isArray(currentUser?.interests) && currentUser.interests.length > 0) {
      return currentUser.interests;
    }
    return ['Coding', 'Web Development', 'AI', 'Machine Learning'];
  }, [currentUser]);

  // Find students with similar interests based on real data
  const suggestedStudents = useMemo(() => {
    const searchTerms = [
      ...selectedRoles.map(r => r.toLowerCase()),
      ...currentStudentInterests.map(i => i.toLowerCase()),
      title.toLowerCase()
    ];

    const currentUserName = currentUser?.name?.toLowerCase() || '';

    return EXISTING_PLATFORM_STUDENTS
      .filter(s => !s.name.toLowerCase().includes(currentUserName))
      .map(student => {
        const studentInterestsLower = student.interests.map(i => i.toLowerCase());
        const studentSkillsLower = student.skills.map(sk => sk.toLowerCase());

        const matchedInterests = student.interests.filter(int =>
          searchTerms.some(term => term.includes(int.toLowerCase()) || int.toLowerCase().includes(term))
        );

        const matchedSkills = student.skills.filter(sk =>
          searchTerms.some(term => term.includes(sk.toLowerCase()) || sk.toLowerCase().includes(term))
        );

        const relevanceScore = (matchedInterests.length * 2) + matchedSkills.length;

        return {
          ...student,
          matchedInterests: [...new Set([...matchedInterests, ...matchedSkills])],
          relevanceScore
        };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [selectedRoles, currentStudentInterests, title, currentUser]);

  const handleToggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleAddCustomRole = () => {
    const trimmed = customRoleInput.trim();
    if (!trimmed) return;
    if (!selectedRoles.includes(trimmed)) {
      setSelectedRoles([...selectedRoles, trimmed]);
    }
    setCustomRoleInput('');
  };

  const handleInviteStudent = (studentId) => {
    setInvitedStudents(prev => ({ ...prev, [studentId]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!canSubmit) return;

    const newProject = {
      id: `proj_${Date.now()}`,
      title: title.trim(),
      emoji: emoji || '💡',
      color: '#4A90E2',
      desc: description.trim(),
      skills: selectedRoles.slice(0, 4),
      status: 'Recruiting',
      members: [currentUser?.name || 'You'],
      maxMembers: Number(memberCount),
      owner: currentUser?.name || 'You',
      roles: selectedRoles,
      level: currentUser?.educationLevel || 'College / High School',
      isMyProject: true,
      createdAt: new Date().toLocaleDateString('en-IN')
    };

    onCreated(newProject);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,41,0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5000, padding: '16px'
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s ease'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-surface-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              borderRadius: '10px',
              background: 'rgba(74, 144, 226, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FolderKanban size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: '800', fontSize: '1.15rem' }}>
                Start a New Project
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Collaborate with peers, recruit team roles, and build practical solutions.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '22px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Project Title & Emoji */}
          <div>
            <label style={{ fontWeight: '700', fontSize: '0.84rem', display: 'block', marginBottom: '6px' }}>
              Project Title *
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                style={{
                  width: '56px',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)',
                  fontSize: '1.25rem',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                title="Select project icon"
              >
                <option value="🚀">🚀</option>
                <option value="🤖">🤖</option>
                <option value="🌱">🌱</option>
                <option value="💻">💻</option>
                <option value="🧠">🧠</option>
                <option value="🛒">🛒</option>
                <option value="💚">💚</option>
                <option value="📐">📐</option>
                <option value="🗺️">🗺️</option>
                <option value="🔬">🔬</option>
              </select>
              <input
                className="form-input"
                style={{ flex: 1, height: '42px' }}
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Autonomous Campus Delivery Robot"
              />
            </div>
            {submitAttempted && !isTitleValid && (
              <div style={{ fontSize: '0.74rem', color: '#E74C3C', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> Please enter a valid project title (at least 3 characters).
              </div>
            )}
          </div>

          {/* 1. PROJECT IDEA / DESCRIPTION (100–150 words requirement) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontWeight: '700', fontSize: '0.84rem' }}>
                Project Idea &amp; Description *
              </label>

              {/* Live word count indicator */}
              <div style={{
                fontSize: '0.76rem',
                fontWeight: '700',
                padding: '2px 9px',
                borderRadius: '12px',
                background: wordCount === 0
                  ? 'var(--bg-surface-subtle)'
                  : isWordCountValid
                    ? 'rgba(39, 174, 96, 0.15)'
                    : 'rgba(231, 76, 60, 0.15)',
                color: wordCount === 0
                  ? 'var(--text-muted)'
                  : isWordCountValid
                    ? '#27AE60'
                    : '#E74C3C',
                border: `1px solid ${
                  wordCount === 0
                    ? 'var(--border-subtle)'
                    : isWordCountValid
                      ? 'rgba(39, 174, 96, 0.4)'
                      : 'rgba(231, 76, 60, 0.4)'
                }`
              }}>
                {wordCount} / 150 words
              </div>
            </div>

            <textarea
              className="form-input"
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe your project idea in detail: what problem does it solve, what technologies will be used, and how will your team collaborate? (Must be between 100 and 150 words)"
              style={{
                resize: 'vertical',
                borderColor: submitAttempted && !isWordCountValid ? '#E74C3C' : undefined,
                lineHeight: '1.5',
                fontSize: '0.86rem'
              }}
            />

            {/* Validation Feedback */}
            <div style={{ marginTop: '5px', fontSize: '0.75rem' }}>
              {wordCount === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>
                  Minimum: 100 words · Maximum: 150 words.
                </div>
              ) : wordCount < 100 ? (
                <div style={{ color: '#E67E22', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> Description is too short. It must be at least 100 words (currently {wordCount} words; {100 - wordCount} more required).
                </div>
              ) : wordCount > 150 ? (
                <div style={{ color: '#E74C3C', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={13} /> Description exceeds limit! Maximum is 150 words (currently {wordCount} words; please remove {wordCount - 150} words).
                </div>
              ) : (
                <div style={{ color: '#27AE60', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                  <Check size={13} /> Description length is valid ({wordCount} words).
                </div>
              )}
            </div>
          </div>

          {/* 2. REQUIRED ROLES */}
          <div>
            <label style={{ fontWeight: '700', fontSize: '0.84rem', display: 'block', marginBottom: '6px' }}>
              Required Roles *
            </label>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Specify the positions you are looking for in your project team.
            </div>

            {/* Selected Roles Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {selectedRoles.map(role => (
                <span
                  key={role}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    background: 'var(--accent-primary-light, rgba(74, 144, 226, 0.15))',
                    color: 'var(--accent-primary, #4A90E2)',
                    fontSize: '0.78rem',
                    fontWeight: '600',
                    border: '1px solid rgba(74, 144, 226, 0.3)'
                  }}
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => handleToggleRole(role)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary, #4A90E2)',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: 0
                    }}
                    title={`Remove ${role}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Add Preset Roles */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {PREDEFINED_ROLES.filter(r => !selectedRoles.includes(r)).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleToggleRole(role)}
                  style={{
                    padding: '3px 9px',
                    borderRadius: '16px',
                    border: '1px dashed var(--border-subtle)',
                    background: 'var(--bg-surface-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.74rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = 'var(--accent-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  + {role}
                </button>
              ))}
            </div>

            {/* Custom Role Input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                style={{ flex: 1, height: '36px', fontSize: '0.82rem' }}
                value={customRoleInput}
                onChange={e => setCustomRoleInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomRole(); } }}
                placeholder="Or type a custom role (e.g. Embedded Engineer)"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleAddCustomRole}
                style={{ height: '36px', fontSize: '0.78rem', padding: '0 12px' }}
              >
                + Add
              </button>
            </div>

            {submitAttempted && !isRolesValid && (
              <div style={{ fontSize: '0.74rem', color: '#E74C3C', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> Please select or add at least one required role.
              </div>
            )}
          </div>

          {/* 3. REQUIRED NUMBER OF MEMBERS */}
          <div>
            <label style={{ fontWeight: '700', fontSize: '0.84rem', display: 'block', marginBottom: '6px' }}>
              Required Number of Team Members *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-subtle)', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setMemberCount(prev => Math.max(2, Number(prev) - 1))}
                  style={{
                    width: '38px', height: '38px',
                    background: 'var(--bg-surface-subtle)',
                    border: 'none', color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Minus size={15} />
                </button>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={memberCount}
                  onChange={e => setMemberCount(e.target.value)}
                  style={{
                    width: '60px', height: '38px',
                    border: 'none', background: 'var(--bg-surface)',
                    color: 'var(--text-primary)', textAlign: 'center',
                    fontWeight: '700', fontSize: '0.92rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMemberCount(prev => Math.min(12, Number(prev) + 1))}
                  style={{
                    width: '38px', height: '38px',
                    background: 'var(--bg-surface-subtle)',
                    border: 'none', color: 'var(--text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Total members including you (Allowed: 2–12 members)
              </span>
            </div>
            {submitAttempted && !isMemberCountValid && (
              <div style={{ fontSize: '0.74rem', color: '#E74C3C', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertCircle size={12} /> Please specify a valid member count between 2 and 12.
              </div>
            )}
          </div>

          {/* 4. FIND STUDENTS WITH SIMILAR INTERESTS (Using existing platform data) */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '14px 16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                  Looking for Team Members?
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Discover enrolled students who share relevant interests with your project.
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSimilarStudents(!showSimilarStudents)}
                style={{
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: showSimilarStudents ? 'var(--accent-primary)' : undefined,
                  color: showSimilarStudents ? '#fff' : undefined,
                  borderColor: showSimilarStudents ? 'var(--accent-primary)' : undefined
                }}
              >
                <Search size={14} />
                Find Students With Similar Interests
              </button>
            </div>

            {/* Matching Students List */}
            {showSimilarStudents && (
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.76rem', fontWeight: '700', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                  🎯 Suggested Peers from Your Platform ({suggestedStudents.length} matches):
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {suggestedStudents.map(student => {
                    const isInvited = invitedStudents[student.id];
                    return (
                      <div
                        key={student.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          gap: '10px'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--text-primary)' }}>{student.name}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>· {student.level}</span>
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                            {student.interests.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '10px',
                                  background: 'rgba(74, 144, 226, 0.1)',
                                  color: 'var(--accent-primary)'
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleInviteStudent(student.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: isInvited ? '1px solid #27AE60' : '1px solid var(--border-subtle)',
                            background: isInvited ? '#E8FBF2' : 'var(--bg-surface-subtle)',
                            color: isInvited ? '#27AE60' : 'var(--text-primary)',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            flexShrink: 0
                          }}
                        >
                          {isInvited ? (
                            <>
                              <Check size={12} /> Invited
                            </>
                          ) : (
                            <>
                              <Send size={12} /> Invite
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 5. CONFIRMATION CHECKBOX */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            border: `1px solid ${submitAttempted && !confirmed ? '#E74C3C' : 'var(--border-subtle)'}`,
            background: submitAttempted && !confirmed ? 'rgba(231, 76, 60, 0.05)' : 'var(--bg-surface-subtle)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              userSelect: 'none'
            }}>
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--accent-primary)',
                  marginTop: '1px',
                  cursor: 'pointer'
                }}
              />
              <span>
                I confirm that the information provided above is correct and I want to post this project.
              </span>
            </label>
            {submitAttempted && !confirmed && (
              <div style={{ fontSize: '0.74rem', color: '#E74C3C', marginTop: '6px', paddingLeft: '28px' }}>
                You must tick this confirmation checkbox before posting.
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '8px 18px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{
                padding: '8px 24px',
                opacity: canSubmit ? 1 : 0.75,
                cursor: canSubmit ? 'pointer' : 'not-allowed'
              }}
            >
              Post Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main View ────────────────────────────────────────────────────────────────
export const ProjectCollabView = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('browse');
  const [requests, setRequests] = useState(() => load(LS.REQUESTS, []));
  const [members, setMembers] = useState(() => load(LS.MEMBERS, {}));
  const [myProjects, setMyProjects] = useState(() => load(LS.MY_PROJ, []));
  const [customProjects, setCustomProjects] = useState(() => load(LS.CUSTOM_PROJ, []));
  const [joinModal, setJoinModal] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [postSuccessNotice, setPostSuccessNotice] = useState(false);

  useEffect(() => { save(LS.REQUESTS, requests); }, [requests]);
  useEffect(() => { save(LS.MEMBERS, members); }, [members]);
  useEffect(() => { save(LS.MY_PROJ, myProjects); }, [myProjects]);
  useEffect(() => { save(LS.CUSTOM_PROJ, customProjects); }, [customProjects]);

  const CURRENT_USER = currentUser?.name || 'You';

  // Merge custom created projects with baseline catalog
  const allProjects = useMemo(() => {
    return [...customProjects, ...PROJECTS];
  }, [customProjects]);

  const requestedIds = new Set(requests.filter(r => r.status !== 'Rejected').map(r => r.projectId));
  const acceptedIds = new Set(myProjects.map(p => p.projectId));

  const handleJoinRequest = (reqData) => {
    setRequests(prev => [reqData, ...prev]);
    setJoinModal(null);
  };

  const handleAccept = (req) => {
    setRequests(prev => prev.map(r => r === req ? { ...r, status: 'Accepted' } : r));
    setMyProjects(prev => [...prev, { projectId: req.projectId, projectTitle: req.projectTitle, joinedAt: new Date().toLocaleDateString('en-IN'), role: req.role }]);
    setMembers(prev => ({ ...prev, [req.projectId]: [...(prev[req.projectId] || []), CURRENT_USER] }));
  };

  const handleReject = (req) => {
    setRequests(prev => prev.map(r => r === req ? { ...r, status: 'Rejected' } : r));
  };

  const handleProjectCreated = (newProject) => {
    setCustomProjects(prev => [newProject, ...prev]);
    setCreateModalOpen(false);
    setActiveTab('browse');
    setPostSuccessNotice(true);
    setTimeout(() => setPostSuccessNotice(false), 5000);
  };

  // Pending requests for "owner" view
  const pendingRequests = requests.filter(r => r.status === 'Pending');

  // Unified My Projects count (joined projects + user-created projects)
  const allMyProjectsCount = myProjects.length + customProjects.length;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Project Collaboration 🛠️
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join teams, build projects, and gain real-world experience.
          </p>
        </div>
        <button
          id="start-project-btn"
          className="btn-primary"
          onClick={() => setCreateModalOpen(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={15} /> Start Project
        </button>
      </div>

      {/* Success Notification Banner */}
      {postSuccessNotice && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(39, 174, 96, 0.12)',
          border: '1px solid rgba(39, 174, 96, 0.35)',
          color: '#27AE60',
          fontWeight: '600',
          fontSize: '0.84rem',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={16} /> Your project has been posted successfully and is now live in Browse Projects!
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-row" style={{ marginBottom: '20px' }}>
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Projects
        </button>
        <button
          className={`tab-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Projects {allMyProjectsCount > 0 && (
            <span style={{ marginLeft: '5px', background: '#27AE60', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>
              {allMyProjectsCount}
            </span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Join Requests {pendingRequests.length > 0 && (
            <span style={{ marginLeft: '5px', background: '#E67E22', color: '#fff', borderRadius: '10px', padding: '0 6px', fontSize: '0.7rem' }}>
              {pendingRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* ── BROWSE ── */}
      {activeTab === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {allProjects.map(p => {
            const isOwner = p.isMyProject || p.owner === CURRENT_USER;
            const joined = acceptedIds.has(p.id) || isOwner;
            const requested = requestedIds.has(p.id);

            return (
              <div key={p.id} className="content-card" style={{ borderLeft: `3px solid ${p.color || '#4A90E2'}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '1.8rem' }}>{p.emoji || '🚀'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {p.title}
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: `${STATUS_COLORS[p.status] || '#4A90E2'}15`,
                      color: STATUS_COLORS[p.status] || '#4A90E2'
                    }}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '10px' }}>
                  {p.desc}
                </p>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  🎓 {p.level} &nbsp;·&nbsp; Open roles: {Array.isArray(p.roles) ? p.roles.join(', ') : 'Collaborators'}
                </div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(p.skills || []).map(s => (
                    <span key={s} style={{ padding: '2px 7px', borderRadius: '20px', fontSize: '0.7rem', background: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>
                      {s}
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <Users size={14} /> {(p.members || []).length}/{p.maxMembers || 4} members
                  </div>
                  {isOwner ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--accent-primary, #4A90E2)' }}>
                      <CheckCircle size={14} /> Project Owner
                    </div>
                  ) : joined ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: '700', color: '#27AE60' }}>
                      <CheckCircle size={14} /> Joined ✓
                    </div>
                  ) : requested ? (
                    <div style={{ fontSize: '0.78rem', fontWeight: '600', color: '#F39C12', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> Request Sent ✓
                    </div>
                  ) : (
                    <button className="btn-secondary" style={{ fontSize: '0.78rem', padding: '6px 12px' }} onClick={() => setJoinModal(p)}>
                      {p.status === 'Recruiting' ? 'Request to Join' : 'View Project'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MY PROJECTS ── */}
      {activeTab === 'my' && (
        <div>
          {allMyProjectsCount === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛠️</div>
              <div style={{ fontWeight: '600', marginBottom: '6px' }}>No projects yet</div>
              <div style={{ fontSize: '0.84rem' }}>Request to join a project or start your own.</div>
              <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('browse')}>
                Browse Projects
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Created projects */}
              {customProjects.map(cp => (
                <div key={cp.id} className="content-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${cp.color || '#4A90E2'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {cp.emoji} {cp.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Roles: {cp.roles?.join(', ')} &nbsp;·&nbsp; {cp.members?.length || 1}/{cp.maxMembers} members
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Created on {cp.createdAt}
                      </div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '20px', background: 'rgba(74, 144, 226, 0.15)', color: 'var(--accent-primary, #4A90E2)', fontSize: '0.76rem', fontWeight: '700' }}>
                      👑 Project Owner
                    </span>
                  </div>
                </div>
              ))}

              {/* Joined projects */}
              {myProjects.map((mp, i) => {
                const proj = allProjects.find(p => p.id === mp.projectId);
                return (
                  <div key={i} className="content-card" style={{ padding: '18px 20px', borderLeft: `3px solid ${proj?.color || '#4A90E2'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.96rem', color: 'var(--text-primary)', marginBottom: '3px' }}>
                          {proj?.emoji || '🚀'} {mp.projectTitle}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Role: {mp.role}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>Joined on {mp.joinedAt}</div>
                      </div>
                      <span style={{ padding: '4px 10px', borderRadius: '20px', background: '#E8FBF2', color: '#27AE60', fontSize: '0.76rem', fontWeight: '700' }}>
                        Active Member ✓
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── JOIN REQUESTS (owner view) ── */}
      {activeTab === 'requests' && (
        <div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
            As a project owner, you can review and accept/reject join requests below.
          </div>
          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📬</div>
              No join requests yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {requests.map((req, i) => {
                const proj = allProjects.find(p => p.id === req.projectId);
                return (
                  <div key={i} className="content-card" style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {proj?.emoji || '🚀'} {req.projectTitle}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          Role: {req.role} &nbsp;·&nbsp; Skills: {req.skills}
                        </div>
                        {req.message && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{req.message}"</div>}
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>Requested on {req.requestedAt}</div>
                      </div>
                      {req.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleAccept(req)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#E8FBF2', color: '#27AE60', fontWeight: '700', fontSize: '0.82rem', border: '1.5px solid #A9E6C5', cursor: 'pointer' }}>
                            <UserCheck size={14} /> Accept
                          </button>
                          <button onClick={() => handleReject(req)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#FDEDEC', color: '#E74C3C', fontWeight: '700', fontSize: '0.82rem', border: '1.5px solid #F5B5B0', cursor: 'pointer' }}>
                            <UserX size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700', background: req.status === 'Accepted' ? '#E8FBF2' : '#FDEDEC', color: req.status === 'Accepted' ? '#27AE60' : '#E74C3C' }}>
                          {req.status}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Join Request Modal */}
      {joinModal && <JoinRequestModal project={joinModal} onClose={() => setJoinModal(null)} onSubmit={handleJoinRequest} />}

      {/* Start Project Creation Modal (CHANGE 1) */}
      {createModalOpen && (
        <CreateProjectModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={handleProjectCreated}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};
