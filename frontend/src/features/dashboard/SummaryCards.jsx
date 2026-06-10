import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CategoryIcon from '@mui/icons-material/Category'
import { Box, Card, CardContent, Skeleton, Typography } from '@mui/material'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0)

function StatCard({ icon, label, value, sub, subColor, loading }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
        </Box>
        {loading
          ? <Skeleton width="60%" height={36} />
          : <Typography variant="h5" fontWeight={700}>{value}</Typography>
        }
        {sub && !loading && (
          <Typography variant="caption" color={subColor ?? 'text.secondary'} mt={0.5} display="block">
            {sub}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default function SummaryCards({ summary, loading }) {
  // API returns a string ("26.5") or the literal "None" when no prior month exists
  const mom = parseFloat(summary?.month_over_month_change) || 0
  const momColor = mom > 0 ? 'error.main' : 'success.main'
  const momLabel = `${mom > 0 ? '+' : ''}${mom.toFixed(1)}% vs last month`

  return (
    <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }} gap={2}>
      <StatCard
        icon={<AccountBalanceWalletIcon />}
        label="Spent This Month"
        value={formatCurrency(summary?.total_spent)}
        sub={momLabel}
        subColor={momColor}
        loading={loading}
      />
      <StatCard
        icon={<TrendingDownIcon />}
        label="Spent Last Month"
        value={formatCurrency(summary?.total_spent_last_month)}
        loading={loading}
      />
      <StatCard
        icon={<CategoryIcon />}
        label="Top Category"
        value={summary?.top_category?.name ?? '—'}
        sub={summary?.top_category ? formatCurrency(summary.top_category.amount) : undefined}
        loading={loading}
      />
      <StatCard
        icon={<TrendingUpIcon />}
        label="Recent Transactions"
        value={summary?.recent_expenses?.length ?? 0}
        sub="in the last 5 entries"
        loading={loading}
      />
    </Box>
  )
}
