import Application from '../models/Application.js';
import Project from '../models/Project.js';
import { createNotification, NOTIFICATION_TYPES } from '../utils/notificationHelper.js';
import { isRecruiting } from '../utils/statusHelper.js';

export const applyToProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Project owners cannot apply to their own project' });
    }

    if (project.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'You are already a team member' });
    }

    if (!isRecruiting(project.status)) {
      return res.status(400).json({ message: 'This project is not accepting applications' });
    }

    if (project.members.length >= project.teamSize) {
      return res.status(400).json({ message: 'Team is full' });
    }

    const existing = await Application.findOne({
      userId: req.user._id,
      projectId,
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }

    const application = await Application.create({
      userId: req.user._id,
      projectId,
      message: message || '',
    });

    await createNotification({
      userId: project.createdBy,
      type: NOTIFICATION_TYPES.APPLICATION_RECEIVED,
      title: 'New Application',
      message: `${req.user.name} applied to "${project.title}"`,
      relatedId: application._id,
      projectId: project._id,
    });

    const populated = await Application.findById(application._id)
      .populate('userId', 'name email role skills')
      .populate('projectId', 'title');

    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied to this project' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('projectId', 'title description status requiredSkills teamSize members')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectApplications = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ projectId: req.params.projectId })
      .populate('userId', 'name email role skills bio experience availability')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const application = await Application.findById(req.params.id)
      .populate('projectId')
      .populate('userId', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const project = application.projectId;
    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: 'Application already processed' });
    }

    application.status = status;
    await application.save();

    if (status === 'accepted') {
      if (project.members.length >= project.teamSize) {
        application.status = 'rejected';
        await application.save();
        return res.status(400).json({ message: 'Team is full' });
      }

      if (!project.members.some((m) => m.toString() === application.userId._id.toString())) {
        project.members.push(application.userId._id);
        project.memberRoles = project.memberRoles || [];
        project.memberRoles.push({ user: application.userId._id, role: 'member' });
        await project.save();
      }

      await createNotification({
        userId: application.userId._id,
        type: NOTIFICATION_TYPES.APPLICATION_ACCEPTED,
        title: 'Application Accepted',
        message: `Your application to "${project.title}" was accepted`,
        relatedId: application._id,
        projectId: project._id,
      });

      await createNotification({
        userId: application.userId._id,
        type: NOTIFICATION_TYPES.TEAM_ADDED,
        title: 'Added to Team',
        message: `You joined the team for "${project.title}"`,
        projectId: project._id,
      });
    } else {
      await createNotification({
        userId: application.userId._id,
        type: NOTIFICATION_TYPES.APPLICATION_REJECTED,
        title: 'Application Rejected',
        message: `Your application to "${project.title}" was rejected`,
        relatedId: application._id,
        projectId: project._id,
      });
    }

    const updated = await Application.findById(application._id)
      .populate('userId', 'name email role skills')
      .populate('projectId', 'title');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardApplications = async (req, res) => {
  try {
    const userId = req.user._id;

    const myApplications = await Application.find({ userId })
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });

    const ownedProjectIds = await Project.find({ createdBy: userId }).distinct('_id');
    const incomingApplications = await Application.find({
      projectId: { $in: ownedProjectIds },
    })
      .populate('userId', 'name role skills')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 });

    res.json({ myApplications, incomingApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
