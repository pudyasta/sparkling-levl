import { useCallback, useRef, useState } from '@lynx-js/react';
import { useEffect } from 'react';

import CourseCard from '@/components/CoursesCard/CoursesCard';
import { PullToRefresh } from '@/components/PullToRefresh/PullToRefresh';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import type { Category } from '@/pages/CourseDetail/repository/type';

import { useGetAllCourses } from '../../usecase/useGetAllCourses';
import styles from './Course.module.css';
import CategoryLabel from './components/CategoryLabel';
import { LEVEL_TAGS, SORT_OPTIONS } from './data/courses';

// Debounce helper — avoids firing API on every keystroke
const useDebounce = (fn: (...args: any[]) => void, delay: number) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn]
  );
};

const Courses: React.FC = () => {
  const { navigateTo } = useNativeBridge();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [levelTag, setLevelTag] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { courses, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useGetAllCourses({
      search: search || undefined,
      'filter[level_tag]': levelTag || undefined,
      'filter[category_id]': activeCategory ? (activeCategory.id as any) : undefined,
      sort: sort || undefined,
    });

  const debouncedSetSearch = useDebounce((val: string) => setSearch(val), 400);

  const handleSearchInput = (e: any) => {
    debouncedSetSearch(e.detail.value);
  };

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.detail;
    const nearBottom = scrollHeight - scrollTop - clientHeight < 200;
    if (nearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const hasActiveFilters = levelTag || sort;
  useEffect(() => {
    if (courses.length > 0) {
      courses.map((course) => {
        const category = categories.find((cat) => cat.id === course.id);

        if (!category) {
          setCategories([...categories, course.category]);
        }
      });
    }
  }, [courses]);

  return (
    <PullToRefresh
      onRefresh={async () => {
        await refetch();
      }}
    >
      <scroll-view scroll-y className="flex-1" bindscroll={handleScroll}>
        <view className={styles.container}>
          {/* Header */}
          <view className={styles.header}>
            <Text size={TextType.h1} fontWeight="bold" color="white">
              Courses
            </Text>

            {/* Search + filter trigger row */}
            <view className="mt-4 flex-row gap-3 flex">
              <view className={`${styles.searchBar} flex-1`}>
                <text className={styles.searchIcon}>🔍</text>
                <input
                  className={styles.searchInput}
                  placeholder="Search courses"
                  bindinput={handleSearchInput}
                />
              </view>

              {/* Filter toggle button */}
              <view
                bindtap={() => setShowFilters(!showFilters)}
                className={`h-12 w-12 items-center rounded-2xl justify-center ${
                  hasActiveFilters ? 'bg-blue-500' : 'bg-white/20'
                }`}
              >
                <text className="text-lg">⚙️</text>
              </view>
            </view>

            {/* Expanded filter row */}
            {showFilters && (
              <view className="mt-3 flex-col gap-2 flex">
                {/* Level tag */}
                <view className="flex-row flex-wrap gap-2 flex">
                  {LEVEL_TAGS.map((tag) => (
                    <view
                      key={tag.value}
                      bindtap={() => setLevelTag(levelTag === tag.value ? '' : tag.value)}
                      className={`rounded-full px-3 py-1 ${
                        levelTag === tag.value ? 'bg-blue-500' : 'bg-white/20'
                      }`}
                    >
                      <text
                        className={`text-xs font-bold ${
                          levelTag === tag.value ? 'text-white' : 'text-white/80'
                        }`}
                      >
                        {tag.label}
                      </text>
                    </view>
                  ))}
                </view>

                {/* Sort */}
                <view className="flex-row flex-wrap gap-2 flex">
                  {SORT_OPTIONS.map((opt) => (
                    <view
                      key={opt.value}
                      bindtap={() => setSort(sort === opt.value ? '' : opt.value)}
                      className={`rounded-full px-3 py-1 ${
                        sort === opt.value ? 'bg-yellow-400' : 'bg-white/20'
                      }`}
                    >
                      <text
                        className={`text-xs font-bold ${
                          sort === opt.value ? 'text-yellow-900' : 'text-white/80'
                        }`}
                      >
                        {opt.label}
                      </text>
                    </view>
                  ))}
                </view>

                {/* Clear filters */}
                {hasActiveFilters && (
                  <view
                    bindtap={() => {
                      setLevelTag('');
                      setSort('');
                    }}
                    className="self-start rounded-full bg-red-400/30 px-3 py-1"
                  >
                    <text className="text-xs font-bold text-red-200">✕ Clear filters</text>
                  </view>
                )}
              </view>
            )}
          </view>

          {/* Categories */}
          <scroll-view scroll-x className="flex-1">
            <view className={styles.categoryList}>
              {categories.map((cat) => (
                <CategoryLabel
                  key={cat.id}
                  isActive={cat.id === activeCategory?.id}
                  category={cat.name}
                  bindTap={() => setActiveCategory(cat)}
                />
              ))}
            </view>
          </scroll-view>

          {/* Course list */}
          <view className={styles.courseList}>
            {isLoading ? (
              // Skeleton placeholders
              Array.from({ length: 4 }).map((_, i) => (
                <view key={i} className="mb-4 h-48 w-full animate-pulse rounded-2xl bg-slate-200" />
              ))
            ) : courses.length === 0 ? (
              <view className={styles.emptyState}>
                <text className="mb-2 text-4xl">🔍</text>
                <text className={styles.emptyText}>No courses match your search.</text>
              </view>
            ) : (
              <view className="animate-fade-in">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    bindTap={() =>
                      navigateTo('courseDetail.lynx.bundle', {
                        courseId: course.id,
                        slug: course.slug,
                      })
                    }
                    course={{
                      id: course.id.toString(),
                      title: course.title,
                      description: course.short_desc,
                      level: course.level_tag,
                      category: course.category?.name || '',
                      image: course.banner,
                      lessons: course.progress?.total_items || 0,
                    }}
                  />
                ))}
              </view>
            )}

            {/* Load more indicator */}
            {isFetchingNextPage && (
              <view className="items-center py-6 flex">
                <text className="text-sm text-slate-400">Loading more...</text>
              </view>
            )}

            {/* End of list */}
            {!hasNextPage && courses.length > 0 && (
              <view className="w-full items-center pb-6 pt-2 flex justify-center">
                <Text size={TextType.p}>Kamu sudah melihat semua kursus yang ada 🎉</Text>
              </view>
            )}
          </view>
        </view>
      </scroll-view>
    </PullToRefresh>
  );
};

export default Courses;
