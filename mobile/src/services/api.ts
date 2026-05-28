import axios from 'axios';
import Constants from 'expo-constants';
import { useAuthStore } from '../store/auth.store';

// Em celular físico "localhost" aponta pro próprio celular.
// debuggerHost é o IP do Mac onde o Metro está rodando (ex: 10.65.154.171:8081).
// Extraímos só o IP e trocamos a porta para 8080 (backend).
// Fallback para localhost quando rodar em emulador/web.
const debuggerHost = Constants.expoConfig?.hostUri ?? Constants.manifest2?.extra?.expoGo?.debuggerHost;
const hostIP = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';

export const API_BASE_URL = `http://${hostIP}:8080/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
