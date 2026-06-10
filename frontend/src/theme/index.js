import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary:   { main: '#6366F1' },
    secondary: { main: '#EC4899' },
    success:   { main: '#10B981' },
    warning:   { main: '#F59E0B' },
    error:     { main: '#EF4444' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderRadius: 12 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, backgroundColor: '#F8FAFC' },
      },
    },
  },
})

export default theme
