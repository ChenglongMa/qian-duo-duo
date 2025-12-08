import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e'
    },
    secondary: {
      main: '#f59e0b'
    },
    background: {
      default: '#f4f7f8'
    }
  },
  typography: {
    fontFamily: ['"DM Sans"', 'system-ui', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 12 }
});
