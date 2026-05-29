import { router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import Input, { type InputRef } from '../src/components/Input/Input';
import { Loading } from '../src/components/Loading/Loading';
import Text from '../src/components/Text';
import { FontFamily, TextType } from '../src/components/Text/types';
import { Shimmer } from '../src/components/common';
import Button from '../src/components/common/Button';
import { Colors } from '../src/constant/style';
import { htmlToPlainText } from '../src/lib/helper/htmlToText';
import type { LessonElement } from '../src/pages/CourseDetail/repository/type';
import {
  useEnrollCourse,
  useGetCourseDetail,
} from '../src/pages/CourseDetail/usecase/useCourseDetail';

function CourseDetailSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{ backgroundColor: '#C7C7C7', padding: 24, paddingTop: 56, paddingBottom: 72 }}>
        <Shimmer isRound width={40} height={40} />
        <View style={{ height: 16 }} />
        <Shimmer width={80} height={24} borderRadius={8} />
        <View style={{ height: 12 }} />
        <Shimmer height={40} borderRadius={8} />
        <View style={{ height: 8 }} />
        <Shimmer width="60%" height={40} borderRadius={8} />
      </View>
      <View style={{ marginTop: -52, paddingHorizontal: 20, paddingBottom: 40 }}>
        <View style={styles.progressCard}>
          <Shimmer height={20} width={120} borderRadius={8} />
          <View style={{ height: 8 }} />
          <Shimmer height={10} borderRadius={999} />
          <View style={{ height: 12 }} />
          <Shimmer height={44} borderRadius={12} />
        </View>
        <Shimmer height={24} width={140} borderRadius={8} />
        <View style={{ height: 16 }} />
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.unitCard, { marginBottom: 12 }]}>
            <Shimmer height={20} width="70%" borderRadius={8} />
            <View style={{ height: 8 }} />
            <Shimmer height={14} width="45%" borderRadius={8} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function EnrollCard({
  courseSlug,
  enrollmentType,
  enrollmentStatus,
  onSuccess,
}: {
  courseSlug: string;
  enrollmentType: string;
  enrollmentStatus: string | null;
  onSuccess: () => void;
}) {
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(enrollmentStatus === 'pending');
  const inputRef = useRef<InputRef>(null);

  const { enroll, isLoading } = useEnrollCourse({
    onSuccess: () => {
      if (enrollmentType === 'approval') {
        setIsPending(true);
        return;
      }
      onSuccess();
    },
  });

  if (isPending) {
    return (
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 32 }}>⏳</Text>
        <Text size={TextType.h2} fontWeight="bold" style={{ textAlign: 'center' }}>
          Permintaan Terkirim!
        </Text>
        <Text size={TextType.b2} color={Colors.TextTertiary} style={{ textAlign: 'center' }}>
          Pendaftaranmu sedang menunggu persetujuan admin.
        </Text>
      </View>
    );
  }

  const handleEnroll = () => {
    setKeyError(null);
    if (enrollmentType === 'key_based' && !inputRef.current?.getValue()?.trim()) {
      setKeyError('Masukkan kode pendaftaran.');
      return;
    }
    enroll({
      slug: courseSlug,
      enrollmentKey:
        enrollmentType === 'key_based' ? inputRef.current?.getValue() || undefined : undefined,
    });
  };

  return (
    <View style={{ gap: 12 }}>
      {enrollmentType === 'auto_accept' && (
        <>
          <Text size={TextType.h2} fontWeight="bold">
            Daftar untuk mulai belajar!
          </Text>
          <Text size={TextType.b2} color={Colors.TextTertiary}>
            Kursus ini terbuka buat semua orang. Gabung sekarang yuk!
          </Text>
        </>
      )}
      {enrollmentType === 'key_based' && (
        <>
          <Text size={TextType.h2} fontWeight="bold">
            Input kode pendaftaran
          </Text>
          <Text size={TextType.b2} color={Colors.TextTertiary}>
            Kursus ini memerlukan kode pendaftaran.
          </Text>
          <Input title="Kode Pendaftaran" ref={inputRef} />
          {keyError && (
            <Text size={TextType.b3} color={Colors.Error}>
              {keyError}
            </Text>
          )}
        </>
      )}
      {enrollmentType === 'approval' && (
        <>
          <Text size={TextType.h2} fontWeight="bold">
            Minta untuk bergabung
          </Text>
          <Text size={TextType.b2} color={Colors.TextTertiary}>
            Kursus ini memerlukan persetujuan admin.
          </Text>
          <View style={styles.warnBox}>
            <Text size={TextType.b3} color="#92400E">
              Persetujuan mungkin membutuhkan waktu hingga 1-2 hari kerja.
            </Text>
          </View>
        </>
      )}
      <Button
        onPress={handleEnroll}
        disabled={isLoading}
        variant={enrollmentType === 'approval' ? 'outlined' : 'filled'}
        color="primary"
      >
        {isLoading ? <Loading size={20} color="#fff" /> : 'Daftar'}
      </Button>
    </View>
  );
}

