import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppCard from '@/components/AppCard';
import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import Shimmer from '@/components/Shimmer';
import { Colors } from '@/constant/colors';
import { useGetCourseDetail } from '@/usecase/courseDetail/useCourseDetail';
import { useCourseDetailRepository } from '@/repository/courseDetail/useCourseDetailRepository';
import type { Unit } from '@/types/course';

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ courseId: string; slug: string }>();
  const { course, isLoading, refetch } = useGetCourseDetail(slug ?? '');

  if (isLoading) return <CourseDetailSkeleton />;
  if (!course) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.hero}>
        <Image source={{ uri: course.banner }} style={styles.heroBg} contentFit="cover" />
        <View style={styles.heroOverlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ color: '#fff', fontSize: 18 }}>←</Text>
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <View style={[styles.catBadge, { backgroundColor: Colors.Primary }]}>
            <AppText size={TextType.b3} color="white" fontWeight="bold">
              {course.category?.name ?? ''}
            </AppText>
          </View>
          <AppText size={TextType.h1} fontWeight="bold" color="white" style={{ marginVertical: 8 }}>
            {course.title}
          </AppText>
          <AppText size={TextType.b2} color="white" style={{ opacity: 0.9 }}>
            {course.short_desc}
          </AppText>
        </View>
      </View>

      <View style={{ marginTop: -48, paddingHorizontal: 16 }}>
        <AppCard style={{ shadowOpacity: 0.15 }}>
          {course.enrollment_status === 'active' || course.enrollment_status === 'completed' ? (
            <>
              <View style={styles.progressHeader}>
                <AppText size={TextType.b1} fontWeight="bold">Your Progress</AppText>
                <AppText size={TextType.h2} fontWeight="bold" color={Colors.Primary}>
                  {course.progress?.percentage ?? 0}%
                </AppText>
              </View>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${course.progress?.percentage ?? 0}%` as any },
                  ]}
                />
              </View>
              <AppButton
                label="Continue Learning"
                variant="outlined"
                color="primary"
                style={{ marginTop: 16 }}
                onPress={() => {
                  const firstUnit = course.units?.[0];
                  const firstLesson = firstUnit?.elements?.[0];
                  if (firstUnit && firstLesson) {
                    router.push({
                      pathname: '/lessons',
                      params: {
                        lesson_slug: firstLesson.slug,
                        unit_slug: firstUnit.slug,
                        course_slug: course.slug,
                        assignment_id: firstLesson.id,
                        type: firstLesson.type,
                        all_lessons: JSON.stringify(firstUnit.elements ?? []),
                      },
                    });
                  }
                }}
              />
            </>
          ) : (
            <EnrollSection course={course} onSuccess={() => refetch()} />
          )}
        </AppCard>
      </View>

      <View style={{ padding: 16 }}>
        {course.units && course.units.length > 0 && (
          <AppText size={TextType.h2} fontWeight="bold" style={{ marginBottom: 12, marginTop: 8 }}>
            Course Units
          </AppText>
        )}
        {course.units?.map((unit: Unit) => (
          <UnitSection
            key={unit.id}
            unit={unit}
            onLessonPress={(element: any) =>
              router.push({
                pathname: '/lessons',
                params: {
                  lesson_slug: element.slug,
                  unit_slug: unit.slug,
                  course_slug: course.slug,
                  assignment_id: element.id,
                  type: element.type,
                  all_lessons: JSON.stringify(unit.elements ?? []),
                },
              })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

function EnrollSection({ course, onSuccess }: { course: any; onSuccess: () => void }) {
  const { enrollCourseApi } = useCourseDetailRepository();

  const handleEnroll = async () => {
    try {
      await enrollCourseApi(course.slug);
      onSuccess();
    } catch {
      // handle error
    }
  };

  return (
    <>
      <AppText size={TextType.b1} fontWeight="bold" style={{ marginBottom: 8 }}>
        {course.enrollment_type === 'auto_accept' ? 'Enroll for free' : 'Request Enrollment'}
      </AppText>
      <AppButton label="Enroll Now" color="primary" onPress={handleEnroll} />
    </>
  );
}

function UnitSection({
  unit,
  onLessonPress,
}: {
  unit: Unit;
  onLessonPress: (element: any) => void;
}) {
  const isLocked = unit.progress?.is_locked;
  return (
    <View style={[styles.unitCard, isLocked && { opacity: 0.6 }]}>
      <View style={styles.unitHeader}>
        <View style={{ flex: 1 }}>
          <AppText size={TextType.b1} fontWeight="bold">{unit.title}</AppText>
          <AppText size={TextType.b3} color={Colors.Disabled}>
            {unit.progress?.completed_items ?? 0}/{unit.progress?.total_items ?? 0} lessons
          </AppText>
        </View>
        {isLocked ? (
          <Text style={{ fontSize: 18 }}>🔒</Text>
        ) : (
          <Text style={{ fontSize: 18 }}>✅</Text>
        )}
      </View>
      {unit.elements?.map((el) => (
        <TouchableOpacity
          key={el.id}
          onPress={() => !el.is_locked && onLessonPress(el)}
          style={[styles.lesson, el.is_locked && { opacity: 0.4 }]}
          disabled={el.is_locked}
        >
          <View style={[styles.lessonDot, el.is_completed && styles.lessonDotDone]} />
          <AppText size={TextType.b2} style={{ flex: 1 }}>{el.title}</AppText>
          <AppText size={TextType.b3} color={Colors.Disabled}>{el.type}</AppText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function CourseDetailSkeleton() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Shimmer height={200} borderRadius={0} />
        <Shimmer height={24} width="60%" />
        <Shimmer height={18} />
        <Shimmer height={18} width="80%" />
        <Shimmer height={120} borderRadius={16} style={{ marginTop: 8 }} />
        {[1, 2, 3].map((i) => (
          <Shimmer key={i} height={80} borderRadius={12} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 280, justifyContent: 'flex-end', overflow: 'hidden' },
  heroBg: { ...StyleSheet.absoluteFillObject },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  backBtn: {
    position: 'absolute',
    top: 48,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: { padding: 20, paddingBottom: 64, gap: 4 },
  catBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressBg: { height: 10, borderRadius: 5, backgroundColor: '#F1F3F4', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5, backgroundColor: Colors.Primary },
  unitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  unitHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F4',
  },
  lessonDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Disabled,
    backgroundColor: '#fff',
  },
  lessonDotDone: { backgroundColor: Colors.Success, borderColor: Colors.Success },
});
