import {
  Box, Grid, InputAdornment, MenuItem,
  TextField,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
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
    <Box sx={{ mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <TextField
            size="small"
            placeholder="Search title or notes…"
            fullWidth
            value={filters.search ?? ''}
            onChange={set('search')}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
        </Grid>

        <Grid item xs={6} sm={2}>
          <TextField size="small" label="From" type="date" fullWidth InputLabelProps={{ shrink: true }} value={filters.date_from ?? ''} onChange={set('date_from')} />
        </Grid>

        <Grid item xs={6} sm={2}>
          <TextField size="small" label="To" type="date" fullWidth InputLabelProps={{ shrink: true }} value={filters.date_to ?? ''} onChange={set('date_to')} />
        </Grid>

        <Grid item xs={6} sm={2}>
          <TextField select size="small" label="Category" fullWidth value={filters.category ?? ''} onChange={set('category')}>
            <MenuItem value="">All Categories</MenuItem>
            {categories.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>
        </Grid>

        <Grid item xs={6} sm={2}>
          <TextField select size="small" label="Payment" fullWidth value={filters.payment_method ?? ''} onChange={set('payment_method')}>
            {PAYMENT_METHODS.map(m => <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>)}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  )
}
