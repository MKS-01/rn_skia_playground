import React, { useEffect, useMemo } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Canvas, Vertices, vec } from '@shopify/react-native-skia';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

// ─── Mesh config ──────────────────────────────────────────────────────────────
const CR = 4;
const CC = 4;
const FR = 20;
const FC = 20;

const FREQS = [
  [0.28, 0.20, 0.33, 0.25],
  [0.22, 0.35, 0.18, 0.30],
  [0.31, 0.17, 0.26, 0.38],
  [0.19, 0.34, 0.23, 0.27],
];
const PHASE = [
  [0.0, 1.2, 2.5, 0.8],
  [1.7, 0.4, 2.1, 1.0],
  [0.6, 1.9, 0.3, 2.3],
  [1.4, 0.1, 1.1, 2.7],
];

// Variant 1 — warm rose / peach
const V1_HUES = [
  [345, 352, 18, 28],
  [338, 348, 12, 22],
  [342, 346, 355, 16],
  [332, 340, 350,  8],
];
const V1_SAT = 42;
const V1_LIT = 84;

// Variant 2 — cool periwinkle / lavender
const V2_HUES = [
  [210, 220, 232, 245],
  [205, 215, 228, 240],
  [212, 224, 235, 248],
  [200, 212, 226, 242],
];
const V2_SAT = 38;
const V2_LIT = 88;

// ─── Worklet helpers ─────────────────────────────────────────────────────────
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  'worklet';
  const hh = ((h % 360) + 360) % 360;
  const ss = s / 100;
  const ll = l / 100;
  const c = (1 - Math.abs(2 * ll - 1)) * ss;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = ll - c / 2;
  let r = 0, g = 0, b = 0;
  if      (hh < 60)  { r = c; g = x; }
  else if (hh < 120) { r = x; g = c; }
  else if (hh < 180) {         g = c; b = x; }
  else if (hh < 240) {         g = x; b = c; }
  else if (hh < 300) { r = x;         b = c; }
  else               { r = c;         b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function bilinear(
  c00: [number, number, number], c10: [number, number, number],
  c01: [number, number, number], c11: [number, number, number],
  tx: number, ty: number,
): [number, number, number] {
  'worklet';
  const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty);
  const w01 = (1 - tx) * ty,       w11 = tx * ty;
  return [
    Math.round(c00[0]*w00 + c10[0]*w10 + c01[0]*w01 + c11[0]*w11),
    Math.round(c00[1]*w00 + c10[1]*w10 + c01[1]*w01 + c11[1]*w11),
    Math.round(c00[2]*w00 + c10[2]*w10 + c01[2]*w01 + c11[2]*w11),
  ];
}

// ─── Main screen ──────────────────────────────────────────────────────────────
interface HeroScreenProps {
  activeVariant: number;
  scrollOffset: SharedValue<number>;
}

