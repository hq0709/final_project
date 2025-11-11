// GameTracker Pro API Client

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Types
export interface User {
  userId: number;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  country: string;
  totalAchievements: number;
  totalPlaytimeHours: number;
  accountCreated: string;
  lastLogin?: string;
}

export interface Game {
  gameId: number;
  title: string;
  description: string;
  releaseDate: string;
  developer: string;
  publisher: string;
  coverImageUrl?: string;
  totalAchievements: number;
  avgCompletionTimeHours: number;
  metacriticScore: number;
}

export interface Achievement {
  achievementId: number;
  gameId: number;
  title: string;
  description: string;
  iconUrl?: string;
  points: number;
  rarityPercentage: number;
  isHidden: boolean;
}

export interface Review {
  reviewId: number;
  userId: number;
  gameId: number;
  rating: number;
  reviewText: string;
  helpfulCount: number;
  likesCount: number;
  repliesCount: number;
  createdDate: string;
  updatedDate?: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
  gameTitle?: string;
}

export interface ReviewReply {
  replyId: number;
  reviewId: number;
  userId: number;
  replyText: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
}

export interface Activity {
  activityId: number;
  userId: number;
  activityType: string;
  gameId?: number;
  reviewId?: number;
  activityText: string;
  createdAt: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  gameTitle?: string;
  gameCoverUrl?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
  country: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Helper function to get auth token
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

// Helper function to set auth token
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('authToken', token);
}

// Helper function to remove auth token
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('authToken');
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'An error occurred',
    }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>('/auth/me');
  },

  health: async (): Promise<{ service: string; version: string; status: string }> => {
    return apiRequest('/auth/health');
  },
};

