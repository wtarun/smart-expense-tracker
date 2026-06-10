import { yupResolver } from '@hookform/resolvers/yup'
import {
  Alert, Box, Button, Card, CardContent,
  Grid, Link, TextField, Typography,
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import * as yup from 'yup'
import useAuth from '../../hooks/useAuth'

const schema = yup.object({
  first_name:       yup.string().required('First name is required'),
  last_name:        yup.string().required('Last name is required'),
  email:            yup.string().email('Enter a valid email').required('Email is required'),
  username:         yup.string().required('Username is required').min(3),
  password:         yup.string().min(8, 'Minimum 8 characters').required('Password is required'),
  password_confirm: yup.string()
    .oneOf([yup.ref('password')], 'Passwords do not match')
    .required('Please confirm your password'),
})

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (values) => {
    setError('')
    try {
      await registerUser(values)
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      setError(err.response?.data?.error ?? 'Registration failed. Please try again.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 480 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Start tracking your expenses today
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField {...register('first_name')} label="First Name" fullWidth error={!!errors.first_name} helperText={errors.first_name?.message} />
              </Grid>
              <Grid item xs={6}>
                <TextField {...register('last_name')} label="Last Name" fullWidth error={!!errors.last_name} helperText={errors.last_name?.message} />
              </Grid>
            </Grid>
            <TextField {...register('email')} label="Email" type="email" fullWidth margin="normal" error={!!errors.email} helperText={errors.email?.message} />
            <TextField {...register('username')} label="Username" fullWidth margin="normal" error={!!errors.username} helperText={errors.username?.message} />
            <TextField {...register('password')} label="Password" type="password" fullWidth margin="normal" error={!!errors.password} helperText={errors.password?.message} />
            <TextField {...register('password_confirm')} label="Confirm Password" type="password" fullWidth margin="normal" error={!!errors.password_confirm} helperText={errors.password_confirm?.message} />

            <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting} sx={{ mt: 3 }}>
              {isSubmitting ? 'Creating account…' : 'Create Account'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account?{' '}
            <Link href="/login" underline="hover">Sign in</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
