// User Model
export interface User {
  id: string;
  name: string;
  email: string;
  role: "studennt";
}

export interface Course {
  id: string;
  title: string;
  author: string;
  price: number;
  rating: number;
  reviewCount: number;
  isFavorite: boolean;
  image?: string;
  description?: string;
  language?: string;
  contents?: CourseContent[];
}

export interface CourseContent {
  id: string;
  title: string;
  duration?: string;
}

// Cart Model
export interface Cart {
  items: Course[];
  subtotal: number;
}

// Category Model
export interface Category {
  id: string;
  name: string;
  icon?: string;
}

