import connectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Application from './models/Application.js';
import bcrypt from 'bcryptjs';

const testApplyFlow = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const passHash = await bcrypt.hash('Password123!', 10);

    // Create User A (Owner)
    const owner = await User.create({
      name: 'Owner User',
      email: `owner_${Date.now()}@test.com`,
      username: `owner_${Date.now()}`.slice(0, 15),
      password: passHash,
      emailVerified: true,
    });

    // Create User B (Applicant)
    const applicant = await User.create({
      name: 'Applicant User',
      email: `applicant_${Date.now()}@test.com`,
      username: `applicant_${Date.now()}`.slice(0, 15),
      password: passHash,
      emailVerified: true,
    });

    // Create Project owned by Owner User
    const project = await Project.create({
      title: `Test Project ${Date.now()}`,
      description: 'Testing application flow',
      createdBy: owner._id,
      members: [owner._id],
      status: 'recruiting',
      teamSize: 5,
    });

    console.log('Created project:', project._id);

    // Try applying with Applicant User
    const app = await Application.create({
      userId: applicant._id,
      projectId: project._id,
      message: 'Hello, I want to join!',
    });

    console.log('✅ Application created successfully:', app._id);

    // Clean up
    await Promise.all([
      User.deleteOne({ _id: owner._id }),
      User.deleteOne({ _id: applicant._id }),
      Project.deleteOne({ _id: project._id }),
      Application.deleteOne({ _id: app._id }),
    ]);
    console.log('✅ Cleaned up test data.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Apply test failed:', err);
    process.exit(1);
  }
};

testApplyFlow();
