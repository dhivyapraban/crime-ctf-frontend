const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

export interface LoginResponse {
  success: boolean;
  token: string;
  role?: string;
  user: {
    username: string;
  };
}

export interface ErrorResponse {
  error: string;
}

// Detective API
export const detectiveAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/detective/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/detective/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  },

  logout: async (navigate?: (path: string) => void) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/detective/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Continue with client-side logout even if server request fails
        console.error('Logout request failed:', error);
      }
    }

    // Remove token and user data from client storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('detectiveData');

    // Redirect to role selection after logout
    if (navigate) {
      navigate('/role-selection');
    }
  },
};

// Chief API
export const chiefAPI = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/chief/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  },

  getProfile: async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/chief/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: ErrorResponse = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  },

  logout: async (navigate?: (path: string) => void) => {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/chief/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        // Continue with client-side logout even if server request fails
        console.error('Logout request failed:', error);
      }
    }

    // Remove token and user data from client storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    sessionStorage.removeItem('chiefData');

    // Redirect to role selection after logout
    if (navigate) {
      navigate('/role-selection');
    }
  },
};
