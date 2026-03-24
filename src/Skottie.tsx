import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Canvas, Skia, Skottie as SkottieView } from '@shopify/react-native-skia';
import { useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// Minimal Lottie JSON: pulsing circle with color animation
const LOTTIE_JSON = {
  v: '5.9.0',
  fr: 60,
  ip: 0,
  op: 120,
  w: 256,
  h: 256,
  nm: 'Pulse',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [128, 128, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [40, 40, 100] },
            { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [130, 130, 100] },
            { t: 120, s: [40, 40, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [
        {
          ty: 'el',
          nm: 'Ellipse Path',
          d: 1,
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [90, 90] },
        },
        {
          ty: 'fl',
          nm: 'Fill',
          c: {
            a: 1,
            k: [
              { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 0, s: [0.22, 0.33, 1, 1] },
              { i: { x: [0.5], y: [1] }, o: { x: [0.5], y: [0] }, t: 60, s: [0.96, 0.25, 0.37, 1] },
              { t: 120, s: [0.22, 0.33, 1, 1] },
            ],
          },
          o: { a: 0, k: 100 },
          r: 1,
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
    },
  ],
};

const SIZE = 256;

const Skottie = () => {
  const animation = useMemo(() => Skia.Skottie.Make(JSON.stringify(LOTTIE_JSON))!, []);
  const totalFrames = animation.duration() * animation.fps();
  const durationMs = animation.duration() * 1000;

  const frame = useSharedValue(0);
  useEffect(() => {
    frame.value = withRepeat(withTiming(totalFrames - 1, { duration: durationMs }), -1, false);
  }, [frame, totalFrames, durationMs]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skottie (Lottie via Skia)</Text>
      <Canvas style={styles.canvas}>
        <SkottieView animation={animation} frame={frame} />
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { fontSize: 15, fontWeight: '700', paddingHorizontal: 16, marginBottom: 4 },
  canvas: { width: SIZE, height: SIZE, alignSelf: 'center' },
});

export default Skottie;
