// Seed data for LEARNING LOOPS
export const initialData = {
  users: [
    {
      id: "usr-student-1",
      code: "STU1001",
      aliasId: "STU1001",
      name: "Likhit Sreeram Malla",
      email: "likhit.malla@example.edu",
      aliases: ["aarav.sharma@example.edu", "STU1001", "usr-student-1"],
      password: "password123",
      email_verified: true,
      phone: "+91 98765 43210",
      role: "student",
      profileCompleted: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr-student-2",
      code: "STU1002",
      aliasId: "STU1002",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.edu",
      aliases: ["priya.patel@example.edu", "STU1002", "usr-student-2"],
      password: "password123",
      email_verified: true,
      phone: "+91 98765 43211",
      role: "student",
      profileCompleted: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr-student-3",
      code: "STU1003",
      aliasId: "STU1003",
      name: "Priya Reddy",
      email: "priya.reddy@example.edu",
      aliases: ["rahul.varma@example.edu", "STU1003", "usr-student-3"],
      password: "password123",
      email_verified: true,
      phone: "+91 98765 43212",
      role: "student",
      profileCompleted: true,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    {
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
    },
    {
      id: "usr-teacher-1",
      code: "TCH1001",
      name: "Prof. K. Ramanujan",
      email: "ramanujan@loops-college.edu",
      password: "password123",
      email_verified: true,
      phone: "+91 91234 56780",
      role: "teacher",
      designation: "Professor of Computer Science & Engineering",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr-teacher-2",
      code: "TCH1002",
      name: "Dr. Sunita Rao",
      email: "sunita.rao@loops-college.edu",
      password: "password123",
      email_verified: true,
      phone: "+91 91234 56781",
      role: "teacher",
      designation: "Head of Academic Innovation & AI Lab",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
    },
    {
      id: "usr-parent-1",
      code: "PAR1001",
      name: "Rajesh Sharma",
      email: "rajesh.sharma@example.com",
      password: "password123",
      email_verified: true,
      phone: "+91 98490 12345",
      role: "parent",
      linkedStudentId: "usr-student-1",
      verified: true,
      relation: "Father",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
    },
    {
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
    }
  ],

  student_profiles: [
    {
      userId: "usr-student-1",
      code: "STU1001",
      aliasUserId: "STU1001",
      fullName: "Likhit Sreeram Malla",
      dob: "2004-06-15",
      college: "Government Polytechnic College, Nizamabad",
      courseName: "Diploma in Computer Engineering",
      yearSemester: "2nd Year / 4th Sem",
      interests: ["Python", "Artificial Intelligence", "Machine Learning", "Web Development"],
      goals: ["Placement preparation", "AI & Machine Learning", "Project development"],
      careerGoal: "AI & Machine Learning",
      currentGoal: "AI & Machine Learning",
      dailyLearningTargetMinutes: 60,
      todayCompletedMinutes: 35,
      preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      preferredTime: "Evening (6:00 PM - 8:00 PM)",
      learningDifficulty: "Balanced",
      currentStreak: 12,
      longestStreak: 21,
      totalProblemsSolved: 248,
      coursesCompleted: 4,
      averageTestScore: 82,
      totalLearningTimeMinutes: 1120, // 18h 40m
      dataPreference: "Low Data",
      parentName: "Rajesh Sharma",
      parentPhone: "+91 98490 12345",
      parentEmail: "rajesh.sharma@example.com",
      topicPerformance: [
        { topic: "Python Basics", score: 88, status: "Mastered", questionsCount: 50 },
        { topic: "AI Fundamentals", score: 84, status: "Proficient", questionsCount: 45 },
        { topic: "Data Structures", score: 79, status: "Proficient", questionsCount: 60 },
        { topic: "Machine Learning Concepts", score: 72, status: "Needs Practice", questionsCount: 48 },
        { topic: "Statistics", score: 61, status: "Needs Practice", questionsCount: 45 }
      ]
    },
    {
      userId: "usr-student-2",
      code: "STU1002",
      aliasUserId: "STU1002",
      fullName: "Rahul Sharma",
      dob: "2004-09-20",
      college: "Government Polytechnic College, Warangal",
      courseName: "Diploma in Information Technology",
      yearSemester: "2nd Year / 3rd Sem",
      interests: ["HTML", "CSS", "JavaScript", "React", "Web Development"],
      goals: ["Frontend Mastery", "Full-Stack Web Development"],
      careerGoal: "Full-Stack Web Developer",
      currentGoal: "Full-Stack Web Developer",
      dailyLearningTargetMinutes: 60,
      todayCompletedMinutes: 42,
      preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      preferredTime: "Morning (7:00 AM - 9:00 AM)",
      learningDifficulty: "Standard",
      currentStreak: 8,
      longestStreak: 15,
      totalProblemsSolved: 156,
      coursesCompleted: 3,
      averageTestScore: 76,
      totalLearningTimeMinutes: 865, // 14h 25m
      dataPreference: "Low Data",
      parentName: "Suresh Sharma",
      parentPhone: "+91 98490 54321",
      parentEmail: "suresh.sharma@example.com",
      topicPerformance: [
        { topic: "HTML & CSS", score: 90, status: "Mastered", questionsCount: 40 },
        { topic: "JavaScript Core", score: 82, status: "Proficient", questionsCount: 45 },
        { topic: "React Components", score: 74, status: "Needs Practice", questionsCount: 30 },
        { topic: "Database & SQL", score: 70, status: "Needs Practice", questionsCount: 25 },
        { topic: "Node.js & Express APIs", score: 64, status: "Needs Practice", questionsCount: 16 }
      ]
    },
    {
      userId: "usr-student-3",
      code: "STU1003",
      aliasUserId: "STU1003",
      fullName: "Priya Reddy",
      dob: "2004-03-12",
      college: "SVK Polytechnic College, Hyderabad",
      courseName: "Diploma in Computer Engineering",
      yearSemester: "3rd Year / 5th Sem",
      interests: ["Python", "Data Science", "Mathematics", "Machine Learning"],
      goals: ["Data Science Certification", "Research Project"],
      careerGoal: "Data Scientist",
      currentGoal: "Data Scientist",
      dailyLearningTargetMinutes: 90,
      todayCompletedMinutes: 75,
      preferredDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      preferredTime: "Night (8:00 PM - 10:30 PM)",
      learningDifficulty: "Challenging",
      currentStreak: 21,
      longestStreak: 30,
      totalProblemsSolved: 327,
      coursesCompleted: 6,
      averageTestScore: 89,
      totalLearningTimeMinutes: 1570, // 26h 10m
      dataPreference: "Balanced",
      parentName: "Venkat Reddy",
      parentPhone: "+91 98490 99887",
      parentEmail: "venkat.reddy@example.com",
      topicPerformance: [
        { topic: "Python for Data Science", score: 92, status: "Mastered", questionsCount: 80 },
        { topic: "Data Analysis & Pandas", score: 90, status: "Mastered", questionsCount: 75 },
        { topic: "Statistics & Probability", score: 88, status: "Mastered", questionsCount: 70 },
        { topic: "Machine Learning Algorithms", score: 85, status: "Mastered", questionsCount: 62 },
        { topic: "Big Data & SQL Pipelines", score: 68, status: "Needs Practice", questionsCount: 40 }
      ]
    }
  ],

  courses: [
    {
      id: "crs-c-lang",
      title: "C Programming",
      category: "Computer Science Core",
      difficulty: "Beginner",
      durationHours: 24,
      totalModules: 5,
      totalLessons: 20,
      downloadSizeMb: 120,
      lowDataSizeMb: 18,
      language: "English | Telugu | Hindi",
      rating: 4.8,
      progressPercent: 75,
      enrolled: true,
      description: "Master procedural programming, pointers, memory allocation, and foundational algorithmic thinking.",
      topics: ["Variables & Data Types", "Control Structures & Loops", "Functions & Scope", "Pointers & Memory", "Structs & File I/O"],
      modules: [
        {
          id: "mod-c-1",
          title: "Module 1: Getting Started with C",
          lessons: [
            { id: "les-c-1", title: "C Syntax, Compilers & Structure", durationMins: 20, status: "completed", downloaded: true, summary: "Understanding main(), header files, compilation pipeline (preprocessor -> assembler -> linker)." },
            { id: "les-c-2", title: "Variables, Constants & Data Types", durationMins: 25, status: "completed", downloaded: true, summary: "Primitive types, format specifiers (%d, %f, %c), variable declarations and memory limits." }
          ]
        },
        {
          id: "mod-c-2",
          title: "Module 2: Control Flow & Loops",
          lessons: [
            { id: "les-c-3", title: "Conditional Statements (if-else, switch)", durationMins: 30, status: "completed", downloaded: true, summary: "Branching constructs, ternary operators, nested conditions, and efficient switch fall-through." },
            { id: "les-c-4", title: "For, While & Do-While Loops", durationMins: 35, status: "completed", downloaded: true, summary: "Iteration logic, infinite loops prevention, break, continue, and loop invariant patterns." }
          ]
        },
        {
          id: "mod-c-3",
          title: "Module 3: Functions & Modular Programming",
          lessons: [
            { id: "les-c-5", title: "Function Prototypes & Call by Value", durationMins: 30, status: "completed", downloaded: true, summary: "Function signatures, parameter passing, stack frames, and recursive function bases." },
            { id: "les-c-6", title: "Recursion & Call Stack Dynamics", durationMins: 35, status: "in_progress", downloaded: true, summary: "Base cases, recursion depth, stack overflow diagnostics, and memoization concepts." }
          ]
        },
        {
          id: "mod-c-4",
          title: "Module 4: Pointers & Direct Memory Access",
          lessons: [
            { id: "les-c-7", title: "Understanding Memory Addresses & Dereferencing", durationMins: 40, status: "available", downloaded: false, summary: "The & and * operators, pointer arithmetic, void pointers, and segfault debugging." },
            { id: "les-c-8", title: "Dynamic Memory: malloc, calloc, realloc & free", durationMins: 45, status: "available", downloaded: false, summary: "Heap allocation lifecycle, memory leaks prevention, dangling pointer traps." }
          ]
        },
        {
          id: "mod-c-5",
          title: "Module 5: Structures, Unions & File I/O",
          lessons: [
            { id: "les-c-9", title: "User Defined Data Types: struct & typedef", durationMins: 35, status: "available", downloaded: false, summary: "Grouping heterogeneous records, alignment, padding, and nested structs." },
            { id: "les-c-10", title: "File Operations (fopen, fread, fwrite, fclose)", durationMins: 40, status: "available", downloaded: false, summary: "Text vs binary streams, file pointers, error checking with feof and ferror." }
          ]
        }
      ]
    },
    {
      id: "crs-cpp",
      title: "C++ Object-Oriented Programming",
      category: "Computer Science Core",
      difficulty: "Intermediate",
      durationHours: 28,
      totalModules: 5,
      totalLessons: 18,
      downloadSizeMb: 110,
      lowDataSizeMb: 16,
      language: "English | Hindi",
      rating: 4.7,
      progressPercent: 40,
      enrolled: true,
      description: "Dive into Classes, Objects, Inheritance, Polymorphism, and Standard Template Library (STL).",
      topics: ["Classes & Objects", "Constructors & Destructors", "Inheritance & Polymorphism", "Templates & STL", "Exception Handling"]
    },
    {
      id: "crs-java",
      title: "Java Core & Enterprise",
      category: "Software Development",
      difficulty: "Intermediate",
      durationHours: 32,
      totalModules: 6,
      totalLessons: 24,
      downloadSizeMb: 140,
      lowDataSizeMb: 22,
      language: "English | Telugu",
      rating: 4.9,
      progressPercent: 100,
      enrolled: true,
      completedDate: "2026-06-20",
      certificateId: "LL-CERT-2026-JAVA-8821",
      description: "Master Java OOP, Collections Framework, Streams API, Multithreading, and JDBC fundamentals.",
      topics: ["JVM Architecture", "Collections Framework", "Concurrency", "Generics", "Streams API"]
    },
    {
      id: "crs-python",
      title: "Python Fundamentals & Scripting",
      category: "Programming & Data",
      difficulty: "Beginner",
      durationHours: 20,
      totalModules: 4,
      totalLessons: 16,
      downloadSizeMb: 95,
      lowDataSizeMb: 14,
      language: "English | Telugu | Hindi",
      rating: 4.9,
      progressPercent: 100,
      enrolled: true,
      completedDate: "2026-07-15",
      certificateId: "LL-CERT-2026-PY-9104",
      description: "Learn clean Python syntax, list comprehensions, file handling, and introductory data science packages.",
      topics: ["Syntax & Types", "Data Structures", "Functions & Lambdas", "Modules & Packages", "File Handling"],
      modules: [
        {
          id: "mod-py-1",
          title: "Module 1: Python Basics & Syntax",
          lessons: [
            { id: "les-py-1", title: "Python Variables, Constants & Data Types", durationMins: 20, status: "completed", downloaded: true, summary: "Dynamic typing, numeric types, strings, standard input/output, and type casting in Python." },
            { id: "les-py-2", title: "Conditions & Logical Branching", durationMins: 25, status: "completed", downloaded: true, summary: "Boolean logic, if-elif-else statements, identity and membership operators." }
          ]
        },
        {
          id: "mod-py-2",
          title: "Module 2: Loops & Functions",
          lessons: [
            { id: "les-py-3", title: "Python Loops for Beginners", durationMins: 30, status: "completed", downloaded: true, summary: "For loops, while loops, range() sequences, loop control statements, and iteration patterns." },
            { id: "les-py-4", title: "Functions & Scope Dynamics", durationMins: 35, status: "completed", downloaded: true, summary: "Def signatures, positional vs keyword arguments, default values, return values, and global/local scope." }
          ]
        }
      ]
    },
    {
      id: "crs-html-css",
      title: "HTML & CSS Responsive Design",
      category: "Web Development",
      difficulty: "Beginner",
      durationHours: 16,
      totalModules: 4,
      totalLessons: 14,
      downloadSizeMb: 80,
      lowDataSizeMb: 12,
      language: "English | Telugu | Hindi",
      rating: 4.9,
      progressPercent: 100,
      enrolled: true,
      completedDate: "2026-08-10",
      certificateId: "LL-CERT-2026-HTML-7402",
      description: "Build beautiful, accessible, mobile-first responsive interfaces using modern HTML5 and Vanilla CSS.",
      topics: ["Semantic HTML5", "CSS Box Model", "Flexbox Layout", "CSS Grid", "Media Queries & Responsive Units"],
      modules: [
        {
          id: "mod-html-1",
          title: "Semantic HTML5 Architecture",
          lessons: [
            { id: "les-h-1", title: "Semantic Tags: header, main, nav, section, article", durationMins: 20, status: "completed", downloaded: true, summary: "Accessible document outline, ARIA landmark roles, SEO optimization." },
            { id: "les-h-2", title: "Forms, Validations & Input Types", durationMins: 25, status: "completed", downloaded: true, summary: "Native input attributes (pattern, required), accessible labels, fieldsets." }
          ]
        },
        {
          id: "mod-html-2",
          title: "Modern CSS Layouts",
          lessons: [
            { id: "les-h-3", title: "Flexbox Deep Dive: Axes, Alignment & Wrapping", durationMins: 30, status: "completed", downloaded: true, summary: "Main-axis vs cross-axis, justify-content, align-items, flex-grow/shrink dynamics." },
            { id: "les-h-4", title: "CSS Grid: Templates, Areas & Minmax", durationMins: 35, status: "completed", downloaded: true, summary: "Two-dimensional layout, grid-template-columns, repeat(auto-fit, minmax()), grid-gap." }
          ]
        }
      ]
    },
    {
      id: "crs-javascript",
      title: "JavaScript Modern ES6+ & Async",
      category: "Web Development",
      difficulty: "Intermediate",
      durationHours: 26,
      totalModules: 5,
      totalLessons: 20,
      downloadSizeMb: 105,
      lowDataSizeMb: 15,
      language: "English | Telugu | Hindi",
      rating: 4.8,
      progressPercent: 85,
      enrolled: true,
      description: "Master modern ECMAScript, closures, the event loop, Promises, Fetch API, and DOM manipulation.",
      topics: ["ES6+ Syntax", "Scope & Closures", "Asynchronous JS & Event Loop", "DOM Manipulation", "Fetch & REST APIs"],
      modules: [
        {
          id: "mod-js-1",
          title: "ES6 Core Foundations",
          lessons: [
            { id: "les-js-1", title: "Arrow Functions, Destructuring & Rest/Spread", durationMins: 25, status: "completed", downloaded: true, summary: "Lexical this binding, object/array destructuring patterns, rest parameters." },
            { id: "les-js-2", title: "Scope, Closures & Execution Contexts", durationMins: 35, status: "completed", downloaded: true, summary: "Lexical environment, closures for private data encapsulation, memory retention." }
          ]
        },
        {
          id: "mod-js-2",
          title: "Asynchronous JavaScript",
          lessons: [
            { id: "les-js-3", title: "Event Loop, Microtasks & Macrotasks", durationMins: 30, status: "completed", downloaded: true, summary: "Call stack, Web APIs, microtask queue (Promises) vs task queue (setTimeout)." },
            { id: "les-js-4", title: "Promises & Async/Await Error Handling", durationMins: 35, status: "in_progress", downloaded: true, summary: "Chaining, Promise.all, Promise.allSettled, try/catch with async functions." }
          ]
        }
      ]
    },
    {
      id: "crs-sql",
      title: "SQL Database Design & Queries",
      category: "Data & Backend",
      difficulty: "Beginner",
      durationHours: 18,
      totalModules: 4,
      totalLessons: 15,
      downloadSizeMb: 75,
      lowDataSizeMb: 11,
      language: "English | Hindi",
      rating: 4.7,
      progressPercent: 100,
      enrolled: true,
      completedDate: "2026-08-25",
      certificateId: "LL-CERT-2026-SQL-6391",
      description: "Relational database concepts, normalization (1NF-3NF), complex joins, aggregations, and indexing.",
      topics: ["DDL & DML Commands", "Entity Relationships", "INNER/LEFT/RIGHT Joins", "GROUP BY & HAVING", "Indexes & Transactions"]
    },
    {
      id: "crs-dsa",
      title: "Data Structures & Algorithms",
      category: "Computer Science Core",
      difficulty: "Advanced",
      durationHours: 40,
      totalModules: 8,
      totalLessons: 32,
      downloadSizeMb: 160,
      lowDataSizeMb: 25,
      language: "English | Telugu | Hindi",
      rating: 4.9,
      progressPercent: 30,
      enrolled: true,
      description: "Master Linked Lists, Stacks, Queues, Binary Trees, Heaps, Graphs, Dynamic Programming, and Sorting.",
      topics: ["Time & Space Complexity", "Arrays & Linked Lists", "Stacks & Queues", "Trees & Graphs", "Dynamic Programming"]
    },
    {
      id: "crs-webdev",
      title: "Full-Stack Web Development",
      category: "Web Development",
      difficulty: "Intermediate",
      durationHours: 36,
      totalModules: 6,
      totalLessons: 26,
      downloadSizeMb: 210,
      lowDataSizeMb: 30,
      language: "English | Telugu",
      rating: 4.9,
      progressPercent: 60,
      enrolled: true,
      description: "Integrate frontend components, REST APIs, state management, database models, and offline-first PWAs.",
      topics: ["Client-Server Architecture", "RESTful API Design", "Authentication & JWT", "Database Integration", "PWA & Offline Caching"]
    },
    {
      id: "crs-ai",
      title: "Introduction to Artificial Intelligence",
      category: "Emerging Technologies",
      difficulty: "Beginner",
      durationHours: 22,
      totalModules: 5,
      totalLessons: 18,
      downloadSizeMb: 130,
      lowDataSizeMb: 19,
      language: "English | Hindi",
      rating: 4.8,
      progressPercent: 20,
      enrolled: false,
      description: "Understand AI foundations, machine learning paradigms, neural networks, computer vision, and NLP.",
      topics: ["Search & Heuristics", "Supervised vs Unsupervised ML", "Neural Network Basics", "Natural Language Processing", "Responsible AI & Ethics"],
      modules: [
        {
          id: "mod-ai-1",
          title: "Module 1: Machine Learning Foundations",
          lessons: [
            { id: "les-ai-1", title: "Introduction to Machine Learning", durationMins: 25, status: "completed", downloaded: true, summary: "Core paradigms: supervised, unsupervised, reinforcement learning, dataset splitting, and loss functions." },
            { id: "les-ai-2", title: "Linear Regression Explained", durationMins: 30, status: "available", downloaded: false, summary: "Cost functions (MSE), gradient descent optimization, hyperparameter tuning, and fitting best-fit lines." }
          ]
        },
        {
          id: "mod-ai-2",
          title: "Module 2: Classification & Model Diagnostics",
          lessons: [
            { id: "les-ai-3", title: "Classification & Logistic Decision Boundaries", durationMins: 35, status: "available", downloaded: false, summary: "Sigmoid mapping, cross-entropy loss, binary classification thresholds, and multi-class softmax." },
            { id: "les-ai-4", title: "Model Evaluation & Confusion Matrix", durationMins: 30, status: "available", downloaded: false, summary: "Precision, recall, F1-score, True Positive rates, ROC-AUC curves, and validation diagnostics." }
          ]
        }
      ]
    }
  ],

  // Question bank for Practice and Mock Tests
  questions: [
    {
      id: "q-101",
      courseId: "crs-c-lang",
      topic: "Loops",
      difficulty: "Easy",
      question: "Which loop construct in C is guaranteed to execute its body at least once?",
      options: ["for loop", "while loop", "do-while loop", "nested loop"],
      correctIndex: 2,
      explanation: "A do-while loop evaluates its condition at the end of the iteration, guaranteeing that the body executes at least once before the check."
    },
    {
      id: "q-102",
      courseId: "crs-c-lang",
      topic: "Loops",
      difficulty: "Medium",
      question: "What is the output of `for(int i = 0; i < 5; i += 2) { printf(\"%d \", i); }` in C?",
      options: ["0 1 2 3 4", "0 2 4", "0 2 4 6", "2 4"],
      correctIndex: 1,
      explanation: "i starts at 0, prints 0, becomes 2, prints 2, becomes 4, prints 4, then becomes 6 and stops because 6 < 5 is false."
    },
    {
      id: "q-103",
      courseId: "crs-c-lang",
      topic: "Arrays",
      difficulty: "Easy",
      question: "In C, if `int arr[5] = {10, 20, 30, 40, 50};`, what is the value of `*(arr + 2)`?",
      options: ["10", "20", "30", "Address of 30"],
      correctIndex: 2,
      explanation: "Pointer arithmetic: `arr` points to index 0. `arr + 2` points to index 2, and dereferencing `*(arr + 2)` yields the value 30."
    },
    {
      id: "q-104",
      courseId: "crs-c-lang",
      topic: "Arrays",
      difficulty: "Medium",
      question: "What happens if you access `arr[10]` in an array declared as `int arr[5]` in standard C?",
      options: ["Compiler raises ArrayOutOfBounds error", "Returns 0", "Undefined behavior (accesses arbitrary memory)", "Program terminates safely"],
      correctIndex: 2,
      explanation: "C does not perform bounds checking on array indices. Accessing beyond the boundary invokes undefined behavior and can cause segmentation faults."
    },
    {
      id: "q-105",
      courseId: "crs-c-lang",
      topic: "Functions",
      difficulty: "Medium",
      question: "What is the mechanism used by default when passing parameters to functions in C?",
      options: ["Call by Reference", "Call by Value", "Call by Name", "Call by Pointer"],
      correctIndex: 1,
      explanation: "C strictly uses Call by Value. Passing pointers passes the value of the memory address, not a native reference."
    },
    {
      id: "q-106",
      courseId: "crs-c-lang",
      topic: "Functions",
      difficulty: "Hard",
      question: "What is the result of returning the address of a local automatic variable from a C function?",
      options: ["Valid memory access", "Dangling pointer leading to undefined behavior", "Automatic promotion to heap memory", "Syntax error"],
      correctIndex: 1,
      explanation: "Automatic local variables are deallocated when the function's stack frame pops. Returning their address produces a dangling pointer."
    },
    {
      id: "q-107",
      courseId: "crs-c-lang",
      topic: "Pointers",
      difficulty: "Hard",
      question: "If `int *ptr = NULL;`, what occurs when attempting `*ptr = 100;` on modern protected memory operating systems?",
      options: ["ptr points to memory 100", "Memory location 0 is updated", "Segmentation fault / Access Violation exception", "Ignored by the processor"],
      correctIndex: 2,
      explanation: "Dereferencing a NULL pointer triggers a hardware memory protection fault, resulting in immediate program termination (SIGSEGV)."
    },
    {
      id: "q-108",
      courseId: "crs-c-lang",
      topic: "Pointers",
      difficulty: "Medium",
      question: "Which operator is used to obtain the memory address of an existing variable in C?",
      options: ["*", "->", "&", "%"],
      correctIndex: 2,
      explanation: "The unary `&` (address-of) operator retrieves the memory address of its operand."
    },
    {
      id: "q-109",
      courseId: "crs-html-css",
      topic: "Flexbox",
      difficulty: "Easy",
      question: "Which CSS property aligns flex items along the primary (main) axis?",
      options: ["align-items", "justify-content", "align-content", "flex-direction"],
      correctIndex: 1,
      explanation: "`justify-content` defines how remaining space is distributed between and around flex items along the main axis."
    },
    {
      id: "q-110",
      courseId: "crs-html-css",
      topic: "CSS Grid",
      difficulty: "Medium",
      question: "What does `grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));` achieve?",
      options: [
        "Creates exactly 250 columns",
        "A responsive layout that automatically fits as many 250px+ columns as possible without media queries",
        "A fixed 3-column table",
        "Stretches a single item to fill 250px"
      ],
      correctIndex: 1,
      explanation: "This classic modern CSS pattern creates an inherently responsive grid that wraps columns automatically when screen width changes."
    },
    {
      id: "q-111",
      courseId: "crs-javascript",
      topic: "Async JS",
      difficulty: "Medium",
      question: "Where do resolved Promise callbacks (`.then()`) execute in the JavaScript runtime?",
      options: ["Directly on the Call Stack synchronously", "In the Macrotask (Task) queue", "In the Microtask queue", "In the Web Worker thread"],
      correctIndex: 2,
      explanation: "Promises use the Microtask queue, which has higher priority than the Macrotask queue and drains completely before the next render or timer."
    },
    {
      id: "q-112",
      courseId: "crs-javascript",
      topic: "Scope",
      difficulty: "Easy",
      question: "Which keyword declares a block-scoped variable that cannot be re-assigned in JavaScript?",
      options: ["var", "let", "const", "def"],
      correctIndex: 2,
      explanation: "`const` creates a block-scoped constant reference that prevents reassignment."
    }
  ],

  // Mock Tests and Bi-Weekly Tests
  tests: [
    {
      id: "test-c-biweekly-1",
      title: "Bi-Weekly Assessment: C Core & Memory Diagnostics",
      courseId: "crs-c-lang",
      subject: "C Programming",
      durationMinutes: 30,
      totalQuestions: 8,
      passingScore: 60,
      status: "available",
      isBiWeekly: true,
      dueDate: "2026-09-10",
      questionIds: ["q-101", "q-102", "q-103", "q-104", "q-105", "q-106", "q-107", "q-108"],
      topics: ["Loops", "Arrays", "Functions", "Pointers"]
    },
    {
      id: "test-web-biweekly-2",
      title: "Bi-Weekly Assessment: Frontend Architecture & DOM",
      courseId: "crs-html-css",
      subject: "Web Development",
      durationMinutes: 25,
      totalQuestions: 4,
      passingScore: 65,
      status: "available",
      isBiWeekly: true,
      dueDate: "2026-09-14",
      questionIds: ["q-109", "q-110", "q-111", "q-112"],
      topics: ["Flexbox", "CSS Grid", "Async JS", "Scope"]
    }
  ],

  // Student Test Attempts & Topic Performance Analysis
  test_attempts: generateClassTestAttempts(),

  // 3-Month GitHub-style activity contribution calendar (90 Days)
  activity_history: generateActivityHistory(),

  // Badges & Achievements
  badges: [
    {
      id: "badge-first-step",
      name: "First Step",
      description: "Completed your very first lesson in Learning Loops.",
      icon: "Award",
      unlocked: true,
      unlockedDate: "2026-06-02",
      category: "Milestone",
      progress: 100
    },
    {
      id: "badge-consistency-master",
      name: "Consistency Master",
      description: "Maintained an unbroken 30-day learning streak.",
      icon: "Flame",
      unlocked: false,
      progress: 40, // 12 of 30 days
      category: "Consistency"
    },
    {
      id: "badge-problem-solver",
      name: "Problem Solver",
      description: "Solved 100 practice problems across any subject.",
      icon: "CheckCircle",
      unlocked: true,
      unlockedDate: "2026-07-22",
      category: "Practice",
      progress: 100
    },
    {
      id: "badge-practice-pro",
      name: "Practice Pro",
      description: "Solved 500 practice questions and quizzes.",
      icon: "Zap",
      unlocked: false,
      progress: 50, // 248 of 500
      category: "Practice"
    },
    {
      id: "badge-test-champion",
      name: "Test Champion",
      description: "Scored 90% or higher on an official mock examination.",
      icon: "Trophy",
      unlocked: true,
      unlockedDate: "2026-08-14",
      category: "Performance",
      progress: 100
    },
    {
      id: "badge-course-finisher",
      name: "Course Finisher",
      description: "Completed your first comprehensive course with certificate.",
      icon: "BookOpen",
      unlocked: true,
      unlockedDate: "2026-06-20",
      category: "Coursework",
      progress: 100
    },
    {
      id: "badge-explorer",
      name: "Explorer",
      description: "Enrolled in and actively explored 5 distinct subject areas.",
      icon: "Compass",
      unlocked: true,
      unlockedDate: "2026-08-01",
      category: "Exploration",
      progress: 100
    }
  ],

  // Certificates
  certificates: [
    {
      id: "LL-CERT-2026-JAVA-8821",
      studentName: "Aarav Sharma",
      courseTitle: "Java Core & Enterprise",
      completionDate: "June 20, 2026",
      score: "89%",
      issuedBy: "LEARNING LOOPS Smart Education Foundation",
      signature: "Prof. K. Ramanujan",
      verificationUrl: "https://learningloops.edu/verify/LL-CERT-2026-JAVA-8821"
    },
    {
      id: "LL-CERT-2026-PY-9104",
      studentName: "Aarav Sharma",
      courseTitle: "Python Fundamentals & Scripting",
      completionDate: "July 15, 2026",
      score: "94%",
      issuedBy: "LEARNING LOOPS Smart Education Foundation",
      signature: "Dr. Sunita Rao",
      verificationUrl: "https://learningloops.edu/verify/LL-CERT-2026-PY-9104"
    },
    {
      id: "LL-CERT-2026-HTML-7402",
      studentName: "Aarav Sharma",
      courseTitle: "HTML & CSS Responsive Design",
      completionDate: "August 10, 2026",
      score: "92%",
      issuedBy: "LEARNING LOOPS Smart Education Foundation",
      signature: "Prof. K. Ramanujan",
      verificationUrl: "https://learningloops.edu/verify/LL-CERT-2026-HTML-7402"
    },
    {
      id: "LL-CERT-2026-SQL-6391",
      studentName: "Aarav Sharma",
      courseTitle: "SQL Database Design & Queries",
      completionDate: "August 25, 2026",
      score: "88%",
      issuedBy: "LEARNING LOOPS Smart Education Foundation",
      signature: "Dr. Sunita Rao",
      verificationUrl: "https://learningloops.edu/verify/LL-CERT-2026-SQL-6391"
    }
  ],

  // Classes (for Teacher portal)
  classes: [
    {
      id: "cls-cse-2026-a",
      name: "CSE-401: Systems Programming & C Core",
      department: "Computer Science",
      semester: "4th Semester",
      teacherId: "usr-teacher-1",
      totalStudents: 42,
      averageScore: 78,
      activeTestsCount: 2,
      resourcesCount: 14
    },
    {
      id: "cls-cse-2026-b",
      name: "CSE-405: Full-Stack Web Technologies",
      department: "Computer Science",
      semester: "4th Semester",
      teacherId: "usr-teacher-2",
      totalStudents: 38,
      averageScore: 84,
      activeTestsCount: 1,
      resourcesCount: 19
    }
  ],

  // Resource Folders for Teacher File Management
  resource_folders: [
    { id: "fld-c-lang", name: "C Programming", icon: "folder", createdBy: "usr-teacher-1", createdAt: "2026-08-01T09:00:00Z" },
    { id: "fld-python", name: "Python", icon: "folder", createdBy: "usr-teacher-1", createdAt: "2026-08-01T09:00:00Z" },
    { id: "fld-ai-ml", name: "AI & ML", icon: "folder", createdBy: "usr-teacher-1", createdAt: "2026-08-01T09:00:00Z" },
    { id: "fld-dsa", name: "Data Structures", icon: "folder", createdBy: "usr-teacher-1", createdAt: "2026-08-01T09:00:00Z" },
    { id: "fld-general", name: "General Resources", icon: "folder", createdBy: "usr-teacher-1", createdAt: "2026-08-01T09:00:00Z" }
  ],

  // Academic E-Books Library (Connected to Teacher & Student Library)
  library_ebooks: [
    {
      id: "ebk-c-guide",
      title: "C Programming Complete Guide",
      author: "Prof. K. Ramanujan",
      subject: "C Programming",
      courseId: "crs-c-lang",
      topic: "Loops & Pointers",
      description: "Comprehensive textbook covering fundamentals from primitive data structures and memory allocation to advanced pointer manipulation.",
      fileType: "PDF",
      fileSize: "2.4 MB",
      sizeKb: 2400,
      coverUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80",
      contentSnippet: "CHAPTER 1: C PROGRAMMING ARCHITECTURE\nC is a procedural programming language designed by Dennis Ritchie at Bell Labs. It provides low-level memory access via pointers while retaining structured programming semantics.\n\nCHAPTER 2: VARIABLES & MEMORY LAYOUT\nA variable is a named storage location. In C, integers typically take 4 bytes, chars 1 byte, and pointers 8 bytes on 64-bit systems.\n\nCHAPTER 3: CONTROL FLOW & LOOPS\nfor(int i = 0; i < n; i++) allows deterministic iterative execution. while() checks conditions beforehand, while do-while() guarantees at least one execution.\n\nCHAPTER 4: POINTER ARITHMETIC\nA pointer stores the address of a memory block. & retrieves an address, * dereferences it to read or write the underlying value.",
      uploadedBy: "usr-teacher-1",
      accessLevel: "all_students",
      visibility: "all_students",
      status: "published",
      downloads: 412,
      createdAt: "2026-08-10T10:00:00Z"
    },
    {
      id: "ebk-python-mastery",
      title: "Python 3: From Scripting to Systems",
      author: "Dr. Sunita Rao",
      subject: "Python",
      courseId: "crs-python",
      topic: "Functions & Automation",
      description: "Practical engineering handbook on Python scripting, generator expressions, object-oriented design, and standard library tools.",
      fileType: "PDF",
      fileSize: "3.1 MB",
      sizeKb: 3100,
      coverUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
      contentSnippet: "MODULE 1: PYTHON DYNAMICS\nPython is an interpreted, high-level, dynamically typed language emphasizing readable syntax and DRY architecture.\n\nMODULE 2: FUNCTIONS & FIRST-CLASS OBJECTS\nFunctions in Python are first-class citizens. They can be passed as arguments, assigned to variables, and returned from other functions.\n\nMODULE 3: LIST COMPREHENSIONS & GENERATORS\nGenerators allow lazy evaluation, consuming memory proportional to the current element rather than the entire collection.",
      uploadedBy: "usr-teacher-2",
      accessLevel: "all_students",
      visibility: "all_students",
      status: "published",
      downloads: 289,
      createdAt: "2026-08-12T14:00:00Z"
    },
    {
      id: "ebk-dsa-handbook",
      title: "Algorithms & Data Structures in Practice",
      author: "CSE Faculty Circle",
      subject: "Data Structures",
      courseId: "crs-dsa",
      topic: "Stacks, Queues & Trees",
      description: "Rigorous yet readable guide on asymptotic analysis, balanced search trees, graph traversal algorithms, and dynamic programming.",
      fileType: "PDF",
      fileSize: "4.2 MB",
      sizeKb: 4200,
      coverUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80",
      contentSnippet: "SECTION 1: ASYMPTOTIC COMPLEXITY\nBig-O defines the upper bound of algorithm runtime growth. Logarithmic O(log n) scaling separates feasible systems from intractable calculations.\n\nSECTION 2: LINEAR STRUCTURES\nStacks operate on Last-In First-Out (LIFO); Queues operate on First-In First-Out (FIFO). Both admit O(1) push and pop operations.\n\nSECTION 3: TREES & HEAPS\nBinary Search Trees maintain ordered keys, yielding average O(log n) search, insert, and delete performance.",
      uploadedBy: "usr-teacher-1",
      accessLevel: "all_students",
      visibility: "all_students",
      status: "published",
      downloads: 531,
      createdAt: "2026-08-14T09:30:00Z"
    },
    {
      id: "ebk-ai-foundations",
      title: "Foundations of Artificial Intelligence & Machine Learning",
      author: "Academic Board",
      subject: "AI & ML",
      courseId: "crs-ai",
      topic: "Neural Networks & Heuristics",
      description: "Accessible introduction to state space search, heuristic evaluation, perceptrons, backpropagation, and practical model validation.",
      fileType: "PDF",
      fileSize: "3.8 MB",
      sizeKb: 3800,
      coverUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=400&q=80",
      contentSnippet: "CHAPTER 1: THE INTELLIGENT AGENT PARADIGM\nAgents perceive their environment through sensors and act upon it via actuators. Rational agents strive to maximize expected performance metrics.\n\nCHAPTER 2: SEARCH & OPTIMIZATION\nA* search combines path cost g(n) with admissible heuristic h(n) to guarantee optimal paths on graphs.\n\nCHAPTER 3: SUPERVISED LEARNING & GRADIENT DESCENT\nLinear models adjust weight vectors along the negative gradient of the loss surface, converging toward minimal empirical error.",
      uploadedBy: "usr-teacher-1",
      accessLevel: "all_students",
      visibility: "all_students",
      status: "published",
      downloads: 365,
      createdAt: "2026-08-18T11:20:00Z"
    }
  ],

  // Resources (Library & Teacher Uploads with Folder & Visibility Mapping)
  resources: [
    {
      id: "res-001",
      folderId: "fld-c-lang",
      title: "C Pointers & Memory Management Pocket Guide",
      author: "Prof. K. Ramanujan",
      format: "PDF (Compressed)",
      fileType: "PDF",
      fileSize: "450 KB",
      sizeKb: 450,
      downloads: 320,
      subject: "C Programming",
      courseId: "crs-c-lang",
      topic: "Pointers & Memory Addresses",
      visibility: "all_students",
      status: "published",
      isPublicDomain: true,
      url: "#",
      description: "Visual diagrams detailing memory addresses, stack frames, malloc lifecycles, and common segfault patterns.",
      uploadedBy: "usr-teacher-1",
      createdAt: "2026-08-15T10:00:00Z"
    },
    {
      id: "res-002",
      folderId: "fld-general",
      title: "Modern CSS Grid & Flexbox Cheatsheet",
      author: "Dr. Sunita Rao",
      format: "PDF (High Contrast)",
      fileType: "PDF",
      fileSize: "310 KB",
      sizeKb: 310,
      downloads: 485,
      subject: "Web Development",
      courseId: "crs-html-css",
      topic: "Flexbox & Grid",
      visibility: "all_students",
      status: "published",
      isPublicDomain: true,
      url: "#",
      description: "Single-page printable syntax reference for auto-fit, minmax, justify-content, and media queries.",
      uploadedBy: "usr-teacher-2",
      createdAt: "2026-08-16T11:00:00Z"
    },
    {
      id: "res-003",
      folderId: "fld-dsa",
      title: "Data Structures Hand-Written Notes (Arrays to Graphs)",
      author: "CSE Faculty Circle",
      format: "PDF (Ultra-Low Data)",
      fileType: "PDF",
      fileSize: "890 KB",
      sizeKb: 890,
      downloads: 940,
      subject: "Data Structures",
      courseId: "crs-dsa",
      topic: "Linear Data Structures",
      visibility: "all_students",
      status: "published",
      isPublicDomain: true,
      url: "#",
      description: "Clean black-and-white handwritten notes optimized for reading on small, inexpensive smartphones.",
      uploadedBy: "usr-teacher-1",
      createdAt: "2026-08-17T12:00:00Z"
    },
    {
      id: "res-004",
      folderId: "fld-general",
      title: "Previous Year University Question Papers (2021-2025)",
      author: "Academic Board",
      format: "PDF Archive",
      fileType: "PDF",
      fileSize: "1.2 MB",
      sizeKb: 1200,
      downloads: 1420,
      subject: "Computer Science Core",
      courseId: "crs-c-lang",
      topic: "Exam Preparation",
      visibility: "all_students",
      status: "published",
      isPublicDomain: true,
      url: "#",
      description: "Solved questions with model answers and marks distribution rubrics.",
      uploadedBy: "usr-teacher-1",
      createdAt: "2026-08-18T14:00:00Z"
    },
    {
      id: "res-005",
      folderId: "fld-c-lang",
      title: "Pointer Cheatsheet & Stack Frame Diagram",
      author: "Prof. K. Ramanujan",
      format: "PDF (Compressed)",
      fileType: "PDF",
      fileSize: "280 KB",
      sizeKb: 280,
      downloads: 156,
      subject: "C Programming",
      courseId: "crs-c-lang",
      topic: "Pointers",
      visibility: "all_students",
      status: "published",
      isPublicDomain: true,
      url: "#",
      description: "Quick revision diagram for dereferencing, address calculation, and pointer offsets.",
      uploadedBy: "usr-teacher-1",
      createdAt: "2026-08-20T09:15:00Z"
    },
    {
      id: "res-006",
      folderId: "fld-python",
      title: "Python Basics Quick Reference",
      author: "Dr. Sunita Rao",
      format: "PDF (Compressed)",
      fileType: "PDF",
      fileSize: "320 KB",
      sizeKb: 320,
      downloads: 210,
      subject: "Python",
      courseId: "crs-python",
      topic: "Variables & Loops",
      visibility: "all_students",
      status: "published",
      isPublicDomain: true,
      url: "#",
      description: "Standard libraries, control structures, list operations, and dictionary methods.",
      uploadedBy: "usr-teacher-2",
      createdAt: "2026-08-22T10:30:00Z"
    }
  ],

  // Library Resource Requests
  resource_requests: [
    {
      id: "req-001",
      studentName: "Aarav Sharma",
      studentEmail: "aarav.sharma@example.edu",
      bookTitle: "The C Programming Language (2nd Edition)",
      author: "Brian W. Kernighan, Dennis M. Ritchie",
      isbn: "978-0131103627",
      reason: "Need reference chapters on UNIX system interface and standard library headers for upcoming semester project.",
      status: "Under Review",
      requestDate: "2026-08-30"
    }
  ],

  // Notifications
  notifications: [
    {
      id: "notif-1",
      studentId: "usr-student-1",
      title: "Bi-Weekly Assessment Ready",
      message: "Your scheduled C Core & Memory Diagnostics assessment is live. Estimated time: 30 minutes.",
      time: "2 hours ago",
      read: false,
      type: "test"
    },
    {
      id: "notif-2",
      studentId: "usr-student-1",
      title: "Streak Milestone: 12 Days!",
      message: "Outstanding consistency! Complete today's 25 minutes of learning to safeguard your streak.",
      time: "6 hours ago",
      read: false,
      type: "streak"
    },
    {
      id: "notif-3",
      studentId: "usr-student-1",
      title: "New Teacher Resource Added",
      message: "Prof. K. Ramanujan uploaded 'C Pointers Pocket Guide' to your class resources.",
      time: "Yesterday",
      read: true,
      type: "resource"
    }
  ],

  // Idempotent Sync Events Log (Backend Sync Engine deduplication)
  sync_events: [],

  // Curated Educational YouTube Resources for Course Lessons
  lesson_youtube_videos: [
    {
      id: "yt-c-var-neuralnine",
      lessonId: "les-c-2",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Variables, Constants & Data Types",
      title: "Data Types & Variables - C Programming Tutorial #2",
      youtubeVideoId: "PDzKufPL51Q",
      videoUrl: "https://www.youtube.com/watch?v=PDzKufPL51Q",
      description: "Comprehensive guide to C variables, primitive data types, memory limits, and format specifiers.",
      channelName: "NeuralNine",
      duration: "12:45",
      thumbnailUrl: "https://img.youtube.com/vi/PDzKufPL51Q/hqdefault.jpg",
      topic: "Variables & Data Types",
      status: "approved",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-15T10:00:00Z"
    },
    {
      id: "yt-c-var-1",
      lessonId: "les-c-2",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Variables, Constants & Data Types",
      title: "C Variables and Data Types Explained",
      youtubeVideoId: "EITg8K3tKzg",
      videoUrl: "https://www.youtube.com/watch?v=EITg8K3tKzg",
      description: "Beginner-friendly walkthrough of C primitive types, storage sizes in bytes, format specifiers (%d, %f, %c), and declaration rules.",
      channelName: "Bro Code",
      duration: "14:20",
      thumbnailUrl: "https://img.youtube.com/vi/EITg8K3tKzg/hqdefault.jpg",
      topic: "Variables, Constants & Data Types",
      status: "approved",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-15T10:00:00Z"
    },
    {
      id: "yt-c-var-2",
      lessonId: "les-c-2",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Variables, Constants & Data Types",
      title: "C Programming Data Types & Limits in Depth",
      youtubeVideoId: "o0bL_b0Xy0o",
      videoUrl: "https://www.youtube.com/watch?v=o0bL_b0Xy0o",
      description: "Deep dive into signed/unsigned binary representations, minimum/maximum limits in limits.h, and precision boundaries.",
      channelName: "Neso Academy",
      duration: "11:45",
      thumbnailUrl: "https://img.youtube.com/vi/o0bL_b0Xy0o/hqdefault.jpg",
      topic: "Variables & Memory Limits",
      status: "approved",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-16T11:30:00Z"
    },
    {
      id: "yt-c-var-3",
      lessonId: "les-c-2",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Variables, Constants & Data Types",
      title: "Variables and Constants in C",
      youtubeVideoId: "KJgsSFOSQvU",
      videoUrl: "https://www.youtube.com/watch?v=KJgsSFOSQvU",
      description: "How the compiler stores constants vs variables in stack memory frames with clear visual diagrams.",
      channelName: "freeCodeCamp.org",
      duration: "18:10",
      thumbnailUrl: "https://img.youtube.com/vi/KJgsSFOSQvU/hqdefault.jpg",
      topic: "Constants & Memory Architecture",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-17T09:15:00Z"
    },
    {
      id: "yt-c-loop-1",
      lessonId: "les-c-4",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "For, While & Do-While Loops",
      title: "For, While & Do-While Loops in C",
      youtubeVideoId: "Gk-9IuQn21w",
      videoUrl: "https://www.youtube.com/watch?v=Gk-9IuQn21w",
      description: "Visualizing iteration mechanics, initialization, condition checking, loop step increments, and break/continue safeguards.",
      channelName: "Bro Code",
      duration: "12:15",
      thumbnailUrl: "https://img.youtube.com/vi/Gk-9IuQn21w/hqdefault.jpg",
      topic: "Loops & Iterations",
      status: "approved",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-18T10:00:00Z"
    },
    {
      id: "yt-c-func-1",
      lessonId: "les-c-5",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Function Prototypes & Call by Value",
      title: "Functions in C - Prototype & Return Values",
      youtubeVideoId: "7t225b1zWb8",
      videoUrl: "https://www.youtube.com/watch?v=7t225b1zWb8",
      description: "Step-by-step tutorial on writing modular C functions, understanding return types, and call-by-value stack frames.",
      channelName: "Bro Code",
      duration: "10:35",
      thumbnailUrl: "https://img.youtube.com/vi/7t225b1zWb8/hqdefault.jpg",
      topic: "Functions & Scope",
      status: "approved",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-19T14:20:00Z"
    },
    {
      id: "yt-c-ptr-1",
      lessonId: "les-c-7",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Understanding Memory Addresses & Dereferencing",
      title: "Pointers in C Explained Simply",
      youtubeVideoId: "2ybLD6_2gKM",
      videoUrl: "https://www.youtube.com/watch?v=2ybLD6_2gKM",
      description: "Demystifying pointers: address-of operator &, dereference operator *, pointer arithmetic, and avoiding segmentation faults.",
      channelName: "freeCodeCamp.org",
      duration: "22:15",
      thumbnailUrl: "https://img.youtube.com/vi/2ybLD6_2gKM/hqdefault.jpg",
      topic: "Pointers & Memory Addresses",
      status: "approved",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-20T16:00:00Z"
    },
    {
      id: "yt-py-var-1",
      lessonId: "les-py-1",
      courseId: "crs-python",
      courseTitle: "Python Fundamentals & Scripting",
      lessonTitle: "Python Variables, Constants & Data Types",
      title: "Python Variables and Types",
      youtubeVideoId: "_uQrJ0TkZlc",
      videoUrl: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      description: "Learn how variables work in Python, dynamic typing, type conversion, and strings formatted with f-strings.",
      channelName: "Programming with Mosh",
      duration: "15:20",
      thumbnailUrl: "https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg",
      topic: "Variables & Syntax",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-21T09:00:00Z"
    },
    {
      id: "yt-py-loop-1",
      lessonId: "les-py-3",
      courseId: "crs-python",
      courseTitle: "Python Fundamentals & Scripting",
      lessonTitle: "Python Loops for Beginners",
      title: "Python Loops for Beginners",
      youtubeVideoId: "94UHCEmprCY",
      videoUrl: "https://www.youtube.com/watch?v=94UHCEmprCY",
      description: "Mastering for loops, while loops, range() intervals, break and continue logic with clean examples.",
      channelName: "Corey Schafer",
      duration: "16:40",
      thumbnailUrl: "https://img.youtube.com/vi/94UHCEmprCY/hqdefault.jpg",
      topic: "Python Loops for Beginners",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-22T11:45:00Z"
    },
    {
      id: "yt-py-func-1",
      lessonId: "les-py-4",
      courseId: "crs-python",
      courseTitle: "Python Fundamentals & Scripting",
      lessonTitle: "Functions & Scope Dynamics",
      title: "Python Functions - Everything You Need to Know",
      youtubeVideoId: "9Os0o3wzS_I",
      videoUrl: "https://www.youtube.com/watch?v=9Os0o3wzS_I",
      description: "DRY programming, def definitions, returning values, default arguments, and *args/**kwargs unpacking.",
      channelName: "Corey Schafer",
      duration: "20:15",
      thumbnailUrl: "https://img.youtube.com/vi/9Os0o3wzS_I/hqdefault.jpg",
      topic: "Functions & Arguments",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-23T14:30:00Z"
    },
    {
      id: "yt-ai-intro-1",
      lessonId: "les-ai-1",
      courseId: "crs-ai",
      courseTitle: "Introduction to Artificial Intelligence",
      lessonTitle: "Introduction to Machine Learning",
      title: "Machine Learning Fundamentals Explained",
      youtubeVideoId: "JMUxmLyrhSk",
      videoUrl: "https://www.youtube.com/watch?v=JMUxmLyrhSk",
      description: "Foundational conceptual intuition behind machine learning, training sets, test validation, and model fitting.",
      channelName: "StatQuest with Josh Starmer",
      duration: "13:45",
      thumbnailUrl: "https://img.youtube.com/vi/JMUxmLyrhSk/hqdefault.jpg",
      topic: "Introduction to Machine Learning",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-24T10:00:00Z"
    },
    {
      id: "yt-ai-reg-1",
      lessonId: "les-ai-2",
      courseId: "crs-ai",
      courseTitle: "Introduction to Artificial Intelligence",
      lessonTitle: "Linear Regression Explained",
      title: "Linear Regression, Clearly Explained!",
      youtubeVideoId: "7ArmBVF2dCs",
      videoUrl: "https://www.youtube.com/watch?v=7ArmBVF2dCs",
      description: "Visual walkthrough of finding the best-fit line, calculating sum of squared residuals, R-squared, and p-values.",
      channelName: "StatQuest with Josh Starmer",
      duration: "18:25",
      thumbnailUrl: "https://img.youtube.com/vi/7ArmBVF2dCs/hqdefault.jpg",
      topic: "Linear Regression",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-25T15:10:00Z"
    },
    {
      id: "yt-ai-eval-1",
      lessonId: "les-ai-4",
      courseId: "crs-ai",
      courseTitle: "Introduction to Artificial Intelligence",
      lessonTitle: "Model Evaluation & Confusion Matrix",
      title: "Confusion Matrix & Evaluation Metrics",
      youtubeVideoId: "sQ870aivNUo",
      videoUrl: "https://www.youtube.com/watch?v=sQ870aivNUo",
      description: "True Positives, False Positives, Sensitivity, Specificity, and how to evaluate model performance without bias.",
      channelName: "StatQuest with Josh Starmer",
      duration: "12:30",
      thumbnailUrl: "https://img.youtube.com/vi/sQ870aivNUo/hqdefault.jpg",
      topic: "Model Evaluation",
      status: "approved",
      isActive: true,
      addedBy: "TCH1002",
      addedByName: "Dr. Sunita Rao",
      createdAt: "2026-08-26T16:45:00Z"
    },
    {
      id: "yt-pending-1",
      lessonId: "les-c-8",
      courseId: "crs-c-lang",
      courseTitle: "C Programming",
      lessonTitle: "Dynamic Memory: malloc, calloc, realloc & free",
      title: "Dynamic Memory Allocation in C (malloc/free)",
      youtubeVideoId: "udr_j2QkF-E",
      videoUrl: "https://www.youtube.com/watch?v=udr_j2QkF-E",
      description: "Faculty proposed explanation of heap management and preventing dangling pointers.",
      channelName: "Portfolio Courses",
      duration: "15:10",
      thumbnailUrl: "https://img.youtube.com/vi/udr_j2QkF-E/hqdefault.jpg",
      topic: "Dynamic Memory Allocation",
      status: "pending",
      isActive: true,
      addedBy: "TCH1001",
      addedByName: "Prof. K. Ramanujan",
      createdAt: "2026-08-27T11:00:00Z"
    }
  ],

  // Student Video Watch Progress Tracking
  student_video_progress: [
    {
      id: "prog-stu1-c-var",
      studentId: "usr-student-1",
      courseId: "crs-c-lang",
      lessonId: "les-c-2",
      youtubeVideoId: "EITg8K3tKzg",
      status: "watched",
      watchedAt: "2026-09-08T14:30:00Z",
      progressPercentage: 100
    }
  ],

  // Student Lesson Notebooks (Integrated with Notebook Creator)
  student_lesson_notebooks: [
    {
      id: "nb-stu1-les-c-2",
      studentId: "usr-student-1",
      courseId: "crs-c-lang",
      lessonId: "les-c-2",
      youtubeVideoId: "EITg8K3tKzg",
      importantPoints: [
        "Primitive types in C allocate contiguous bytes in stack memory frames.",
        "Format specifiers: %d for signed integer, %f for single-precision float, %c for single character.",
        "Constants declared with 'const' cannot be mutated once initialized in memory."
      ],
      definitions: [
        "Variable: A named reference to a contiguous block of physical RAM allocated during execution.",
        "Format Specifier: An escape sequence instructing printf/scanf how to interpret raw memory bits."
      ],
      examples: "int studentAge = 19;\nconst float PI = 3.14159f;\nchar letterGrade = 'A';",
      doubts: "What happens to stack memory if an integer overflows beyond 2,147,483,647?",
      summary: "Comprehensive notes on primitive types, format specifiers, memory sizes, and const immutability rules in C.",
      updatedAt: "2026-09-09T10:15:00Z"
    }
  ]
};

// Generates 90 days of realistic, deterministic daily activity for a student
function generateStudentActivityHistory(studentId, streakDays, dailyTarget, todayMinutes, testScore, testTitle) {
  const history = [];
  const today = new Date("2026-09-02");

  for (let i = 89; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    // Activity distributions
    const isToday = i === 0;
    const isRecentStreak = i > 0 && i < streakDays;
    const isWeekend = d.getDay() === 0;

    let level = 0; // 0: None, 1: Low, 2: Med, 3: High, 4: Very High, 5: Streak Freeze, 6: Test Day
    let minutes = 0;
    let problemsSolved = 0;
    let lessonsCompleted = 0;
    let testTaken = null;

    if (isToday) {
      minutes = todayMinutes;
      problemsSolved = Math.max(2, Math.round(todayMinutes / 10));
      lessonsCompleted = todayMinutes >= 30 ? 1 : 0;
      level = todayMinutes >= 60 ? 4 : (todayMinutes >= 40 ? 3 : (todayMinutes >= 20 ? 2 : 1));
    } else if (i === 4) {
      // 4 days ago: Test day!
      level = 6;
      minutes = dailyTarget;
      problemsSolved = 15;
      lessonsCompleted = 2;
      testTaken = { title: testTitle, score: testScore };
    } else if (i === 7 && streakDays > 8) {
      // 7 days ago: Streak freeze safeguard used
      level = 5;
      minutes = 0;
      problemsSolved = 0;
    } else if (isRecentStreak) {
      // Active unbroken streak
      const charSeed = studentId.charCodeAt(studentId.length - 1);
      const mod = (i + charSeed) % 3;
      if (mod === 0) {
        level = 4; // Very High
        minutes = dailyTarget + 10;
        problemsSolved = 6;
        lessonsCompleted = 2;
      } else if (mod === 1) {
        level = 3; // High
        minutes = dailyTarget;
        problemsSolved = 4;
        lessonsCompleted = 1;
      } else {
        level = 2; // Medium
        minutes = Math.max(25, dailyTarget - 15);
        problemsSolved = 3;
        lessonsCompleted = 1;
      }
    } else if (isWeekend && i % 4 === 0) {
      level = 0; // Rest day
    } else {
      // Past historical activity (deterministic pseudo distribution)
      const charSeed = studentId.charCodeAt(studentId.length - 1);
      const pseudo = (i * 17 + charSeed) % 5;
      if (pseudo === 0) {
        level = 0;
      } else if (pseudo === 1) {
        level = 1;
        minutes = 20;
        problemsSolved = 2;
      } else if (pseudo === 2) {
        level = 2;
        minutes = 35;
        problemsSolved = 3;
        lessonsCompleted = 1;
      } else if (pseudo === 3) {
        level = 3;
        minutes = 55;
        problemsSolved = 5;
        lessonsCompleted = 1;
      } else {
        level = 4;
        minutes = 75;
        problemsSolved = 7;
        lessonsCompleted = 2;
      }
    }

    history.push({
      studentId,
      date: dateStr,
      dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'short' }),
      level,
      learningTimeMinutes: minutes,
      problemsSolved,
      lessonsCompleted,
      testTaken
    });
  }

  return history;
}