// Games API
export const gamesAPI = {
  getAll: async (page: number = 0, size: number = 20): Promise<Game[]> => {
    return apiRequest<Game[]>(`/games?page=${page}&size=${size}`);
  },

  getById: async (id: number): Promise<Game> => {
    return apiRequest<Game>(`/games/${id}`);
  },

  search: async (query: string, page: number = 0, size: number = 20): Promise<Game[]> => {
    return apiRequest<Game[]>(`/games/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  },

  getAchievements: async (gameId: number): Promise<Achievement[]> => {
    return apiRequest<Achievement[]>(`/games/${gameId}/achievements`);
  },

  getPlatforms: async (gameId: number): Promise<any[]> => {
    return apiRequest<any[]>(`/games/${gameId}/platforms`);
  },
};

// User API (placeholder for future implementation)
export const userAPI = {
  getProfile: async (userId: number): Promise<User> => {
    return apiRequest<User>(`/users/${userId}`);
  },

  updateProfile: async (userId: number, data: Partial<User>): Promise<User> => {
    return apiRequest<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Library API
export const libraryAPI = {
  // Get user's game library
  getUserLibrary: async (): Promise<any[]> => {
    return apiRequest<any[]>('/library');
  },

  // Add game to library (accepts object with gameId, status, etc.)
  addGameToLibrary: async (data: {
    gameId: number;
    status?: string;
    platformId?: number;
    playtimeHours?: number;
    completionPercentage?: number;
  }): Promise<any> => {
    return apiRequest<any>('/library', {
      method: 'POST',
      body: JSON.stringify({
        gameId: data.gameId,
        platformId: data.platformId || 1, // Default to Steam
        status: data.status || 'owned',
        playtimeHours: data.playtimeHours || 0,
        completionPercentage: data.completionPercentage || 0,
      }),
    });
  },

  // Check if game is in library
  checkGameInLibrary: async (gameId: number): Promise<any> => {
    return apiRequest<any>(`/library/check/${gameId}`);
  },

  // Update game in library
  updateGameInLibrary: async (userGameId: number, data: any): Promise<any> => {
    return apiRequest<any>(`/library/${userGameId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Remove game from library by gameId
  removeGameFromLibraryByGameId: async (gameId: number): Promise<any> => {
    // First check to get userGameId
    const checkResult = await apiRequest<any>(`/library/check/${gameId}`);
    if (checkResult.userGameId) {
      return apiRequest<any>(`/library/${checkResult.userGameId}`, {
        method: 'DELETE',
      });
    }
    throw new Error('Game not found in library');
  },

  // Remove game from library by userGameId
  removeGameFromLibrary: async (userGameId: number): Promise<any> => {
    return apiRequest<any>(`/library/${userGameId}`, {
      method: 'DELETE',
    });
  },

  // Get library statistics
  getLibraryStats: async (): Promise<any> => {
    return apiRequest<any>('/library/stats');
  },
};

// Achievements API
export const achievementsAPI = {
  // Get all achievements for a game
  getGameAchievements: async (gameId: number): Promise<any[]> => {
    return apiRequest<any[]>(`/achievements/game/${gameId}`);
  },

  // Get user's achievements for a game
  getUserGameAchievements: async (gameId: number): Promise<any[]> => {
    return apiRequest<any[]>(`/achievements/game/${gameId}/user`);
  },

  // Get achievement progress for a game
  getAchievementProgress: async (gameId: number): Promise<any> => {
    return apiRequest<any>(`/achievements/game/${gameId}/progress`);
  },

  // Unlock an achievement
  unlockAchievement: async (achievementId: number): Promise<any> => {
    return apiRequest<any>(`/achievements/${achievementId}/unlock`, {
      method: 'POST',
    });
  },

  // Get recent achievements
  getRecentAchievements: async (limit: number = 10): Promise<any[]> => {
    return apiRequest<any[]>(`/achievements/recent?limit=${limit}`);
  },

  // Get rarest achievements
  getRarestAchievements: async (limit: number = 10): Promise<any[]> => {
    return apiRequest<any[]>(`/achievements/rarest?limit=${limit}`);
  },

  // Get all user achievements
  getUserAchievements: async (): Promise<any[]> => {
    return apiRequest<any[]>(`/achievements/user`);
  },
};

// Reviews API
export const reviewsAPI = {
  // Get reviews for a game
  getGameReviews: async (gameId: number, page: number = 0, size: number = 10): Promise<any> => {
    return apiRequest<any>(`/reviews/game/${gameId}?page=${page}&size=${size}`);
  },

  // Get user's reviews
  getUserReviews: async (): Promise<any[]> => {
    return apiRequest<any[]>('/reviews/user');
  },

  // Create a review
  createReview: async (data: any): Promise<any> => {
    return apiRequest<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update a review
  updateReview: async (reviewId: number, data: any): Promise<any> => {
    return apiRequest<any>(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete a review
  deleteReview: async (reviewId: number): Promise<any> => {
    return apiRequest<any>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },

  // Vote on a review
  voteReview: async (reviewId: number, helpful: boolean): Promise<any> => {
    return apiRequest<any>(`/reviews/${reviewId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ helpful }),
    });
  },

  // Like a review
  likeReview: async (reviewId: number): Promise<any> => {
    return apiRequest<any>(`/reviews/${reviewId}/like`, {
      method: 'POST',
    });
  },

  // Unlike a review
  unlikeReview: async (reviewId: number): Promise<any> => {
    return apiRequest<any>(`/reviews/${reviewId}/like`, {
      method: 'DELETE',
    });
  },

  // Check if user liked a review
  checkLiked: async (reviewId: number): Promise<{ liked: boolean; likesCount: number }> => {
    return apiRequest<{ liked: boolean; likesCount: number }>(`/reviews/${reviewId}/liked`);
  },

  // Get review replies
  getReplies: async (reviewId: number): Promise<ReviewReply[]> => {
    return apiRequest<ReviewReply[]>(`/reviews/${reviewId}/replies`);
  },

  // Add a reply to a review
  addReply: async (reviewId: number, replyText: string): Promise<ReviewReply> => {
    return apiRequest<ReviewReply>(`/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ replyText }),
    });
  },

  // Delete a reply
  deleteReply: async (replyId: number): Promise<any> => {
    return apiRequest<any>(`/reviews/replies/${replyId}`, {
      method: 'DELETE',
    });
  },
};

// Activities API
export const activitiesAPI = {
  // Get recent community activities
  getRecentActivities: async (limit: number = 20, type?: string): Promise<Activity[]> => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (type) params.append('type', type);
    return apiRequest<Activity[]>(`/activities?${params.toString()}`);
  },

  // Get user's activities
  getUserActivities: async (userId: number): Promise<Activity[]> => {
    return apiRequest<Activity[]>(`/activities/user/${userId}`);
  },

  // Get current user's activities
  getMyActivities: async (): Promise<Activity[]> => {
    return apiRequest<Activity[]>('/activities/me');
  },

  // Get activities for a game
  getGameActivities: async (gameId: number): Promise<Activity[]> => {
    return apiRequest<Activity[]>(`/activities/game/${gameId}`);
  },
};

