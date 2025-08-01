'use client';

import { useState, useEffect } from 'react';
import AuthForm from '../components/AuthForm';
import MovieCarousel from '../components/MovieCarousel';

interface Recommendation {
  movie_id: number;
  title: string;
  vote_average: number;
  vote_count: number;
  genre_ids: string;
  weighted_score: number;
  source_movies: string;
  user_rating: number;
  poster_path?: string;
  cluster_id?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
}

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);

  // Check for existing token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      fetchCurrentUser(savedToken);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        // Token is invalid, clear it
        handleLogout();
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      handleLogout();
    }
  };

  const handleLogin = (authToken: string) => {
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', authToken);
    fetchCurrentUser(authToken);
  };

  const handleRegister = (authToken: string) => {
    setToken(authToken);
    setIsAuthenticated(true);
    localStorage.setItem('authToken', authToken);
    fetchCurrentUser(authToken);
  };

  const handleLogout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    setRecommendations([]);
    setRecommendationsError(null);
  };

  const handleGetRecommendations = async () => {
    if (!token) {
      setRecommendationsError('Please login first');
      return;
    }

    setIsLoadingRecommendations(true);
    setRecommendationsError(null);

    try {
      const response = await fetch('http://localhost:8000/api/recommendations?top_n=12', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();

      if (response.ok) {
        setRecommendations(result.recommendations || []);
        if (result.message) {
          setRecommendationsError(result.message);
        }
      } else {
        if (response.status === 401) {
          handleLogout();
          setRecommendationsError('Session expired. Please login again.');
        } else {
          setRecommendationsError(`Failed to get recommendations: ${result.detail || 'Please try again.'}`);
        }
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
      setRecommendationsError('Failed to get recommendations. Please check if the backend server is running.');
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Movie Recommendation Engine
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to upload your movie ratings and get personalized recommendations
              </p>
            </div>

            {/* Auth Form */}
            <AuthForm onLogin={handleLogin} onRegister={handleRegister} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Welcome back, {currentUser?.username}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser?.email}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          <MovieCarousel />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Upload Ratings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Upload your movie ratings to get personalized recommendations
              </p>
              <a
                href="/upload"
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded transition-colors"
              >
                Upload CSV
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                View Films
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Browse and get your personalized movie recommendations
              </p>
              <a
                href="/films"
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded transition-colors"
              >
                Get Recommendations
              </a>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                My Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Manage your profile and account settings
              </p>
              <a
                href="/account"
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded transition-colors"
              >
                View Profile
              </a>
            </div>
          </div>

          {/* Recent Recommendations Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Recommendations
              </h3>
              <button
                onClick={handleGetRecommendations}
                disabled={isLoadingRecommendations}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isLoadingRecommendations
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoadingRecommendations ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {recommendationsError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{recommendationsError}</p>
              </div>
            )}

            {recommendations.length > 0 ? (
              <div className="space-y-4">
                {/* Source Movies Summary */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Based on your ratings of:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(recommendations.map(r => 
                      Array.isArray(r.source_movies) ? r.source_movies : [r.source_movies]
                    ).flat())).slice(0, 5).map((sourceMovie, index) => (
                      <span
                        key={index}
                        className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {sourceMovie}
                      </span>
                    ))}
                    {Array.from(new Set(recommendations.map(r => 
                      Array.isArray(r.source_movies) ? r.source_movies : [r.source_movies]
                    ).flat())).length > 5 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{Array.from(new Set(recommendations.map(r => 
                          Array.isArray(r.source_movies) ? r.source_movies : [r.source_movies]
                        ).flat())).length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Movie Recommendations */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.slice(0, 6).map((rec, index) => (
                    <div key={rec.movie_id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        {rec.poster_path && (
                          <div className="flex-shrink-0 w-16 aspect-[2/3] overflow-hidden rounded">
                            <img
                              src={`https://image.tmdb.org/t/p/w200${rec.poster_path}`}
                              alt={rec.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                                                  <h4 className="font-medium text-gray-900 dark:text-white">
                          {index + 1}. {rec.title}
                          {rec.cluster_id && (
                            <span className="ml-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded text-xs font-medium">
                              C{rec.cluster_id}
                            </span>
                          )}
                        </h4>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <p>Rating: ⭐ {rec.vote_average.toFixed(1)}</p>
                            <p>Score: {rec.weighted_score.toFixed(2)}</p>
                            {/* Source Movies for this recommendation */}
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Based on:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {Array.isArray(rec.source_movies) ? 
                                  (rec.source_movies as string[]).slice(0, 2).map((source: string, idx: number) => (
                                    <span
                                      key={idx}
                                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded text-xs"
                                    >
                                      {source}
                                    </span>
                                  ))
                                  : 
                                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1 py-0.5 rounded text-xs">
                                    {rec.source_movies}
                                  </span>
                                }
                                {Array.isArray(rec.source_movies) && (rec.source_movies as string[]).length > 2 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    +{(rec.source_movies as string[]).length - 2} more
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upload some movie ratings to see your personalized recommendations.
              </p>
            )}

            {recommendations.length > 0 && (
              <div className="mt-4 text-center">
                <a
                  href="/films"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  View all recommendations →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
