const API_BASE = '/api/ai-advisor';

export const aiAdvisorService = {
  analyzeFace: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Analysis failed');
    }

    return data;
  },

  getFaceShapes: async () => {
    const response = await fetch(`${API_BASE}/face-shapes`);
    const data = await response.json();
    return data.face_shapes;
  },

  getRecommendationsByShape: async (faceShape) => {
    const response = await fetch(`${API_BASE}/recommendations/${faceShape}`);
    const data = await response.json();
    return data.recommendations;
  },

  getHistory: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/history`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.history;
  },

  getUserRecommendations: async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE}/recommendations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data.recommendations;
  },
};