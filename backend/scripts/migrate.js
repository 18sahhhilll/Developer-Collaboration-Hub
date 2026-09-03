/**
 * Migration script for DevCollab schema updates.
 * Run: node scripts/migrate.js
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

dotenv.config();

const STATUS_MAP = { open: 'recruiting', closed: 'archived' };

const TYPE_MAP = {
  application: 'application_received',
  accepted: 'application_accepted',
  rejected: 'application_rejected',
  team: 'team_added',
};

const migrate = async () => {
  await connectDB();
  console.log('Starting migration...');

  const projects = await Project.find({});
  let projectUpdates = 0;

  for (const project of projects) {
    let changed = false;

    if (STATUS_MAP[project.status]) {
      project.status = STATUS_MAP[project.status];
      changed = true;
    }

    if (!project.technologies?.length && project.requiredSkills?.length) {
      project.technologies = [...project.requiredSkills];
      changed = true;
    }

    if (!project.memberRoles?.length && project.members?.length) {
      project.memberRoles = project.members.map((memberId) => ({
        user: memberId,
        role: memberId.toString() === project.createdBy.toString() ? 'owner' : 'member',
      }));
      changed = true;
    }

    if (changed) {
      await project.save();
      projectUpdates++;
    }
  }

  const legacyUsers = await User.updateMany(
    { onboardingCompleted: { $exists: false } },
    { $set: { onboardingCompleted: true, showCompletedProjects: true } }
  );

  const oauthFields = await User.updateMany(
    { authProvider: { $exists: false } },
    { $set: { authProvider: 'local', emailVerified: true } }
  );

  const notifications = await Notification.find({});
  let notifUpdates = 0;
  for (const notif of notifications) {
    if (TYPE_MAP[notif.type]) {
      notif.type = TYPE_MAP[notif.type];
      await notif.save();
      notifUpdates++;
    }
  }

  console.log(`Updated ${projectUpdates} projects`);
  console.log(`Updated ${legacyUsers.modifiedCount} legacy user profiles`);
  console.log(`Updated ${oauthFields.modifiedCount} users with OAuth defaults`);
  console.log(`Updated ${notifUpdates} notifications`);
  console.log('Migration complete.');
  process.exit(0);
};

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
