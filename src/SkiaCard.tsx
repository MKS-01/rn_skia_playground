import React, { useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Canvas, RoundedRect, Shadow } from '@shopify/react-native-skia';

const SHADOW_SPACE = 24;
const RADIUS = 18;

interface SkiaCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const SkiaCard = ({ children, style }: SkiaCardProps) => {
  const [size, setSize] = useState({ w: 0, h: 0 });

  return (
    <View style={[styles.wrap, style]}>
      <View
        onLayout={({ nativeEvent: { layout } }) =>
          setSize({ w: layout.width, h: layout.height })
        }
      >
        {size.w > 0 && (
          <Canvas
            style={{
              position: 'absolute',
              top: -SHADOW_SPACE,
              left: -SHADOW_SPACE,
              width: size.w + SHADOW_SPACE * 2,
              height: size.h + SHADOW_SPACE * 2,
            }}
          >
            <RoundedRect
              x={SHADOW_SPACE}
              y={SHADOW_SPACE}
              width={size.w}
              height={size.h}
              r={RADIUS}
              color="white"
            >
              <Shadow dx={0} dy={6} blur={18} color="rgba(0,0,0,0.10)" />
              <Shadow dx={0} dy={2} blur={4}  color="rgba(0,0,0,0.06)" />
            </RoundedRect>
          </Canvas>
        )}
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

export default SkiaCard;