function generateAllActivityHistories() {
  const h1 = generateStudentActivityHistory("usr-student-1", 12, 60, 35, 82, "AI & Python Fundamentals Diagnostic");
  const h1Code = generateStudentActivityHistory("STU1001", 12, 60, 35, 82, "AI & Python Fundamentals Diagnostic");
  const h2 = generateStudentActivityHistory("usr-student-2", 8, 60, 42, 76, "Modern Web Architecture Diagnostic");
  const h2Code = generateStudentActivityHistory("STU1002", 8, 60, 42, 76, "Modern Web Architecture Diagnostic");
  const h3 = generateStudentActivityHistory("usr-student-3", 21, 90, 75, 89, "Data Science & Statistics Diagnostic");
  const h3Code = generateStudentActivityHistory("STU1003", 21, 90, 75, 89, "Data Science & Statistics Diagnostic");
  return [...h1, ...h1Code, ...h2, ...h2Code, ...h3, ...h3Code];
}

export function generateActivityHistory() {
  return generateAllActivityHistories();
}

// Generate realistic class test attempts for CSE-401 C Programming test
export function generateClassTestAttempts() {
  const students = [
    { id: "usr-student-1", code: "STU1001", name: "Likhit Sreeram Malla", score: 78, timeSec: 980, varAcc: 92, loopAcc: 85, funcAcc: 70, ptrAcc: 48 },
    { id: "usr-student-3", code: "STU1003", name: "Priya Reddy", score: 88, timeSec: 1040, varAcc: 95, loopAcc: 90, funcAcc: 80, ptrAcc: 65 },
    { id: "usr-student-2", code: "STU1002", name: "Rahul Sharma", score: 72, timeSec: 1100, varAcc: 86, loopAcc: 75, funcAcc: 65, ptrAcc: 46 },
    { id: "usr-student-4", code: "STU1004", name: "Ananya Patel", score: 96, timeSec: 840, varAcc: 100, loopAcc: 95, funcAcc: 95, ptrAcc: 90 },
    { id: "usr-student-5", code: "STU1005", name: "Vikram Singh", score: 48, timeSec: 1320, varAcc: 70, loopAcc: 55, funcAcc: 45, ptrAcc: 22 },
    { id: "usr-student-6", code: "STU1006", name: "Sneha Gupta", score: 38, timeSec: 1450, varAcc: 60, loopAcc: 45, funcAcc: 35, ptrAcc: 12 },
    { id: "usr-student-7", code: "STU1007", name: "Karthik Varma", score: 64, timeSec: 1150, varAcc: 80, loopAcc: 68, funcAcc: 55, ptrAcc: 35 },
    { id: "usr-student-8", code: "STU1008", name: "Neha Deshmukh", score: 76, timeSec: 1020, varAcc: 90, loopAcc: 78, funcAcc: 64, ptrAcc: 45 },
    { id: "usr-student-9", code: "STU1009", name: "Rohan Joshi", score: 85, timeSec: 960, varAcc: 95, loopAcc: 88, funcAcc: 75, ptrAcc: 55 },
    { id: "usr-student-10", code: "STU1010", name: "Pooja Nair", score: 52, timeSec: 1280, varAcc: 72, loopAcc: 58, funcAcc: 48, ptrAcc: 25 },
    { id: "usr-student-11", code: "STU1011", name: "Aditya Roy", score: 80, timeSec: 1000, varAcc: 92, loopAcc: 82, funcAcc: 70, ptrAcc: 50 },
    { id: "usr-student-12", code: "STU1012", name: "Meera Iyer", score: 92, timeSec: 890, varAcc: 98, loopAcc: 94, funcAcc: 88, ptrAcc: 82 },
    { id: "usr-student-13", code: "STU1013", name: "Devansh Rao", score: 68, timeSec: 1180, varAcc: 82, loopAcc: 70, funcAcc: 58, ptrAcc: 38 },
    { id: "usr-student-14", code: "STU1014", name: "Tanvi Kulkarni", score: 74, timeSec: 1060, varAcc: 88, loopAcc: 76, funcAcc: 62, ptrAcc: 44 },
    { id: "usr-student-15", code: "STU1015", name: "Siddharth Jain", score: 56, timeSec: 1350, varAcc: 75, loopAcc: 60, funcAcc: 50, ptrAcc: 28 },
    { id: "usr-student-16", code: "STU1016", name: "Kavya Menon", score: 84, timeSec: 940, varAcc: 94, loopAcc: 86, funcAcc: 74, ptrAcc: 58 },
    { id: "usr-student-17", code: "STU1017", name: "Arjun Verma", score: 70, timeSec: 1120, varAcc: 84, loopAcc: 72, funcAcc: 60, ptrAcc: 42 },
    { id: "usr-student-18", code: "STU1018", name: "Ishita Sen", score: 90, timeSec: 880, varAcc: 96, loopAcc: 92, funcAcc: 85, ptrAcc: 75 },
    { id: "usr-student-19", code: "STU1019", name: "Varun Chawla", score: 62, timeSec: 1200, varAcc: 78, loopAcc: 66, funcAcc: 54, ptrAcc: 34 },
    { id: "usr-student-20", code: "STU1020", name: "Riya Mukherjee", score: 78, timeSec: 1050, varAcc: 90, loopAcc: 80, funcAcc: 68, ptrAcc: 46 },
    { id: "usr-student-21", code: "STU1021", name: "Kunal Bansal", score: 45, timeSec: 1390, varAcc: 68, loopAcc: 52, funcAcc: 40, ptrAcc: 18 },
    { id: "usr-student-22", code: "STU1022", name: "Divya Pillai", score: 82, timeSec: 990, varAcc: 92, loopAcc: 84, funcAcc: 72, ptrAcc: 54 },
    { id: "usr-student-23", code: "STU1023", name: "Yash Malhotra", score: 66, timeSec: 1160, varAcc: 80, loopAcc: 68, funcAcc: 56, ptrAcc: 36 },
    { id: "usr-student-24", code: "STU1024", name: "Shreya Das", score: 54, timeSec: 1310, varAcc: 74, loopAcc: 58, funcAcc: 48, ptrAcc: 26 },
    { id: "usr-student-25", code: "STU1025", name: "Harshvardhan Patil", score: 76, timeSec: 1070, varAcc: 88, loopAcc: 78, funcAcc: 64, ptrAcc: 45 },
    { id: "usr-student-26", code: "STU1026", name: "Swati Bhattacharya", score: 86, timeSec: 920, varAcc: 95, loopAcc: 88, funcAcc: 76, ptrAcc: 60 },
    { id: "usr-student-27", code: "STU1027", name: "Manav Kapoor", score: 70, timeSec: 1140, varAcc: 85, loopAcc: 72, funcAcc: 60, ptrAcc: 42 }
  ];

  return students.map((s, idx) => {
    const passed = s.score >= 60;
    return {
      id: `att-seed-${String(idx + 1).padStart(3, '0')}`,
      studentId: s.id,
      studentCode: s.code,
      studentName: s.name,
      testId: "test-c-biweekly-1",
      testTitle: "Bi-Weekly Assessment: C Core & Memory Diagnostics",
      scorePercentage: s.score,
      rawScore: Math.round((s.score / 100) * 8 * 10) / 10,
      totalMarks: 8,
      passed,
      timeTakenSeconds: s.timeSec,
      attemptDate: `2026-08-${String(20 + (idx % 8)).padStart(2, '0')}T14:30:00Z`,
      performanceRating: s.score >= 85 ? "Excellent Performance" : (s.score >= 60 ? "Good Effort" : "Needs Immediate Intervention"),
      topicBreakdown: [
        { topic: "Variables", accuracy: s.varAcc, status: s.varAcc >= 85 ? "Strong" : (s.varAcc >= 70 ? "Good" : "Needs Practice") },
        { topic: "Loops", accuracy: s.loopAcc, status: s.loopAcc >= 85 ? "Strong" : (s.loopAcc >= 70 ? "Good" : "Needs Practice") },
        { topic: "Functions", accuracy: s.funcAcc, status: s.funcAcc >= 85 ? "Strong" : (s.funcAcc >= 70 ? "Good" : "Needs Practice") },
        { topic: "Pointers", accuracy: s.ptrAcc, status: s.ptrAcc >= 85 ? "Strong" : (s.ptrAcc >= 70 ? "Good" : "Weak") }
      ],
      aiInsight: s.ptrAcc < 50
        ? "Pointers appears to be the main area requiring additional practice."
        : (s.funcAcc < 70 ? "Functions & call stack dynamics could use further reinforcement." : "Consistent solid understanding across all assessment topics."),
      recommendedActions: s.ptrAcc < 50
        ? ["Pointer Basics", "Pointer Practice Questions", "Pointer Revision Notes"]
        : ["Advanced Pointers", "Complex Systems Drills"]
    };
  });
}

