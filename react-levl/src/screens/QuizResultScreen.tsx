import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type RouteT = RouteProp<RootStackParamList, 'QuizResult'>;

export default function QuizResultScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteT>();
  const { score, final_score, is_passed, time_spent } = params;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={styles.container}>
        <Text style={styles.emoji}>{is_passed ? '🏆' : '😢'}</Text>
        <AppText size={TextType.h1} fontWeight="bold" style={styles.title}>
          {is_passed ? 'Congratulations!' : 'Better Luck Next Time'}
        </AppText>

        <View style={[styles.scoreBadge, { backgroundColor: is_passed ? '#E8F5E9' : '#FFEBEE' }]}>
          <AppText size={TextType.h1} fontWeight="bold" color={is_passed ? Colors.Success : Colors.Error}>
            {final_score}
          </AppText>
          <AppText size={TextType.b2} color={is_passed ? Colors.Success : Colors.Error}>Final Score</AppText>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <AppText size={TextType.h2} fontWeight="bold">{score}</AppText>
            <AppText size={TextType.b3} color={Colors.Disabled}>Raw Score</AppText>
          </View>
          <View style={styles.stat}>
            <AppText size={TextType.h2} fontWeight="bold">{formatTime(time_spent)}</AppText>
            <AppText size={TextType.b3} color={Colors.Disabled}>Time Spent</AppText>
          </View>
          <View style={styles.stat}>
            <Text style={{ fontSize: 24 }}>{is_passed ? '✅' : '❌'}</Text>
            <AppText size={TextType.b3} color={Colors.Disabled}>{is_passed ? 'Passed' : 'Failed'}</AppText>
          </View>
        </View>

        <AppButton
          label="Back to Course"
          color="primary"
          onPress={() => navigation.popToTop()}
          style={{ marginTop: 8 }}
        />
        <AppButton
          label="Go to Dashboard"
          variant="outlined"
          color="primary"
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
          style={{ marginTop: 12 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 32, alignItems: 'center', justifyContent: 'center', gap: 20 },
  emoji: { fontSize: 64 },
  title: { textAlign: 'center' },
  scoreBadge: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center', gap: 4 },
});
