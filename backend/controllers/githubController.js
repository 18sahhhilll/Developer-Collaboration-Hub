import axios from 'axios';
import User from '../models/User.js';

const getGithubHeaders = () => {
  const headers = { 'User-Agent': 'DevCollab-App' };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
};

export const getGithubData = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let username = (user.githubUsername || '').trim();
    if (!username && user.socialLinks?.github) {
      const cleanUrl = user.socialLinks.github.trim();
      const match = cleanUrl.match(/github\.com\/([^\/\?#]+)/i);
      if (match && match[1]) {
        username = match[1];
      } else if (!cleanUrl.startsWith('http')) {
        username = cleanUrl;
      }
    }

    if (!username) {
      return res.status(400).json({ message: 'GitHub username not configured' });
    }

    const headers = getGithubHeaders();

    let userRes, reposRes;
    try {
      [userRes, reposRes] = await Promise.all([
        axios.get(`https://api.github.com/users/${username}`, { headers }),
        axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=8`, { headers }),
      ]);
    } catch (apiError) {
      // If GitHub API rate limits or errors, fall back to cached data if available
      if (user.githubData?.cachedProfile && user.githubData?.cachedRepos) {
        return res.json({
          profile: user.githubData.cachedProfile,
          repos: user.githubData.cachedRepos,
          languages: user.githubData.languages || [],
          isCached: true,
        });
      }
      throw apiError;
    }

    const repos = reposRes.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      updatedAt: repo.updated_at,
    }));

    // Aggregate language stats
    const languages = {};
    for (const repo of reposRes.data) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }
    const languageList = Object.entries(languages).map(([name, count]) => ({ name, count }));

    const profileData = {
      username: userRes.data.login,
      avatar: userRes.data.avatar_url,
      bio: userRes.data.bio,
      name: userRes.data.name,
      publicRepos: userRes.data.public_repos,
      followers: userRes.data.followers,
      following: userRes.data.following,
      url: userRes.data.html_url,
      isConnectedViaOAuth: !!user.githubId,
    };

    // Cache github data on user document asynchronously
    const githubDataCache = {
      bio: userRes.data.bio || '',
      publicRepos: userRes.data.public_repos,
      followers: userRes.data.followers,
      following: userRes.data.following,
      languages: languageList,
      cachedProfile: profileData,
      cachedRepos: repos,
      lastSynced: new Date(),
    };

    User.findByIdAndUpdate(user._id, { githubData: githubDataCache }).catch(() => {});

    res.json({
      profile: profileData,
      repos,
      languages: languageList,
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ message: 'GitHub user not found' });
    }
    if (error.response?.status === 403) {
      return res.status(429).json({ message: 'GitHub API rate limit exceeded' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Manual refresh endpoint - forces a fresh fetch from GitHub
export const refreshGithubData = async (req, res) => {
  req.params.id = req.user._id.toString();
  return getGithubData(req, res);
};

export default { getGithubData, refreshGithubData };
