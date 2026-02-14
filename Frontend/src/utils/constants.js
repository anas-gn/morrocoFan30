// URL de base de ton API Spring Boot
export const API_BASE_URL = 'http://localhost:8080/api';

export const ENDPOINTS = {
  CITIES: {
    GET_ALL: '/cities/all',
    GET_BY_ID: (id) => `/cities/${id}`,
    ADD: '/cities/add',
    UPDATE: (id) => `/cities/update/${id}`,
    DELETE: (id) => `/cities/delete/${id}`,
    HOTELS: (id) => `/cities/${id}/hotels`,
    ATTRACTIONS: (id) => `/cities/${id}/attractions`,
    STADES: (id) => `/cities/${id}/stades`,
  }
};