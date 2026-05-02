import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import CourseCard from '@/components/CourseCard';
import { Colors } from '@/constant/colors';
import { useGetAllCourses } from '@/usecase/main/useGetAllCourses';
import type { Category } from '@/types/course';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LEVEL_TAGS = [
  { label: 'Dasar', value: 'dasar' },
  { label: 'Menengah', value: 'menengah' },
  { label: 'Mahir', value: 'mahir' },
];

const SORT_OPTIONS = [
  { label: 'Terbaru', value: '-created_at' },
  { label: 'Terlama', value: 'created_at' },
  { label: 'A-Z', value: 'title' },
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
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const [levelTag, setLevelTag] = useState('');
  const [sort, setSort] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const { courses, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } =
    useGetAllCourses({
      search: search || undefined,
      'filter[level_tag]': levelTag || undefined,
      'filter[category_id]': activeCategory?.id,
      sort: sort || undefined,
    });

  const debouncedSearch = useDebounce((val: string) => setSearch(val), 400);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={styles.header}>
        <AppText size={TextType.h1} fontWeight="bold" color="white">Courses</AppText>

        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text style={{ marginRight: 8 }}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search courses"
              placeholderTextColor="rgba(255,255,255,0.6)"
              onChangeText={debouncedSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowFilters((p) => !p)}
            style={[styles.filterBtn, showFilters && { backgroundColor: Colors.Primary }]}
          >
            <Text style={{ fontSize: 18 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={{ gap: 8, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {LEVEL_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.value}
                  onPress={() => setLevelTag((v) => (v === tag.value ? '' : tag.value))}
                  style={[styles.chip, levelTag === tag.value && styles.chipActive]}
                >
                  <Text style={[styles.chipText, levelTag === tag.value && styles.chipTextActive]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setSort((v) => (v === opt.value ? '' : opt.value))}
                  style={[styles.chip, sort === opt.value && styles.chipActive]}
                >
                  <Text style={[styles.chipText, sort === opt.value && styles.chipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {(levelTag || sort) && (
              <TouchableOpacity
                onPress={() => { setLevelTag(''); setSort(''); }}
                style={styles.clearBtn}
              >
                <Text style={{ fontSize: 12, color: '#FFAAAA', fontWeight: '600' }}>✕ Clear filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Category scroll */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 48 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
        >
          <TouchableOpacity
            onPress={() => setActiveCategory(null)}
            style={[styles.catChip, !activeCategory && styles.catChipActive]}
          >
            <Text style={[styles.catText, !activeCategory && styles.catTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setActiveCategory(cat)}
              style={[styles.catChip, activeCategory?.id === cat.id && styles.catChipActive]}
            >
              <Text style={[styles.catText, activeCategory?.id === cat.id && styles.catTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Course list */}
      {isLoading ? (
        <AppLoading fullScreen />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <CourseCard
              course={{
                id: String(item.id),
                title: item.title,
                description: item.short_desc,
                level: item.level_tag,
                category: item.category?.name ?? '',
                image: item.banner,
                lessons: item.progress?.total_items ?? 0,
              }}
              onPress={() => navigation.navigate('CourseDetail', { courseId: item.id, slug: item.slug })}
            />
          )}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) fetchNextPage(); }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 16 }}>
                <AppLoading size="small" />
              </View>
            ) : !hasNextPage && courses.length > 0 ? (
              <AppText size={TextType.b3} color={Colors.Disabled} style={{ textAlign: 'center', paddingVertical: 16 }}>
                Semua kursus sudah ditampilkan 🎉
              </AppText>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <AppText size={TextType.b1} color={Colors.Disabled}>No courses match your search.</AppText>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.Primary,
    padding: 16,
    paddingTop: 20,
    paddingBottom: 20,
    gap: 12,
  },
  searchRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chipActive: { backgroundColor: '#fff' },
  chipText: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  chipTextActive: { color: Colors.Primary },
  clearBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,100,100,0.2)',
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  catChip: {
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.Accent,
    marginRight: 0,
  },
  catChipActive: { backgroundColor: Colors.Primary },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.Neutral },
  catTextActive: { color: '#fff' },
  empty: { alignItems: 'center', paddingTop: 60 },
});
