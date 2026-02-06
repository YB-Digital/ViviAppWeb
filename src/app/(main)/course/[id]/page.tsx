'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Star, Play, Globe, Lock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useCourseStore } from '@/store/courseStore';
import { useCartStore } from '@/store/cartStore';
import { useState } from 'react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const { getCourseById, toggleFavorite, purchasedCourses } = useCourseStore();
  const { addToCart, isInCart } = useCartStore();
  const [adding, setAdding] = useState(false);

  const course = getCourseById(courseId);
  const inCart = isInCart(courseId);
  const isPurchased = purchasedCourses.some(c => c.id === courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  const handleBuy = async () => {
    if (isPurchased && course.videoIds && course.videoIds.length > 0) {
      router.push(`/course/${courseId}/lesson/${course.videoIds[0]}`);
    } else if (!inCart) {
      setAdding(true);
      try {
        await addToCart(course);
        router.push('/cart');
      } catch (e) {
        alert('Kurs sepete eklenemedi!');
      } finally {
        setAdding(false);
      }
    } else {
      router.push('/cart');
    }
  };

  const handleLessonClick = (lessonId: string) => {
    if (isPurchased) {
      router.push(`/course/${courseId}/lesson/${lessonId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Back Link */}
        <Link
          href="/courses"
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Courses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Image */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {course.imagePath ? (
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    backgroundImage: `url(${course.imagePath})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}

              {isPurchased && (
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-green-500 rounded text-white text-xs font-medium">
                  Purchased
                </div>
              )}
            </div>

            {/* Title and Rating */}
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-500 text-sm mb-3">by {course.trainerName}</p>

              <div className="flex items-center gap-2">
                <span className="text-gray-900 text-sm font-medium">{course.rating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={
                        star <= Math.floor(course.rating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm">({course.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-gray-900 font-semibold text-base mb-3">About this course</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {course.description || 'No description available.'}
              </p>
            </div>

            {/* Video List */}
            {course.videoIds && course.videoIds.length > 0 && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-gray-900 font-semibold text-base mb-4">
                  Videos ({course.videoIds.length} adet)
                </h2>
                <div className="space-y-2">
                  {course.videoIds.map((videoId: string, index: number) => (
                    <button
                      key={videoId}
                      onClick={() => handleLessonClick(videoId)}
                      disabled={!isPurchased}
                      className={`w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-colors border border-gray-100 ${isPurchased ? 'hover:bg-gray-100 cursor-pointer' : 'cursor-not-allowed opacity-60'
                        }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPurchased ? 'bg-primary/10' : 'bg-gray-200'
                        }`}>
                        {isPurchased ? (
                          <Play size={14} className="text-primary ml-0.5" />
                        ) : (
                          <Lock size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-gray-900 text-sm font-medium">
                          {index + 1}. Video
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 sticky top-24">
              {/* Price */}
              {!isPurchased && (
                <div className="mb-4">
                  <span className="text-primary text-2xl font-bold">
                    ${course.price.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button fullWidth onClick={handleBuy} disabled={adding}>
                  {adding
                    ? 'Adding...'
                    : isPurchased
                      ? 'Start Learning'
                      : inCart
                        ? 'Go to Cart'
                        : 'Add to Cart'
                  }
                </Button>
                
                <button
                  onClick={() => toggleFavorite(course.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    size={16}
                    className={course.isFavorite ? 'text-primary fill-primary' : 'text-gray-500'}
                  />
                  {course.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                </button>
              </div>

              {/* Course Info */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lessons</span>
                  <span className="text-gray-900 font-medium">{course.videoIds?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
