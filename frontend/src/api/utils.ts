import axios from 'axios';

import type { ApiErrorResponse } from '../types/api';

export function ApiErrorHandler(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data as ApiErrorResponse;
  }
  return { errors: ['An unexpected error occurred. Please try again later.'] };
}

export function handleAuthenticationSuccess(token: string) {
  localStorage.setItem('authToken', token);
  // Set the token in axios default headers for future requests
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}
