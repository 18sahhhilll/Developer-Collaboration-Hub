/**
 * Password strength meter component.
 * Shows visual strength bar and live validation checklist.
 */

const checks = [
  { id: 'length', label: 'At least 10 characters', test: (p) => p.length >= 10 },
  { id: 'upper', label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { id: 'digit', label: 'One number', test: (p) => /[0-9]/.test(p) },
  { id: 'special', label: 'One special character (!@#$...)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const getStrength = (password) => {
  if (!password) return 0;
  return checks.filter((c) => c.test(password)).length;
};

const STRENGTH_CONFIG = [
  { label: '', color: 'bg-gray-200' },
  { label: 'Weak', color: 'bg-red-400' },
  { label: 'Fair', color: 'bg-orange-400' },
  { label: 'Good', color: 'bg-yellow-400' },
  { label: 'Strong', color: 'bg-blue-400' },
  { label: 'Very Strong', color: 'bg-green-500' },
];

const PasswordStrengthMeter = ({ password, showChecklist = true }) => {
  if (!password) return null;

  const strength = getStrength(password);
  const config = STRENGTH_CONFIG[strength];

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-gray-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${config.color}`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        {config.label && (
          <span className={`text-xs font-medium shrink-0 ${
            strength <= 1 ? 'text-red-500' :
            strength === 2 ? 'text-orange-500' :
            strength === 3 ? 'text-yellow-600' :
            strength === 4 ? 'text-blue-500' :
            'text-green-600'
          }`}>
            {config.label}
          </span>
        )}
      </div>

      {/* Checklist */}
      {showChecklist && (
        <ul className="space-y-1">
          {checks.map((check) => {
            const passed = check.test(password);
            return (
              <li key={check.id} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-600' : 'text-muted'}`}>
                <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] ${passed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  {passed ? '✓' : '○'}
                </span>
                {check.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const isPasswordValid = (password) => getStrength(password) === 5;

export default PasswordStrengthMeter;
