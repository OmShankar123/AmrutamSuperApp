import { StyleSheet } from 'react-native-unistyles';

import { darkTheme } from './themes/dark';
import { lightTheme } from './themes/light';

const breakpoints = {
  xs: 0,
  sm: 375,
  md: 414,
  lg: 768,
  xl: 1024,
};

type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface UnistylesBreakpoints extends AppBreakpoints {}

  export interface UnistylesThemes {
    light: typeof lightTheme;
    dark: typeof darkTheme;
  }
}

StyleSheet.configure({
  themes: { light: lightTheme, dark: darkTheme },
  breakpoints,
  settings: {
    adaptiveThemes: true,
  },
});
