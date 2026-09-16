import { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import api from '../services/api';
import Badge from './Badge';

/**
 * Profile badges section — fetches and displays a user's earned badges.
 *
 * Props:
 *   userId   — the profile user's ID (null/undefined = own profile)
 *   isOwnProfile — whether this is the logged-in user's own profile
 */
const ProfileBadges = ({ userId, isOwnProfile }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const endpoint = userId ? `/users/badges/${userId}` : '/users/badges';
        const { data } = await api.get(endpoint);
        setBadges(data);
      } catch {
        setBadges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();

    // If own profile, also trigger a badge refresh so newly-earned badges appear
    if (isOwnProfile) {
      api.post('/users/badges/refresh').then(({ data }) => {
        if (data?.badges) setBadges(data.badges);
      }).catch(() => {});
    }
  }, [userId, isOwnProfile]);

  if (loading) return null;

  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-2">
        <Award className="h-5 w-5 text-muted" />
        <h2 className="text-lg font-semibold">Badges</h2>
        {badges.length > 0 && (
          <span className="rounded-full bg-chrome px-2 py-0.5 text-xs font-medium text-muted">
            {badges.length}
          </span>
        )}
      </div>

      {badges.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted">No badges earned yet.</p>
          <p className="mt-1 text-xs text-muted">
            Keep contributing and collaborating to unlock badges!
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {badges.map((badge) => (
            <Badge key={badge.id} badge={badge} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileBadges;
