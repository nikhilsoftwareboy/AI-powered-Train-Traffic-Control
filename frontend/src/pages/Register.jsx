import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Train as TrainIcon
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { username, email, password, confirmPassword } = formData

    if (!username || !email || !password) {
      setError('All fields are required')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // ✅ SEND ONLY REQUIRED DATA
    const result = await register({ username, email, password })

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || 'Registration failed')
    }

    setLoading(false)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(135deg, #0a0e27 0%, #151932 100%)'
      }}
    >
      <Container maxWidth="sm">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box textAlign="center" mb={3}>
                <TrainIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Typography variant="h4" fontWeight={700}>
                  Create Account
                </Typography>
              </Box>

              {error && <Alert severity="error">{error}</Alert>}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  margin="normal"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    )
                  }}
                />

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  sx={{ mt: 2 }}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Button>
              </form>

              <Divider sx={{ my: 3 }} />

              <Typography align="center">
                Already have an account? <Link to="/login">Login</Link>
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Container>
    </Box>
  )
}

export default Register
