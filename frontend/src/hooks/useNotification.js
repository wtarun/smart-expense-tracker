import { useContext } from 'react'
import { NotificationContext } from '../store/NotificationContext'

export default function useNotification() {
  return useContext(NotificationContext)
}
