import { yupResolver } from '@hookform/resolvers/yup'
import {
  Box, Button, Drawer, MenuItem,
  Stack, TextField, Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import categoriesApi from '../../api/categoriesApi'
import expensesApi from '../../api/expensesApi'
import useNotification from '../../hooks/useNotification'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
]

const schema = yup.object({
  title:          yup.string().required('Title is required').max(200),
  amount:         yup.number().typeError('Enter a valid amount').positive('Must be greater than 0').required('Amount is required'),
  expense_date:   yup.string().required('Date is required'),
  category_id:    yup.string().required('Category is required'),
  payment_method: yup.string().required('Payment method is required'),
  notes:          yup.string().max(1000),
})

const today = new Date().toISOString().split('T')[0]

export default function ExpenseForm({ open, expense, onClose, onSaved }) {
  const { notify } = useNotification()
  const [categories, setCategories] = useState([])
  const isEdit = Boolean(expense)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '', amount: '', expense_date: today,
      category_id: '', payment_method: 'card', notes: '',
    },
  })

  useEffect(() => {
    categoriesApi.list().then(res => setCategories(res.data.data ?? [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (open) {
      reset(expense
        ? {
            title:          expense.title,
            amount:         expense.amount,
            expense_date:   expense.expense_date,
            category_id:    expense.category?.id ?? '',
            payment_method: expense.payment_method ?? 'card',
            notes:          expense.notes ?? '',
          }
        : { title: '', amount: '', expense_date: today, category_id: '', payment_method: 'card', notes: '' }
      )
    }
  }, [open, expense, reset])

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await expensesApi.update(expense.id, values)
        notify('Expense updated', 'success')
      } else {
        await expensesApi.create(values)
        notify('Expense added', 'success')
      }
      onSaved()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.error ?? 'Something went wrong'
      notify(msg, 'error')
    }
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 3 } }}>
      <Typography variant="h6" gutterBottom>
        {isEdit ? 'Edit Expense' : 'Add Expense'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2.5} mt={1}>
          <TextField {...register('title')} label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />

          <TextField {...register('amount')} label="Amount" type="number" inputProps={{ step: '0.01', min: '0.01' }} fullWidth error={!!errors.amount} helperText={errors.amount?.message} />

          <TextField {...register('expense_date')} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.expense_date} helperText={errors.expense_date?.message} />

          <TextField {...register('category_id')} select label="Category" fullWidth error={!!errors.category_id} helperText={errors.category_id?.message} defaultValue="">
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>

          <TextField {...register('payment_method')} select label="Payment Method" fullWidth error={!!errors.payment_method} helperText={errors.payment_method?.message} defaultValue="card">
            {PAYMENT_METHODS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>

          <TextField {...register('notes')} label="Notes (optional)" multiline rows={3} fullWidth error={!!errors.notes} helperText={errors.notes?.message} />

          <Stack direction="row" spacing={2} justifyContent="flex-end" pt={1}>
            <Button variant="outlined" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : isEdit ? 'Update' : 'Add Expense'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Drawer>
  )
}
