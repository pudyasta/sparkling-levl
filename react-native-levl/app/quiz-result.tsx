import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import Text from '../src/components/Text';
import { FontFamily, TextType } from '../src/components/Text/types';
import Badge from '../src/components/common/Badge/Badge';
import Button from '../src/components/common/Button';
import { Colors } from '../src/constant/style';
import { htmlToPlainText } from '../src/lib/helper/htmlToText';
import { useQuizRepository } from '../src/pages/Quiz/repository/QuizRepository';

function ScoreRing({ percentage, isPassed }: { percentage: number; isPassed: boolean }) {
  const color = isPassed ? Colors.Success : Colors.Error;
  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text
        size={TextType.h1}
        fontWeight="bold"
        fontFamily={FontFamily.jakarta}
        color={color}
        style={{ fontSize: 36 }}
      >
        {Math.round(percentage)}
      </Text>
      <Text size={TextType.b3} color={color}>
        / 100
      </Text>
    </View>
  );
}

export default function QuizResultScreen() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();
  const repo = useQuizRepository();
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!submissionId) return;
    repo
      .getQuizOverviewApi(parseInt(submissionId))
      .then((res: any) => setOverview(res?.data ?? null))
      .finally(() => setIsLoading(false));
  }, [submissionId]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.Primary} size="large" />
      </View>
    );
  }

  if (!overview) {
    return (
      <View style={styles.center}>
        <Text size={TextType.b2} color={Colors.Error}>
          Gagal memuat hasil quiz.
        </Text>
        <Button onPress={() => router.back()} style={{ marginTop: 16 }}>
          Kembali
        </Button>
      </View>
    );
  }

  const score = overview.score ?? 0;
  const isPassed = overview.is_passed ?? score >= 60;
  const answers: any[] = overview.questions ?? overview.answers ?? [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.Canvas }}
      contentContainerStyle={styles.content}
    >
      {/* Score header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 40, textAlign: 'center' }}>{isPassed ? '🎉' : '😔'}</Text>
        <Text
          size={TextType.h1}
          fontWeight="bold"
          fontFamily={FontFamily.jakarta}
          style={{ textAlign: 'center', marginTop: 8 }}
        >
          {isPassed ? 'Selamat!' : 'Hampir!'}
        </Text>
        <Text size={TextType.b2} color={Colors.TextSecondary} style={{ textAlign: 'center' }}>
          {isPassed ? 'Kamu berhasil melewati quiz ini' : 'Kamu belum mencapai nilai minimum'}
        </Text>

        <ScoreRing percentage={score} isPassed={isPassed} />

        <View style={styles.statsRow}>
          {overview.correct_count !== undefined && (
            <View style={styles.statItem}>
              <Text size={TextType.h2} fontWeight="bold" color={Colors.Success}>
                {overview.correct_count}
              </Text>
              <Text size={TextType.b3} color={Colors.TextTertiary}>
                Benar
              </Text>
            </View>
          )}
          {overview.wrong_count !== undefined && (
            <View style={styles.statItem}>
              <Text size={TextType.h2} fontWeight="bold" color={Colors.Error}>
                {overview.wrong_count}
              </Text>
              <Text size={TextType.b3} color={Colors.TextTertiary}>
                Salah
              </Text>
            </View>
          )}
          {overview.total_questions !== undefined && (
            <View style={styles.statItem}>
              <Text size={TextType.h2} fontWeight="bold" color={Colors.Primary}>
                {overview.total_questions}
              </Text>
              <Text size={TextType.b3} color={Colors.TextTertiary}>
                Total
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Answer review */}
      {answers.length > 0 && (
        <View style={{ gap: 12 }}>
          <Text size={TextType.h2} fontWeight="bold" style={{ marginBottom: 4 }}>
            Review Jawaban
          </Text>
          {answers.map((item: any, idx: number) => {
            const isCorrect = item.is_correct;
            return (
              <View
                key={item.id ?? idx}
                style={[
                  styles.answerCard,
                  { borderLeftColor: isCorrect ? Colors.Success : Colors.Error },
                ]}
              >
                <View
                  style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}
                >
                  <Text size={TextType.b3} color={Colors.TextTertiary}>
                    Soal {idx + 1}
                  </Text>
                  <Badge variant={isCorrect ? 'success' : 'danger'}>
                    {isCorrect ? 'Benar' : 'Salah'}
                  </Badge>
                </View>
                <Text size={TextType.b2} fontWeight="600" style={{ marginBottom: 6 }}>
                  {htmlToPlainText(item.question?.content ?? '')}
                </Text>
                {item.answer?.content && (
                  <Text size={TextType.b3} color={Colors.TextSecondary}>
                    Jawaban: {htmlToPlainText(item.answer.content)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      <Button onPress={() => router.back()} style={{ marginTop: 20 }}>
        Selesai
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  content: { padding: 20, paddingBottom: 60, gap: 20 },
  header: {
    backgroundColor: Colors.Surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  scoreRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  statsRow: { flexDirection: 'row', gap: 24 },
  statItem: { alignItems: 'center', gap: 2 },
  answerCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.Border,
    borderLeftWidth: 4,
  },
});
