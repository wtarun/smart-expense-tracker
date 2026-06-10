import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import expensesApi from '../../api/expensesApi'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useNotification from '../../hooks/useNotification'
import ExpenseFilters from './ExpenseFilters'
import ExpenseForm from './ExpenseForm'
import ExpenseList from './ExpenseList'

const DEFAULT_FILTERS = { search: '', date_from: '', date_to: '', category: '', payment_method: '' }
const PAGE_SIZE = 20

export default function ExpensesPage() {
  const { notify } = useNotification()
  const [expenses, setExpenses]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState(DEFAULT_FILTERS)
  const [page, setPage]             = useState(1)
  const [count, setCount]           = useState(0)
  const [ordering, setOrdering]     = useState({ field: 'expense_date', dir: 'desc' })
  const [formOpen, setFormOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]     = useState(false)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const orderStr = ordering.dir === 'desc' ? `-${ordering.field}` : ordering.field
      const params = {
        page,
        page_size: PAGE_SIZE,
        ordering: orderStr,
        ...(filters.search        && { search: filters.search }),
        ...(filters.date_from     && { date_from: filters.date_from }),
        ...(filters.date_to       && { date_to: filters.date_to }),
        ...(filters.category      && { category: filters.category }),
        ...(filters.payment_method && { payment_method: filters.payment_method }),
      }
      const res = await expensesApi.list(params)
      const payload = res.data.data
      setExpenses(payload.results ?? [])
      setCount(payload.count ?? 0)
    } catch {
      notify('Failed to load expenses', 'error')
    } finally {
      setLoading(false)
    }
  }, [filters, page, ordering, notify])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleFilterChange = (newFilters) => { setFilters(newFilters); setPage(1) }

  const handleSort = (field) => {
    setOrdering(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }))
    setPage(1)
  }

  const openAdd  = () => { setEditTarget(null); setFormOpen(true) }
  const openEdit = (exp) => { setEditTarget(exp); setFormOpen(true) }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await expensesApi.remove(deleteTarget.id)
      notify('Expense deleted', 'success')
      setDeleteTarget(null)
      fetchExpenses()
    } catch {
      notify('Failed to delete expense', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Expenses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd}>Add Expense</Button>
      </Box>

      <ExpenseFilters filters={filters} onChange={handleFilterChange} />

      {loading
        ? <LoadingSpinner />
        : (
          <ExpenseList
            expenses={expenses}
            pagination={{ page, count, pageSize: PAGE_SIZE }}
            ordering={ordering}
            onSort={handleSort}
            onPageChange={setPage}
            onEdit={openEdit}
            onDelete={setDeleteTarget}
          />
        )
      }

      <ExpenseForm
        open={formOpen}
        expense={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={fetchExpenses}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Expense"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  )
}
