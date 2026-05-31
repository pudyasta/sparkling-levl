import React, { useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Badge from '@/components/common/Badge/Badge';
import { Colors } from '@/constant/style';
import { htmlToPlainText } from '@/lib/helper/htmlToText';

const LEVEL_VARIANT: Record<string, 'info' | 'warning' | 'danger'> = {
  DASAR: 'info',
  MENENGAH: 'warning',
  MAHIR: 'danger',
};

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    level: string;
    lessons: number;
    category: string;
    image: string;
  };
  bindTap: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, bindTap }) => {
  const levelVariant = LEVEL_VARIANT[course.level?.toUpperCase()] ?? 'neutral';
  const excerpt = course.description
    ? htmlToPlainText(course.description).split(' ').slice(0, 30).join(' ') + '...'
    : '';

  useEffect(() => {
    console.log(course);
  }, [course]);

  return (
    <TouchableOpacity onPress={bindTap} activeOpacity={0.8} style={styles.card}>
      {course.image ? (
        <Image source={{ uri: course.image }} style={styles.banner} resizeMode="cover" />
      ) : (
        <View style={[styles.banner, { backgroundColor: Colors.N100 }]} />
      )}

      <View style={styles.content}>
        {course.level && (
          <Badge variant={levelVariant}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1).toLowerCase()}
          </Badge>
        )}

        <Text size={TextType.b2} fontWeight="600" color={Colors.N900} numberOfLines={2}>
          {course.title}
        </Text>

        {excerpt ? (
          <Text size={TextType.b3} color={Colors.TextTertiary} numberOfLines={2}>
            {excerpt}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <Text size={TextType.p} fontWeight="600" color={Colors.Primary}>
            Lihat Selengkapnya
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  banner: { height: 128, width: '100%' },
  content: { padding: 12, gap: 8 },
  footer: { flexDirection: 'row', justifyContent: 'flex-end', paddingTop: 4 },
});

export default CourseCard;
