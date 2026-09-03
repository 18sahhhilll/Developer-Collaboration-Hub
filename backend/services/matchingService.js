/**
 * Calculate skill match percentage between user skills and project required skills.
 * match % = (matched skills / total required skills) * 100
 */
export const calculateMatchPercentage = (userSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 100;

  const normalizedUser = userSkills.map((s) => s.toLowerCase().trim());
  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase().trim());

  const matched = normalizedRequired.filter((skill) =>
    normalizedUser.includes(skill)
  );

  return Math.round((matched.length / normalizedRequired.length) * 100);
};

export const enrichProjectsWithMatch = (projects, userSkills) => {
  return projects.map((project) => {
    const projectObj = project.toObject ? project.toObject() : { ...project };
    return {
      ...projectObj,
      matchPercentage: calculateMatchPercentage(userSkills, projectObj.requiredSkills),
    };
  });
};

export default { calculateMatchPercentage, enrichProjectsWithMatch };
