import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Layout / entering animations with staggered delays.
// FadeInDown.delay() chains on the animation builder — no shared values needed.
// Tap "Replay" to remount and re-trigger the sequence.

const FEATURES = [
  { dot: '#6366F1', title: 'UI Thread',        sub: 'Animations run natively — zero JS bridge round-trips' },
  { dot: '#3B82F6', title: 'worklets',          sub: 'Serialisable JS functions shipped to the UI runtime' },
  { dot: '#10B981', title: 'Shared Values',     sub: 'Reactive state readable on both JS and UI threads' },
  { dot: '#F59E0B', title: 'useAnimatedStyle',  sub: 'Derives animated styles directly from shared values' },
  { dot: '#EF4444', title: 'CSS Animations',    sub: 'Keyframe animations without any hooks — new in v4' },
];

const StaggerSample = () => {
  // Increment key to remount children and retrigger entering animations
  const [epoch, setEpoch] = useState(0);

  return (
    <View>
      <View key={epoch} style={styles.list}>
        {FEATURES.map((item, i) => (
          <Animated.View
            key={item.title}
            entering={FadeInDown.delay(i * 90).springify().damping(14)}
            style={styles.row}
          >
            <View style={[styles.dot, { backgroundColor: item.dot }]} />
            <View style={styles.text}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
          </Animated.View>
        ))}
      </View>

      <Pressable style={styles.btn} onPress={() => setEpoch(e => e + 1)}>
        <Text style={styles.btnText}>Replay</Text>
      </Pressable>

      <View style={styles.tags}>
        {['FadeInDown', '.delay()', '.springify()'].map(tag => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 15 },
  btn: {
    marginTop: 14,
    alignSelf: 'center',
    backgroundColor: '#6366F1',
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 22,
  },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
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

export default StaggerSample;
