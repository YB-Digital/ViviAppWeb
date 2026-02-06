import { Cart } from "@/types";

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
  let responseBody: any = null;
  try {
    responseBody = await response.clone().json();
  } catch (e) {
    responseBody = await response.clone().text();
  }
  if (!response.ok || (responseBody && responseBody.success === false)) {
    console.error('API ERROR:', {
      url: `${API_BASE_URL}${endpoint}`,
      status: response.status,
      statusText: response.statusText,
      body: responseBody,
      message: responseBody?.message,
    });
    const error = new Error(responseBody?.message || 'Request failed');
    (error as any).status = response.status;
    (error as any).body = responseBody;
    throw error;
  }
  return responseBody;
};

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest<{ data: {token: string}; user: { id: string; fullName: string; email: string; username: string; phoneNumber: string; city: string } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { fullName: string; email: string; username: string; phoneNumber: string; password: string; city: string }) =>
    apiRequest<{ token: string; user: { id: string; fullName: string; email: string; username: string; phoneNumber: string; city: string } }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  googleAuth: (idToken: string) =>
    apiRequest<{ token: string; user: { id: string; name: string; email: string } }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  forgotPassword: (email: string) =>
    apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  logout: () => {
    setAuthToken(null);
  },
};

// Courses API
export const coursesAPI = {
  getAll: async () => {
    const response = await apiRequest<{ success: boolean; message: string; data: CourseResponse }[]>('/api/courses/getall');
    return response;
  },

  getById: (id: string) =>
    apiRequest<{ course: CourseDetailResponse }>(`/courses/${id}`),

  getLessons: (courseId: string) =>
    apiRequest<{ lessons: LessonResponse[] }>(`/courses/${courseId}/lessons`),

  getVideoUrl: (courseId: string, lessonId: string) =>
    apiRequest<{ url: string; token: string }>(`/courses/${courseId}/lessons/${lessonId}/video`),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiRequest<{ user: UserResponse }>('/user/profile'),

  getUser: async () => {
    const response = await apiRequest<{ data: UserResponse }>('/api/users/me');
    return response.data;
  },

  getPurchasedCourses: () =>
    apiRequest<{ courses: CourseResponse[] }>('/user/courses'),

  getFavorites: () =>
    apiRequest<{ courses: CourseResponse[] }>('/user/favorites'),

  addFavorite: (courseId: string) =>
    apiRequest<{ message: string }>(`/user/favorites/${courseId}`, { method: 'POST' }),

  removeFavorite: (courseId: string) =>
    apiRequest<{ message: string }>(`/user/favorites/${courseId}`, { method: 'DELETE' }),

  getLessonProgress: (courseId: string, lessonId: string) =>
    apiRequest<{ progress: number; completed: boolean }>(`/user/courses/${courseId}/lessons/${lessonId}/progress`),

  updateLessonProgress: (courseId: string, lessonId: string, progress: number) =>
    apiRequest<{ message: string }>(`/user/courses/${courseId}/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ progress }),
    }),
};

// Cart & Payment API
export const paymentAPI = {
  createPaymentIntent: (amount: number, currency: string, courseList: string[]) =>
    apiRequest<{ clientSecret: string; intentId: string }>(
      '/api/payment/intent',
      {
        method: 'POST',
        body: JSON.stringify({ amount, currency, courseList }),
      }
    ),

  createCheckoutSession: (courseIds: string[]) =>
    apiRequest<{ sessionId: string; url: string }>('/payment/checkout', {
      method: 'POST',
      body: JSON.stringify({ courseIds }),
    }),

  verifyPayment: (sessionId: string) =>
    apiRequest<{ success: boolean; courses: CourseResponse[] }>(`/payment/verify/${sessionId}`),
};


// Cart API
export const cartAPI = {
  createCart: (courseList: string[], amount: number) =>
    apiRequest<Cart>(`/api/cart/create?amount=${amount}`, {
      method: 'POST',
      body: JSON.stringify(courseList),
    }),

  getActiveCart: (cartId: string) =>
    apiRequest<Cart>(`/api/cart/${cartId}`),

  markPaid: (cartId: string) =>
    apiRequest<void>(`/api/cart/${cartId}/paid`, { method: 'POST' }),

  startStripePayment: (cartId: string) =>
    apiRequest<string>(`/api/cart/${cartId}/payment/start`, { method: 'POST' }),

  addCourseToCart: (courseId: string) =>
    apiRequest<Cart>(`/api/cart/add/${courseId}`, { method: 'POST' }),
};

// Response Types
interface CourseResponse {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number;
  reviewCount: number;
  thumbnail?: string;
  description?: string;
  language?: string;
  isFavorite?: boolean;
  isPurchased?: boolean;
}

interface CourseDetailResponse extends CourseResponse {
  lessons: LessonResponse[];
}

interface LessonResponse {
  id: string;
  title: string;
  duration: string;
  order: number;
  isPreview?: boolean;
  isCompleted?: boolean;
  progress?: number;
}

interface UserResponse {
  id: string;
  name: string;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
}

