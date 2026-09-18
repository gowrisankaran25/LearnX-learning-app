const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Load Models
const User = require('../models/User');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Badge = require('../models/Badge');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/learnx');

const seedData = async () => {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Quiz.deleteMany();
    await Badge.deleteMany();

    console.log('Creating badges...');
    const badge1 = await Badge.create({
      name: '7-Day Streak Master',
      description: 'Learned every day for 7 consecutive days',
      icon: 'flame',
      category: 'streak',
      rarity: 'rare',
      requirements: { type: 'streak_days', value: 7 },
      xpReward: 250
    });

    const badge2 = await Badge.create({
      name: 'Quiz Champion',
      description: 'Scored 100% on a course quiz',
      icon: 'trophy',
      category: 'achievement',
      rarity: 'epic',
      requirements: { type: 'quizzes_passed', value: 1 },
      xpReward: 300
    });

    const badge3 = await Badge.create({
      name: 'Java Explorer',
      description: 'Completed your first Java lessons',
      icon: 'book',
      category: 'completion',
      rarity: 'common',
      requirements: { type: 'lessons_completed', value: 2 },
      xpReward: 150
    });

    const badge4 = await Badge.create({
      name: 'High Achiever',
      description: 'Earned more than 2,000 XP',
      icon: 'award',
      category: 'achievement',
      rarity: 'legendary',
      requirements: { type: 'xp_earned', value: 2000 },
      xpReward: 500
    });

    console.log('Creating users...');
    
    // Create users
    const password = 'password123';

    const teacher = await User.create({
      name: 'Dr. Jane Smith',
      email: 'teacher@learnx.com',
      password: password,
      role: 'teacher',
      bio: 'Expert in Computer Science and Programming.',
    });

    const student = await User.create({
      name: 'Hariez',
      email: 'student@learnx.com',
      password: password,
      role: 'student',
      learningDNA: {
        learningStyle: 'visual',
        strongAreas: [{ topic: 'Python', score: 85 }],
        weakAreas: [{ topic: 'Computer Networks', score: 45, priority: 'high' }],
        averageQuizScore: 78,
        consistency: 80,
        recommendedDifficulty: 'intermediate'
      },
      gamification: {
        xp: 2450,
        level: 12,
        streak: 7,
        longestStreak: 14,
        badges: [badge1._id, badge2._id, badge3._id, badge4._id]
      }
    });

    console.log('Creating courses...');
    
    const course1 = await Course.create({
      title: 'Java Programming',
      description: 'Learn Java from scratch to advanced concepts.',
      instructor: teacher._id,
      category: 'Programming',
      level: 'Beginner',
      duration: 340, // 5h 40m
      whatYouLearn: ['Java syntax', 'OOP', 'Data structures'],
      price: 0,
      tags: ['java', 'programming', 'oop'],
      published: true
    });

    const course2 = await Course.create({
      title: 'Database Management',
      description: 'Master SQL and Database Normalization.',
      instructor: teacher._id,
      category: 'Database',
      level: 'Intermediate',
      duration: 200,
      whatYouLearn: ['SQL', 'Normalization', 'Indexing'],
      price: 0,
      tags: ['sql', 'database', 'dbms'],
      published: true
    });

    const course3 = await Course.create({
      title: 'Network Protocols',
      description: 'Understanding TCP/IP, HTTP, and DNS.',
      instructor: teacher._id,
      category: 'Networking',
      level: 'Intermediate',
      duration: 150,
      whatYouLearn: ['TCP/IP', 'HTTP', 'DNS'],
      price: 0,
      tags: ['networking', 'protocols'],
      published: true
    });

    const course4 = await Course.create({
      title: 'Web Development Foundations',
      description: 'Build accessible web pages with HTML, CSS, and JavaScript.',
      instructor: teacher._id,
      category: 'Web Development',
      level: 'Beginner',
      duration: 260,
      whatYouLearn: ['Semantic HTML', 'Responsive CSS', 'JavaScript basics'],
      price: 0,
      tags: ['html', 'css', 'javascript', 'web'],
      published: true
    });

    console.log('Creating lessons...');

    const lesson1 = await Lesson.create({
      title: 'Introduction to Java',
      course: course1._id,
      description: 'Getting started with Java environment.',
      videoUrl: 'https://www.youtube.com/embed/eIrMbAQSU34',
      videoDuration: 600,
      order: 1
    });

    const lesson2 = await Lesson.create({
      title: 'Variables and Data Types',
      course: course1._id,
      description: 'Learn about variables and primitive data types in Java.',
      videoUrl: 'https://www.youtube.com/embed/eIrMbAQSU34',
      videoDuration: 800,
      order: 2
    });

    const lesson3 = await Lesson.create({
      title: 'Database Normalization',
      course: course2._id,
      description: 'Learn 1NF, 2NF, and 3NF.',
      videoUrl: 'https://www.youtube.com/embed/HXV3zeQKqGY',
      videoDuration: 1200,
      order: 1
    });

    const lesson4 = await Lesson.create({
      title: 'Introduction to Network Protocols',
      course: course3._id,
      description: 'Understand how computers communicate across networks.',
      videoUrl: 'https://www.youtube.com/embed/qiQR5rTSshw',
      videoDuration: 1800,
      order: 1
    });

    const lesson5 = await Lesson.create({
      title: 'HTML and CSS Essentials',
      course: course4._id,
      description: 'Create structured and responsive web pages.',
      videoUrl: 'https://www.youtube.com/embed/UB1O30fR-EE',
      videoDuration: 1500,
      order: 1
    });

    // Add lessons to courses
    course1.lessons.push(lesson1._id, lesson2._id);
    await course1.save();

    course2.lessons.push(lesson3._id);
    await course2.save();

    course3.lessons.push(lesson4._id);
    await course3.save();

    course4.lessons.push(lesson5._id);
    await course4.save();

    console.log('Creating quizzes...');

    const quiz1 = await Quiz.create({
      title: 'Java Basics Quiz',
      course: course1._id,
      lesson: lesson2._id,
      description: 'Test your knowledge on Java variables and basics.',
      duration: 600, // 10 minutes
      passingScore: 60,
      topic: 'Java',
      difficulty: 'easy',
      published: true,
      questions: [
        {
          type: 'mcq',
          question: 'Which of the following is not a primitive data type in Java?',
          options: ['int', 'boolean', 'String', 'char'],
          correctAnswer: 2,
          explanation: 'String is an object, not a primitive data type.',
          points: 10,
          order: 1
        },
        {
          type: 'truefalse',
          question: 'Java is a compiled and interpreted language.',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'Java code is compiled into bytecode and interpreted by JVM.',
          points: 10,
          order: 2
        }
      ]
    });

    course1.quizzes.push(quiz1._id);
    await course1.save();

    const javaFinal = await Quiz.create({
      title: 'Java Final Assessment',
      course: course1._id,
      description: 'Final test covering Java fundamentals and object-oriented programming.',
      duration: 1200,
      passingScore: 70,
      topic: 'Java',
      difficulty: 'medium',
      published: true,
      questions: [
        { type: 'mcq', question: 'Which keyword creates a subclass relationship?', options: ['this', 'extends', 'static', 'new'], correctAnswer: 1, explanation: 'extends creates inheritance between classes.', points: 10, order: 1 },
        { type: 'mcq', question: 'Which collection stores unique values?', options: ['List', 'Queue', 'Set', 'Array'], correctAnswer: 2, explanation: 'Set implementations do not allow duplicate values.', points: 10, order: 2 },
        { type: 'truefalse', question: 'An interface can define a contract for implementing classes.', options: ['True', 'False'], correctAnswer: 0, explanation: 'Interfaces define behavior contracts.', points: 10, order: 3 }
      ]
    });

    const databaseFinal = await Quiz.create({
      title: 'Database Final Test',
      course: course2._id,
      lesson: lesson3._id,
      description: 'Final test on SQL, normalization, and database design.',
      duration: 900,
      passingScore: 70,
      topic: 'Database',
      difficulty: 'medium',
      published: true,
      questions: [
        { type: 'mcq', question: 'Which SQL command reads data?', options: ['SELECT', 'INSERT', 'DROP', 'ALTER'], correctAnswer: 0, explanation: 'SELECT retrieves rows from a database.', points: 10, order: 1 },
        { type: 'mcq', question: 'What is the main goal of normalization?', options: ['Add duplicates', 'Reduce redundancy', 'Remove keys', 'Slow queries'], correctAnswer: 1, explanation: 'Normalization reduces duplicated and inconsistent data.', points: 10, order: 2 }
      ]
    });

    const networkingFinal = await Quiz.create({
      title: 'Network Protocols Final Test',
      course: course3._id,
      lesson: lesson4._id,
      description: 'Final test on TCP/IP, HTTP, DNS, and network layers.',
      duration: 900,
      passingScore: 70,
      topic: 'Networking',
      difficulty: 'medium',
      published: true,
      questions: [
        { type: 'mcq', question: 'Which protocol translates domain names to IP addresses?', options: ['HTTP', 'DNS', 'TCP', 'FTP'], correctAnswer: 1, explanation: 'DNS resolves domain names to IP addresses.', points: 10, order: 1 },
        { type: 'mcq', question: 'Which protocol provides reliable ordered delivery?', options: ['IP', 'UDP', 'TCP', 'DNS'], correctAnswer: 2, explanation: 'TCP provides reliable ordered delivery.', points: 10, order: 2 }
      ]
    });

    const webFinal = await Quiz.create({
      title: 'Web Development Final Test',
      course: course4._id,
      lesson: lesson5._id,
      description: 'Final test on HTML, CSS, and JavaScript fundamentals.',
      duration: 900,
      passingScore: 70,
      topic: 'Web Development',
      difficulty: 'easy',
      published: true,
      questions: [
        { type: 'mcq', question: 'Which language structures a web page?', options: ['CSS', 'HTML', 'SQL', 'Python'], correctAnswer: 1, explanation: 'HTML provides the structure of a web page.', points: 10, order: 1 },
        { type: 'mcq', question: 'Which language adds behavior in the browser?', options: ['JavaScript', 'HTML', 'CSS', 'XML'], correctAnswer: 0, explanation: 'JavaScript provides browser behavior and interactivity.', points: 10, order: 2 }
      ]
    });

    course1.quizzes.push(javaFinal._id);
    course2.quizzes.push(databaseFinal._id);
    course3.quizzes.push(networkingFinal._id);
    course4.quizzes.push(webFinal._id);
    await Promise.all([course1.save(), course2.save(), course3.save(), course4.save()]);

    console.log('Enrolling student and adding progress...');

    // Enroll student in courses
    student.enrolledCourses.push(course1._id, course2._id, course3._id, course4._id);
    
    // Mark some lessons completed
    student.completedLessons.push(
      { lesson: lesson1._id, completedAt: new Date() },
      { lesson: lesson3._id, completedAt: new Date() }
    );
    
    // Add quiz attempts
    student.quizAttempts.push({
      quiz: quiz1._id,
      score: 100,
      answers: { [quiz1.questions[0]._id]: 2, [quiz1.questions[1]._id]: 0 },
      timeTaken: 120
    });

    await student.save();

    console.log('Data seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
