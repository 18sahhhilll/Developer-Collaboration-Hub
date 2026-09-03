import User from '../models/User.js';
import Project from '../models/Project.js';
import Application from '../models/Application.js';
import { normalizeSkills } from '../utils/skillsData.js';
import { normalizeStatus } from '../utils/statusHelper.js';
import { validateUsername } from '../utils/validators.js';
import { evaluateAndAwardBadges } from '../services/badgeService.js';

// Resolve a userId that could be a Mongo ObjectId or a username
const resolveUserId = async (idOrUsername) => {
  if (!idOrUsername) return null;
  // ObjectId is 24 hex chars
  if (/^[a-f\d]{24}$/i.test(idOrUsername)) {
    return idOrUsername;
  }
  // Treat as username
  const user = await User.findOne({ username: idOrUsername.toLowerCase() }).select('_id');
  return user?._id || null;
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const userId = await resolveUserId(req.params.id);
    if (!userId) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = await User.findById(userId).select('-password -email');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.toPublicProfile());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const fields = [
      'name',
      'bio',
      'role',
      'experience',
      'availability',
      'interests',
      'socialLinks',
      'githubUsername',
      'showCompletedProjects',
      'avatarConfig',
      'avatarUrl',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Username update
    if (req.body.username !== undefined) {
      const newUsername = req.body.username.toLowerCase();
      if (newUsername !== user.username) {
        const check = validateUsername(newUsername);
        if (!check.valid) {
          return res.status(400).json({ message: check.message });
        }
        const taken = await User.findOne({ username: newUsername, _id: { $ne: user._id } });
        if (taken) {
          return res.status(400).json({ message: 'This username is already taken' });
        }
        user.username = newUsername;
      }
    }

    if (req.body.skills !== undefined) {
      user.skills = normalizeSkills(
        Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',')
      );
    }

    const updated = await user.save();

    // Evaluate badges after profile update
    evaluateAndAwardBadges(updated).catch(() => {});

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      username: updated.username,
      bio: updated.bio,
      skills: updated.skills,
      role: updated.role,
      experience: updated.experience,
      availability: updated.availability,
      interests: updated.interests,
      socialLinks: updated.socialLinks,
      githubUsername: updated.githubUsername,
      onboardingCompleted: updated.onboardingCompleted,
      showCompletedProjects: updated.showCompletedProjects,
      avatarUrl: updated.avatarUrl,
      avatarConfig: updated.avatarConfig,
      badges: updated.badges,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { bio, skills, socialLinks, githubUsername, username, skip } = req.body;

    if (!skip) {
      if (bio !== undefined) user.bio = bio;
      if (skills !== undefined) {
        user.skills = normalizeSkills(Array.isArray(skills) ? skills : []);
      }
      if (socialLinks !== undefined) {
        user.socialLinks = { ...user.socialLinks, ...socialLinks };
      }
      if (githubUsername !== undefined) user.githubUsername = githubUsername;

      // Allow setting username during onboarding
      if (username !== undefined && username !== user.username) {
        const check = validateUsername(username.toLowerCase());
        if (!check.valid) {
          return res.status(400).json({ message: check.message });
        }
        const taken = await User.findOne({ username: username.toLowerCase(), _id: { $ne: user._id } });
        if (taken) {
          return res.status(400).json({ message: 'This username is already taken' });
        }
        user.username = username.toLowerCase();
      }
    }

    user.onboardingCompleted = true;
    await user.save();

    evaluateAndAwardBadges(user).catch(() => {});

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      skills: user.skills,
      socialLinks: user.socialLinks,
      githubUsername: user.githubUsername,
      onboardingCompleted: user.onboardingCompleted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfileStats = async (req, res) => {
  try {
    const userId = req.params.id
      ? await resolveUserId(req.params.id)
      : req.user._id;

    if (!userId) return res.status(404).json({ message: 'User not found' });

    const [created, contributed, active, completed, sent, accepted] = await Promise.all([
      Project.countDocuments({ createdBy: userId }),
      Project.countDocuments({ members: userId, createdBy: { $ne: userId } }),
      Project.countDocuments({
        members: userId,
        status: { $in: ['recruiting', 'open', 'in-progress'] },
      }),
      Project.countDocuments({ members: userId, status: 'completed' }),
      Application.countDocuments({ userId }),
      Application.countDocuments({ userId, status: 'accepted' }),
    ]);

    res.json({
      projectsCreated: created,
      projectsContributed: contributed,
      activeProjects: active,
      completedProjects: completed,
      applicationsSent: sent,
      applicationsAccepted: accepted,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfileProjects = async (req, res) => {
  try {
    const userId = req.params.id
      ? await resolveUserId(req.params.id)
      : req.user._id;

    if (!userId) return res.status(404).json({ message: 'User not found' });

    const { filter = 'all' } = req.query;
    const user = await User.findById(userId).select('showCompletedProjects');
    const targetId = userId.toString();
    const isOwn = targetId === req.user._id.toString();

    let query = {};
    switch (filter) {
      case 'created':
        query = { createdBy: targetId };
        break;
      case 'contributed':
        query = { members: targetId, createdBy: { $ne: targetId } };
        break;
      case 'completed':
        query = { members: targetId, status: 'completed' };
        break;
      default:
        query = { $or: [{ createdBy: targetId }, { members: targetId }] };
    }

    if (!isOwn && !user?.showCompletedProjects && filter !== 'completed') {
      query.status = { $ne: 'completed' };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name username')
      .populate('members', 'name role username')
      .sort({ updatedAt: -1 });

    res.json(
      projects.map((p) => ({
        ...p.toObject(),
        status: normalizeStatus(p.status),
        role: p.createdBy._id.toString() === userId.toString() ? 'creator' : 'contributor',
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const projectId = req.params.projectId;
    const index = user.bookmarks.indexOf(projectId);

    if (index > -1) {
      user.bookmarks.splice(index, 1);
    } else {
      user.bookmarks.push(projectId);
    }

    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('bookmarks');
    res.json(user.bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Avatar config update endpoint
export const updateAvatar = async (req, res) => {
  try {
    const { avatarConfig } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (avatarConfig) user.avatarConfig = { ...user.avatarConfig, ...avatarConfig };
    // Clear avatarUrl when using built-in avatar
    if (req.body.useBuiltIn) user.avatarUrl = '';
    await user.save();
    res.json({ avatarConfig: user.avatarConfig, avatarUrl: user.avatarUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get badges for a user
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.params.id ? await resolveUserId(req.params.id) : req.user._id;
    if (!userId) return res.status(404).json({ message: 'User not found' });
    const user = await User.findById(userId).select('badges');
    res.json(user?.badges || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Refresh badges manually
export const refreshBadges = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const newBadges = await evaluateAndAwardBadges(user);
    res.json({ badges: user.badges, newBadges });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
