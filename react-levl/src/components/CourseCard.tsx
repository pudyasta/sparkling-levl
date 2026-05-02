import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constant/colors';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    category: string;
    image: string;
    lessons: number;
  };
  onPress?: () => void;
}

export default function CourseCard({ course, onPress }: CourseCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <Image source={{ uri: course.image }} style={styles.image} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.row}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#FFF8E6' }]}>
            <Text style={[styles.badgeText, { color: '#FBB03B' }]}>{course.level}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.desc} numberOfLines={2}>{course.description}</Text>
        <Text style={styles.meta}>{course.lessons} lessons</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  image: { width: '100%', height: 160 },
  body: { padding: 14 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: {
    backgroundColor: Colors.Accent,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: { fontSize: 11, fontWeight: '600', color: Colors.Primary },
  title: { fontSize: 15, fontWeight: '700', color: Colors.Neutral, marginBottom: 4 },
  desc: { fontSize: 13, color: Colors.Disabled, marginBottom: 8 },
  meta: { fontSize: 12, color: Colors.Primary, fontWeight: '600' },
});
