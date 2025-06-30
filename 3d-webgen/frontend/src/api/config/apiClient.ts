import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://129.146.48.166:8000';

// 🔐 Gestione token
const getAccessToken = () => localStorage.getItem('accessToken');
const getRefreshToken = () => localStorage.getItem('refreshToken');
const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};
const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

// 🕐 Utility per verificare scadenza token
const isTokenExpiringSoon = (token: string, minutesBeforeExpiry = 5): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    
    const expTime = payload.exp * 1000;
    const now = Date.now();
    const timeUntilExpiry = expTime - now;
    const warningTime = minutesBeforeExpiry * 60 * 1000;
    
    return timeUntilExpiry < warningTime;
  } catch (error) {
    return true; // Se non riesco a decodificare, considero scaduto
  }
};

// 🔄 Rinnovo token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('❌ No refresh token available');
    throw new Error('No refresh token available');
  }
  
  console.log('🔄 Tentativo refresh token...');
  
  try {
    const response = await axios.post(`${API_URL}/api/users/token/refresh/`, {
      refresh: refreshToken
    });
    
    console.log('✅ Token rinnovato con successo');
    
    // Se il backend restituisce anche un nuovo refresh token, aggiornalo
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    
    return response.data.access;
  } catch (error) {
    console.log('❌ Refresh token fallito:', error.response?.data);
    throw error;
  }
};

// 📡 Client axios configurato
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 📤 Request interceptor - con refresh preventivo
apiClient.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    
    if (token) {
      // Controlla se il token sta per scadere e rinnovalo preventivamente
      if (isTokenExpiringSoon(token)) {
        try {
          console.log('🔄 Refresh preventivo del token...');
          const newToken = await refreshAccessToken();
          localStorage.setItem('accessToken', newToken);
          config.headers.Authorization = `Bearer ${newToken}`;
        } catch (error) {
          console.log('❌ Refresh preventivo fallito, procedo con token esistente');
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// 📥 Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('🔍 Ricevuto 401, tentativo refresh...');
      
      try {
        const newAccessToken = await refreshAccessToken();
        localStorage.setItem('accessToken', newAccessToken);
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        console.log('❌ Refresh fallito, redirect al login');
        clearTokens();
        
        // Evita redirect multipli se siamo già nella pagina di auth
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// 🎯 Hook personalizzato per verificare autenticazione
export const useTokenValidation = () => {
  const checkTokenValidity = async (): Promise<boolean> => {
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    
    if (!token || !refreshToken) {
      return false;
    }
    
    try {
      // Se il token sta per scadere, rinnovalo
      if (isTokenExpiringSoon(token)) {
        await refreshAccessToken();
      }
      return true;
    } catch (error) {
      clearTokens();
      return false;
    }
  };
  
  return { checkTokenValidity };
};

// 🚀 Funzione di inizializzazione per verificare token all'avvio
export const initializeAuth = async (): Promise<boolean> => {
  const token = getAccessToken();
  const refreshToken = getRefreshToken();
  
  if (!token || !refreshToken) {
    return false;
  }
  
  try {
    // Verifica se il token è ancora valido o se può essere rinnovato
    if (isTokenExpiringSoon(token, 1)) { // Rinnova se scade entro 1 minuto
      console.log('🔄 Inizializzazione: rinnovo token...');
      const newToken = await refreshAccessToken();
      localStorage.setItem('accessToken', newToken);
    }
    return true;
  } catch (error) {
    console.log('❌ Inizializzazione fallita, token non validi');
    clearTokens();
    return false;
  }
};

// Esporta anche le utility
export { setTokens, clearTokens, isTokenExpiringSoon };