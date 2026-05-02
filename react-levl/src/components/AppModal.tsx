import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Colors } from '@/constant/colors';
import AppButton from './AppButton';

export enum ModalTemplate {
  Default = 'default',
  Sad = 'sad',
  Custom = 'custom',
}

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  body?: string;
  template?: ModalTemplate;
  buttonText?: string;
  onButtonPress?: () => void;
  children?: React.ReactNode;
}

export default function AppModal({
  visible,
  onClose,
  title,
  body,
  template = ModalTemplate.Default,
  buttonText,
  onButtonPress,
  children,
}: AppModalProps) {
  const emoji = template === ModalTemplate.Sad ? '😢' : template === ModalTemplate.Default ? '📖' : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {template === ModalTemplate.Custom ? (
                children
              ) : (
                <>
                  {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
                  {title ? <Text style={styles.title}>{title}</Text> : null}
                  {body ? <Text style={styles.body}>{body}</Text> : null}
                  <View style={styles.row}>
                    <AppButton
                      label={buttonText ?? 'OK'}
                      onPress={() => { onButtonPress?.(); onClose(); }}
                      color="primary"
                    />
                  </View>
                </>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={{ color: Colors.Disabled, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: Colors.Neutral, textAlign: 'center', marginBottom: 8 },
  body: { fontSize: 14, color: Colors.Disabled, textAlign: 'center', marginBottom: 16 },
  row: { width: '100%' },
  closeBtn: { position: 'absolute', top: 12, right: 16 },
});
