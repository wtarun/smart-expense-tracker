import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography,
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
        {/* Mobile hamburger */}
        <IconButton edge="start" onClick={onMenuClick} sx={{ mr: 2, display: { md: 'none' } }}>
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>
            {user?.first_name?.[0]?.toUpperCase() ?? 'U'}
          </Avatar>

          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {user?.first_name} {user?.last_name}
          </Typography>

          {/* Sign out — text label on sm+, icon-only on mobile */}
          <Button
            onClick={logout}
            color="error"
            size="small"
            startIcon={<LogoutIcon />}
            sx={{ display: { xs: 'none', sm: 'flex' }, textTransform: 'none', fontWeight: 600 }}
          >
            Sign out
          </Button>
          <IconButton onClick={logout} color="error" size="small" sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
