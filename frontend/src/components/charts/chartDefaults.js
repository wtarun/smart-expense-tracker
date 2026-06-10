import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js'

// Register all components once at module load
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
)

// Brand palette (matches theme/index.js)
export const COLORS = [
  '#6366F1', // indigo  – primary
  '#EC4899', // pink    – secondary
  '#10B981', // emerald – success
  '#F59E0B', // amber   – warning
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EF4444', // red     – error
  '#14B8A6', // teal
]

export const baseFont = {
  family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  size: 12,
}

export const tooltipDefaults = {
  backgroundColor: '#1E293B',
  titleFont: { ...baseFont, weight: 'bold' },
  bodyFont: baseFont,
  padding: 10,
  cornerRadius: 8,
}

export const legendDefaults = {
  labels: {
    font: baseFont,
    padding: 16,
    usePointStyle: true,
    pointStyleWidth: 10,
  },
}
