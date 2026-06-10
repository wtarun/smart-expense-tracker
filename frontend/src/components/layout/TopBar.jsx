import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar, Avatar, Box, IconButton, Toolbar, Tooltip, Typography,
} from '@mui/material'
import useAuth from '../../hooks/useAuth'
import { DRAWER_WIDTH } from './Sidebar'

export default function TopBar({ onMenuClick, title }) {
  const { user, logout } = useAuth()

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml:    { md: `${DRAWER_WIDTH}px` },
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar>
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
            {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.first_name} {user?.last_name}
          </Typography>
          <Tooltip title="Logout">
            <IconButton onClick={logout} size="small">
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
