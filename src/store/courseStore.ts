import { create } from 'zustand';
import { Course } from '@/types';
import { coursesAPI } from '@/lib/api';

interface CourseState {
  courses: Course[];
  favorites: Course[];
  purchasedCourses: Course[];
  toggleFavorite: (courseId: string) => void;
  addToPurchased: (course: Course) => void;
  getCourseById: (id: string) => Course | undefined;
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  favorites: [],
  purchasedCourses: [],

  toggleFavorite: (courseId) => {
    set((state) => {
      const updatedCourses = state.courses.map((course) =>
        course.id === courseId
          ? { ...course, isFavorite: !course.isFavorite }
          : course
      );
      
      const favorites = updatedCourses.filter((course) => course.isFavorite);
      
      return { courses: updatedCourses, favorites };
    });
  },
  
  addToPurchased: (course) => {
    set((state) => ({
      purchasedCourses: [...state.purchasedCourses, course],
    }));
  },
  
  getCourseById: (id) => {
    return get().courses.find((course) => course.id === id);
  },
}));

// API'dan kursları yükle
export const loadCourses = async () => {
  try {
    const res = await coursesAPI.getAll();
    // API'dan gelen kursları tip uyumlu hale getir
    const courses = res.courses.map((c: any) => ({
      ...c,
      isFavorite: c.isFavorite ?? false,
    }));
    useCourseStore.setState({ courses });
  } catch (error) {
    // Hata yönetimi
    console.error('Kurslar yüklenemedi:', error);
  }
};

