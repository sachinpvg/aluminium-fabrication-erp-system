import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiUrl } from '../api';

export default function AdminAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/admin/analytics'));
            if (!res.ok) throw new Error('API failure');
            const json = await res.json();
            setData(json);
            setError(false);
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="alert alert-danger mx-3 mt-4" role="alert">
                Failed to load analytics data. Please make sure the server is running.
            </div>
        );
    }

    const { totals, dailyStats } = data;

    // Formatting currency locally
    const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="bi bi-graph-up-arrow me-2" style={{ color: '#0d6efd' }}></i>Analytics Overview
                </h4>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchAnalytics}>
                    <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #0d6efd, #0b5ed7)', color: 'white' }}>
                        <div className="card-body p-4 text-center">
                            <h6 className="card-title text-opacity-75 mb-2 fw-semibold">Total Bookings</h6>
                            <h2 className="fw-bold mb-0">{totals.totalBookings}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #198754, #157347)', color: 'white' }}>
                        <div className="card-body p-4 text-center">
                            <h6 className="card-title text-opacity-75 mb-2 fw-semibold">Total Revenue</h6>
                            <h2 className="fw-bold mb-0">{formatCurrency(totals.totalRevenue)}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #dc3545, #bb2d3b)', color: 'white' }}>
                        <div className="card-body p-4 text-center">
                            <h6 className="card-title text-opacity-75 mb-2 fw-semibold">Total Cost</h6>
                            <h2 className="fw-bold mb-0">{formatCurrency(totals.totalCost)}</h2>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-sm-6 col-lg-3">
                    <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #6f42c1, #59339d)', color: 'white' }}>
                        <div className="card-body p-4 text-center">
                            <h6 className="card-title text-opacity-75 mb-2 fw-semibold">Total Profit</h6>
                            <h2 className="fw-bold mb-0">{formatCurrency(totals.totalProfit)}</h2>
                            {totals.totalLoss > 0 && (
                                <small className="d-block mt-1 text-warning fw-bold">Loss: {formatCurrency(totals.totalLoss)}</small>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                <div className="card-header bg-white border-bottom-0 pt-4 pb-0 px-4">
                    <h6 className="fw-bold text-dark"><i className="bi bi-calendar3 me-2 text-muted"></i>Financial Performance (Last 30 Days)</h6>
                </div>
                <div className="card-body p-4" style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={dailyStats}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#198754" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#198754" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#dc3545" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#dc3545" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(val) => {
                                    const d = new Date(val);
                                    return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                                }}
                                axisLine={false} 
                                tickLine={false} 
                                dy={10} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tickFormatter={(val) => `₹${val/1000}k`} 
                            />
                            <Tooltip 
                                formatter={(value, name) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}
                                labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#198754" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            <Area type="monotone" dataKey="cost" stroke="#dc3545" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
