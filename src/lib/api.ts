import { Cart } from "@/types";

export type UserGetMeResponse = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

export type LoginResponse = {
 data: {
   token: string;
 }
};

export type RegisterResponse = {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
};

// API Configuration
// Replace with your actual backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.viviacademy.xyz';

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('vivi_token', token);
  } else {
    localStorage.removeItem('vivi_token');
  }
};

export const getAuthToken = (): string | null => {
  if (authToken) return authToken;
  if (typeof window !== 'undefined') {
    return localStorage.getItem('vivi_token');
  }
  return null;
};

// API Helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  // DEBUG: Header ve token logu
  if (endpoint.includes('/payment/intent')) {
    console.log('[API DEBUG] Token:', token);
    console.log('[API DEBUG] Headers:', headers);
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  let responseBody: unknown = null;
  try {
    responseBody = await response.clone().json();
  } catch {
    responseBody = await response.clone().text();
  }
  // type guard ile responseBody'nin object olup olmadığını kontrol et
  if (
    !response.ok ||
    (typeof responseBody === 'object' && responseBody !== null && 'success' in responseBody && (responseBody as { success: boolean }).success === false)
  ) {
    const message = typeof responseBody === 'object' && responseBody !== null && 'message' in responseBody
      ? (responseBody as { message?: string }).message
      : undefined;
    console.error('API ERROR:', {
      url: `${API_BASE_URL}${endpoint}`,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      message,
    });
    const error = new Error(message || 'Request failed');
    (error as Error & { status?: number; body?: unknown }).status = response.status;
    (error as Error & { status?: number; body?: unknown }).body = responseBody;
    throw error;
  }
  return responseBody as T;
};

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }): Promise<LoginResponse> =>
    apiRequest<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  register: (data: { fullName: string; email: string; username: string; phoneNumber: string; password: string; city: string }): Promise<RegisterResponse> =>
    apiRequest<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  googleSuccess: () =>
    apiRequest('/api/auth/google-success', { method: 'GET' }),
  forgotPassword: (data: { email: string; isMobile?: boolean }) =>
    apiRequest('/api/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetPassword: (token: string, data: { password: string; againPassword: string }) =>
    apiRequest(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  logout: () => {
    setAuthToken(null);
  },
};

// Courses API
export const coursesAPI = {
  getAll: (): Promise<any[]> => apiRequest<any[]>('/api/courses/getall'),
  getById: (id: string) => apiRequest(`/api/courses/${id}`),
  create: (data: Record<string, unknown>) => apiRequest('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/api/courses/${id}`, { method: 'DELETE' }),
  getByUserId: (userId: string) => apiRequest(`/api/courses?userId=${userId}`),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('/api/users/profile'),
  updateProfile: (data: Record<string, unknown>) => apiRequest('/api/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  createProfile: (data: Record<string, unknown>) => apiRequest('/api/users/profile', { method: 'POST', body: JSON.stringify(data) }),
  getMe: (): Promise<UserGetMeResponse> => apiRequest<UserGetMeResponse>('/api/users/me'),
  getById: (id: string) => apiRequest(`/api/users/${id}`),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/api/users/${id}`, { method: 'DELETE' }),
  verify: (id: string) => apiRequest(`/api/users/${id}/verify`, { method: 'PUT' }),
};


// Payment API
export const paymentAPI = {
  createPaymentIntent: (cartId: string, data: Record<string, unknown>, token: string) =>
    apiRequest(`/api/payment/${cartId}/intent`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    }),
  createCheckoutSession: (userId: string) =>
    apiRequest(`/api/checkout/?userId=${userId}`, { method: 'POST' }),
  startStripePayment: () => apiRequest('/api/cart/payment/start', { method: 'POST' }),
  markCartPaid: () => apiRequest('/api/cart/paid', { method: 'POST' }),
};


// Cart API
export const cartAPI = {
  createCart: (amount: number, courseIds: string[]): Promise<Cart> =>
    apiRequest('/api/cart/create?amount=' + amount, {
      method: 'POST',
      body: JSON.stringify(courseIds),
    }),
  addToCart: (courseId: string) =>
    apiRequest(`/api/cart/add/${courseId}`, { method: 'POST' }),
  getMyActiveCart: (): Promise<Cart> => apiRequest('/api/cart'),
};
// Favorites API
export const favoritesAPI = {
  getFavorites: () => apiRequest('/api/favorites'),
  addFavorite: (courseId: string) => apiRequest('/api/favorites/add', { method: 'POST', body: JSON.stringify({ courseId }) }),
  removeFavorite: (courseId: string) => apiRequest(`/api/favorites/remove/${courseId}`, { method: 'DELETE' }),
  isFavorite: (courseId: string) => apiRequest(`/api/favorites/check/${courseId}`),
};

// User Preferences API
export const userPreferencesAPI = {
  getPreferences: () => apiRequest('/api/v1/user-preferences/get'),
  updatePreferences: (data: Record<string, unknown>) => apiRequest('/api/v1/user-preferences/update', { method: 'PUT', body: JSON.stringify(data) }),
};

// Category API
export const categoryAPI = {
  getAll: () => apiRequest('/api/categories/getall'),
  getById: (id: string) => apiRequest(`/api/categories/${id}`),
  create: (data: Record<string, unknown>) => apiRequest('/api/admin/category', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/admin/category/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiRequest(`/api/admin/category/${id}`, { method: 'DELETE' }),
};

// Video API
export const videoAPI = {
  getAll: () => apiRequest('/api/videos'),
  getById: (id: string) => apiRequest(`/api/videos/${id}`),
  upload: (data: Record<string, unknown>, params: { title: string; description: string; videoAltBaslik?: string; videoSections?: string[]; thumbnailUrl?: string; categoryId?: string }) => {
    const stringParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value === 'undefined') return;
      if (Array.isArray(value)) {
        stringParams[key] = value.join(',');
      } else {
        stringParams[key] = String(value);
      }
    });
    const query = new URLSearchParams(stringParams).toString();
    return apiRequest(`/api/videos/upload?${query}`, { method: 'POST', body: JSON.stringify(data) });
  },
  delete: (id: string) => apiRequest(`/api/videos/${id}`, { method: 'DELETE' }),
};

// Certificate API
export const certificateAPI = {
  upload: (data: Record<string, unknown>) => apiRequest('/api/certificates/upload', { method: 'POST', body: JSON.stringify(data) }),
  getById: (id: string) => apiRequest(`/api/certificates/${id}`),
  delete: (id: string) => apiRequest(`/api/certificates/${id}`, { method: 'DELETE' }),
};

// Admin API
export const adminAPI = {
  sendNotification: (data: Record<string, unknown>) => apiRequest('/api/admin/send-notification', { method: 'POST', body: JSON.stringify(data) }),
};


