import Project from '../models/Project.js';
import { createNotification, NOTIFICATION_TYPES } from '../utils/notificationHelper.js';

const isOwner = (project, userId) =>
  project.createdBy.toString() === userId.toString();

export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can remove members' });
    }

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Transfer ownership before leaving as owner' });
    }

    if (!project.members.some((m) => m.toString() === userId)) {
      return res.status(404).json({ message: 'Member not found in project' });
    }

    project.members = project.members.filter((m) => m.toString() !== userId);
    project.memberRoles = (project.memberRoles || []).filter(
      (r) => r.user.toString() !== userId
    );
    await project.save();

    await createNotification({
      userId,
      type: NOTIFICATION_TYPES.TEAM_REMOVED,
      title: 'Removed from Project',
      message: `You were removed from "${project.title}"`,
      projectId: project._id,
    });

    const populated = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const transferOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (!newOwnerId) {
      return res.status(400).json({ message: 'newOwnerId is required' });
    }

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can transfer ownership' });
    }

    if (!project.members.some((m) => m.toString() === newOwnerId)) {
      return res.status(400).json({ message: 'New owner must be a team member' });
    }

    const oldOwnerId = project.createdBy;
    project.createdBy = newOwnerId;

    project.memberRoles = (project.members || []).map((memberId) => ({
      user: memberId,
      role: memberId.toString() === newOwnerId ? 'owner' : 'member',
    }));

    await project.save();

    await createNotification({
      userId: newOwnerId,
      type: NOTIFICATION_TYPES.OWNERSHIP_TRANSFERRED,
      title: 'Ownership Transferred',
      message: `You are now the owner of "${project.title}"`,
      projectId: project._id,
    });

    await createNotification({
      userId: oldOwnerId,
      type: NOTIFICATION_TYPES.PROJECT_UPDATED,
      title: 'Ownership Transferred',
      message: `You transferred ownership of "${project.title}"`,
      projectId: project._id,
    });

    const populated = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const promoteCoLeader = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (!isOwner(project, req.user._id)) {
      return res.status(403).json({ message: 'Only the project owner can promote members' });
    }

    if (!project.members.some((m) => m.toString() === userId)) {
      return res.status(404).json({ message: 'Member not found' });
    }

    if (userId === project.createdBy.toString()) {
      return res.status(400).json({ message: 'Owner is already the project lead' });
    }

    project.memberRoles = (project.members || []).map((memberId) => {
      const idStr = memberId.toString();
      let role = 'member';
      if (idStr === project.createdBy.toString()) role = 'owner';
      else if (idStr === userId) role = 'co-leader';
      else {
        const existing = (project.memberRoles || []).find((r) => r.user.toString() === idStr);
        if (existing?.role === 'co-leader' && idStr !== userId) role = 'member';
        else if (existing?.role === 'co-leader') role = 'co-leader';
      }
      return { user: memberId, role };
    });

    await project.save();

    await createNotification({
      userId,
      type: NOTIFICATION_TYPES.TEAM_ADDED,
      title: 'Promoted to Co-Leader',
      message: `You were promoted to co-leader on "${project.title}"`,
      projectId: project._id,
    });

    const populated = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name role');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { removeMember, transferOwnership, promoteCoLeader };
