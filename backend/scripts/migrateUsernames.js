/**
 * Migration: generate usernames for existing users who don't have one.
 * Runs at server startup — safe to run multiple times.
 */
import User from '../models/User.js';

const slugify = (str) =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9_.]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 18);

const generateUniqueUsername = async (base) => {
  let candidate = slugify(base) || 'user';
  if (candidate.length < 3) candidate = `dev_${candidate}`;

  // Check if available
  const exists = await User.findOne({ username: candidate });
  if (!exists) return candidate;

  // Try with suffix
  for (let i = 1; i <= 999; i++) {
    const suffixed = `${candidate.slice(0, 16)}_${i}`;
    const taken = await User.findOne({ username: suffixed });
    if (!taken) return suffixed;
  }
  return `user_${Date.now()}`;
};

export const migrateUsernames = async () => {
  try {
    const usersWithoutUsername = await User.find({
      $or: [{ username: null }, { username: '' }, { username: { $exists: false } }],
    }).select('name email username');

    if (usersWithoutUsername.length === 0) {
      console.log('✅ Username migration: All users already have usernames');
      return;
    }

    console.log(`🔄 Username migration: Generating usernames for ${usersWithoutUsername.length} users...`);

    for (const user of usersWithoutUsername) {
      const base = user.name?.split(' ')[0] || user.email?.split('@')[0] || 'user';
      const username = await generateUniqueUsername(base);
      await User.findByIdAndUpdate(user._id, { username });
    }

    console.log(`✅ Username migration: Complete`);
  } catch (err) {
    console.error('⚠️  Username migration error:', err.message);
  }
};

export default migrateUsernames;
