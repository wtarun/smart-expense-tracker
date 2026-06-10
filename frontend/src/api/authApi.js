import axiosInstance from './axiosInstance'

const authApi = {
  register: (data)        => axiosInstance.post('/auth/register/', data),
  login:    (data)        => axiosInstance.post('/auth/login/', data),
  logout:   (refresh)     => axiosInstance.post('/auth/logout/', { refresh }),
  me:       ()            => axiosInstance.get('/auth/me/'),
  updateMe: (data)        => axiosInstance.patch('/auth/me/', data),
  changePassword: (data)  => axiosInstance.post('/auth/change-password/', data),
}

export default authApi
