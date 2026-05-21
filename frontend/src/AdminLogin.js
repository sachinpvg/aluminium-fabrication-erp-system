import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from './api';

export default function AdminLogin() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(apiUrl('/auth/admin-login'), form);
            localStorage.setItem('adminToken', res.data.token);
            localStorage.setItem('adminUser', JSON.stringify(res.data.user));
            navigate('/admindashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
            <div style={{
                background: '#fff', borderRadius: 16, padding: '40px 36px',
                width: '100%', maxWidth: 400,
                boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
            }}>
                <div className="text-center mb-4">
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0f2027, #2c5364)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 14px', fontSize: 26
                    }}>🔐</div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Admin Login</h4>
                    <p className="text-muted small">Vector Industries — Admin Access</p>
                </div>

                {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Admin Email</label>
                        <input
                            type="email" className="form-control" name="email"
                            placeholder="admin@example.com" value={form.email}
                            onChange={handleChange} required autoFocus
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Password</label>
                        <input
                            type="password" className="form-control" name="password"
                            placeholder="Your admin password" value={form.password}
                            onChange={handleChange} required
                        />
                    </div>
                    <button className="btn btn-dark w-100" type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login as Admin'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p className="text-muted small mb-0">
                        New admin? <Link to="/adminsignup">Create Admin Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
