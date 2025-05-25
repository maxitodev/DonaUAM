import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './components/Auth/PrivateRoute.jsx'
import './index.css'
import App from './App.jsx'
import Register from './components/Auth/Register.jsx'
import Login from './components/Auth/Login.jsx'
import Home from './components/Home.jsx'
import Logout from './components/Navbar/Logout.jsx'
import Donation from './components/Donations/Donation.jsx'
import MyDonations from './components/Donations/Mydonations.jsx'
import EditDonation from './components/Donations/EditDonation.jsx'
import DonationDetail from './components/Donations/DonationDetail.jsx'
import RequestForm from './components/Requests/RequestForm.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
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
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
