import { Platform } from 'react-native';

const tintColorLight = '#0024FF';
const tintColorDark = '#FCCD12';

export const Colors = {
  light: {
    text: '#FFFFFF',
    background: '#020B2E',
    tint: tintColorLight,
    icon: '#FFFFFF',
    tabIconDefault: '#8A96B8',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#020B2E',
    tint: tintColorDark,
    icon: '#FFFFFF',
    tabIconDefault: '#8A96B8',
    tabIconSelected: tintColorDark,
  },
};

export const theme = {
  colors: {
    background: '#020B2E',
    secondary: '#070F33',
    primary: '#0024FF',
    yellow: '#FCCD12',
    text: '#FFFFFF',
    muted: '#9AA7C9',
    card: '#0A163F',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
