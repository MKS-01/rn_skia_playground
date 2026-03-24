import React, { useCallback, useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Canvas, Vertices, vec } from '@shopify/react-native-skia';
import { useFrameCallback, useSharedValue, withTiming } from 'react-native-reanimated';
import { FC, FR, useMeshColors } from './meshConfig';

interface MeshBackgroundProps {
  variant: number;
  height?: number;
}

const MeshBackground = ({ variant, height: heightProp }: MeshBackgroundProps) => {
  const { width, height: screenHeight } = useWindowDimensions();
  const meshHeight = heightProp ?? screenHeight;

  const variantAnim = useSharedValue(0);
  useEffect(() => {
    variantAnim.value = withTiming(variant, { duration: 900 });
  }, [variant, variantAnim]);

  const { vertices, indices } = useMemo(() => {
    const verts = [];
    for (let row = 0; row <= FR; row++) {
      for (let col = 0; col <= FC; col++) {
        verts.push(vec((col / FC) * width, (row / FR) * meshHeight));
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
  }, [width, meshHeight]);

  const time = useSharedValue(0);
  const onFrame = useCallback((info: { timestamp: number }) => {
    'worklet';
    time.value = info.timestamp / 1000;
  }, [time]);
  useFrameCallback(onFrame);

  const colors = useMeshColors(time, variantAnim);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Vertices vertices={vertices} colors={colors} indices={indices} />
    </Canvas>
  );
};

export default MeshBackground;
