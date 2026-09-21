import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { SiteProvider } from './contexts/SiteContext';
import { ToastProvider } from './contexts/ToastContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <SiteProvider>
        <ToastProvider>
          <CartProvider>
            <AppRoutes />
          </CartProvider>
        </ToastProvider>
      </SiteProvider>
    </BrowserRouter>
  );
}
