import { createTheme } from '@mui/material/styles';

export const herdTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1F6B4A', dark: '#0F3D2E', light: '#3D8B68', contrastText: '#fff' },
    secondary: { main: '#C4A35A', dark: '#8C6D2E', contrastText: '#1A1408' },
    background: { default: '#F3F0E8', paper: '#FFFcf7' },
    error: { main: '#B42318' },
    warning: { main: '#B54708' },
    success: { main: '#1F6B4A' },
    text: { primary: '#1A2420', secondary: '#5C675F' },
  },
  typography: {
    fontFamily: '"DM Sans", system-ui, sans-serif',
    h1: { fontFamily: 'Fraunces, serif', fontWeight: 650 },
    h2: { fontFamily: 'Fraunces, serif', fontWeight: 650 },
    h3: { fontFamily: 'Fraunces, serif', fontWeight: 650 },
    h4: { fontFamily: 'Fraunces, serif', fontWeight: 650, letterSpacing: '-0.02em' },
    h5: { fontFamily: 'Fraunces, serif', fontWeight: 650 },
    h6: { fontFamily: 'Fraunces, serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(15, 61, 46, 0.06)',
          border: '1px solid rgba(15, 61, 46, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
  },
});
