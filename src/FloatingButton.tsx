import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const W = 172;
const H = 48;
const R = H / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FloatingButton = ({ onPress }: { onPress?: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.pressable, animatedStyle]}
      onPressIn={() => { scale.value = withSpring(0.93, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={onPress}
    >
      {/* Gradient pill background via Skia */}
      <Canvas style={styles.canvas}>
        <RoundedRect x={0} y={0} width={W} height={H} r={R}>
          <LinearGradient
            start={vec(0, H / 2)}
            end={vec(W, H / 2)}
            colors={['#7C3AED', '#A855F7', '#EC4899']}
          />
        </RoundedRect>
      </Canvas>

      {/* Label overlay */}
      <View style={[StyleSheet.absoluteFill, styles.row]}>
        <Text style={styles.sparkle}>✦</Text>
        <Text style={styles.label}>Button</Text>
      </View>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  pressable: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: W,
    height: H,
    // shadow
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  canvas: {
    width: W,
    height: H,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  sparkle: {
    color: '#fff',
    fontSize: 14,
  },
  label: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default FloatingButton;
