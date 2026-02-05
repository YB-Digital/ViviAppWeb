'use client';

import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { Course } from '@/types';
import { useCourseStore } from '@/store/courseStore';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { toggleFavorite } = useCourseStore();

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(course.id);
  };

  return (
    <Link href={`/course/${course.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
        {/* Course Image */}
        <div className="relative aspect-video bg-gray-100">
          {course.imagePath ? (
            <div
              className="w-full h-full bg-gray-100"
              style={{
                backgroundImage: `url(${course.imagePath})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm transition-colors hover:bg-white shadow-sm"
          >
            <Heart
              size={16}
              className={course.isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}
            />
          </button>
        </div>

        {/* Course Info */}
        <div className="p-3 flex-grow flex flex-col">
          <h3 className="text-gray-900 font-medium text-sm mb-0.5 line-clamp-2">{course.title}</h3>
          <p className="text-gray-500 text-xs mb-2">{course.trainerName}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-2">
            <span className="text-gray-900 text-xs font-medium">{course.rating.toFixed(1)}</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={12}
                  className={
                    star <= Math.floor(course.rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-gray-400 text-xs">({course.reviewCount})</span>
          </div>

          {/* Price */}
          <p className="text-primary font-semibold text-sm mt-auto">${course.price.toFixed(2)}</p>
        </div>
      </div>
    </Link>
  );
}