const HeroScreen = ({ activeVariant, scrollOffset }: HeroScreenProps) => {
  const { width, height } = useWindowDimensions();
  const heroH = height * 0.48;

  const variantAnim = useSharedValue(0);

  useEffect(() => {
    variantAnim.value = withTiming(activeVariant, { duration: 900 });
  }, [activeVariant, variantAnim]);

  // Mesh vertices + indices (static)
  const { vertices, indices } = useMemo(() => {
    const verts = [];
    for (let row = 0; row <= FR; row++) {
      for (let col = 0; col <= FC; col++) {
        verts.push(vec((col / FC) * width, (row / FR) * heroH));
      }
    }
    const idx: number[] = [];
    for (let row = 0; row < FR; row++) {
      for (let col = 0; col < FC; col++) {
        const tl = row * (FC + 1) + col;
        const tr = tl + 1;
        const bl = (row + 1) * (FC + 1) + col;
        const br = bl + 1;
        idx.push(tl, tr, bl, tr, br, bl);
      }
    }
    return { vertices: verts, indices: idx };
  }, [width, heroH]);

  const time = useSharedValue(0);
  useFrameCallback(info => { time.value = info.timestamp / 1000; });

  // Colors animated between variants
  const colors = useDerivedValue(() => {
    const t = time.value;
    const v = variantAnim.value;
    const swing = 10;

    const ctrl: Array<Array<[number, number, number]>> = [];
    for (let r = 0; r < CR; r++) {
      const row: Array<[number, number, number]> = [];
      for (let c = 0; c < CC; c++) {
        const osc = Math.sin(FREQS[r][c] * t + PHASE[r][c]);
        const h1 = V1_HUES[r][c] + osc * swing;
        const h2 = V2_HUES[r][c] + osc * (swing * 0.6);
        const hue = h1 * (1 - v) + h2 * v;
        const sat = V1_SAT * (1 - v) + V2_SAT * v;
        const lit = V1_LIT * (1 - v) + V2_LIT * v;
        row.push(hslToRgb(hue, sat, lit));
      }
      ctrl.push(row);
    }

    const result: string[] = [];
    for (let row = 0; row <= FR; row++) {
      for (let col = 0; col <= FC; col++) {
        const gx = (col / FC) * (CC - 1);
        const gy = (row / FR) * (CR - 1);
        const cx0 = Math.min(Math.floor(gx), CC - 2);
        const cy0 = Math.min(Math.floor(gy), CR - 2);
        const [r, g, b] = bilinear(
          ctrl[cy0][cx0], ctrl[cy0][cx0 + 1],
          ctrl[cy0 + 1][cx0], ctrl[cy0 + 1][cx0 + 1],
          gx - cx0, gy - cy0,
        );
        result.push(`rgb(${r},${g},${b})`);
      }
    }
    return result;
  });

  // ── Scroll-driven effects ──────────────────────────────────────────────────
  // Container zooms out, background zooms in — creates depth on scroll
  const heroWrapStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(scrollOffset.value, [0, heroH], [1, 0.93], Extrapolation.CLAMP),
    }],
  }));

  const bgZoomStyle = useAnimatedStyle(() => ({
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    transform: [{
      scale: interpolate(scrollOffset.value, [0, heroH], [1, 1.18], Extrapolation.CLAMP),
    }],
  }));

  const overlayStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#fff',
    opacity: interpolate(scrollOffset.value, [0, heroH * 0.6], [0, 0.45], Extrapolation.CLAMP),
  }));

  const contentScrollStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, heroH * 0.45], [1, 0], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollOffset.value, [0, heroH * 0.45], [0, -28], Extrapolation.CLAMP),
    }],
  }));

  const topBarScrollStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollOffset.value, [0, heroH * 0.35], [1, 0.2], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollOffset.value, [0, heroH * 0.35], [0, -12], Extrapolation.CLAMP),
    }],
  }));

  // CTA button color + bounce
  const ctaScale = useSharedValue(1);
  const ctaScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ctaScale.value }],
  }));
  const ctaAnimStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(variantAnim.value, [0, 1], ['#1C1C1E', '#2563EB']),
  }));

  // Variant 1 title fades out, variant 2 fades in
  const title1Style = useAnimatedStyle(() => ({
    opacity: 1 - variantAnim.value,
    position: 'absolute',
    transform: [{ translateY: -variantAnim.value * 10 }],
  }));
  const title2Style = useAnimatedStyle(() => ({
    opacity: variantAnim.value,
    transform: [{ translateY: (1 - variantAnim.value) * 10 }],
  }));

  // Eyebrow + description fade in for variant 2
  const eyebrowStyle = useAnimatedStyle(() => ({
    opacity: variantAnim.value,
    transform: [{ translateY: (1 - variantAnim.value) * 8 }],
  }));
  const descStyle = useAnimatedStyle(() => ({
    opacity: variantAnim.value,
    transform: [{ translateY: (1 - variantAnim.value) * 8 }],
  }));

  return (
    <View style={styles.screen}>
      {/* ── Hero ── */}
      <Animated.View style={[styles.hero, { height: heroH }, heroWrapStyle]}>
        <Animated.View style={bgZoomStyle}>
          <Canvas style={StyleSheet.absoluteFill}>
            <Vertices vertices={vertices} colors={colors} indices={indices} />
          </Canvas>
        </Animated.View>
        <Animated.View style={overlayStyle} pointerEvents="none" />

        {/* Top bar */}
        <Animated.View style={[styles.topBar, topBarScrollStyle]}>
          <Text style={styles.appName}>
            {activeVariant === 0 ? 'Skia' : 'Reanimated'}
          </Text>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>◈</Text>
            <Text style={styles.badgeText}>
              {activeVariant === 0 ? 'GPU Powered' : 'UI Thread'}
            </Text>
          </View>
        </Animated.View>

        {/* Hero content */}
        <Animated.View style={[styles.heroContent, contentScrollStyle]}>
          <Animated.Text style={[styles.eyebrow, eyebrowStyle]}>
            REACT NATIVE REANIMATED
          </Animated.Text>

          {/* Crossfading titles */}
          <View style={styles.titleWrap}>
            <Animated.Text style={[styles.heroTitle, title1Style]}>
              Draw at the{'\n'}speed of light
            </Animated.Text>
            <Animated.Text style={[styles.heroTitle, title2Style]}>
              Animate with{'\n'}precision
            </Animated.Text>
          </View>

          <Animated.Text style={[styles.heroDesc, descStyle]}>
            Worklet-powered animations{'\n'}running natively on the UI thread
          </Animated.Text>

          <Animated.View style={[styles.ctaButton, ctaAnimStyle, ctaScaleStyle]}>
            <Pressable
              style={styles.ctaInner}
              onPressIn={() => { ctaScale.value = withSpring(0.9, { damping: 12 }); }}
              onPressOut={() => { ctaScale.value = withSpring(1, { damping: 8, stiffness: 180 }); }}
              onPress={() => Linking.openURL(activeVariant === 0
                ? 'https://shopify.github.io/react-native-skia/'
                : 'https://docs.swmansion.com/react-native-reanimated/'
              )}
            >
              <Text style={styles.ctaText}>
                {activeVariant === 0 ? 'Explore Skia' : 'Explore Reanimated'}
              </Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      {/* ── Peeking card ── */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          {activeVariant === 0 ? 'SKIA GRAPHICS ENGINE' : 'REANIMATED 4'}
        </Text>
        <Text style={styles.cardHint}>
          {activeVariant === 0
            ? 'Hardware-accelerated 2D rendering'
            : '60fps animations on the UI thread'}
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: '#F9FAFB' },
  // Hero
  hero: { overflow: 'hidden' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 68,
  },
  appName: { fontSize: 26, fontWeight: '700', color: '#1C1C1E' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeIcon: { fontSize: 11, color: '#374151' },
  badgeText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  // Content
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  titleWrap: {
    height: 90,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#6366F1',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1C1C1E',
    lineHeight: 42,
  },
  heroDesc: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    borderRadius: 30,
    marginTop: 4,
  },
  ctaInner: {
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  // Card peek
  card: {
    marginHorizontal: 16,
    marginTop: 12,
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
  cardLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: '#9CA3AF' },
  cardHint: { fontSize: 14, fontWeight: '500', color: '#111827', marginTop: 4 },
});

export default HeroScreen;
