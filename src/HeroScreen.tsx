import React, { useEffect } from 'react';
import {
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MeshBackground from './MeshBackground';

interface HeroScreenProps {
  activeVariant: number;
  scrollOffset: SharedValue<number>;
}

const HeroScreen = ({ activeVariant, scrollOffset }: HeroScreenProps) => {
  const { height } = useWindowDimensions();
  const heroH = height * 0.48;

  const variantAnim = useSharedValue(0);
  useEffect(() => {
    variantAnim.value = withTiming(activeVariant, { duration: 900 });
  }, [activeVariant, variantAnim]);

  // ── Scroll-driven effects ──────────────────────────────────────────────────
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

  // Eyebrow + description share the same fade-in animation
  const fadeInStyle = useAnimatedStyle(() => ({
    opacity: variantAnim.value,
    transform: [{ translateY: (1 - variantAnim.value) * 8 }],
  }));

  return (
    <View style={styles.screen}>
      {/* ── Hero ── */}
      <Animated.View style={[styles.hero, { height: heroH }, heroWrapStyle]}>
        <Animated.View style={bgZoomStyle}>
          <MeshBackground variant={activeVariant} height={heroH} />
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
          <Animated.Text style={[styles.eyebrow, fadeInStyle]}>
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

          <Animated.Text style={[styles.heroDesc, fadeInStyle]}>
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
