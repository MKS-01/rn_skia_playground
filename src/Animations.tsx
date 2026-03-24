import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Circle, interpolateColors } from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SIZE = 300;

const Animations = () => {
  // 1. Bouncing ball — cy animates up/down
  const cy = useSharedValue(50);
  useEffect(() => {
    cy.value = withRepeat(
      withTiming(250, { duration: 700, easing: Easing.bounce }),
      -1,
      true,
    );
  }, [cy]);

  // 2. Pulsing circle — radius grows and shrinks
  const r = useSharedValue(15);
  useEffect(() => {
    r.value = withRepeat(
      withTiming(55, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [r]);

  // 3. Color-animated circle — uses Skia's interpolateColors (not Reanimated's)
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
  }, [progress]);
  const color = useDerivedValue(() =>
    interpolateColors(progress.value, [0, 0.5, 1], ['#3B82F6', '#EC4899', '#3B82F6']),
  );

  return (
    <Canvas style={styles.canvas}>
      {/* Bouncing ball */}
      <Circle cx={75} cy={cy} r={25} color="#06B6D4" />
      {/* Pulsing circle */}
      <Circle cx={150} cy={150} r={r} color="#F97316" />
      {/* Color-cycling circle */}
      <Circle cx={240} cy={150} r={35} color={color} />
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: { width: SIZE, height: SIZE, alignSelf: 'center' },
});

export default Animations;
