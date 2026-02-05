'use client';

import Link from 'next/link';
import { PlayCircle, Play } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { useCourseStore } from '@/store/courseStore';
import { Course } from '@/types';

interface PurchasedCourseCardProps {
  course: Course;
}

function PurchasedCourseCard({ course }: PurchasedCourseCardProps) {
  const lessonCount = course.videoIds?.length || 0;
  const firstLessonId = course.videoIds?.[0] ?? undefined;

  return (
    <Link href={firstLessonId ? `/course/${course.id}/lesson/${firstLessonId}` : `/course/${course.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-md">
        {/* Course Image */}
        <div className="relative aspect-video bg-gray-100">
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Play Overlay */}
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
            <div className="h-full bg-primary" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Course Info */}
        <div className="p-3">
          <h3 className="text-gray-900 font-medium text-sm mb-0.5 line-clamp-2">{course.title}</h3>
          <p className="text-gray-500 text-xs mb-3">{course.trainerName}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
              <PlayCircle size={14} />
              <span>{lessonCount} lessons</span>
            </div>

            <span className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
              Continue
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MyCoursesPage() {
  const { purchasedCourses } = useCourseStore();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-gray-500 text-sm">Continue your learning journey</p>
        </div>

        {/* Content */}
        {purchasedCourses.length === 0 ? (
          <EmptyState
            icon={<PlayCircle size={48} />}
            title="No purchased courses yet"
            description="Browse our catalog and find a course that interests you."
          />
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Your Courses</p>
                <p className="text-gray-900 text-2xl font-bold">{purchasedCourses.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <PlayCircle size={24} className="text-primary" />
              </div>
            </div>

            {/* Course List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchasedCourses.map((course) => (
                <PurchasedCourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
