const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Cases API
export const casesAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/cases`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch cases');
    return response.json();
  },

  add: async (caseData: any) => {
    const response = await fetch(`${API_BASE_URL}/cases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(caseData),
    });
    if (!response.ok) throw new Error('Failed to add case');
    return response.json();
  },

  update: async (id: string, caseData: any) => {
    const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(caseData),
    });
    if (!response.ok) throw new Error('Failed to update case');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete case');
    return response.json();
  },

  releaseHint: async (caseId: string, hintId: string) => {
    const response = await fetch(`${API_BASE_URL}/cases/${caseId}/hints/${hintId}/release`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to release hint');
    return response.json();
  },
};

// Game State API
export const gameAPI = {
  getState: async () => {
    const response = await fetch(`${API_BASE_URL}/game`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch game state');
    return response.json();
  },

  updateState: async (stateData: any) => {
    const response = await fetch(`${API_BASE_URL}/game`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stateData),
    });
    if (!response.ok) throw new Error('Failed to update game state');
    return response.json();
  },

  startContest: async (timerSeconds: number) => {
    const response = await fetch(`${API_BASE_URL}/game/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ timerSeconds }),
    });
    if (!response.ok) throw new Error('Failed to start contest');
    return response.json();
  },

  stopContest: async () => {
    const response = await fetch(`${API_BASE_URL}/game/stop`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to stop contest');
    return response.json();
  },
};

// Leaderboard API
export const leaderboardAPI = {
  get: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch leaderboard');
    return response.json();
  },

  getMyScore: async () => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/my-score`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch score');
    return response.json();
  },

  submitSolution: async (caseId: string, flag: string) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ caseId, flag }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to submit solution');
    }
    return data;
  },

  useHint: async (caseId: string, hintId: string) => {
    const response = await fetch(`${API_BASE_URL}/leaderboard/use-hint`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ caseId, hintId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to use hint');
    }
    return response.json();
  },
};
