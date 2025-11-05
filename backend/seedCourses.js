import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import User from './models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/e-learning';

const sampleCourses = [
  {
    title: 'Complete Web Development Masterclass',
    description: 'Master web development from scratch with HTML, CSS, JavaScript, React, Node.js, and MongoDB. Build real-world projects and deploy them professionally.',
    duration: '42h 30m',
    level: 'beginner',
    price: 89.99,
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop',
    status: 'active'
  },
  {
    title: 'Advanced React & TypeScript Development',
    description: 'Take your React skills to the next level with TypeScript, advanced patterns, and best practices used in production applications.',
    duration: '35h 20m',
    level: 'intermediate',
    price: 99.99,
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop',
    status: 'active'
  },
  {
    title: 'Node.js Backend Development',
    description: 'Build robust backend applications with Node.js, Express, MongoDB, and learn authentication, APIs, and deployment.',
    duration: '28h 15m',
    level: 'intermediate',
    price: 79.99,
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop',
    status: 'active'
  },
  {
    title: 'Python for Data Science',
    description: 'Learn Python programming and data science libraries including NumPy, Pandas, Matplotlib, and Scikit-learn.',
    duration: '40h 10m',
    level: 'beginner',
    price: 0, // Free course
    thumbnail: 'https://images.unsplash.com/photo-1528716321680-836a63fe7783?w=800&h=450&fit=crop',
    status: 'active'
  },
  {
    title: 'AWS Cloud Architecture',
    description: 'Master Amazon Web Services including EC2, S3, RDS, Lambda, and learn to architect scalable cloud solutions.',
    duration: '45h 00m',
    level: 'advanced',
    price: 129.99,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=450&fit=crop',
    status: 'active'
  }
];

const seedCourses = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find a teacher user
    const teacher = await User.findOne({ role: 'teacher' });
    
    if (!teacher) {
      console.log('❌ No teacher found. Please create a teacher account first.');
      process.exit(1);
    }

    console.log(`📚 Seeding courses for teacher: ${teacher.fullName}`);

    // Clear existing courses (optional - comment out if you want to keep existing)
    // await Course.deleteMany({ teacher: teacher._id });
    // console.log('🗑️  Cleared existing courses');

    // Create courses
    const createdCourses = [];
    for (const courseData of sampleCourses) {
      const course = new Course({
        ...courseData,
        teacher: teacher._id,
        students: [],
        modules: []
      });

      await course.save();
      createdCourses.push(course);
      console.log(`✅ Created: ${course.title}`);
    }

    console.log(`\n🎉 Successfully seeded ${createdCourses.length} courses!`);
    console.log('\nCourse IDs (use these for testing):');
    createdCourses.forEach(course => {
      console.log(`  - ${course.title}: ${course._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

// Run seed
seedCourses();

