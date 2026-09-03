import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: { type: String, default: '', maxlength: 500 },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, projectId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
