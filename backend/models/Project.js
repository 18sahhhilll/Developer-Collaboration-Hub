import mongoose from 'mongoose';

const memberRoleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: ['owner', 'co-leader', 'member'],
      default: 'member',
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, maxlength: 2000 },
    requiredSkills: [{ type: String, trim: true }],
    technologies: [{ type: String, trim: true }],
    teamSize: { type: Number, required: true, min: 1, max: 50, default: 5 },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    memberRoles: [memberRoleSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['recruiting', 'in-progress', 'completed', 'archived', 'open', 'closed'],
      default: 'recruiting',
    },
    category: { type: String, default: 'General', trim: true },
  },
  { timestamps: true }
);

projectSchema.index({
  title: 'text',
  description: 'text',
  requiredSkills: 'text',
  technologies: 'text',
  category: 'text',
});

projectSchema.virtual('memberCount').get(function () {
  return this.members?.length || 0;
});

projectSchema.pre('save', function (next) {
  if (this.status === 'open') this.status = 'recruiting';
  if (this.status === 'closed') this.status = 'archived';

  if (this.isNew || this.isModified('members') || this.isModified('createdBy')) {
    const roles = [];
    const ownerId = this.createdBy?.toString();
    (this.members || []).forEach((memberId) => {
      const id = memberId.toString();
      roles.push({
        user: memberId,
        role: id === ownerId ? 'owner' : 'member',
      });
    });
    this.memberRoles = roles;
  }
  next();
});

projectSchema.set('toJSON', { virtuals: true });
projectSchema.set('toObject', { virtuals: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
