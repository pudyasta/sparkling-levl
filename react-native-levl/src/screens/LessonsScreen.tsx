import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppLoading from '@/components/AppLoading';
import AppModal, { ModalTemplate } from '@/components/AppModal';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useGetLesson, useMarkAsDone } from '@/usecase/lessons/useGetLessons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LessonsScreen() {
  const params = useLocalSearchParams<{
    lesson_slug: string;
    unit_slug: string;
    course_slug: string;
    assignment_id: string;
    type: string;
    all_lessons: string;
  }>();

  const [currentParams, setCurrentParams] = useState({
    lesson_slug: params.lesson_slug,
    unit_slug: params.unit_slug,
    course_slug: params.course_slug,
    assignment_id: Number(params.assignment_id),
    type: params.type,
  });

  const allLessons = useRef<any[]>(
    params.all_lessons ? JSON.parse(params.all_lessons) : []
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [isBackModal, setIsBackModal] = useState(false);
  const [xpReward, setXpReward] = useState(0);

  const { lesson, isLoading, refetch } = useGetLesson({
    course_slug: currentParams.course_slug,
    unit_slug: currentParams.unit_slug,
    lesson_slug: currentParams.lesson_slug,
  });

  const { execute: markDone } = useMarkAsDone();

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setIsBackModal(true);
      return true;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    const total = allLessons.current.length;
    const done = allLessons.current.filter((l: any) => l.is_completed).length;
    setCompletedLessons(done);
    setProgressPercentage(total > 0 ? (done / total) * 100 : 0);
  }, []);

  const handlePageChange = (index: number) => {
    const target = allLessons.current[index];
    if (!target || target.is_locked) return;
    setCurrentParams((prev) => ({
      ...prev,
      lesson_slug: target.slug,
      assignment_id: target.id,
      type: target.type,
    }));
    setIsSheetOpen(false);
  };

  const handleMarkDone = () => {
    setIsButtonLoading(true);
    markDone(currentParams.lesson_slug, {
      onSuccess: () => {
        const order = lesson?.order ?? 0;
        allLessons.current[order - 1].is_completed = true;
        if (order < allLessons.current.length) {
          allLessons.current[order].is_locked = false;
        }
        const done = allLessons.current.filter((l: any) => l.is_completed).length;
        setCompletedLessons(done);
        setProgressPercentage(
          allLessons.current.length > 0 ? (done / allLessons.current.length) * 100 : 0
        );
        setXpReward(lesson?.xp_reward ?? 0);
        setIsButtonLoading(false);
        setIsSuccessModal(true);
        refetch();
      },
      onError: () => {
        setIsButtonLoading(false);
        setIsSuccessModal(true);
      },
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <TouchableOpacity
        onPress={() => setIsSheetOpen((p) => !p)}
        style={styles.progressHeader}
      >
        <View style={styles.progressLabelRow}>
          <AppText size={TextType.b2}>
            Course Progress {completedLessons}/{allLessons.current.length}
          </AppText>
          <Text>{isSheetOpen ? '▼' : '▲'}</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` as any }]} />
        </View>
      </TouchableOpacity>

      {isSheetOpen && (
        <View style={styles.sheet}>
          <ScrollView style={{ flex: 1 }}>
            {allLessons.current.map((item: any, i: number) => {
              const isActive = item.id === currentParams.assignment_id;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => { if (!item.is_locked) handlePageChange(i); }}
                  disabled={item.is_locked}
                  style={[
                    styles.lessonItem,
                    isActive && styles.lessonItemActive,
                    item.is_locked && { opacity: 0.4 },
                  ]}
                >
                  {item.is_completed ? (
                    <View style={styles.dotDone}>
                      <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>
                    </View>
                  ) : (
                    <View style={[styles.dot, isActive && { borderColor: Colors.Primary }]} />
                  )}
                  <Text
                    style={[
                      styles.lessonTitle,
                      isActive && { color: Colors.Primary, fontWeight: '700' },
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingTop: 16 }}>
        {isLoading ? (
          <View style={{ paddingTop: 60 }}>
            <AppLoading fullScreen />
          </View>
        ) : (
          <LessonContent
            lesson={lesson}
            type={currentParams.type}
            onMarkDone={handleMarkDone}
            isLoading={isButtonLoading}
          />
        )}
      </ScrollView>

      <AppModal
        visible={isSuccessModal}
        onClose={() => setIsSuccessModal(false)}
        title="Yeay kamu berhasil!"
        body={`Kamu mendapatkan +${xpReward} XP`}
        template={ModalTemplate.Default}
        buttonText="Lanjut ke lesson selanjutnya"
        onButtonPress={() => {
          const order = lesson?.order ?? 0;
          handlePageChange(order);
        }}
      />

      <AppModal
        visible={isBackModal}
        onClose={() => setIsBackModal(false)}
        template={ModalTemplate.Custom}
      >
        <View style={{ padding: 8, gap: 16 }}>
          <AppText size={TextType.h3} fontWeight="600" style={{ textAlign: 'center' }}>
            Keluar dari halaman ini?
          </AppText>
          <AppText color={Colors.Disabled} style={{ textAlign: 'center' }}>
            Kemajuan kamu tidak akan hilang.
          </AppText>
          <AppButton
            label="Keluar"
            color="primary"
            onPress={() => { setIsBackModal(false); router.back(); }}
          />
          <AppButton
            label="Tetap di sini"
            variant="outlined"
            color="primary"
            onPress={() => setIsBackModal(false)}
          />
        </View>
      </AppModal>
    </SafeAreaView>
  );
}

function LessonContent({
  lesson,
  type,
  onMarkDone,
  isLoading,
}: {
  lesson: any;
  type: string;
  onMarkDone: () => void;
  isLoading: boolean;
}) {
  if (!lesson) return null;

  return (
    <View style={{ gap: 16 }}>
      <AppText size={TextType.h2} fontWeight="bold">{lesson.title}</AppText>
      {lesson.content && (
        <AppText size={TextType.b1} style={{ lineHeight: 24 }}>{lesson.content}</AppText>
      )}
      {type === 'lesson' && (
        <AppButton
          label={lesson.is_completed ? '✓ Completed' : 'Mark as Done'}
          color="primary"
          onPress={onMarkDone}
          isLoading={isLoading}
          disabled={lesson.is_completed || isLoading}
          style={{ marginTop: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  progressHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: '#F1F3F4', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.Primary },
  sheet: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
    paddingHorizontal: 16,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  lessonItemActive: { backgroundColor: '#F0F7FF', borderRadius: 8, paddingHorizontal: 8 },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#dadce0',
    backgroundColor: '#fff',
  },
  dotDone: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.Success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonTitle: { flex: 1, fontSize: 14, color: '#3c4043' },
});
