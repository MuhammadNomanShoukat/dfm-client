import axios from 'axios';

const apiRoot = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export const api = axios.create({
  baseURL: apiRoot ? `${apiRoot}/api` : '/api',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const farmId = localStorage.getItem('herdos_farm');
  if (farmId) {
    config.headers['X-Farm-Id'] = farmId;
  }
  return config;
});

export function setActiveFarm(farmId: string | null): void {
  if (farmId) {
    localStorage.setItem('herdos_farm', farmId);
  } else {
    localStorage.removeItem('herdos_farm');
  }
}

export function getActiveFarm(): string | null {
  return localStorage.getItem('herdos_farm');
}
