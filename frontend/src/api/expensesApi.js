import axiosInstance from './axiosInstance'

const expensesApi = {
  list:   (params) => axiosInstance.get('/expenses/', { params }),
  get:    (id)     => axiosInstance.get(`/expenses/${id}/`),
  create: (data)   => axiosInstance.post('/expenses/', data),
  update: (id, data) => axiosInstance.patch(`/expenses/${id}/`, data),
  remove: (id)     => axiosInstance.delete(`/expenses/${id}/`),
}

export default expensesApi
