import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import { Loading } from '@/components/Loading/Loading';
import Button from '@/components/common/Button';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import { htmlToPlainText } from '@/lib/helper/htmlToText';
import type { LessonBlock, LessonData } from '@/pages/Lessons/repository/type/lessons';
import { useGetLesson, useMarkAsDone } from '@/pages/Lessons/usecase/useGetLesson';

function renderBlocks(blocks: LessonBlock[]) {
  return blocks.map((block) => {
    if (block.block_type === 'text') {
      return (
        <Text key={block.id} size={TextType.b2} color={Colors.TextPrimary} style={styles.textBlock}>
          {htmlToPlainText(block.content)}
        </Text>
      );
    }
    if (block.block_type === 'video' && block.media) {
      return (
        <View key={block.id} style={styles.mediaBlock}>
          <TouchableOpacity
            onPress={() => Linking.openURL(block.media!.url)}
            style={styles.videoPlaceholder}
          >
            <Text style={{ fontSize: 32 }}>▶️</Text>
            <Text size={TextType.b2} color={Colors.TextSecondary} style={{ marginTop: 8 }}>
              {block.media.file_name}
            </Text>
          </TouchableOpacity>
          {block.content ? (
            <Text size={TextType.b3} color={Colors.TextTertiary} style={{ padding: 8 }}>
              {htmlToPlainText(block.content)}
            </Text>
          ) : null}
        </View>
      );
    }
    if (block.block_type === 'image' && block.media) {
      return (
        <View key={block.id} style={styles.mediaBlock}>
          <Image
            source={{ uri: block.media.url }}
            style={styles.imageBlock}
            resizeMode="contain"
          />
          {block.content ? (
            <Text size={TextType.b3} color={Colors.TextTertiary} style={styles.imageCaption}>
              {htmlToPlainText(block.content)}
            </Text>
          ) : null}
        </View>
      );
    }
    if (block.block_type === 'file' && block.media) {
      return (
        <TouchableOpacity
          key={block.id}
          style={styles.fileCard}
          onPress={() => Linking.openURL(block.media!.url)}
        >
          <Text style={{ fontSize: 24 }}>📎</Text>
          <View style={{ flex: 1 }}>
            <Text size={TextType.b2} fontWeight="600">{block.media.file_name}</Text>
            <Text size={TextType.p} color={Colors.TextTertiary}>
              {(block.media.size / 1024).toFixed(1)} KB
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return null;
  });
}

export default function LessonsScreen() {
  const {
    course_slug,
    unit_slug,
    lesson_slug,
    lesson_type,
    courseId,
  } = useLocalSearchParams<{
    course_slug: string;
    unit_slug: string;
    lesson_slug: string;
    lesson_type: string;
    courseId: string;
  }>();

  const [currentLessonSlug, setCurrentLessonSlug] = useState(lesson_slug ?? '');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [completedModal, setCompletedModal] = useState<{ visible: boolean; xp: number }>({ visible: false, xp: 0 });

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();

  const { lesson, isLoading, refetch } = useGetLesson(
    course_slug ?? '',
    unit_slug ?? '',
    currentLessonSlug,
  );

  const { execute: markAsDone, isLoading: isMarkingDone } = useMarkAsDone({
    onSuccess: (xp) => {
      setCompletedModal({ visible: true, xp });
      refetch();
    },
  });

  const toggleSheet = () => {
    const toValue = isSheetOpen ? 0 : 1;
    Animated.spring(sheetAnim, { toValue, useNativeDriver: true, tension: 100, friction: 14 }).start();
    setIsSheetOpen(!isSheetOpen);
  };

  const sheetTranslate = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-height * 0.5, 0],
  });

  if (isLoading && !lesson) {
    return (
      <View style={styles.center}>
        <Loading size={32} />
      </View>
    );
  }

  if (!lesson) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Surface }}>
      {/* Floating progress header */}
      <View style={styles.progressHeader}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backCircle}
        >
          <Text size={TextType.b1} color={Colors.TextSecondary}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onPress={toggleSheet}>
          <View style={styles.progressLabelRow}>
            <Text size={TextType.b2} fontWeight="600">{lesson.title}</Text>
            <Text size={TextType.b3}>{isSheetOpen ? '▼' : '▲'}</Text>
          </View>
          <View style={styles.progBg}>
            <View
              style={[
                styles.progFill,
                { width: lesson.is_completed ? '100%' : '50%' },
              ]}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
      >
        {/* Badge */}
        <View style={styles.typeBadge}>
          <Text size={TextType.p} fontWeight="bold" color="#16A34A">
            MATERI
          </Text>
        </View>
        <Text size={TextType.b2} color={Colors.Primary} style={{ marginBottom: 4 }}>
          Materi Ke-{lesson.order}
        </Text>
        <Text size={TextType.h1} fontWeight="bold" style={{ marginBottom: 20, lineHeight: 32 }}>
          {lesson.title}
        </Text>

        {/* Blocks */}
        {lesson.blocks && renderBlocks(lesson.blocks)}

        {/* Mark as done */}
        <View style={{ marginTop: 32 }}>
          <Button
            onPress={() => markAsDone(currentLessonSlug)}
            disabled={lesson.is_completed || isMarkingDone}
          >
            {isMarkingDone ? (
              <Loading size={20} color="#fff" />
            ) : lesson.is_completed ? (
              'Selesai ✅'
            ) : (
              'Tandai Sudah Selesai'
            )}
          </Button>
        </View>
      </ScrollView>

      {/* Completed modal */}
      <Modal
        visible={completedModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletedModal({ visible: false, xp: 0 })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>🎉</Text>
            <Text size={TextType.h2} fontWeight="bold" style={{ textAlign: 'center', marginTop: 8 }}>
              Yeay kamu berhasil!
            </Text>
            <Text size={TextType.b2} color={Colors.TextSecondary} style={{ textAlign: 'center', marginTop: 4 }}>
              Kamu mendapatkan +{completedModal.xp} XP
            </Text>
            <View style={{ marginTop: 20 }}>
              <Button onPress={() => { setCompletedModal({ visible: false, xp: 0 }); }}>
                Lanjut
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    backgroundColor: Colors.Surface,
    zIndex: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  backCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.N100,
    alignItems: 'center', justifyContent: 'center',
  },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progBg: { height: 6, borderRadius: 999, backgroundColor: Colors.N100, overflow: 'hidden' },
  progFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.Primary },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DCFCE7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  textBlock: {
    lineHeight: 24,
    marginBottom: 16,
    color: Colors.N700,
  },
  mediaBlock: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  videoPlaceholder: {
    height: 200,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBlock: { height: 200, width: '100%' },
  imageCaption: {
    padding: 10,
    backgroundColor: Colors.Canvas,
    textAlign: 'center',
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.Canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: 14,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
});
