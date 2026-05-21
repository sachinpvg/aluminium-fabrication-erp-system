import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from './api';

export default function Signuppage() {
  const navigate = useNavigate();
  const [data, setData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null); // { userId }

  function handleChange(e) {
    setData({ ...data, [e.target.name]: e.target.value });
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(apiUrl('/auth/register'), data);
      // Show the unique userId and let user note it before redirecting
      setSuccessInfo({ userId: res.data.userId });
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // If registration succeeded, show success card
  if (successInfo) {
    return (
      <div className="signbody vh-100">
        <div className='container-fluid'>
          <div className='row align-items-center justify-content-center' style={{ minHeight: '100vh' }}>
            <div className="col-12 col-sm-5 col-md-4">
              <div className="shadow-lg p-4 mt-3 bg-white rounded text-center">
                <div style={{ fontSize: 56 }}>✅</div>
                <h4 className="text-success fw-bold mt-2">Registration Successful!</h4>
                <p className="text-muted">Your account has been created. Please note your unique User ID:</p>
                <div style={{
                  background: '#f0f4ff', border: '2px dashed #4a6cf7',
                  borderRadius: 10, padding: '16px 24px', margin: '12px auto', display: 'inline-block'
                }}>
                  <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#4a6cf7' }}>
                    {successInfo.userId}
                  </span>
                </div>
                <p className="text-muted small mt-2">
                  Save this ID — you may need it to reference your account.
                </p>
                <button
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => navigate('/login', { state: { message: 'Registration successful! Please log in.' } })}
                >
                  Proceed to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="signbody vh-100">
        <div className='container-fluid'>
          <div className='row align-item-center'>
            <div className="col-12 col-sm-4 col-md-4"></div>
            <div className="col-12 col-sm-4 col-md-4">
              <form className="signformback shadow-lg p-3 mt-3 bg-body-tertiary rounded" onSubmit={submit}>
                <div className="d-flex justify-content-center">
                  <div className="ms-2 text-primary pt-2">
                    <h3>Aluminium Fabrication ERP</h3>
                    <h6>User Signup</h6>
                    <img src='https://t4.ftcdn.net/jpg/15/43/58/61/360_F_1543586113_8AA1YMIFM8xf84DF8ZNt5P2Z7kNRDGdx.jpg' className="keyimg img-fluid ms-3" alt="signup" />
                  </div>
                </div>
                {error && (
                  <div className="alert alert-danger py-2 mt-2" role="alert">
                    {error}
                  </div>
                )}
                <div className="mt-2">
                  <input type="text" className="form-control" name="username" placeholder='Username'
                    value={data.username} onChange={handleChange} required />
                </div>
                <div className="mt-2">
                  <input type="email" className="form-control" name="email" placeholder='Email address'
                    value={data.email} onChange={handleChange} required />
                </div>
                <div className="mt-2">
                  <input type="password" className="form-control" name="password" placeholder='Password'
                    value={data.password} onChange={handleChange} required />
                </div>
                <div className="d-grid gap-2 col-6 mx-auto mt-3">
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                </div>
                <div className="mt-3 d-flex justify-content-center">
                  <p>Already have an account? <Link to="/login">Log in</Link></p>
                </div>
              </form>
            </div>
            <div className="col-12 col-sm-4 col-md-4"></div>
          </div>
        </div>
      </div>
    </>
  );
}