function UnitRow({
  unit,
  courseSlug,
  courseId,
  isLastAccessed,
}: {
  unit: any;
  courseSlug: string;
  courseId: number;
  isLastAccessed: boolean;
}) {
  const [expanded, setExpanded] = useState(isLastAccessed);
  const pct = unit.progress?.percentage ?? 0;

  const handleLessonPress = (element: LessonElement) => {
    if (element.is_locked) return;
    if (element.type === 'quiz') {
      router.push({ pathname: '/quiz', params: { quizId: element.id.toString() } });
      return;
    }
    router.push({
      pathname: '/lessons',
      params: {
        courseId,
        lesson_slug: element.slug,
        unit_slug: unit.slug,
        course_slug: courseSlug,
        lesson_type: element.type,
      },
    });
  };

  return (
    <View style={[styles.unitCard, isLastAccessed && styles.unitCardHighlight]}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.unitHeader}
        activeOpacity={0.8}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Text size={TextType.b1} fontWeight="bold">
            {unit.title}
          </Text>
          <Text size={TextType.b3} color={Colors.TextTertiary}>
            {unit.progress?.completed_items ?? 0} / {unit.progress?.total_items ?? 0} materi
          </Text>
        </View>
        <Text size={TextType.b2} color={Colors.Primary}>
          {expanded ? '▲' : '▼'}
        </Text>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progBg}>
        <View style={[styles.progFill, { width: `${pct}%` as any }]} />
      </View>

      {expanded && (
        <View style={{ marginTop: 8, gap: 6 }}>
          {unit.elements?.map((el: LessonElement) => (
            <TouchableOpacity
              key={el.id}
              onPress={() => handleLessonPress(el)}
              disabled={el.is_locked}
              style={[styles.lessonRow, el.is_locked && styles.lessonLocked]}
              activeOpacity={0.7}
            >
              <View style={styles.lessonIcon}>
                <Text size={TextType.p}>
                  {el.is_completed ? '✅' : el.is_locked ? '🔒' : el.type === 'quiz' ? '📝' : '📖'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  size={TextType.b2}
                  fontWeight={el.is_locked ? '400' : '500'}
                  color={el.is_locked ? Colors.TextDisabled : Colors.TextPrimary}
                >
                  {el.title}
                </Text>
                {el.xp_reward > 0 && (
                  <Text size={TextType.p} color={Colors.Secondary}>
                    +{el.xp_reward} XP
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CourseDetailScreen() {
  const { course_slug } = useLocalSearchParams<{ course_slug: string; courseId: string }>();
  const { course, isLoading, refetch } = useGetCourseDetail(course_slug ?? '');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading && !course) return <CourseDetailSkeleton />;
  if (!course) return null;

  const isEnrolled =
    course.enrollment_status === 'active' || course.enrollment_status === 'completed';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F8FAFC' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Hero */}
      <ImageBackground
        source={{ uri: course.banner || course.thumbnail }}
        style={styles.hero}
        imageStyle={{ opacity: 0.7 }}
      >
        <View style={styles.heroOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text color="white" size={TextType.b1}>
              ←
            </Text>
          </TouchableOpacity>

          <View style={styles.categoryPill}>
            <Text size={TextType.b3} fontWeight="bold" color="white">
              {course.category?.name}
            </Text>
          </View>

          <Text
            size={TextType.h1}
            fontWeight="bold"
            fontFamily={FontFamily.jakarta}
            color="white"
            style={{ marginBottom: 8 }}
          >
            {course.title}
          </Text>

          <Text size={TextType.b2} color="rgba(255,255,255,0.9)">
            {htmlToPlainText(course.short_desc)}
          </Text>
        </View>
      </ImageBackground>

      {/* Body */}
      <View style={styles.body}>
        {/* Progress / Enroll card */}
        <View style={styles.progressCard}>
          {isEnrolled ? (
            <>
              <View style={styles.progressRow}>
                <Text size={TextType.b1} fontWeight="bold">
                  Progres Kamu
                </Text>
                <Text size={TextType.h2} fontWeight="bold" color={Colors.Primary}>
                  {course.progress?.percentage ?? 0}%
                </Text>
              </View>
              <View style={styles.progBg}>
                <View
                  style={[
                    styles.progFill,
                    { width: `${course.progress?.percentage ?? 0}%` as any },
                  ]}
                />
              </View>
            </>
          ) : (
            <EnrollCard
              courseSlug={course.slug}
              enrollmentType={course.enrollment_type}
              enrollmentStatus={course.enrollment_status}
              onSuccess={() => refetch()}
            />
          )}
        </View>

        {/* Units */}
        {course.units && course.units.length > 0 && (
          <>
            <Text size={TextType.h2} fontWeight="bold" style={{ marginBottom: 8, marginTop: 4 }}>
              Course Units
            </Text>
            {course.units.map((unit) => (
              <UnitRow
                key={unit.id}
                unit={unit}
                courseSlug={course.slug}
                courseId={course.id}
                isLastAccessed={
                  course.progress?.last_accessed_unit
                    ? unit.id === course.progress.last_accessed_unit.id
                    : false
                }
              />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 280, justifyContent: 'flex-end' },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 72,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.Primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
  },
  body: { marginTop: -52, paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  progressCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progBg: { height: 10, borderRadius: 999, backgroundColor: Colors.N100, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.Primary },
  unitCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: 16,
  },
  unitCardHighlight: { borderColor: Colors.Primary, borderWidth: 2 },
  unitHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.Canvas,
    borderRadius: 10,
    padding: 10,
  },
  lessonLocked: { opacity: 0.5 },
  lessonIcon: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  warnBox: { backgroundColor: '#FFFBEB', borderRadius: 12, padding: 12 },
});
