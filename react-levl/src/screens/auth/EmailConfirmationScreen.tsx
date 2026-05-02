import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useRegisterRepo } from '@/repository/auth/useRegisterRepo';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EmailConfirmationScreen() {
  const navigation = useNavigation<Nav>();
  const { resendVerificationEmailApi } = useRegisterRepo();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.Background }}>
      <View style={styles.container}>
        <AppText size={TextType.h1} style={{ fontSize: 64, textAlign: 'center' }}>📧</AppText>
        <AppText size={TextType.h1} fontWeight="bold" style={styles.title}>
          Check Your Email
        </AppText>
        <AppText size={TextType.b1} color={Colors.Disabled} style={styles.body}>
          We've sent a verification link to your email address. Please check your inbox and click the link to activate your account.
        </AppText>

        <AppButton
          label="Back to Login"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
          style={{ marginTop: 32 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  body: {
    textAlign: 'center',
    lineHeight: 24,
  },
});
