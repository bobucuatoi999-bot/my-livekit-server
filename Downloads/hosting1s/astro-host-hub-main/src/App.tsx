import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import Index from './pages/Index'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import ServerPage from './pages/ServerPage'
import OrderPage from './pages/OrderPage'
import WalletPage from './pages/WalletPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/server/:id" element={<ServerPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/wallet" element={<WalletPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
