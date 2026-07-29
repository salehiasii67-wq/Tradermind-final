/**
 * Design tokens derived from the TraderMind web app (index.css dark theme).
 * HSL values converted to hex for React Native compatibility.
 */

const colors = {
  light: {
    text: '#0d1017',
    tint: '#3b82f6',
    background: '#f0f1f5',
    foreground: '#0d1017',
    card: '#ffffff',
    cardForeground: '#0d1017',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#e3e7ec',
    secondaryForeground: '#0d1017',
    muted: '#e3e7ec',
    mutedForeground: '#657688',
    accent: '#e3e7ec',
    accentForeground: '#0d1017',
    destructive: '#ef4343',
    destructiveForeground: '#ffffff',
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59f0a',
    warningForeground: '#ffffff',
    border: '#d3d6de',
    input: '#d3d6de',
  },
  dark: {
    text: '#dde2eb',
    tint: '#3b82f6',
    background: '#0d1017',
    foreground: '#dde2eb',
    card: '#161b27',
    cardForeground: '#dde2eb',
    primary: '#3b82f6',
    primaryForeground: '#ffffff',
    secondary: '#1e2333',
    secondaryForeground: '#dde2eb',
    muted: '#1e2333',
    mutedForeground: '#8896a8',
    accent: '#1e2333',
    accentForeground: '#dde2eb',
    destructive: '#ef4343',
    destructiveForeground: '#ffffff',
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59f0a',
    warningForeground: '#ffffff',
    border: '#1e2333',
    input: '#222c3c',
  },
  // 0.75rem = 12px — matches web --radius
  radius: 12,
};

export default colors;
