/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animations from './src/Animations';
import Skottie from './src/Skottie';
import HeroScreen from './src/HeroScreen';
import ImageSample from './src/ImageSample';

// ─── Floating variant toggle ──────────────────────────────────────────────────
const LABELS = ['Skia', 'Reanimated'];

function FloatingToggle({ variant, onChange }: { variant: number; onChange: (i: number) => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[toggle.wrap, { bottom: insets.bottom + 16 }]}>
      {LABELS.map((label, i) => (
        <Pressable key={label} onPress={() => onChange(i)} style={[toggle.tab, variant === i && toggle.active]}>
          <Text style={[toggle.text, variant === i && toggle.activeText]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

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

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <HeroScreen activeVariant={variant} />
          <Animations />
          <Skottie />

          <View style={styles.bottomPad} />
        </ScrollView>
        <FloatingToggle variant={variant} onChange={setVariant} />
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
