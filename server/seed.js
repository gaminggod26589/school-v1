// Seed script — run with: node seed.js
// Populates demo data: 1 principal, 3 teachers, 5 students (classes 8,9,10), 10 books, 5 notices
// ⚠️ This will DELETE existing data first — only run in development!

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Book = require('./models/Book');
const Notice = require('./models/Notice');
const Attendance = require('./models/Attendance');

dotenv.config();

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    // Clear existing data
    await Promise.all([
        User.deleteMany({}),
        Book.deleteMany({}),
        Notice.deleteMany({}),
        Attendance.deleteMany({}),
    ]);
    console.log('Cleared existing data...');

    // ── Users ──────────────────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', 10); // shared demo password

    const users = await User.insertMany([
        // Principal
        { name: 'Ram Prasad Sharma', email: 'principal@school.edu.np', password, role: 'principal' },
        // Teachers
        { name: 'Sita Devi Thapa', email: 'sita@school.edu.np', password, role: 'teacher' },
        { name: 'Hari Bahadur Rai', email: 'hari@school.edu.np', password, role: 'teacher' },
        { name: 'Kamala Adhikari', email: 'kamala@school.edu.np', password, role: 'teacher' },
        // Students class 8
        { name: 'Raju Tamang', email: 'raju@student.edu.np', password, role: 'student', classGrade: 8, section: 'A', yearJoined: 2023 },
        { name: 'Mina Gurung', email: 'mina@student.edu.np', password, role: 'student', classGrade: 8, section: 'B', yearJoined: 2023 },
        // Students class 9
        { name: 'Bikash Shrestha', email: 'bikash@student.edu.np', password, role: 'student', classGrade: 9, section: 'A', yearJoined: 2022 },
        { name: 'Priya Lama', email: 'priya@student.edu.np', password, role: 'student', classGrade: 9, section: 'A', yearJoined: 2022 },
        // Students class 10
        { name: 'Sujan Poudel', email: 'sujan@student.edu.np', password, role: 'student', classGrade: 10, section: 'C', yearJoined: 2021 },
    ]);

    console.log(`✅ Created ${users.length} users`);

    // ── Books ──────────────────────────────────────────────────────────────────
    const books = await Book.insertMany([
        { title: 'The Science of Everything', author: 'A.K. Jha', category: 'Science', totalCopies: 3, available: 3 },
        { title: 'Mathematics Made Easy', author: 'P.R. Shrestha', category: 'Mathematics', totalCopies: 5, available: 5 },
        { title: 'Nepal: A History', author: 'Surya Bahadur', category: 'History', totalCopies: 2, available: 2 },
        { title: 'English Grammar Mastery', author: 'Helen Curtis', category: 'Language', totalCopies: 4, available: 4 },
        { title: 'Computer Fundamentals', author: 'D.P. Nagpal', category: 'Technology', totalCopies: 3, available: 3 },
        { title: 'Geography of South Asia', author: 'R.K. Dixit', category: 'Geography', totalCopies: 2, available: 2 },
        { title: 'Introduction to Economics', author: 'N.G. Mankiw', category: 'Economics', totalCopies: 2, available: 2 },
        { title: 'Stories from the Himalayas', author: 'Tenzin Norbu', category: 'Fiction', totalCopies: 5, available: 5 },
        { title: 'Health & Physical Education', author: 'MoE Nepal', category: 'Health', totalCopies: 6, available: 6 },
        { title: 'Social Studies Grade 10', author: 'CDC Nepal', category: 'Social Studies', totalCopies: 4, available: 4 },
    ]);

    console.log(`✅ Created ${books.length} books`);

    // ── Notices, News, Events ──────────────────────────────────────────────────
    const principalId = users[0]._id;
    const notices = await Notice.insertMany([
        {
            title: 'School Reopening After Dashain Break',
            body: 'All students are informed that the school will reopen on October 28th after the Dashain festival break. Attendance will be mandatory from day one.',
            category: 'notice',
            date: 'Oct 20, 2024',
            postedBy: principalId,
            isPinned: true,
        },
        {
            title: 'Annual Science Exhibition 2024',
            body: 'Martyrs\' Memorial School is proud to announce the Annual Science Exhibition. Students from grades 8–10 are encouraged to submit their projects by November 15th.',
            category: 'news',
            date: 'Nov 1, 2024',
            postedBy: principalId,
        },
        {
            title: 'SEE Examination Schedule Released',
            body: 'The National Examination Board has officially released the SEE examination schedule for Grade 10 students. The exams will begin on March 15, 2025.',
            category: 'notice',
            date: 'Nov 5, 2024',
            postedBy: principalId,
            isPinned: true,
        },
        {
            title: 'Sports Day Celebration',
            body: 'Join us for a day of fun and competition at our Annual Sports Day event. Games, relay races, and prizes await!',
            category: 'event',
            date: 'Nov 10, 2024',
            eventDate: new Date('2024-12-05'),
            postedBy: principalId,
        },
        {
            title: 'Parent-Teacher Meeting',
            body: 'All parents are invited to attend the Parent-Teacher meeting on November 25th from 10:00 AM to 1:00 PM to discuss academic progress.',
            category: 'event',
            date: 'Nov 12, 2024',
            eventDate: new Date('2024-11-25'),
            postedBy: principalId,
        },
    ]);

    console.log(`✅ Created ${notices.length} notices/events`);

    console.log('\n🎓 Seed complete! Demo credentials (password: password123):');
    console.log('  Principal: principal@school.edu.np');
    console.log('  Teacher:   sita@school.edu.np');
    console.log('  Student:   bikash@student.edu.np (Class 9)');

    mongoose.disconnect();
};

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
