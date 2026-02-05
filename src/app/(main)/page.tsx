'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import SearchBar from '@/components/ui/SearchBar';
import CourseCard from '@/components/ui/CourseCard';
import Footer from '@/components/layout/Footer';
import { useCourseStore } from '@/store/courseStore';
import { useUserStore } from '@/store/userStore';
import { loadCourses } from '@/store/courseStore';

const categories = [
  { id: '1', name: 'Lip Workshop' },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { courses } = useCourseStore();
  const { user, isAuthenticated } = useUserStore();

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-gray-500 text-sm mb-2">Welcome back,</p>
            <h1 className="text-gray-900 text-3xl lg:text-4xl font-bold mb-4">
              {isAuthenticated && user ? user.name : 'Guest'}
            </h1>
            <p className="text-gray-600 text-base lg:text-lg mb-8">
              Discover professional beauty and aesthetics courses designed to elevate your skills
            </p>
            <div className="max-w-xl">
              <SearchBar
                placeholder="Search courses..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Categories */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-gray-900 text-xl lg:text-2xl font-semibold mb-1">Categories</h2>
            <p className="text-gray-500 text-sm">Explore courses by category</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg whitespace-nowrap text-sm font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors"
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {/* Courses */}
        <section>
          <div className="mb-6">
            <h2 className="text-gray-900 text-xl lg:text-2xl font-semibold mb-1">Featured Courses</h2>
            <p className="text-gray-500 text-sm">Start learning with our top-rated courses</p>
          </div>
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No courses found matching your search</p>
            </div>
          )}
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

