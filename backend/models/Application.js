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

export const ensureApplicationIndexes = async () => {
  try {
    const db = mongoose.connection?.db;
    if (!db) return;
    const collection = db.collection('applications');
    const indexes = await collection.indexes().catch(() => []);
    for (const idx of indexes) {
      if (idx.name !== '_id_' && idx.name !== 'userId_1_projectId_1') {
        console.log(`🧹 Dropping obsolete index: ${idx.name}`);
        await collection.dropIndex(idx.name).catch(() => {});
      }
    }
    await collection.createIndex({ userId: 1, projectId: 1 }, { unique: true });
    console.log('✅ Application composite unique index verified.');
  } catch (err) {
    console.warn('Application index check warning:', err.message);
  }
};

export default Application;
