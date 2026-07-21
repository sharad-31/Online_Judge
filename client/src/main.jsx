import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './styles/theme.css';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { NavbarVisibilityProvider } from './context/NavbarVisibilityContext.jsx';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <NavbarVisibilityProvider>
        <App />
      </NavbarVisibilityProvider>
    </ThemeProvider>
  </StrictMode>,
)