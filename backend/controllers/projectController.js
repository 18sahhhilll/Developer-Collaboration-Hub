import Project from '../models/Project.js';
import Application from '../models/Application.js';
import { enrichProjectsWithMatch } from '../services/matchingService.js';
import { buildFeedFilter, searchProjects, ensureTextIndex, applyListFilters } from '../services/searchService.js';
import {
  getRecommendedProjects,
  getTrendingProjects,
  getLatestProjects,
  getUserTechProfile,
  scoreProject,
} from '../services/recommendationService.js';
import { normalizeSkills } from '../utils/skillsData.js';
import { normalizeStatus } from '../utils/statusHelper.js';
import { createNotification, NOTIFICATION_TYPES } from '../utils/notificationHelper.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, requiredSkills, technologies, teamSize, category, status } =
      req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const skills = normalizeSkills(requiredSkills || []);
    const techs = normalizeSkills(technologies || skills);

    const project = await Project.create({
      title,
      description,
      requiredSkills: skills,
      technologies: techs,
      teamSize: teamSize || 5,
      category: category || 'General',
      status: status || 'recruiting',
      createdBy: req.user._id,
      members: [req.user._id],
      memberRoles: [{ user: req.user._id, role: 'owner' }],
    });

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name role');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { tab = 'recommended', q, technology, category, teamSize, status } = req.query;
    const filterQuery = { technology, category, teamSize, status };
    const baseFilter = buildFeedFilter(filterQuery);

    if (status) {
      baseFilter.status = status;
    }

    let projects;

    if (q?.trim()) {
      await ensureTextIndex();
      let results = await searchProjects(q.trim(), req.user._id);
      results = applyListFilters(results, filterQuery);
      results = results.filter(
        (p) => (p.createdBy?._id?.toString() || p.createdBy?.toString()) !== req.user._id.toString()
      );

      const userProfile = await getUserTechProfile(req.user);
      projects = results.map((p) => {
        const { score, reason, matchPercentage } = scoreProject(
          p,
          userProfile,
          p.applicationCount || 0
        );
        return {
          ...p,
          status: normalizeStatus(p.status),
          recommendationScore: score,
          recommendationReason: reason,
          matchPercentage,
        };
      });

      if (tab === 'latest') {
        projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (tab === 'trending') {
        projects.sort((a, b) => (b.applicationCount || 0) - (a.applicationCount || 0));
      } else {
        projects.sort(
          (a, b) =>
            (b.recommendationScore || 0) - (a.recommendationScore || 0) ||
            (b.relevanceScore || 0) - (a.relevanceScore || 0)
        );
      }
    } else {
      switch (tab) {
        case 'latest':
          projects = await getLatestProjects(req.user, baseFilter);
          break;
        case 'trending':
          projects = await getTrendingProjects(req.user, baseFilter);
          break;
        default:
          projects = await getRecommendedProjects(req.user, baseFilter);
      }

      projects = projects.filter(
        (p) => (p.createdBy?._id?.toString() || p.createdBy?.toString()) !== req.user._id.toString()
      );

      projects = projects.map((p) => ({ ...p, status: normalizeStatus(p.status) }));
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchProjectsHandler = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    await ensureTextIndex();
    const results = await searchProjects(q, req.user._id);
    const enriched = enrichProjectsWithMatch(results, req.user.skills || []);

    res.json(
      enriched.map((p) => ({
        ...p,
        status: normalizeStatus(p.status),
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { search, category, status, skill, technology } = req.query;
    const filter = buildFeedFilter({ category, teamSize: req.query.teamSize, status, technology });

    if (search) {
      await ensureTextIndex();
      const results = await searchProjects(search, req.user._id);
      return res.json(results.map((p) => ({ ...p, status: normalizeStatus(p.status) })));
    }

    if (skill) {
      filter.$or = [
        { requiredSkills: { $regex: skill, $options: 'i' } },
        { technologies: { $regex: skill, $options: 'i' } },
      ];
    }

    const projects = await Project.find(filter)
      .populate('createdBy', 'name role')
      .populate('members', 'name role')
      .sort({ createdAt: -1 });

    const enriched = enrichProjectsWithMatch(projects, req.user?.skills || []);
    res.json(enriched.map((p) => ({ ...p, status: normalizeStatus(p.status) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectsWithMatch = async (req, res) => {
  try {
    const projects = await getRecommendedProjects(req.user, {
      status: { $in: ['recruiting', 'open', 'in-progress'] },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role bio skills')
      .populate('members', 'name role bio skills');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectObj = project.toObject();
    projectObj.status = normalizeStatus(projectObj.status);
    projectObj.isOwner = project.createdBy._id.toString() === req.user._id.toString();

    const { calculateMatchPercentage } = await import('../services/matchingService.js');
    projectObj.matchPercentage = calculateMatchPercentage(
      req.user.skills,
      [...(project.requiredSkills || []), ...(project.technologies || [])]
    );

    res.json(projectObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const fields = ['title', 'description', 'teamSize', 'status', 'category'];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        project[field] = req.body[field];
      }
    });

    if (req.body.requiredSkills !== undefined) {
      project.requiredSkills = normalizeSkills(req.body.requiredSkills);
    }
    if (req.body.technologies !== undefined) {
      project.technologies = normalizeSkills(req.body.technologies);
    }

    await project.save();

    const memberIds = project.members.filter((m) => m.toString() !== req.user._id.toString());
    await Promise.all(
      memberIds.map((memberId) =>
        createNotification({
          userId: memberId,
          type: NOTIFICATION_TYPES.PROJECT_UPDATED,
          title: 'Project Updated',
          message: `"${project.title}" was updated by the owner`,
          projectId: project._id,
        })
      )
    );

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members', 'name role');

    res.json({ ...populated.toObject(), status: normalizeStatus(populated.status) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await Application.deleteMany({ projectId: project._id });
    await project.deleteOne();

    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorkspaceProjects = async (req, res) => {
  try {
    const userId = req.user._id;
    const { filter = 'all' } = req.query;

    let query;
    switch (filter) {
      case 'created':
        query = { createdBy: userId };
        break;
      case 'joined':
        query = { members: userId, createdBy: { $ne: userId } };
        break;
      case 'completed':
        query = { members: userId, status: { $in: ['completed'] } };
        break;
      case 'archived':
        query = { members: userId, status: { $in: ['archived', 'closed'] } };
        break;
      default:
        query = { $or: [{ createdBy: userId }, { members: userId }] };
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name')
      .populate('members', 'name role')
      .sort({ updatedAt: -1 });

    res.json(
      projects.map((p) => ({
        ...p.toObject(),
        status: normalizeStatus(p.status),
        participationRole:
          p.createdBy._id.toString() === userId.toString() ? 'created' : 'joined',
      }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    })
      .populate('createdBy', 'name')
      .populate('members', 'name role')
      .sort({ updatedAt: -1 });

    res.json(projects.map((p) => ({ ...p.toObject(), status: normalizeStatus(p.status) })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [created, contributed, active, completed, pending, accepted, rejected] =
      await Promise.all([
        Project.countDocuments({ createdBy: userId }),
        Project.countDocuments({ members: userId, createdBy: { $ne: userId } }),
        Project.countDocuments({
          members: userId,
          status: { $in: ['recruiting', 'open', 'in-progress'] },
        }),
        Project.countDocuments({
          members: userId,
          status: { $in: ['completed'] },
        }),
        Application.countDocuments({ userId, status: 'pending' }),
        Application.countDocuments({ userId, status: 'accepted' }),
        Application.countDocuments({ userId, status: 'rejected' }),
      ]);

    const myProjects = created + contributed;
    const incomingApplications = await Application.countDocuments({
      projectId: { $in: await Project.find({ createdBy: userId }).distinct('_id') },
      status: 'pending',
    });

    res.json({
      myProjects,
      created,
      contributed,
      active,
      completed,
      applications: { pending, accepted, rejected },
      incomingApplications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
