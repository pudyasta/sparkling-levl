import React, { useCallback, useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';

interface ConfirmationModalProps {
  title?: string;
  message?: string;
}

export function useConfirmation() {
  const [visible, setVisible] = useState(false);
  const callbackRef = useRef<(() => void) | null>(null);

  const confirm = useCallback((cb: () => void) => {
    callbackRef.current = cb;
    setVisible(true);
  }, []);

  const ConfirmationModal = () => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setVisible(false)}
      >
        <TouchableOpacity activeOpacity={1} style={styles.dialog}>
          <Text style={styles.title}>Konfirmasi</Text>
          <Text style={styles.message}>Apakah kamu yakin?</Text>
          <View style={styles.buttons}>
            <Button
              color="white"
              variant="outlined"
              onPress={() => setVisible(false)}
              style={{ flex: 1 }}
            >
              Batal
            </Button>
            <Button
              onPress={() => {
                setVisible(false);
                callbackRef.current?.();
              }}
              style={{ flex: 1 }}
            >
              Ya
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return { confirm, ConfirmationModal };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.N900 },
  message: { fontSize: 14, color: Colors.TextSecondary },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 8 },
});
