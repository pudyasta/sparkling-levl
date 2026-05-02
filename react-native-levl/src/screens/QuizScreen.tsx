import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { StorageKey, getStorageItem, setStorageItem } from '@/lib/helper/storage';
import { useApiClient } from '@/lib/api/core';

const QUIZ_DURATION = 2 * 60 * 60;

export default function QuizScreen() {
  const params = useLocalSearchParams<{ quizId: string }>();
  const { api } = useApiClient();
  const quizId = Number(params.quizId);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const submissionId = useRef<number | null>(null);

  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoSubmitted = useRef(false);

  const [question, setQuestion] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'quiz' | 'submitting' | 'error'>('loading');
  const [isNavOpen, setIsNavOpen] = useState(false);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current!); timerRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => {
    if (timeLeft === 0 && !hasAutoSubmitted.current && submissionId.current) {
      hasAutoSubmitted.current = true;
      stopTimer();
      setPhase('submitting');
      handleSubmit(submissionId.current);
    }
  }, [timeLeft]);

  useEffect(() => { return () => stopTimer(); }, []);

  const fetchQuestion = async (page: number) => {
    if (!submissionId.current) return;
    setPhase('loading');
    setCurrentPage(page);
    try {
      const res = await api(`/quizzes/${quizId}/submissions/${submissionId.current}/questions?page=${page}`, { method: GET_METHOD });
      const q = res?.data?.data?.data;
      const nav = res?.data?.data?.meta?.pagination;
      const existingAnswer = res?.data?.data?.answer;

      setQuestion(q);
      setMeta({ pagination: nav });
      setTotalQuestions(nav?.total ?? 0);

      if (existingAnswer?.selected_options) {
        setCurrentAnswer(q?.type === 'checkbox' ? existingAnswer.selected_options : existingAnswer.selected_options[0] ?? null);
      } else if (existingAnswer?.content) {
        setCurrentAnswer(existingAnswer.content);
      } else {
        setCurrentAnswer(q?.type === 'checkbox' ? [] : null);
      }
      setPhase('quiz');
    } catch {
      setPhase('error');
    }
  };

  const startQuiz = async () => {
    try {
      const res = await api(`/quizzes/${quizId}/submissions/start`, { method: POST_METHOD });
      const id = res?.data?.data?.id;
      submissionId.current = id;
      await setStorageItem(StorageKey.SubmissionId, { submissionId: id });
      fetchQuestion(1);
      startTimer();
    } catch {
      setPhase('error');
    }
  };

  useEffect(() => {
    (async () => {
      const saved = await getStorageItem<{ submissionId: number }>(StorageKey.SubmissionId);
      if (saved?.submissionId) {
        submissionId.current = saved.submissionId;
        fetchQuestion(1);
        startTimer();
      } else {
        startQuiz();
      }
    })();
  }, []);

  const buildPayload = () => {
    if (!question) return {};
    if (question.type === 'essay') return { quiz_question_id: question.id, selected_options: null, content: currentAnswer };
    if (question.type === 'checkbox') return { quiz_question_id: question.id, selected_options: currentAnswer, content: null };
    return { quiz_question_id: question.id, selected_options: [currentAnswer], content: null };
  };

  const saveAnswer = async () => {
    if (!submissionId.current) return;
    try {
      await api(`/quizzes/${quizId}/submissions/${submissionId.current}/answers`, {
        method: POST_METHOD,
        data: buildPayload(),
      });
    } catch { /* silent */ }
  };

  const handleSubmit = async (subId: number) => {
    try {
      const res = await api(`/quizzes/${quizId}/submissions/${subId}/submit`, { method: POST_METHOD });
      const d = res?.data?.data;
      await setStorageItem(StorageKey.SubmissionId, null);
      stopTimer();
      router.replace({
        pathname: '/quiz-result',
        params: {
          submission_id: String(d.id),
          quiz_id: String(quizId),
          score: String(d.score),
          final_score: String(d.final_score),
          is_passed: String(d.is_passed),
          time_spent: String(d.time_spent_seconds),
        },
      });
    } catch {
      setPhase('error');
    }
  };

  const handleNext = async () => {
    if (!submissionId.current || !question) return;
    setIsSaving(true);
    await saveAnswer();
    setIsSaving(false);
    if (meta?.pagination?.has_next) {
      fetchQuestion(currentPage + 1);
    } else {
      stopTimer();
      setPhase('submitting');
      handleSubmit(submissionId.current);
    }
  };

  const timerColor = timeLeft <= 60 ? '#DC3545' : timeLeft <= 300 ? '#FFC107' : Colors.Primary;

  if (phase === 'submitting') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' }}>
        <Text style={{ fontSize: 40, marginBottom: 12 }}>📤</Text>
        <AppText size={TextType.b1} color={Colors.Disabled}>Submitting your quiz...</AppText>
      </View>
    );
  }

  if (phase === 'error') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <Text style={{ fontSize: 40 }}>❌</Text>
        <AppText size={TextType.b1}>Something went wrong.</AppText>
        <AppButton label="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const progressWidth = totalQuestions > 0 ? (currentPage / totalQuestions) * 100 : 0;
  const options = Array.isArray(question?.options) ? question.options : [];
  const isFlagged = flaggedQuestions.includes(currentPage - 1);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View style={[styles.timerPill, { borderColor: timerColor }]}>
            <View style={[styles.timerDot, { backgroundColor: timerColor }]} />
            <AppText size={TextType.b2} fontWeight="bold" color={timerColor}>{formatTime(timeLeft)}</AppText>
          </View>
          <TouchableOpacity onPress={() => setIsNavOpen(true)} style={styles.navPill}>
            <AppText size={TextType.b2} fontWeight="bold" color={Colors.Primary}>{currentPage} / {totalQuestions}</AppText>
            <Text style={{ color: Colors.Primary }}>  ☰</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressWidth}%` as any }]} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
        {phase === 'loading' ? (
          <View style={{ paddingTop: 80 }}>
            <AppLoading fullScreen />
          </View>
        ) : (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={styles.typePill}>
                <Text style={styles.typeText}>{question?.type_label ?? 'Question'}</Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  setFlaggedQuestions((prev) =>
                    prev.includes(currentPage - 1)
                      ? prev.filter((i) => i !== currentPage - 1)
                      : [...prev, currentPage - 1]
                  )
                }
                style={[styles.flagBtn, isFlagged && { borderColor: '#FFA500', backgroundColor: '#FFF8F0' }]}
              >
                <Text>{isFlagged ? '🚩' : '🏳️'}</Text>
                <Text style={{ fontSize: 10, color: isFlagged ? '#FFA500' : Colors.Disabled }}>
                  {isFlagged ? 'FLAGGED' : 'FLAG'}
                </Text>
              </TouchableOpacity>
            </View>

            <AppText size={TextType.h2} fontWeight="bold" style={{ marginBottom: 24 }}>
              {question?.content}
            </AppText>

            <View style={{ gap: 12 }}>
              {options.map((opt: any) => {
                const isActive = question?.type === 'checkbox'
                  ? Array.isArray(currentAnswer) && currentAnswer.includes(opt)
                  : currentAnswer === opt;
                return (
                  <TouchableOpacity
                    key={typeof opt === 'object' ? opt.id : opt}
                    onPress={() => {
                      if (question?.type === 'checkbox') {
                        const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
                        setCurrentAnswer(prev.includes(opt) ? prev.filter((o: any) => o !== opt) : [...prev, opt]);
                      } else {
                        setCurrentAnswer(opt);
                      }
                    }}
                    style={[styles.option, isActive && styles.optionActive]}
                  >
                    <View style={[styles.optionDot, question?.type === 'checkbox' && styles.optionDotCheckbox, isActive && styles.optionDotActive]}>
                      {isActive && <View style={question?.type === 'checkbox' ? styles.checkInner : styles.radioInner} />}
                    </View>
                    <Text style={[styles.optionText, isActive && { color: Colors.Primary, fontWeight: '700' }]}>
                      {typeof opt === 'object' ? opt.content ?? opt.text ?? JSON.stringify(opt) : String(opt)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {currentPage > 1 && (
            <TouchableOpacity
              onPress={() => fetchQuestion(currentPage - 1)}
              style={styles.backBtn}
            >
              <Text style={{ fontWeight: '700', color: Colors.Neutral }}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }}>
            <AppButton
              label={isSaving ? 'Saving...' : meta?.pagination?.has_next ? 'Next' : 'Finish Quiz ✓'}
              onPress={handleNext}
              disabled={isSaving || phase === 'submitting'}
              isLoading={isSaving}
            />
          </View>
        </View>
      </View>

      <Modal visible={isNavOpen} transparent animationType="slide" onRequestClose={() => setIsNavOpen(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setIsNavOpen(false)} activeOpacity={1}>
          <View style={styles.navSheet}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <AppText size={TextType.h2} fontWeight="bold">Question List</AppText>
              <TouchableOpacity onPress={() => setIsNavOpen(false)}>
                <Text style={{ color: Colors.Disabled, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 24 }}>
                {Array.from({ length: totalQuestions }).map((_, i) => {
                  const isCurrent = i + 1 === currentPage;
                  const isFlaggedQ = flaggedQuestions.includes(i);
                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => { setIsNavOpen(false); setTimeout(() => fetchQuestion(i + 1), 300); }}
                      style={[styles.navItem, isCurrent && styles.navItemActive]}
                    >
                      <Text style={{ fontWeight: '700', color: isCurrent ? Colors.Primary : Colors.Neutral }}>{i + 1}</Text>
                      {isFlaggedQ && <Text style={styles.navFlag}>🚩</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#fff', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  timerPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  timerDot: { width: 6, height: 6, borderRadius: 3 },
  navPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.Accent, borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: '#F1F3F4', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#FBB03B' },
  typePill: { backgroundColor: '#FFF8E6', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: '700', color: '#FBB03B', textTransform: 'uppercase' },
  flagBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'transparent', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#F8F9FA' },
  option: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#F1F3F4', borderRadius: 16, padding: 16, backgroundColor: '#fff' },
  optionActive: { borderColor: Colors.Primary, backgroundColor: `${Colors.Primary}12` },
  optionDot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#dadce0', alignItems: 'center', justifyContent: 'center' },
  optionDotCheckbox: { borderRadius: 6 },
  optionDotActive: { borderColor: Colors.Primary, backgroundColor: Colors.Primary },
  checkInner: { width: 10, height: 10, backgroundColor: '#fff' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  optionText: { flex: 1, fontSize: 14, color: Colors.Neutral },
  footer: { backgroundColor: '#fff', padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: '#F1F3F4' },
  backBtn: { height: 50, paddingHorizontal: 20, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  navSheet: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: '70%' },
  navItem: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, borderColor: '#F1F3F4', backgroundColor: '#F8F9FA', alignItems: 'center', justifyContent: 'center' },
  navItemActive: { borderColor: Colors.Primary, backgroundColor: Colors.Accent },
  navFlag: { position: 'absolute', top: -4, right: -4, fontSize: 10 },
});
