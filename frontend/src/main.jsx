import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'
import "leaflet/dist/leaflet.css";


const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff',
      light: '#5dffff',
      dark: '#00a2cc'
    },
    secondary: {
      main: '#ff6b6b',
      light: '#ff9e9e',
      dark: '#c53b3b'
    },
    background: {
      default: '#0a0e27',
      paper: '#151932'
    },
    success: {
      main: '#51cf66'
    },
    warning: {
      main: '#ffd43b'
    },
    error: {
      main: '#ff6b6b'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700
    },
    h5: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 12
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#151932',
              color: '#fff',
              border: '1px solid #00d4ff'
            }
          }}
        />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

