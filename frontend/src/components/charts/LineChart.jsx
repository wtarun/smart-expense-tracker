import { Card, CardContent, Typography } from '@mui/material'
import { Line } from 'react-chartjs-2'
import { COLORS, baseFont, legendDefaults, tooltipDefaults } from './chartDefaults'

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

const formatMonth = (yyyyMM) => {
  const [year, month] = yyyyMM.split('-')
  return new Date(year, parseInt(month) - 1).toLocaleString('default', { month: 'short', year: '2-digit' })
}

export default function MonthlyLineChart({ data }) {
  const labels = data.map((d) => formatMonth(d.month))
  const values = data.map((d) => parseFloat(d.total))

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Monthly Spending',
        data: values,
        fill: true,
        backgroundColor: 'rgba(99,102,241,0.08)',
        borderColor: COLORS[0],
        pointBackgroundColor: COLORS[0],
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.4,
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
          callback: (v) => `$${(v / 1000).toFixed(1)}k`,
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Monthly Spending Trend
        </Typography>
        <div style={{ height: 280, position: 'relative' }}>
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
