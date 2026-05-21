import './App.css';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { apiUrl } from './api';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || '/userdashboard';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(apiUrl('/auth/login'), { email, password });
      login(res.data.token, res.data.user);
      navigate(from);
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginbody vh-100">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-sm-4 col-md-4"></div>
          <div className="col-12 col-sm-4 col-md-4">
            <form className="loginformback shadow-lg p-5 mt-5 bg-body-tertiary rounded" onSubmit={handleLogin}>
              <div className="d-flex justify-content-center">
                <div className="ms-2 text-primary p-2">
                  <h3>Aluminium Fabrication ERP</h3>
                  <h6>Smart fabrication starts here</h6>
                </div>
              </div>
              <div className="container-fluid">
                <img src='windowfabricc.png' className="img-fluid" alt="fabrication" />
              </div>
              {error && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                  {error}
                </div>
              )}
              <div className='mb-3'>
                <input
                  type="email"
                  className="form-control pt-2"
                  placeholder='Email address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control pt-2"
                  placeholder='Password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="d-grid gap-2 col-6 mx-auto mt-2">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
              <div className="text-center mt-3">
                <p className="mb-0">Don't have an account? <Link to="/signuppage">Sign up</Link></p>
              </div>
            </form>
          </div>
          <div className="col-12 col-sm-4 col-md-4"></div>
        </div>
      </div>
    </div>
  );
}
