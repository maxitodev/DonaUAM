import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/Auth/PrivateRoute.jsx'
import './index.css'
import App from './App.jsx'
import Register from './components/Auth/Register.jsx'
import Login from './components/Auth/Login.jsx'
import ForgotPassword from './components/Auth/ForgotPassword.jsx'
import ResetPassword from './components/Auth/ResetPassword.jsx'
import GoogleAuthSuccess from './components/Auth/GoogleAuthSuccess.jsx'
import Home from './components/Home.jsx'
import Logout from './components/Navbar/Logout.jsx'
import Donation from './components/Donations/Donation.jsx'
import MyDonations from './components/Donations/Mydonations.jsx'
import EditDonation from './components/Donations/EditDonation.jsx'
import DonationDetail from './components/Donations/DonationDetail.jsx'
import RequestForm from './components/Requests/RequestForm.jsx'
import MyRequests from './components/Requests/MyRequests.jsx'
import DonationRequests from './components/Donations/DonationRequests.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/logout"
          element={
            <PrivateRoute>
              <Logout />
            </PrivateRoute>
          }
        />
        <Route
          path="/donar"
          element={
            <PrivateRoute>
              <Donation />
            </PrivateRoute>
          }
        />
        <Route
          path="/mis-donaciones"
          element={
            <PrivateRoute>
              <MyDonations />
            </PrivateRoute>
          }
        />
        <Route
          path="/editar-donacion/:id"
          element={
            <PrivateRoute>
              <EditDonation />
            </PrivateRoute>
          }
        />
        <Route
          path="/donacion/:id"
          element={
            <PrivateRoute>
              <DonationDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitar/:id"
          element={
            <PrivateRoute>
              <RequestForm />
            </PrivateRoute>
          }
        />
        <Route
          path="/mis-solicitudes"
          element={
            <PrivateRoute>
              <MyRequests />
            </PrivateRoute>
          }
        />
        <Route
          path="/solicitudes-donacion/:id"
          element={
            <PrivateRoute>
              <DonationRequests />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
