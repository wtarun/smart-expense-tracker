import BarChartIcon from '@mui/icons-material/BarChart'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import {
  Box, Divider, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 240

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { label: 'Expenses',  icon: <ReceiptLongIcon />, path: '/expenses' },
  { label: 'Analytics', icon: <BarChartIcon />,  path: '/analytics' },
]

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  const content = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 2 }}>
        <Typography variant="h6" color="primary" fontWeight={700} noWrap>
          💰 ExpenseTracker
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ label, icon, path }) => (
          <ListItem key={path} disablePadding>
            <ListItemButton
              selected={pathname.startsWith(path)}
              onClick={() => { navigate(path); onClose?.() }}
              sx={{
                mx: 1, borderRadius: 2, mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { backgroundColor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {content}
      </Drawer>
      {/* Desktop */}
      <Drawer
        variant="permanent"
        sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        open
      >
        {content}
      </Drawer>
    </Box>
  )
}

export { DRAWER_WIDTH }
