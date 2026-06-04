import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Aboutas from './aboutas';
import Login from './login';
import Signuppage from './signuppage';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import QuotationForm from './quotationform';
import Contactus from './contactus';
import Requirement from './requirement';
import AdminDashboard from './AdminDashboard';
import AdminLogin from './AdminLogin';
import AdminSignup from './AdminSignup';
import UserDashboard from './UserDashboard';
import WindowsCatalog from './WindowsCatalog';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
      <AuthProvider>
            <Router>
                  <Routes>
                        <Route path="/" element={<Navigate to="/home" />} />
                        <Route path='/home' element={<App />} />
                        <Route path='/aboutas' element={<Aboutas />} />
                        <Route path='/signuppage' element={<Signuppage />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/quotationform' element={<QuotationForm />} />
                        <Route path='/contactus' element={<Contactus />} />
                        <Route path='/requirement' element={
                              <ProtectedRoute><Requirement /></ProtectedRoute>
                        } />
                        <Route path='/adminlogin' element={<AdminLogin />} />
                        <Route path='/adminsignup' element={<AdminSignup />} />
                        <Route path='/admindashboard' element={<AdminDashboard />} />
                        <Route path='/userdashboard' element={
                              <ProtectedRoute><UserDashboard /></ProtectedRoute>
                        } />
                        <Route path='/windows' element={<WindowsCatalog />} />
                  </Routes>
            </Router>
      </AuthProvider>
);

reportWebVitals();

