import axiosInstance from './axiosInstance'

const analyticsApi = {
  summary:           (params) => axiosInstance.get('/analytics/summary/', { params }),
  categoryBreakdown: (params) => axiosInstance.get('/analytics/category-breakdown/', { params }),
  monthlyTrend:      (params) => axiosInstance.get('/analytics/monthly-trend/', { params }),
}

export default analyticsApi
