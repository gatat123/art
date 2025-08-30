import axios from 'axios';

// API 클라이언트 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://art-production-a9ab.up.railway.app/api'
    : 'http://localhost:3001/api');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new ApiError(response.status, error.error || 'Unknown error');
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: async (data: { username: string; email: string; password: string }) => {
    const result = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  login: async (data: { username: string; password: string }) => {
    const result = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    return result;
  },

  verify: async () => {
    return fetchWithAuth('/auth/verify');
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
};

// Studios API
export const studiosApi = {
  list: async () => {
    return fetchWithAuth('/studios');
  },

  get: async (id: string) => {
    return fetchWithAuth(`/studios/${id}`);
  },

  create: async (data: { name: string; description?: string }) => {
    return fetchWithAuth('/studios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { name?: string; description?: string }) => {
    return fetchWithAuth(`/studios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/studios/${id}`, {
      method: 'DELETE',
    });
  },

  addMember: async (studioId: string, data: { userId: string; role?: string }) => {
    return fetchWithAuth(`/studios/${studioId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Projects API
export const projectsApi = {
  list: async (studioId?: string) => {
    const query = studioId ? `?studio_id=${studioId}` : '';
    return fetchWithAuth(`/projects${query}`);
  },

  get: async (id: string) => {
    return fetchWithAuth(`/projects/${id}`);
  },

  create: async (data: { 
    studio_id: string; 
    title: string; 
    description?: string; 
    deadline?: string 
  }) => {
    return fetchWithAuth('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { 
    title?: string; 
    description?: string; 
    status?: string; 
    deadline?: string 
  }) => {
    return fetchWithAuth(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/projects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Scenes API
export const scenesApi = {
  list: async (projectId: string) => {
    return fetchWithAuth(`/scenes?project_id=${projectId}`);
  },

  get: async (id: string) => {
    return fetchWithAuth(`/scenes/${id}`);
  },

  create: async (data: { 
    project_id: string; 
    scene_number: number; 
    title?: string; 
    description?: string; 
    dialogue?: string; 
    action_description?: string 
  }) => {
    return fetchWithAuth('/scenes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { 
    title?: string; 
    description?: string; 
    dialogue?: string; 
    action_description?: string; 
    status?: string 
  }) => {
    return fetchWithAuth(`/scenes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/scenes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Images API
export const imagesApi = {
  upload: async (data: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    const token = localStorage.getItem('authToken');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/images/upload`, data, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        onUploadProgress: onUploadProgress,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new ApiError(error.response.status, error.response.data?.error || 'Upload failed');
      }
      throw new Error('Network error');
    }
  },

  uploadImage: async (data: FormData, onUploadProgress?: (progressEvent: any) => void) => {
    return imagesApi.upload(data, onUploadProgress);
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/images/${id}`, {
      method: 'DELETE',
    });
  },
};

// Comments API
export const commentsApi = {
  list: async (sceneId: string) => {
    return fetchWithAuth(`/comments?scene_id=${sceneId}`);
  },

  create: async (data: { 
    scene_id: string; 
    content: string; 
    parent_id?: string;
    annotation_data?: string;
    image_type?: string;
    tag?: string;
  }) => {
    return fetchWithAuth('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: { 
    content?: string;
    resolved?: boolean;
    tag?: string;
  }) => {
    return fetchWithAuth(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  toggleResolve: async (id: string) => {
    return fetchWithAuth(`/comments/${id}/resolve`, {
      method: 'PATCH',
    });
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

// Users API
export const usersApi = {
  profile: async () => {
    return fetchWithAuth('/users/profile');
  },

  activity: async () => {
    return fetchWithAuth('/users/activity');
  },
};

export default {
  auth: authApi,
  studios: studiosApi,
  projects: projectsApi,
  scenes: scenesApi,
  images: imagesApi,
  comments: commentsApi,
  users: usersApi,
};
