import {
  Box, Chip, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material'
import EmptyState from '../../components/common/EmptyState'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0)

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

export default function RecentExpenses({ expenses }) {
  if (!expenses?.length) return <EmptyState title="No recent expenses" subtitle="Add an expense to see it here." />

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow sx={{ '& th': { fontWeight: 600, backgroundColor: 'action.hover' } }}>
            <TableCell>Date</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Category</TableCell>
            <TableCell align="right">Amount</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {expenses.map((exp) => (
            <TableRow key={exp.id} hover>
              <TableCell>
                <Typography variant="body2" color="text.secondary">{formatDate(exp.expense_date)}</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>{exp.title}</Typography>
              </TableCell>
              <TableCell>
                {exp.category && (
                  <Chip
                    label={exp.category.name}
                    size="small"
                    sx={{ backgroundColor: exp.category.color ?? 'primary.light', color: 'white', fontWeight: 500 }}
                  />
                )}
              </TableCell>
              <TableCell align="right">
                <Typography variant="body2" fontWeight={600} color="primary.main">
                  {formatCurrency(exp.amount)}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
