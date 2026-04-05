// Courses.tsx
import { useEffect, useMemo, useState } from '@lynx-js/react';
import type { Category } from './type';
import { CATEGORIES, COURSES } from './data/courses';
import CategoryLabel from './components/CategoryLabel';
import { useGetAllCourses } from '../../usecase/useGetAllCourses';
import CourseCard from '@/components/CoursesCard/CoursesCard';
import { loginBanner } from '@/assets/images/pages';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { navigate } from '@/lib/native/nativeNavigate';
import { DETAIL_COURSE_ACTIVITY } from '@/constant/activity';
import styles from './Course.module.css';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

const Courses: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const { navigateTo } = useNativeBridge();

  const { courses, isLoading } = useGetAllCourses({
    onSuccess: (courses) => {},
    onError: (error) => {},
  });

  const filteredCourses = useMemo(
    () =>
      courses &&
      courses.data.filter((course) => {
        // const matchCategory =
        //   activeCategory === 'All' || course. === activeCategory;
        const lowered = search.toLowerCase();
        const matchSearch = !lowered || course.title.toLowerCase().includes(lowered);
        // course.description.toLowerCase().includes(lowered);
        return matchSearch;
      }),
    [courses, search]
  );

  useEffect(() => {}, [isLoading]);

  const handleSearchInput = (e: any) => {};
  return (
    courses && (
      <scroll-view scroll-y>
        <view className={styles.container}>
          {/* Header Section */}
          <view className={styles.header}>
            <Text size={TextType.h1} bold color="white">
              Courses
            </Text>

            {/* Search bar */}
            <view className={styles.searchBar}>
              <text className={styles.searchIcon}>🔍</text>
              <input
                className={styles.searchInput}
                placeholder="Search courses"
                bindinput={handleSearchInput}
              />
            </view>
          </view>

          {/* Categories Section */}
          <view className={styles.categoryList}>
            {CATEGORIES.map((cat) => (
              <CategoryLabel
                key={cat}
                isActive={cat === activeCategory}
                category={cat}
                bindTap={() => setActiveCategory(cat)}
              />
            ))}
          </view>

          {/* Course list */}
          <view className={styles.courseList}>
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                desc={course.short_desc}
                difficulty={course.level_tag}
                image={course.thumbnail}
                bindTap={() =>
                  navigateTo('courseDetail.lynx.bundle', {
                    courseId: course.id,
                    slug: course.slug,
                  })
                }
              />
            ))}

            {filteredCourses.length === 0 && (
              <view className={styles.emptyState}>
                <text className={styles.emptyText}>No courses match your search.</text>
              </view>
            )}
          </view>
        </view>
      </scroll-view>
    )
  );
};
export default Courses;
