import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

// A single shared value (0 → 1) simultaneously drives:
//   • Card background colour
//   • Orb colour, scale, and rotation
//   • Label opacity and translateY
// This illustrates how one source of truth can orchestrate many visual properties.

const STAGES = [
  { label: 'Rest', value: 0 },
  { label: 'Mid',  value: 0.5 },
  { label: 'Peak', value: 1 },
] as const;

const TIMING = { duration: 650, easing: Easing.out(Easing.cubic) };

const InterpolateSample = () => {
  const [active, setActive] = useState(0);
  const progress = useSharedValue(0);

  const go = (i: number) => {
    setActive(i);
    progress.value = withTiming(STAGES[i].value, TIMING);
  };

  // Background of the preview card
  const cardStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#EEF2FF', '#F5F3FF', '#FFF1F2'],
    ),
  }));

  // Orb: colour + scale + rotation all driven by the same value
  const orbStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#6366F1', '#8B5CF6', '#F43F5E'],
    ),
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.65, 1.3], Extrapolation.CLAMP) },
      { rotate: `${interpolate(progress.value, [0, 1], [0, 180], Extrapolation.CLAMP)}deg` },
    ],
  }));

  // Stage label slides up and brightens as progress rises
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.25], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 0.5], [10, 0], Extrapolation.CLAMP) },
    ],
  }));

  // Progress bar width
  const barStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progress.value, [0, 1], [0, 100], Extrapolation.CLAMP)}%`,
    backgroundColor: interpolateColor(
      progress.value,
      [0, 0.5, 1],
      ['#6366F1', '#8B5CF6', '#F43F5E'],
    ),
  }));

  return (
    <View>
      {/* Preview card */}
      <Animated.View style={[styles.previewCard, cardStyle]}>
        <Animated.View style={[styles.orb, orbStyle]} />
        <Animated.Text style={[styles.stageLabel, labelStyle]}>
          {STAGES[active].label}
        </Animated.Text>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>

      {/* Stage buttons */}
      <View style={styles.buttons}>
        {STAGES.map((s, i) => (
          <Pressable
            key={s.label}
            style={[styles.stageBtn, active === i && styles.stageBtnActive]}
            onPress={() => go(i)}
          >
            <Text style={[styles.stageBtnText, active === i && styles.stageBtnTextActive]}>
              {s.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* API tags */}
      <View style={styles.tags}>
        {['interpolateColor', 'interpolate', 'Extrapolation.CLAMP'].map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewCard: {
    borderRadius: 16,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  orb: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.5,
  },
  track: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginTop: 14,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  stageBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
  },
  stageBtnActive: { backgroundColor: '#6366F1' },
  stageBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  stageBtnTextActive: { color: '#fff' },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: '#6366F1' },
});

export default InterpolateSample;
