import { ALL_SKILLS, searchSkills, SKILL_CATEGORIES } from '../utils/skillsData.js';

export const getSkills = async (req, res) => {
  try {
    const { q } = req.query;
    if (q) {
      return res.json(searchSkills(q, 15));
    }
    res.json({ categories: SKILL_CATEGORIES, all: ALL_SKILLS });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default { getSkills };
