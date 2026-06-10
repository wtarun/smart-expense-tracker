import { Box, CircularProgress } from '@mui/material'

export default function LoadingSpinner({ minHeight = 300 }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight }}>
      <CircularProgress />
    </Box>
  )
}
