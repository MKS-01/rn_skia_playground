import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ITEMS = [
  { label: 'First',  color: '#6366F1' },
  { label: 'Second', color: '#3B82F6' },
  { label: 'Third',  color: '#10B981' },
  { label: 'Fourth', color: '#F59E0B' },
  { label: 'Fifth',  color: '#EF4444' },
];

const CARD_GAP = 12;

const ScrollSample = () => {
  const { width } = useWindowDimensions();
  const cardWidth = width - 64 - 32; // SectionCard padding + scroll padding

  const animatedRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(0);

  // scrollTo must be called on the UI thread — useDerivedValue runs there
  useDerivedValue(() => {
    scrollTo(animatedRef, scrollX.value, 0, true);
  });

  const scrollToIndex = (index: number) => {
    scrollX.value = withTiming(index * (cardWidth + CARD_GAP), { duration: 500 });
  };

  return (
    <View>
      <Animated.ScrollView
        ref={animatedRef}
        horizontal
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ITEMS.map((item, i) => (
          <View key={item.label} style={[styles.card, { width: cardWidth, backgroundColor: item.color }]}>
            <Text style={styles.cardLabel}>{item.label}</Text>
            <Text style={styles.cardIndex}>{i + 1} / {ITEMS.length}</Text>
          </View>
        ))}
      </Animated.ScrollView>

      <View style={styles.buttons}>
        {ITEMS.map((item, i) => (
          <Pressable
            key={item.label}
            style={[styles.dot, { backgroundColor: item.color }]}
            onPress={() => scrollToIndex(i)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: { gap: CARD_GAP, paddingHorizontal: 2 },
  card: {
    height: 120,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: { fontSize: 20, fontWeight: '700', color: '#fff' },
  cardIndex: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});

export default ScrollSample;
