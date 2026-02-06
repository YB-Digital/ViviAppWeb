// User Model
export interface User {
  id: string;
  name: string;
  email: string;
  role?: "student";
}

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  imagePath: string;
  price: number;
  rating: number;
  reviewCount: number;
  star: number;
  commentNumber: number;
  isFavorite: boolean;
  targetAudience: string[];
  trainerName: string;
  userId: string;
  videoIds: string[];
}

export interface CourseContent {
  id: string;
  title: string;
  duration?: string;
}

// Cart Model
export interface Cart {
  id: string;
  items: Course[];
  subtotal: number;
}

// Category Model
export interface Category {
  id: string;
  name: string;
  icon?: string;
}

