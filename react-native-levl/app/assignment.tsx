import * as DocumentPicker from 'expo-document-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import { Loading } from '../src/components/Loading/Loading';
import Text from '../src/components/Text';
import { FontFamily, TextType } from '../src/components/Text/types';
import Button from '../src/components/common/Button';
import { Colors } from '../src/constant/style';
import { useAssignmentRepository } from '../src/pages/Lessons/repository/AssignmentRepository';
import type {
  AssignmentStudentResponse,
  AssignmentSubmission,
  PickedFile,
} from '../src/pages/Lessons/repository/type/assignment';

function StatusCard({ data }: { data: AssignmentStudentResponse }) {
  const isGraded = data.submission_status === 'graded';
  const isSubmitted = data.submission_status === 'submitted';
  if (!data.submission_status) return null;

  const bg = isGraded ? '#F0FDF4' : isSubmitted ? '#EFF6FF' : '#FFFBEB';
  const border = isGraded ? '#BBF7D0' : isSubmitted ? '#BFDBFE' : '#FDE68A';
  const textColor = isGraded ? '#15803D' : isSubmitted ? '#1D4ED8' : '#92400E';

  return (
    <View style={[styles.statusCard, { backgroundColor: bg, borderColor: border }]}>
      <View style={{ flex: 1 }}>
        <Text size={TextType.b1} fontWeight="bold" color={textColor}>
          Status: {data.submission_status_label}
        </Text>
        {data.submitted_at && (
          <Text size={TextType.b3} color={textColor}>
            Dikumpulkan pada {new Date(data.submitted_at).toLocaleDateString('id-ID')}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text size={TextType.b1} fontWeight="bold" color={textColor}>
          {data.score ?? '-'}
        </Text>
        <Text size={TextType.b3} color={textColor}>
          Skor Akhir
        </Text>
      </View>
    </View>
  );
}

function FileRow({ file, onRemove }: { file: PickedFile; onRemove?: () => void }) {
  const ext = file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileExt}>
        <Text size={TextType.b3} fontWeight="bold" color={Colors.Primary}>
          {ext}
        </Text>
      </View>
      <Text size={TextType.b2} style={{ flex: 1 }} numberOfLines={1}>
        {file.name}
      </Text>
      {onRemove && (
        <TouchableOpacity onPress={onRemove} style={styles.fileRemove}>
          <Text size={TextType.b2} color={Colors.Error}>
            ✕
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function AssignmentScreen() {
  const { assignmentId } = useLocalSearchParams<{ assignmentId: string }>();
  const repo = useAssignmentRepository();

  const [assignment, setAssignment] = useState<AssignmentStudentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [answerText, setAnswerText] = useState('');
  const [selectedFile, setSelectedFile] = useState<PickedFile | null>(null);
  const [isFileEdited, setIsFileEdited] = useState(false);
  const [isTextEdited, setIsTextEdited] = useState(false);

  const loadAssignment = async () => {
    if (!assignmentId) return;
    try {
      const res = await repo.getAssignmentApi(parseInt(assignmentId));
      const data = res?.data;
      if (data) {
        setAssignment(data);
        // Restore saved draft values
        const lastSubmission: AssignmentSubmission | undefined =
          data.submissions[data.submissions.length - 1];
        if (lastSubmission?.answer_text) {
          setAnswerText(lastSubmission.answer_text);
        }
        if (lastSubmission?.files?.length) {
          const f = lastSubmission.files[0];
          setSelectedFile({
            uri: f.file_url,
            name: f.file_name,
            mimeType: f.mime_type,
            size: f.size,
          });
        }
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Gagal memuat tugas' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignment();
  }, [assignmentId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setIsFileEdited(false);
    setIsTextEdited(false);
    await loadAssignment();
    setRefreshing(false);
  };

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        size: asset.size ?? 0,
      });
      setIsFileEdited(true);
    }
  };

  const handleSaveDraft = async () => {
    if (!assignment) return;
    const subType = assignment.submission_type ?? 'text';

    if ((subType === 'text' || subType === 'mixed') && !answerText.trim()) {
      Toast.show({ type: 'error', text1: 'Tautan atau teks jawaban harus diisi' });
      return;
    }
    if ((subType === 'file' || subType === 'mixed') && !selectedFile) {
      Toast.show({ type: 'error', text1: 'File jawaban harus dipilih' });
      return;
    }

    setIsSaving(true);
    try {
      const lastSubmission = assignment.submissions[assignment.submissions.length - 1];
      const submissionId =
        assignment.submission_status === 'draft' && lastSubmission ? lastSubmission.id : null;

      const res = await repo.submitDraftApi(assignment.id, submissionId, {
        answerText: isTextEdited ? answerText : (lastSubmission?.answer_text ?? ''),
        file: isFileEdited ? selectedFile : null,
        submissionType: subType,
      });

      if (res?.success) {
        Toast.show({ type: 'success', text1: 'Tersimpan sebagai draft' });
        setIsFileEdited(false);
        setIsTextEdited(false);
        await loadAssignment();
      } else {
        const msg =
          res?.errors
            ? Object.values(res.errors as Record<string, string[]>).flat()[0]
            : (res?.message ?? 'Gagal menyimpan draft');
        Toast.show({ type: 'error', text1: msg });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Terjadi kesalahan jaringan' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!assignment) return;
    const lastSubmission = assignment.submissions[assignment.submissions.length - 1];
    if (!lastSubmission?.id) {
      Toast.show({ type: 'error', text1: 'Simpan draft terlebih dahulu' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await repo.submitFinalApi(lastSubmission.id);
      if (res?.success) {
        Toast.show({ type: 'success', text1: 'Tugas berhasil dikumpulkan!' });
        await loadAssignment();
      } else {
        Toast.show({ type: 'error', text1: res?.message ?? 'Gagal mengumpulkan tugas' });
      }
    } catch {
      Toast.show({ type: 'error', text1: 'Terjadi kesalahan jaringan' });
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.Primary} size="large" />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.center}>
        <Text size={TextType.h2} style={{ marginBottom: 8 }}>
          ❌
        </Text>
        <Text size={TextType.b2} color={Colors.Error}>
          Gagal memuat tugas
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text size={TextType.b1} color={Colors.Primary}>
            ← Kembali
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLocked =
    assignment.submission_status === 'submitted' ||
    assignment.submission_status === 'graded' ||
    assignment.is_completed;
  const canFinalSubmit =
    assignment.submission_status === 'draft' && !isFileEdited && !isTextEdited;
  const subType = assignment.submission_type ?? 'text';

  return (
    <View style={{ flex: 1, backgroundColor: Colors.Canvas }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text size={TextType.b1} color={Colors.TextSecondary}>
            ← Kembali
          </Text>
        </TouchableOpacity>
        {assignment.xp_reward > 0 && (
          <View style={styles.xpPill}>
            <Text size={TextType.b3} fontWeight="bold" color={Colors.Primary}>
              +{assignment.xp_reward} XP
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Title section */}
        <View style={{ gap: 6 }}>
          <View style={styles.tagRow}>
            <View style={styles.tagAssignment}>
              <Text size={TextType.b3} fontWeight="bold" color="#C2410C">
                TUGAS
              </Text>
            </View>
            <Text size={TextType.b2} color={Colors.Primary}>
              Materi Ke-{assignment.order}
            </Text>
          </View>
          <Text size={TextType.h1} fontWeight="bold" fontFamily={FontFamily.jakarta}>
            {assignment.title}
          </Text>
        </View>

        {/* Status card */}
        <StatusCard data={assignment} />

        {/* Instructions */}
        {assignment.instructions && (
          <View style={styles.section}>
            <Text size={TextType.b1} fontWeight="bold" style={{ marginBottom: 6 }}>
              Petunjuk:
            </Text>
            <Text size={TextType.b2} color={Colors.TextSecondary} style={{ lineHeight: 22 }}>
              {assignment.instructions}
            </Text>
          </View>
        )}

        {/* File requirements */}
        {(assignment.accepted_formats?.length > 0 || assignment.max_file_size > 0) && (
          <View style={styles.reqRow}>
            {assignment.accepted_formats?.length > 0 && (
              <View style={styles.reqCard}>
                <Text size={TextType.b3} color={Colors.TextTertiary}>
                  Format File
                </Text>
                <Text size={TextType.b2} fontWeight="bold">
                  {assignment.accepted_formats
                    .map((f) => f.split('.').pop()?.toUpperCase() ?? f)
                    .join(', ')}
                </Text>
              </View>
            )}
            {assignment.max_file_size > 0 && (
              <View style={styles.reqCard}>
                <Text size={TextType.b3} color={Colors.TextTertiary}>
                  Ukuran Maks.
                </Text>
                <Text size={TextType.b2} fontWeight="bold">
                  {assignment.max_file_size} MB
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Input area — hidden when locked */}
        {!isLocked && (
          <View style={{ gap: 16 }}>
            {/* Text input */}
            {(subType === 'text' || subType === 'mixed') && (
              <View>
                <Text size={TextType.b2} fontWeight="bold" style={{ marginBottom: 6 }}>
                  Tautan / Teks Jawaban:
                </Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  value={answerText}
                  onChangeText={(v) => {
                    setAnswerText(v);
                    setIsTextEdited(true);
                  }}
                  placeholder="Tulis atau tempel tautan jawaban kamu di sini..."
                  placeholderTextColor={Colors.TextDisabled}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* File picker */}
            {(subType === 'file' || subType === 'mixed') && (
              <View>
                <Text size={TextType.b2} fontWeight="bold" style={{ marginBottom: 6 }}>
                  Unggah Jawaban:
                </Text>
                {selectedFile ? (
                  <View style={{ gap: 8 }}>
                    <FileRow
                      file={selectedFile}
                      onRemove={() => {
                        setSelectedFile(null);
                        setIsFileEdited(true);
                      }}
                    />
                    <TouchableOpacity onPress={pickFile} style={styles.changeFileBtn}>
                      <Text size={TextType.b3} color={Colors.Primary}>
                        Ganti file
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={styles.uploadArea} onPress={pickFile} activeOpacity={0.7}>
                    <View style={styles.uploadIcon}>
                      <Text size={TextType.h2} color={Colors.Primary}>
                        ↑
                      </Text>
                    </View>
                    <Text size={TextType.b1} fontWeight="bold" color={Colors.Primary}>
                      Pilih File Tugas
                    </Text>
                    <Text size={TextType.b3} color={Colors.TextTertiary}>
                      Tap untuk memilih file dari perangkat
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}

        {/* Submitted file (read-only) */}
        {isLocked && selectedFile && (
          <View style={styles.section}>
            <Text size={TextType.b1} fontWeight="bold" style={{ marginBottom: 6 }}>
              File yang dikumpulkan:
            </Text>
            <FileRow file={selectedFile} />
          </View>
        )}

        {/* Submitted text (read-only) */}
        {isLocked && answerText ? (
          <View style={styles.section}>
            <Text size={TextType.b1} fontWeight="bold" style={{ marginBottom: 6 }}>
              Jawaban kamu:
            </Text>
            <View style={styles.readonlyText}>
              <Text size={TextType.b2} color={Colors.TextSecondary} style={{ lineHeight: 22 }}>
                {answerText}
              </Text>
            </View>
          </View>
        ) : null}

        {/* Feedback (if graded) */}
        {assignment.submission_status === 'graded' &&
          assignment.submissions[assignment.submissions.length - 1]?.feedback && (
            <View style={[styles.section, styles.feedbackCard]}>
              <Text size={TextType.b1} fontWeight="bold" style={{ marginBottom: 4 }}>
                Feedback Pengajar:
              </Text>
              <Text size={TextType.b2} style={{ lineHeight: 22 }}>
                {assignment.submissions[assignment.submissions.length - 1].feedback}
              </Text>
            </View>
          )}
      </ScrollView>

      {/* Footer buttons */}
      {!isLocked && (
        <View style={styles.footer}>
          <Button
            variant="outlined"
            color="primary"
            onPress={handleSaveDraft}
            disabled={isSaving || isSubmitting}
            style={{ flex: 1 }}
          >
            {isSaving ? <Loading size={18} /> : 'Simpan Draft'}
          </Button>
          <Button
            onPress={() => setShowConfirm(true)}
            disabled={!canFinalSubmit || isSaving || isSubmitting}
            style={{ flex: 1 }}
          >
            Kumpulkan
          </Button>
        </View>
      )}

      {/* Confirm modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text
              size={TextType.h2}
              fontWeight="bold"
              fontFamily={FontFamily.jakarta}
              style={{ textAlign: 'center' }}
            >
              Kumpulkan tugas?
            </Text>
            <Text
              size={TextType.b2}
              color={Colors.TextSecondary}
              style={{ textAlign: 'center', marginTop: 8, lineHeight: 22 }}
            >
              Setelah dikumpulkan, kamu tidak bisa mengubah jawaban lagi. Pastikan semua sudah benar.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
              <Button
                variant="outlined"
                color="primary"
                onPress={() => setShowConfirm(false)}
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                Periksa lagi
              </Button>
              <Button onPress={handleFinalSubmit} style={{ flex: 1 }} disabled={isSubmitting}>
                {isSubmitting ? <Loading size={18} color="#fff" /> : 'Kumpulkan'}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.Surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  backBtn: { padding: 4 },
  xpPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.Primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagAssignment: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  section: {
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  reqRow: { flexDirection: 'row', gap: 10 },
  reqCard: {
    flex: 1,
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: 12,
    gap: 4,
  },
  textInput: {
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: 14,
    height: 140,
    fontSize: 15,
    color: Colors.TextPrimary,
    lineHeight: 22,
  },
  uploadArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.Primary,
    backgroundColor: Colors.InfoBg,
    paddingVertical: 28,
    gap: 6,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.Surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    padding: 12,
  },
  fileExt: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.InfoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileRemove: { padding: 4 },
  changeFileBtn: { alignSelf: 'flex-start', padding: 4 },
  readonlyText: {
    backgroundColor: Colors.Canvas,
    borderRadius: 8,
    padding: 12,
  },
  feedbackCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
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
