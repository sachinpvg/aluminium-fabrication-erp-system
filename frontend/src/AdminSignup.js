import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from './api';

export default function AdminSignup() {
    const navigate = useNavigate();
    const [data, setData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successInfo, setSuccessInfo] = useState(null);

    function handleChange(e) {
        setData({ ...data, [e.target.name]: e.target.value });
    }

    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(apiUrl('/auth/admin-register'), data);
            setSuccessInfo({ adminId: res.data.adminId });
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Success screen ──
    if (successInfo) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
            }}>
                <div style={{
                    background: '#fff', borderRadius: 16, padding: '40px 36px',
                    width: '100%', maxWidth: 400, textAlign: 'center',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.4)'
                }}>
                    <div style={{ fontSize: 52 }}>✅</div>
                    <h4 className="text-success fw-bold mt-2">Admin Registered!</h4>
                    <p className="text-muted">Your Admin ID has been generated. Save it for reference:</p>
                    <div style={{
                        background: '#f0f4ff', border: '2px dashed #0f2027',
                        borderRadius: 10, padding: '14px 24px', margin: '12px auto', display: 'inline-block'
                    }}>
                        <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: '#0f2027' }}>
                            {successInfo.adminId}
                        </span>
                    </div>
                    <button
                        className="btn btn-dark w-100 mt-4"
                        onClick={() => navigate('/adminlogin')}
                    >
                        Proceed to Admin Login
                    </button>
                </div>
            </div>
        );
    }

    // ── Signup form ──
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
                    }}>🛡️</div>
                    <h4 className="fw-bold mb-1" style={{ color: '#1e293b' }}>Admin Signup</h4>
                    <p className="text-muted small">Vector Industries — Create Admin Account</p>
                </div>

                {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

                <form onSubmit={submit}>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Admin Name</label>
                        <input
                            type="text" className="form-control" name="username"
                            placeholder="Full Name" value={data.username}
                            onChange={handleChange} required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Admin Email</label>
                        <input
                            type="email" className="form-control" name="email"
                            placeholder="admin@example.com" value={data.email}
                            onChange={handleChange} required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-semibold text-secondary">Password</label>
                        <input
                            type="password" className="form-control" name="password"
                            placeholder="Create a strong password" value={data.password}
                            onChange={handleChange} required minLength={6}
                        />
                    </div>
                    <button className="btn btn-dark w-100" type="submit" disabled={loading}>
                        {loading ? 'Registering...' : 'Create Admin Account'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <p className="text-muted small mb-0">
                        Already have an account? <Link to="/adminlogin">Admin Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
