import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import CourseCard from '@/components/CourseCard';
import { Colors } from '@/constant/colors';
import { useQuery } from '@tanstack/react-query';
import { useMainRepository } from '@/repository/main/MainRepository';

export default function MyCoursesScreen() {
  const [search, setSearch] = useState('');
  const { getMyCourseApi } = useMainRepository();

  const { data, isLoading } = useQuery({
    queryKey: ['my-courses', search],
    queryFn: () => getMyCourseApi(search),
  });

  const courses: any[] = data?.data ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <AppText size={TextType.h2} fontWeight="bold" color="white">My Courses</AppText>
      </View>

      <View style={styles.searchBar}>
        <Text style={{ marginRight: 8, fontSize: 16 }}>🔍</Text>
        <TextInput
          style={{ flex: 1, fontSize: 14, color: Colors.Neutral }}
          placeholder="Search your courses"
          placeholderTextColor={Colors.Disabled}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <AppLoading fullScreen />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 40 }}>📚</Text>
              <AppText size={TextType.b1} color={Colors.Disabled} style={{ marginTop: 12 }}>
                You haven't enrolled in any courses yet.
              </AppText>
            </View>
          }
          renderItem={({ item }) => (
            <CourseCard
              course={{
                id: String(item.id),
                title: item.title,
                description: item.short_desc,
                level: item.level_tag,
                category: item.category?.name ?? '',
                image: item.banner ?? item.thumbnail,
                lessons: item.progress?.total_items ?? 0,
              }}
              onPress={() =>
                router.push({
                  pathname: '/course-detail',
                  params: { courseId: item.id, slug: item.slug },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.Primary,
    padding: 16,
    paddingTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
});
