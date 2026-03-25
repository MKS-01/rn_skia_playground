import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

// CSS keyframe animations — no hooks or shared values required.
// Reanimated 4.x ships a CSS animations API; 4.3.0 extends it to SVG components.

const BARS = [
  { delay: '0s',     color: '#6366F1' },
  { delay: '0.15s',  color: '#8B5CF6' },
  { delay: '0.30s',  color: '#A78BFA' },
  { delay: '0.45s',  color: '#C4B5FD' },
];

const CSS_TAGS = ['animationName', 'animationDelay', 'animationDirection'];

const CSSAnimationSample = () => (
  <View>
    {/* Row: spinning tile + pulsing orb */}
    <View style={styles.row}>
      <Animated.View
        style={[
          styles.spinner,
          {
            animationName: {
              from: { transform: [{ rotate: '0deg' }] },
              to:   { transform: [{ rotate: '360deg' }] },
            },
            animationDuration: '1.8s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
          } as any,
        ]}
      />

      <Animated.View
        style={[
          styles.orb,
          {
            animationName: {
              from: { transform: [{ scale: 1   }], opacity: 1   },
              to:   { transform: [{ scale: 1.4 }], opacity: 0.4 },
            },
            animationDuration: '1.2s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
          } as any,
        ]}
      />
    </View>

    {/* Wave bars */}
    <View style={styles.waveRow}>
      {BARS.map((bar, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            { backgroundColor: bar.color },
            {
              animationName: {
                '0%':   { transform: [{ scaleY: 0.25 }] },
                '50%':  { transform: [{ scaleY: 1    }] },
                '100%': { transform: [{ scaleY: 0.25 }] },
              },
              animationDuration: '0.9s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDelay: bar.delay,
            } as any,
          ]}
        />
      ))}
    </View>

    {/* Property tags */}
    <View style={styles.tags}>
      {CSS_TAGS.map(tag => (
        <View key={tag} style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingVertical: 12,
  },
  spinner: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#6366F1',
  },
  orb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#10B981',
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 60,
    marginTop: 4,
  },
  bar: {
    width: 16,
    height: 48,
    borderRadius: 8,
  },
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

export default CSSAnimationSample;
