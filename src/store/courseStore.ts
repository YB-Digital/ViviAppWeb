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
    const response = await coursesAPI.getAll();
    // API'dan gelen [{success, message, data}] formatını işliyoruz
    const courses = response.map((item: { data: any }) => ({
      id: item.data.id,
      title: item.data.title,
      description: item.data.description,
      shortDescription: item.data.shortDescription,
      imagePath: item.data.imagePath,
      price: item.data.price,
      rating: item.data.rating ?? 0,
      reviewCount: item.data.reviewCount ?? 0,
      star: item.data.star ?? 0,
      commentNumber: item.data.commentNumber ?? 0,
      isFavorite: item.data.isFavorite ?? false,
      targetAudience: item.data.targetAudience ?? [],
      trainerName: item.data.trainerName ?? '',
      userId: item.data.userId ?? '',
      videoIds: item.data.videoIds ?? [],
      author: item.data.author ?? '',
    }));

    console.log(courses)
    useCourseStore.setState({ courses });
  } catch (error) {
    // Hata yönetimi
    console.error('Kurslar yüklenemedi:', error);
  }
};

