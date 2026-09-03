const AuthDivider = ({ label = 'or' }) => (
  <div className="relative my-8">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-cream px-2 text-muted">{label}</span>
    </div>
  </div>
);

export default AuthDivider;
