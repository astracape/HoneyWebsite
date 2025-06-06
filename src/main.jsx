import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { CartProvider } from './context/CartContext.jsx'
import { ShippingProvider } from './context/ShippingContext.jsx'
import { CouponProvider } from './context/CouponContext.jsx'
import { CheckoutProvider } from './context/CheckoutContext.jsx'
import 'flowbite';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    
    <CartProvider>
    <ShippingProvider>
      <CouponProvider>
        <CheckoutProvider>
    <App />
    </CheckoutProvider>
    </CouponProvider>
    </ShippingProvider>
    </CartProvider>
  
  </StrictMode>,
)
