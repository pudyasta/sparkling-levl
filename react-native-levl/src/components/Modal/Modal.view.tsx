import React, { useEffect, useState } from 'react';
import { Animated, Modal as RNModal, StyleSheet, TouchableOpacity, View } from 'react-native';
import { lookMascot } from '@/assets/images/mascot';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import CustomImage from '@/components/common/CustomImage/CustomImage';

export enum ModalTemplate {
  Default = 'default',
  Sad = 'sad',
  Custom = 'custom',
}

type ModalProps = {
  visible: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
  template: ModalTemplate;
  title?: string;
  body?: string;
  buttonText?: string;
  onButtonPress?: () => void;
};

export function Modal({
  visible,
  onClose,
  children,
  template = ModalTemplate.Default,
  title = '',
  body = '',
  buttonText = 'Close',
  onButtonPress,
}: ModalProps) {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.dialog}>
          {template !== ModalTemplate.Custom && (
            <View style={styles.modalBody}>
              <CustomImage src={lookMascot} width={120} height={120} />
              <Text size={TextType.h3} fontWeight="600" style={styles.title}>{title}</Text>
              <Text style={styles.body}>{body}</Text>
              <Button
                variant="outlined"
                color="primary"
                size="medium"
                onPress={onButtonPress ?? onClose}
              >
                {buttonText}
              </Button>
            </View>
          )}
          {template === ModalTemplate.Custom && children}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
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
  dialog: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  modalBody: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  title: {
    textAlign: 'center',
    marginTop: 8,
  },
  body: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 8,
  },
});
