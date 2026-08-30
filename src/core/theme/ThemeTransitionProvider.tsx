import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Image as SvgImage, Mask, Rect } from 'react-native-svg';
import { UnistylesRuntime } from 'react-native-unistyles';
import { captureRef } from 'react-native-view-shot';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ThemeTransitionContextType {
  switchThemeWithAnimation: (
    targetMode: 'light' | 'dark' | 'system',
    origin?: { x: number; y: number },
    onComplete?: () => void,
  ) => void;
}

const ThemeTransitionContext = createContext<ThemeTransitionContextType>({
  switchThemeWithAnimation: () => {},
});

export const useThemeTransition = () => useContext(ThemeTransitionContext);

const { width: W, height: H } = Dimensions.get('window');

const waitFrames = (n: number): Promise<void> =>
  new Promise((resolve) => {
    let count = 0;
    const step = () => {
      if (++count >= n) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

export function ThemeTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const containerRef = useRef<View>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [origin, setOrigin] = useState({ x: W / 2, y: H / 3 });
  const radius = useSharedValue(0);

  const onDone = useCallback(
    (onComplete?: () => void) => {
      setSnapshot(null);
      radius.value = 0;
      onComplete?.();
    },
    [radius],
  );

  const switchThemeWithAnimation = useCallback(
    async (
      targetMode: 'light' | 'dark' | 'system',
      touchOrigin?: { x: number; y: number },
      onComplete?: () => void,
    ) => {
      const pt = touchOrigin ?? { x: W / 2, y: H / 3 };
      setOrigin(pt);

      let uri: string | null = null;
      try {
        if (containerRef.current) {
          const b64 = await captureRef(containerRef, {
            format: 'jpg',
            quality: 0.88,
            result: 'base64',
          });
          uri = `data:image/jpeg;base64,${b64}`;
        }
      } catch {
        applyTheme(targetMode);
        onComplete?.();
        return;
      }

      if (!uri) {
        applyTheme(targetMode);
        onComplete?.();
        return;
      }

      setSnapshot(uri);
      radius.value = 0;
      await waitFrames(2);

      applyTheme(targetMode);
      await waitFrames(5);

      const maxR = calcMaxR(pt.x, pt.y);
      radius.value = withTiming(
        maxR,
        { duration: 800, easing: Easing.bezier(0.2, 0, 0, 1) },
        (finished) => {
          if (finished) runOnJS(onDone)(onComplete);
        },
      );
    },
    [onDone, radius],
  );

  const maxR = calcMaxR(origin.x, origin.y);

  const animatedProps = useAnimatedProps(() => ({
    r: radius.value,
  }));

  return (
    <ThemeTransitionContext.Provider value={{ switchThemeWithAnimation }}>
      <View ref={containerRef} collapsable={false} style={styles.fill}>
        {children}
      </View>

      {snapshot ? (
        <View pointerEvents="none" style={styles.overlay}>
          <Svg height={H} style={StyleSheet.absoluteFill} width={W}>
            <Defs>
              <Mask id="circular-reveal">
                <Rect fill="white" height={H} width={W} x={0} y={0} />
                <AnimatedCircle
                  animatedProps={animatedProps}
                  cx={origin.x}
                  cy={origin.y}
                  fill="black"
                />
              </Mask>
            </Defs>
            <SvgImage
              height={H}
              href={snapshot}
              mask="url(#circular-reveal)"
              preserveAspectRatio="xMidYMid slice"
              width={W}
              x={0}
              y={0}
            />
          </Svg>
        </View>
      ) : null}
    </ThemeTransitionContext.Provider>
  );
}

function applyTheme(mode: 'light' | 'dark' | 'system') {
  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode);
  }
}

function calcMaxR(x: number, y: number): number {
  return Math.ceil(Math.hypot(Math.max(x, W - x), Math.max(y, H - y))) + 4;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: W,
    height: H,
    zIndex: 99999,
  },
});
