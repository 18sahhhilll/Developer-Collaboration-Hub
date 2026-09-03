const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-border border-t-accent`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;
