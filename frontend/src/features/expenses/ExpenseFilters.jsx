import SearchIcon from '@mui/icons-material/Search'
import {
  Box, InputAdornment, MenuItem, TextField,
} from '@mui/material'
import { useEffect, useState } from 'react'
import categoriesApi from '../../api/categoriesApi'

const PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'upi', label: 'UPI' },
  { value: 'other', label: 'Other' },
]

export default function ExpenseFilters({ filters, onChange }) {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoriesApi.list().then(res => setCategories(res.data.data ?? [])).catch(() => {})
  }, [])

  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value })

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2,
        alignItems: 'center',
      }}
    >
      {/* Search — grows to fill available space */}
      <TextField
        size="small"
        placeholder="Search title or notes…"
        value={filters.search ?? ''}
        onChange={set('search')}
        sx={{ flex: '1 1 200px', minWidth: 160 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Date from */}
      <TextField
        size="small"
        label="From"
        type="date"
        value={filters.date_from ?? ''}
        onChange={set('date_from')}
        sx={{ flex: '0 0 148px' }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {/* Date to */}
      <TextField
        size="small"
        label="To"
        type="date"
        value={filters.date_to ?? ''}
        onChange={set('date_to')}
        sx={{ flex: '0 0 148px' }}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      {/* Category — grows to fit category names */}
      <TextField
        select
        size="small"
        label="Category"
        value={filters.category ?? ''}
        onChange={set('category')}
        sx={{ flex: '1 1 160px', minWidth: 140 }}
      >
        <MenuItem value="">All Categories</MenuItem>
        {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
      </TextField>

      {/* Payment method */}
      <TextField
        select
        size="small"
        label="Payment"
        value={filters.payment_method ?? ''}
        onChange={set('payment_method')}
        sx={{ flex: '1 1 140px', minWidth: 130 }}
      >
        {PAYMENT_METHODS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
      </TextField>
    </Box>
  )
}
