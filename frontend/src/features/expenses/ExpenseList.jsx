import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import {
  Box, Chip, IconButton, Pagination,
  Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  TableSortLabel, Typography,
} from '@mui/material'
import EmptyState from '../../components/common/EmptyState'

const formatAmount = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const formatDate = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const PAYMENT_LABELS = {
  cash: 'Cash', card: 'Card', bank_transfer: 'Bank', upi: 'UPI', other: 'Other',
}

export default function ExpenseList({ expenses, pagination, ordering, onSort, onPageChange, onEdit, onDelete }) {
  const { page, count, pageSize } = pagination
  const totalPages = Math.ceil(count / pageSize)

  const SortCell = ({ field, label }) => (
    <TableCell sortDirection={ordering.field === field ? ordering.dir : false} sx={{ fontWeight: 600 }}>
      <TableSortLabel
        active={ordering.field === field}
        direction={ordering.field === field ? ordering.dir : 'asc'}
        onClick={() => onSort(field)}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  )

  if (!expenses.length) return <EmptyState title="No expenses found" subtitle="Add your first expense using the button above." />

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: 'action.hover' } }}>
              <SortCell field="expense_date" label="Date" />
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <SortCell field="amount" label="Amount" />
              <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {expenses.map(exp => (
              <TableRow key={exp.id} hover>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{formatDate(exp.expense_date)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{exp.title}</Typography>
                  {exp.notes && <Typography variant="caption" color="text.secondary" noWrap display="block" maxWidth={200}>{exp.notes}</Typography>}
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
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="primary.main">
                    {formatAmount(exp.amount)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {PAYMENT_LABELS[exp.payment_method] ?? exp.payment_method}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEdit(exp)} color="primary"><EditOutlinedIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => onDelete(exp)} color="error"><DeleteOutlinedIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination count={totalPages} page={page} onChange={(_, p) => onPageChange(p)} color="primary" />
        </Box>
      )}
    </Box>
  )
}
