import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import { Box, Typography } from '@mui/material'

export default function EmptyState({ icon, title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
      {icon ?? <ReceiptLongIcon sx={{ fontSize: 64, opacity: 0.3, mb: 2 }} />}
      <Typography variant="h6" gutterBottom>{title ?? 'No data'}</Typography>
      {subtitle && <Typography variant="body2">{subtitle}</Typography>}
    </Box>
  )
}
