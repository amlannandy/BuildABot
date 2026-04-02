import axios from 'axios';

import type { ApiErrorResponse } from '../types/api';

export function ApiErrorHandler(error: unknown): ApiErrorResponse {
  if (axios.isAxiosError(error) && error.response) {
    return error.response.data as ApiErrorResponse;
  }
  return { errors: ['An unexpected error occurred. Please try again later.'] };
}
