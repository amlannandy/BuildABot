import axios from 'axios';

import { LOCAL_STORAGE_KEYS } from '@constants/localStorage';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN) || ''}`,
  },
});

export default apiClient;
