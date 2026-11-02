import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LocaleProvider } from './i18n.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { CompareProvider } from './context/CompareContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <CartProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </CartProvider>
      </LocaleProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
