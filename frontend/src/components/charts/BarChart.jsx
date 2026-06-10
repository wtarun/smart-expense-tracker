import { Card, CardContent, Typography } from '@mui/material'
import { Bar } from 'react-chartjs-2'
import { COLORS, baseFont, tooltipDefaults } from './chartDefaults'

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

export default function CategoryBarChart({ data }) {
  // Sort descending by amount, cap at top 8 to keep the chart readable
  const sorted = [...data].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)).slice(0, 8)

  const labels = sorted.map((d) => d.category)
  const values = sorted.map((d) => parseFloat(d.amount))

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Amount Spent',
        data: values,
        backgroundColor: COLORS.slice(0, sorted.length),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: baseFont },
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: baseFont,
          callback: (v) => `$${v}`,
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Spending by Category (This Month)
        </Typography>
        <div style={{ height: 280, position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
