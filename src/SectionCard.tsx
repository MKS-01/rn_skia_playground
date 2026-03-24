import React from 'react';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';

interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

const SectionCard = ({ title, description, children, style }: SectionCardProps) => (
  <View style={[styles.card, style]}>
    <Text style={styles.title}>{title}</Text>
    {description && <Text style={styles.description}>{description}</Text>}
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
      },
    }),
  },
  title: { fontSize: 15, fontWeight: '700', color: '#111827' },
  description: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  content: { marginTop: 12 },
});

export default SectionCard;
