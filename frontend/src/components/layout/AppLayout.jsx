import { Box, Toolbar } from '@mui/material'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar, { DRAWER_WIDTH } from './Sidebar'
import TopBar from './TopBar'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/expenses':  'Expenses',
  '/analytics': 'Analytics',
  '/settings':  'Settings',
}

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Smart Expense Tracker'

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box
        component="main"
        sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, minWidth: 0 }}
      >
        <TopBar onMenuClick={() => setMobileOpen(true)} title={title} />
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
