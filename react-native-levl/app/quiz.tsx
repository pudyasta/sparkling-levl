import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Button from '@/components/common/Button';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import { htmlToPlainText } from '@/lib/helper/htmlToText';
import { useQuizRepository } from '@/pages/Quiz/repository/QuizRepository';

type QuizPhase = 'starting' | 'quiz' | 'submitting' | 'done' | 'error';

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export default function QuizScreen() {
  const { quizId } = useLocalSearchParams<{ quizId: string }>();
  const repo = useQuizRepository();

  const [phase, setPhase] = useState<QuizPhase>('starting');
  const [submissionId, setSubmissionId] = useState<number | null>(null);
  const [question, setQuestion] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [answer, setAnswer] = useState<any>(null);
  const [essayText, setEssayText] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [timeLeft, setTimeLeft] = useState(-1);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start quiz and get first question
  useEffect(() => {
    if (!quizId) return;
    repo.startQuizApi(parseInt(quizId)).then((res: any) => {
      const sid = res?.data?.id ?? res?.data?.submission_id;
      if (!sid) { setPhase('error'); return; }
      setSubmissionId(sid);
      const duration = res?.data?.time_limit_minutes;
      if (duration) setTimeLeft(duration * 60);
      loadQuestion(sid, 1);
    }).catch(() => setPhase('error'));
  }, [quizId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0 || phase !== 'quiz') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timeLeft, phase]);

  const loadQuestion = async (sid: number, page: number) => {
    setPhase('quiz');
    const res = await repo.getQuizQuestionApi(sid, page);
    const q = res?.data;
    const m = res?.meta;
    const a = res?.answer;
    setQuestion(q);
    setMeta(m);
    setAnswer(a);
    setCurrentPage(page);

    // Restore saved answer
    if (a?.selected_options) {
      setSelectedOptions(Array.isArray(a.selected_options) ? a.selected_options : [a.selected_options]);
    } else {
      setSelectedOptions([]);
    }
    setEssayText(a?.content ?? '');
  };

  const saveCurrentAnswer = async () => {
    if (!submissionId || !question) return;
    setIsSaving(true);
    try {
      const isEssay = question.type === 'essay';
      await repo.saveAnswerApi(submissionId, question.id, {
        content: isEssay ? essayText : undefined,
        selected_options: !isEssay ? selectedOptions : undefined,
      });
    } catch { /* ok */ }
    setIsSaving(false);
  };

  const goToPage = async (page: number) => {
    await saveCurrentAnswer();
    await loadQuestion(submissionId!, page);
  };

  const handleSubmit = async (auto = false) => {
    if (!submissionId) return;
    await saveCurrentAnswer();
    setPhase('submitting');
    try {
      await repo.submitQuizApi(submissionId);
      router.replace({ pathname: '/quiz-result', params: { submissionId: submissionId.toString() } });
    } catch {
      setPhase('error');
    }
  };

  const toggleOption = (opt: string) => {
    const isCheckbox = question?.type === 'checkbox';
    if (isCheckbox) {
      setSelectedOptions((prev) =>
        prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt]
      );
    } else {
      setSelectedOptions([opt]);
    }
  };

  const timerColor = timeLeft >= 0
    ? timeLeft <= 60 ? Colors.Error : timeLeft <= 300 ? Colors.Warning : Colors.Primary
    : Colors.Primary;

  if (phase === 'starting' || phase === 'submitting') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.Primary} size="large" />
        <Text size={TextType.b2} color={Colors.TextSecondary} style={{ marginTop: 12 }}>
          {phase === 'starting' ? 'Memulai quiz...' : 'Mengirim jawaban...'}
        </Text>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={styles.center}>
        <Text size={TextType.h2} style={{ marginBottom: 8 }}>❌</Text>
        <Text size={TextType.b2} color={Colors.Error}>Terjadi kesalahan</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text size={TextType.b1} color={Colors.Primary}>← Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const options: string[] = (() => {
    if (!question?.options) return [];
    if (Array.isArray(question.options)) return question.options.map((o: any) => typeof o === 'string' ? o : o.text ?? String(o));
    if (typeof question.options === 'object') return Object.values(question.options).map((v: any) => typeof v === 'string' ? v : v.text ?? String(v));
    return [];
  })();

  const isEssay = question?.type === 'essay';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.Canvas }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text size={TextType.b1} color={Colors.TextSecondary}>← Keluar</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text size={TextType.b2} fontWeight="bold">
            Soal {meta?.current_order ?? currentPage} / {meta?.total_questions ?? '?'}
          </Text>
        </View>
        {timeLeft >= 0 && (
          <View style={[styles.timer, { borderColor: timerColor }]}>
            <Text size={TextType.b3} fontWeight="bold" color={timerColor}>
              {formatTime(timeLeft)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress dots */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((meta?.current_order ?? 1) / (meta?.total_questions ?? 1)) * 100}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Question */}
        <View style={styles.questionCard}>
          <Text size={TextType.b2} fontWeight="bold" color={Colors.TextPrimary} style={{ lineHeight: 24 }}>
            {htmlToPlainText(question?.content ?? '')}
          </Text>
        </View>

        {/* Options */}
        {isEssay ? (
          <TextInput
            style={styles.essayInput}
            multiline
            value={essayText}
            onChangeText={setEssayText}
            placeholder="Tulis jawaban kamu di sini..."
            placeholderTextColor={Colors.TextDisabled}
            textAlignVertical="top"
          />
        ) : (
          <View style={{ gap: 10 }}>
            {options.map((opt, idx) => {
              const isSelected = selectedOptions.includes(opt);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => toggleOption(opt)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionCircle, isSelected && styles.optionCircleSelected]}>
                    {isSelected && <View style={styles.optionDot} />}
                  </View>
                  <Text
                    size={TextType.b2}
                    color={isSelected ? Colors.Primary : Colors.TextPrimary}
                    fontWeight={isSelected ? 'bold' : '400'}
                    style={{ flex: 1 }}
                  >
                    {htmlToPlainText(opt)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.footer}>
        <Button
          variant="outlined"
          color="primary"
          onPress={() => goToPage(currentPage - 1)}
          disabled={!meta?.has_previous || isSaving}
          style={{ flex: 1 }}
        >
          Sebelumnya
        </Button>
        {meta?.has_next ? (
          <Button
            onPress={() => goToPage(currentPage + 1)}
            disabled={isSaving}
            style={{ flex: 1 }}
          >
            {isSaving ? <Loading size={18} color="#fff" /> : 'Selanjutnya'}
          </Button>
        ) : (
          <Button
            onPress={() => setShowConfirmSubmit(true)}
            disabled={isSaving}
            style={{ flex: 1 }}
          >
            {isSaving ? <Loading size={18} color="#fff" /> : 'Selesai'}
          </Button>
        )}
      </View>

      {/* Confirm submit modal */}
      <Modal visible={showConfirmSubmit} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text size={TextType.h2} fontWeight="bold" style={{ textAlign: 'center' }}>
              Kumpulkan Jawaban?
            </Text>
            <Text size={TextType.b2} color={Colors.TextSecondary} style={{ textAlign: 'center', marginTop: 8 }}>
              Pastikan kamu sudah menjawab semua soal sebelum mengumpulkan.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Button
                variant="outlined"
                color="primary"
                onPress={() => setShowConfirmSubmit(false)}
                style={{ flex: 1 }}
              >
                Batal
              </Button>
              <Button onPress={() => { setShowConfirmSubmit(false); handleSubmit(); }} style={{ flex: 1 }}>
                Kumpulkan
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  backBtn: { padding: 4 },
  timer: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  progressBar: { height: 4, backgroundColor: Colors.N100 },
  progressFill: { height: '100%', backgroundColor: Colors.Primary },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  questionCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.Border,
  },
  optionSelected: { borderColor: Colors.Primary, backgroundColor: Colors.InfoBg },
  optionCircle: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: Colors.N300,
    alignItems: 'center', justifyContent: 'center',
  },
  optionCircleSelected: { borderColor: Colors.Primary },
  optionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.Primary },
  essayInput: {
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: 16,
    height: 180,
    fontSize: 15,
    color: Colors.TextPrimary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.Surface,
    borderTopWidth: 1,
    borderTopColor: Colors.Border,
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
