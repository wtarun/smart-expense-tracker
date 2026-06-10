import { Card, CardContent, Typography } from '@mui/material'
import { Pie } from 'react-chartjs-2'
import { COLORS, legendDefaults, tooltipDefaults } from './chartDefaults'

const formatCurrency = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)

export default function CategoryPieChart({ data }) {
  const labels = data.map((d) => d.category_name)
  const values = data.map((d) => parseFloat(d.amount))

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        ...legendDefaults,
      },
      tooltip: {
        ...tooltipDefaults,
        callbacks: {
          label: (ctx) => {
            const item = data[ctx.dataIndex]
            return ` ${formatCurrency(parseFloat(item.amount))} (${parseFloat(item.percentage).toFixed(1)}%)`
          },
        },
      },
    },
  }

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Spending by Category
        </Typography>
        <div style={{ height: 280, position: 'relative' }}>
          <Pie data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
