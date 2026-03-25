/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { memo, useCallback, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import Animated, { scrollTo, useAnimatedRef, useDerivedValue, useSharedValue, useScrollOffset } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animations from './src/Animations';
import Skottie from './src/Skottie';
import HeroScreen from './src/HeroScreen';
import SectionCard from './src/SectionCard';
import ReanimatedSample from './src/ReanimatedSample';
import ScrollSample from './src/ScrollSample';
import CSSAnimationSample from './src/CSSAnimationSample';
import SpringPhysicsSample from './src/SpringPhysicsSample';
import StaggerSample from './src/StaggerSample';
import InterpolateSample from './src/InterpolateSample';

// ─── Floating variant toggle ──────────────────────────────────────────────────
const LABELS = ['Skia', 'Reanimated'];

const FloatingToggle = memo(function FloatingToggle({ variant, onChange }: { variant: number; onChange: (i: number) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[toggle.wrap, { bottom: insets.bottom + 4 }]}>
      {LABELS.map((label, i) => (
        <Pressable key={label} onPress={() => onChange(i)} style={[toggle.tab, variant === i && toggle.active]}>
          <Text style={[toggle.text, variant === i && toggle.activeText]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
});

const toggle = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(15,15,20,0.82)',
    borderRadius: 30,
    padding: 4,
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  tab: { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 26 },
  active: { backgroundColor: '#fff' },
  text: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.55)' },
  activeText: { color: '#111827' },
});

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [variant, setVariant] = useState(0);

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollTrigger = useSharedValue(0);
  const scrollOffset = useScrollOffset(scrollRef);

  useDerivedValue(() => {
    if (scrollTrigger.value > 0) {
      scrollTo(scrollRef, 0, 0, true);
    }
  });

  const handleVariantChange = useCallback((i: number) => {
    setVariant(i);
    scrollTrigger.value += 1;
  }, [scrollTrigger]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.root}>
        <Animated.ScrollView ref={scrollRef} contentContainerStyle={styles.scroll}>
          <HeroScreen activeVariant={variant} scrollOffset={scrollOffset} />
          {variant === 0 ? (
            <>
              <SectionCard title="Skia Animations" description="Hardware-accelerated canvas animations">
                <Animations />
              </SectionCard>
              <SectionCard title="Skottie" description="Lottie animations rendered via Skia">
                <Skottie />
              </SectionCard>
            </>
          ) : (
            <>
              <SectionCard title="withTiming" description="Animates translateX, borderRadius & color simultaneously">
                <ReanimatedSample />
              </SectionCard>
              <SectionCard title="scrollTo" description="Programmatic animated scroll via UI thread">
                <ScrollSample />
              </SectionCard>
              <SectionCard title="CSS Animations" description="Keyframe animations without hooks — new in v4.3">
                <CSSAnimationSample />
              </SectionCard>
              <SectionCard title="Spring Physics" description="Press and hold — three spring configs compared side by side">
                <SpringPhysicsSample />
              </SectionCard>
              <SectionCard title="Stagger Entry" description="Layout entering animations chained with delay and spring">
                <StaggerSample />
              </SectionCard>
              <SectionCard title="Interpolation" description="One shared value drives colour, scale, rotation and position simultaneously">
                <InterpolateSample />
              </SectionCard>
            </>
          )}

          <View style={styles.bottomPad} />
        </Animated.ScrollView>
        <FloatingToggle variant={variant} onChange={handleVariantChange} />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  bottomPad: { height: 80 },
});

export default App;
