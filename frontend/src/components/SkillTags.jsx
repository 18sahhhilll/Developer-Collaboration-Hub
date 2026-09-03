const SkillTags = ({ skills = [], size = 'sm' }) => {
  if (!skills.length) return null;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((skill) => (
        <span
          key={skill}
          className={`rounded-md bg-chrome font-medium text-muted ${sizeClasses[size]}`}
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

export default SkillTags;
