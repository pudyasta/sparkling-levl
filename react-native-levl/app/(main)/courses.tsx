import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import CourseCard from '@/components/CoursesCard/CoursesCard';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import type { Category, Course } from '@/pages/main/repository/type/course';
import { useGetAllCourses } from '@/pages/main/usecase/useGetAllCourses';

const LEVEL_TAGS = [
  { label: 'Dasar', value: 'DASAR' },
  { label: 'Menengah', value: 'MENENGAH' },
  { label: 'Mahir', value: 'MAHIR' },
];

function useDebounce(fn: (...args: any[]) => void, delay: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (...args: any[]) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    },
    [fn]
  );
}

export default function CoursesScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [levelTag, setLevelTag] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const debouncedSetSearch = useDebounce((val: string) => setDebouncedSearch(val), 400);

  const { courses, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useGetAllCourses({
    search: debouncedSearch || undefined,
    'filter[level_tag]': levelTag || undefined,
    'filter[category_id]': activeCategory?.id,
  });

  React.useEffect(() => {
    if (courses.length > 0) {
      courses.forEach((course) => {
        if (course.category) {
          setCategories((prev) => {
            const exists = prev.find((c) => c.id === course.category!.id);
            return exists ? prev : [...prev, course.category!];
          });
        }
      });
    }
  }, [courses]);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard
      key={item.id}
      bindTap={() =>
        router.push({
          pathname: '/course-detail',
          params: { courseId: item.id, course_slug: item.slug },
        })
      }
      course={{
        id: item.id.toString(),
        title: item.title,
        description: item.description ?? '',
        level: item.difficulty_level,
        category: item.category?.name || '',
        image: item.thumbnail_url ?? '',
        lessons: item.units?.length || item.total_units || 0,
      }}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text size={TextType.h1} fontWeight="bold" color="white">
          Explore Kursus
        </Text>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Cari kursus..."
            placeholderTextColor={Colors.TextTertiary}
            value={search}
            onChangeText={(val) => {
              setSearch(val);
              debouncedSetSearch(val);
            }}
          />
        </View>

        {/* Level filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {LEVEL_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag.value}
              onPress={() => setLevelTag(levelTag === tag.value ? '' : tag.value)}
              style={[
                styles.filterChip,
                levelTag === tag.value && styles.filterChipActive,
              ]}
            >
              <Text
                size={TextType.b3}
                fontWeight="bold"
                color={levelTag === tag.value ? 'white' : 'rgba(255,255,255,0.8)'}
              >
                {tag.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
          {levelTag ? (
            <TouchableOpacity
              onPress={() => setLevelTag('')}
              style={styles.clearChip}
            >
              <Text size={TextType.b3} fontWeight="bold" color="#fca5a5">
                ✕ Clear
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </View>

      {/* Category tabs */}
      {categories.length > 0 && (
        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => setActiveCategory(null)}
              style={[styles.catChip, !activeCategory && styles.catChipActive]}
            >
              <Text size={TextType.b3} fontWeight="600" color={!activeCategory ? Colors.Primary : Colors.TextSecondary}>
                Semua
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id === activeCategory?.id ? null : cat)}
                style={[styles.catChip, cat.id === activeCategory?.id && styles.catChipActive]}
              >
                <Text size={TextType.b3} fontWeight="600" color={cat.id === activeCategory?.id ? Colors.Primary : Colors.TextSecondary}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Course list */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.Primary} size="large" />
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.center}>
          <Text size={TextType.h2} style={{ marginBottom: 8 }}>🔍</Text>
          <Text size={TextType.b2} color={Colors.TextTertiary}>Tidak ada kursus yang ditemukan.</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCourse}
          contentContainerStyle={styles.list}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator color={Colors.Primary} />
              </View>
            ) : !hasNextPage && courses.length > 0 ? (
              <View style={styles.footer}>
                <Text size={TextType.p} color={Colors.TextTertiary}>
                  Kamu sudah melihat semua kursus yang ada 🎉
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.Canvas },
  header: {
    backgroundColor: Colors.Primary,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 12,
  },
  searchRow: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.TextPrimary },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterChipActive: { backgroundColor: Colors.PrimaryDark },
  clearChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(239,68,68,0.3)',
  },
  categoryBar: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.Border, backgroundColor: Colors.Surface },
  catChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.N100,
  },
  catChipActive: { backgroundColor: Colors.InfoBg },
  list: { padding: 16, paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  footer: { paddingVertical: 16, alignItems: 'center' },
});
