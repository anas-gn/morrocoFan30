import { API_BASE_URL, ENDPOINTS } from './constants';

// Fonction générique pour les appels API
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Pour les DELETE qui retournent boolean
    if (method === 'DELETE') {
      return await response.json();
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// CITIES API
export const citiesAPI = {
  // Récupérer toutes les villes
  getAll: () => apiCall(ENDPOINTS.CITIES.GET_ALL),

  // Récupérer une ville par ID
  getById: (id) => apiCall(ENDPOINTS.CITIES.GET_BY_ID(id)),

  // Ajouter une ville
  add: (cityData) => apiCall(ENDPOINTS.CITIES.ADD, 'POST', cityData),

  // Mettre à jour une ville
  update: (id, cityData) => apiCall(ENDPOINTS.CITIES.UPDATE(id), 'PUT', cityData),

  // Supprimer une ville
  delete: (id) => apiCall(ENDPOINTS.CITIES.DELETE(id), 'DELETE'),

  // Récupérer les hôtels d'une ville
  getHotels: (id) => apiCall(ENDPOINTS.CITIES.HOTELS(id)),

  // Récupérer les attractions d'une ville
  getAttractions: (id) => apiCall(ENDPOINTS.CITIES.ATTRACTIONS(id)),

  // Récupérer les stades d'une ville
  getStades: (id) => apiCall(ENDPOINTS.CITIES.STADES(id)),
};