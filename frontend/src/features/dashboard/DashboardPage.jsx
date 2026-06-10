import { Box, Button, Grid, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import analyticsApi from '../../api/analyticsApi'
import BarChart from '../../components/charts/BarChart'
import LineChart from '../../components/charts/LineChart'
import PieChart from '../../components/charts/PieChart'
import '../../components/charts/chartDefaults' // register Chart.js components
import LoadingSpinner from '../../components/common/LoadingSpinner'
import useNotification from '../../hooks/useNotification'
import RecentExpenses from './RecentExpenses'
import SummaryCards from './SummaryCards'

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthRange(monthsBack) {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - monthsBack + 1)
  from.setDate(1)
  return {
    date_from: from.toISOString().split('T')[0],
    date_to:   to.toISOString().split('T')[0],
  }
}

export default function DashboardPage() {
  const { notify } = useNotification()
  const navigate = useNavigate()

  const [summary, setSummary]     = useState(null)
  const [breakdown, setBreakdown] = useState([])
  const [trend, setTrend]         = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    const month = currentMonth()
    const range = monthRange(6)

    Promise.all([
      analyticsApi.summary({ month }),
      analyticsApi.categoryBreakdown({ date_from: range.date_from, date_to: range.date_to }),
      analyticsApi.monthlyTrend({ months: 6 }),
    ])
      .then(([summaryRes, breakdownRes, trendRes]) => {
        setSummary(summaryRes.data.data)
        setBreakdown(breakdownRes.data.data ?? [])
        setTrend(trendRes.data.data ?? [])
      })
      .catch(() => notify('Failed to load dashboard data', 'error'))
      .finally(() => setLoading(false))
  }, [notify])

  const hasBreakdown = breakdown.length > 0
  const hasTrend     = trend.length > 0

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => navigate('/expenses')}>
          View All Expenses
        </Button>
      </Box>

      {/* Summary cards */}
      <SummaryCards summary={summary} loading={loading} />

      {/* Charts */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight={600} mb={2}>Analytics</Typography>

        {loading ? (
          <LoadingSpinner minHeight={320} />
        ) : (
          <Grid container spacing={3}>
            {/* Line chart — full width */}
            <Grid item xs={12}>
              {hasTrend
                ? <LineChart data={trend} />
                : <EmptyChart label="No trend data yet" />
              }
            </Grid>

            {/* Pie + Bar side-by-side */}
            <Grid item xs={12} md={5}>
              {hasBreakdown
                ? <PieChart data={breakdown} />
                : <EmptyChart label="No category data yet" />
              }
            </Grid>
            <Grid item xs={12} md={7}>
              {hasBreakdown
                ? <BarChart data={breakdown} />
                : <EmptyChart label="No category data yet" />
              }
            </Grid>
          </Grid>
        )}
      </Box>

      {/* Recent expenses */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight={600} mb={2}>Recent Expenses</Typography>
        {loading
          ? <LoadingSpinner minHeight={200} />
          : <RecentExpenses expenses={summary?.recent_expenses} />
        }
      </Box>
    </Box>
  )
}

function EmptyChart({ label }) {
  return (
    <Box
      display="flex" alignItems="center" justifyContent="center"
      height={320} borderRadius={2} border="1px dashed" borderColor="divider"
      color="text.disabled"
    >
      <Typography variant="body2">{label}</Typography>
    </Box>
  )
}
