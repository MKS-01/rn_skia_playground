import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const BOX_SIZE = 64;
const DURATION = 600;
const EASING = Easing.out(Easing.cubic);

const ReanimatedSample = () => {
  const { width } = useWindowDimensions();
  // account for card padding (16*2) + SectionCard margin (16*2)
  const trackWidth = width - 64;
  const maxTravel = trackWidth - BOX_SIZE;

  const [toggled, setToggled] = useState(false);
  const progress = useSharedValue(0);

  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * maxTravel }],
    borderRadius: progress.value * (BOX_SIZE / 2),
    backgroundColor: interpolateColor(progress.value, [0, 1], ['#6366F1', '#10B981']),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: 0.4 + progress.value * 0.6,
    transform: [{ scale: 0.9 + progress.value * 0.1 }],
  }));

  const onPress = () => {
    const next = !toggled;
    setToggled(next);
    progress.value = withTiming(next ? 1 : 0, {
      duration: DURATION,
      easing: EASING,
    });
  };

  return (
    <View>
      {/* Animated box */}
      <View style={[styles.track, { width: trackWidth }]}>
        <Animated.View style={[styles.box, boxStyle]} />
      </View>

      {/* Live label */}
      <Animated.Text style={[styles.hint, labelStyle]}>
        {toggled ? 'Morphed →' : '← Original'}
      </Animated.Text>

      {/* Property tags */}
      <View style={styles.tags}>
        {['translateX', 'borderRadius', 'color'].map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>Animate</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: BOX_SIZE,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  tagText: { fontSize: 11, fontWeight: '600', color: '#6366F1' },
  button: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 24,
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default ReanimatedSample;
