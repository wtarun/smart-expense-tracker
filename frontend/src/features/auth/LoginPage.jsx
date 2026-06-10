import { yupResolver } from '@hookform/resolvers/yup'
import {
  Alert, Box, Button, Card, CardContent,
  Link, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import useAuth from '../../hooks/useAuth'

const schema = yup.object({
  email:    yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

export default function LoginPage() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (values) => {
    setError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error ?? 'Login failed. Please try again.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            💰 ExpenseTracker
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Sign in to your account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              {...register('email')}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              error={!!errors.email}
              helperText={errors.email?.message}
              autoComplete="email"
              autoFocus
            />
            <TextField
              {...register('password')}
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              error={!!errors.password}
              helperText={errors.password?.message}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isSubmitting}
              sx={{ mt: 3 }}
            >
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Don&apos;t have an account?{' '}
            <Link href="/register" underline="hover">Sign up</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
