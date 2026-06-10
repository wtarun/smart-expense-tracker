import axiosInstance from './axiosInstance'

const categoriesApi = {
  list:   ()         => axiosInstance.get('/categories/'),
  create: (data)     => axiosInstance.post('/categories/', data),
  update: (id, data) => axiosInstance.patch(`/categories/${id}/`, data),
  remove: (id)       => axiosInstance.delete(`/categories/${id}/`),
}

export default categoriesApi
