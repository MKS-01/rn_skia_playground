import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from 'react-native-reanimated';

// Each card demonstrates a different spring configuration.
// Press and hold to compress, release to spring back.

const CONFIGS: { label: string; hint: string; config: WithSpringConfig; color: string }[] = [
  {
    label: 'Bouncy',
    hint: 'damping 4 · stiffness 80',
    config: { damping: 4, stiffness: 80 },
    color: '#6366F1',
  },
  {
    label: 'Snappy',
    hint: 'damping 20 · stiffness 300',
    config: { damping: 20, stiffness: 300 },
    color: '#10B981',
  },
  {
    label: 'Smooth',
    hint: 'damping 80 · stiffness 200',
    config: { damping: 80, stiffness: 200 },
    color: '#F59E0B',
  },
];

function SpringCard({
  label,
  hint,
  config,
  color,
}: (typeof CONFIGS)[0]) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.8, config); }}
      onPressOut={() => { scale.value = withSpring(1, config); }}
    >
      <Animated.View style={[styles.card, { backgroundColor: color }, animStyle]}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardHint}>{hint}</Text>
      </Animated.View>
    </Pressable>
  );
}

const SpringPhysicsSample = () => (
  <View style={styles.root}>
    <Text style={styles.tip}>Press and hold each card</Text>
    {CONFIGS.map(c => (
      <SpringCard key={c.label} {...c} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { gap: 10 },
  tip: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 2,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  cardLabel: { fontSize: 15, fontWeight: '700', color: '#fff' },
  cardHint: { fontSize: 11, color: 'rgba(255,255,255,0.72)', fontWeight: '500' },
});

export default SpringPhysicsSample;
