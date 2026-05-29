import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Text from '../src/components/Text';
import { FontFamily, TextType } from '../src/components/Text/types';
import { Colors } from '../src/constant/style';
import { useApiClient } from '../src/lib/api/core';
import type { MyCourse } from '../src/pages/MyCourses/index';

function useGetMyCourses() {
  const { api } = useApiClient();
  const query = useQuery<MyCourse[]>({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const res = await api('/my-courses', { method: 'GET' });
      return (res as any)?.data?.data ?? [];
    },
  });
  return { ...query, courses: query.data ?? [] };
}

export default function MyCoursesScreen() {
  const { courses, isLoading, refetch } = useGetMyCourses();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.Canvas }}>
      <LinearGradient colors={[Colors.Primary, Colors.PrimaryDark]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text color="white" size={TextType.b1}>
            ← Kembali
          </Text>
        </TouchableOpacity>
        <Text size={TextType.h1} fontWeight="bold" color="white" fontFamily={FontFamily.jakarta}>
          Kursus Saya
        </Text>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.Primary} size="large" />
        </View>
      ) : courses.length === 0 ? (
        <View style={styles.center}>
          <Text size={TextType.h2} style={{ marginBottom: 8 }}>
            📚
          </Text>
          <Text size={TextType.b2} color={Colors.TextTertiary}>
            Kamu belum mendaftar kursus apapun.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(main)/courses')}
            style={{ marginTop: 16 }}
          >
            <Text size={TextType.b1} color={Colors.Primary}>
              Jelajahi Kursus →
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        >
          {courses.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/course-detail',
                  params: { courseId: item.id, course_slug: item.slug },
                })
              }
            >
              <View style={styles.thumb}>
                {item.thumbnail ? (
                  <Image
                    source={{ uri: item.thumbnail }}
                    style={{ width: 96, height: 96 }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ width: 96, height: 96, backgroundColor: Colors.N200 }} />
                )}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text size={TextType.b1} fontWeight="bold" color={Colors.N900} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text size={TextType.b3} color={Colors.Primary}>
                  {item.progress.completed_items} dari {item.progress.total_items} materi
                </Text>
                <View style={styles.progressRow}>
                  <View style={styles.progBg}>
                    <View
                      style={[styles.progFill, { width: `${item.progress.percentage}%` as any }]}
                    />
                  </View>
                  <Text size={TextType.b3} color={Colors.TextTertiary}>
                    {item.progress.percentage}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    gap: 12,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  list: { padding: 16, gap: 12, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  thumb: { width: 96, height: 96, borderRadius: 12, overflow: 'hidden' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progBg: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.N100,
    overflow: 'hidden',
  },
  progFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.Primary },
});
