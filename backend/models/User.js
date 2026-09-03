import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    earnedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // ── Core identity ──────────────────────────────────────────────
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, minlength: 6, select: false },

    // ── Username system ────────────────────────────────────────────
    username: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },

    // ── OAuth providers ────────────────────────────────────────────
    googleId: { type: String, unique: true, sparse: true },
    githubId: { type: String, unique: true, sparse: true },
    githubUsername: { type: String, default: '' },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
    },

    // ── Email verification ─────────────────────────────────────────
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // ── Password reset ─────────────────────────────────────────────
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    // ── Avatar ─────────────────────────────────────────────────────
    avatarUrl: { type: String, default: '' },
    avatarConfig: {
      style: { type: String, default: 'developer' },
      bgColor: { type: String, default: '#6366f1' },
      skinTone: { type: String, default: 'light' },
      hair: { type: String, default: 'short' },
      hairColor: { type: String, default: 'black' },
      eyes: { type: String, default: 'normal' },
      beard: { type: String, default: 'none' },
      glasses: { type: String, default: 'none' },
      clothes: { type: String, default: 'tshirt' },
      clothesColor: { type: String, default: '#3b82f6' },
      accessory: { type: String, default: 'none' },
    },

    // ── Profile ────────────────────────────────────────────────────
    bio: { type: String, default: '', maxlength: 500 },
    skills: [{ type: String, trim: true }],
    role: { type: String, default: '', trim: true },
    experience: { type: String, default: '', trim: true },
    availability: {
      type: String,
      enum: ['Available', 'Part-time', 'Busy', 'Not available', ''],
      default: 'Available',
    },
    interests: [{ type: String, trim: true }],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      leetcode: { type: String, default: '' },
      portfolio: { type: String, default: '' },
    },

    // ── GitHub imported data ───────────────────────────────────────
    githubData: {
      bio: { type: String, default: '' },
      publicRepos: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
      languages: [{ name: String, count: Number }],
      lastSynced: { type: Date },
    },

    // ── Badges ─────────────────────────────────────────────────────
    badges: { type: [badgeSchema], default: [] },

    // ── Bookmarks & settings ───────────────────────────────────────
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    onboardingCompleted: { type: Boolean, default: false },
    showCompletedProjects: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.toPublicProfile = function () {
  return {
    _id: this._id,
    name: this.name,
    username: this.username,
    bio: this.bio,
    skills: this.skills,
    role: this.role,
    experience: this.experience,
    availability: this.availability,
    interests: this.interests,
    socialLinks: this.socialLinks,
    githubUsername: this.githubUsername,
    showCompletedProjects: this.showCompletedProjects,
    avatarUrl: this.avatarUrl,
    avatarConfig: this.avatarConfig,
    authProvider: this.authProvider,
    githubData: this.githubData,
    badges: this.badges,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
