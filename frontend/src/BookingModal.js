import React, { useState } from 'react';
import './BookingModal.css';
import { useAuth } from './AuthContext';
import { apiUrl } from './api';

export default function BookingModal({ win, onClose }) {
    const { user, token } = useAuth();

    const [form, setForm] = useState({
        username: user?.username || '',
        phone: '',
        address: '',
        width: '',
        height: '',
        fixingDate: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const w = parseFloat(form.width) || 0;
    const h = parseFloat(form.height) || 0;
    const windowPrice = (win.price_per_sqft || 0) * w * h;
    const labour = win.labour_charge || 0;
    const rubber = win.rubber_charge || 0;
    const service = win.service_charge || 0;
    const totalPrice = windowPrice + labour + rubber + service;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!form.phone || !form.address || !form.width || !form.height || !form.fixingDate) {
            setErrorMsg('Please fill in all required fields.');
            return;
        }
        if (w <= 0 || h <= 0) {
            setErrorMsg('Width and Height must be positive numbers.');
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                username: form.username,
                phone: form.phone,
                address: form.address,
                windowId: win._id,
                windowName: win.name,
                width: w,
                height: h,
                fixingDate: form.fixingDate,
                notes: form.notes,
                windowPrice: windowPrice.toFixed(2),
                labourCharge: labour,
                rubberCharge: rubber,
                serviceCharge: service,
                totalPrice: totalPrice.toFixed(2)
            };
            const res = await fetch(apiUrl('/api/bookings'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Booking failed');
            setSuccess(true);
        } catch (err) {
            setErrorMsg(err.message || 'Booking failed. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bm-overlay" onClick={onClose}>
            <div className="bm-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bm-header">
                    <div>
                        <h5 className="bm-title">
                            <i className="bi bi-calendar2-check me-2"></i>
                            Book Window
                        </h5>
                        <p className="bm-subtitle text-primary fw-semibold mb-0">{win.name}</p>
                    </div>
                    <button className="bm-close" onClick={onClose}>×</button>
                </div>

                {/* Body */}
                <div className="bm-body">
                    {success ? (
                        <div className="bm-success">
                            <div className="bm-success-icon">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                            <h4>Booking Submitted!</h4>
                            <p className="text-muted">Your booking is now <strong>pending approval</strong> from admin.</p>
                            <p className="text-muted small">You can track your booking status in <strong>User Dashboard → My Bookings</strong>.</p>
                            <button className="btn btn-primary mt-2" onClick={onClose}>Done</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {errorMsg && (
                                <div className="alert alert-danger py-2 mb-3">{errorMsg}</div>
                            )}

                            <div className="row g-3">
                                {/* User Name */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">User Name <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        name="username"
                                        value={form.username}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        required
                                    />
                                </div>

                                {/* Phone */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Phone Number <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. 9876543210"
                                        required
                                    />
                                </div>

                                {/* Address */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold">Address <span className="text-danger">*</span></label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="Installation address"
                                        rows={2}
                                        required
                                    />
                                </div>

                                {/* Window Type (auto-filled) */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold">Window Type</label>
                                    <input
                                        className="form-control bg-light"
                                        value={win.name}
                                        readOnly
                                    />
                                </div>

                                {/* Width & Height */}
                                <div className="col-6">
                                    <label className="form-label fw-semibold">Width (ft) <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        name="width"
                                        value={form.width}
                                        onChange={handleChange}
                                        placeholder="e.g. 5"
                                        min="0.1"
                                        step="0.1"
                                        required
                                    />
                                </div>
                                <div className="col-6">
                                    <label className="form-label fw-semibold">Height (ft) <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        name="height"
                                        value={form.height}
                                        onChange={handleChange}
                                        placeholder="e.g. 4"
                                        min="0.1"
                                        step="0.1"
                                        required
                                    />
                                </div>

                                {/* Fixing Date */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Fixing Date <span className="text-danger">*</span></label>
                                    <input
                                        className="form-control"
                                        type="date"
                                        name="fixingDate"
                                        value={form.fixingDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                {/* Notes */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Notes (Optional)</label>
                                    <input
                                        className="form-control"
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        placeholder="Any special requirements"
                                    />
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bm-price-box mt-4">
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-calculator me-2"></i>Price Breakdown
                                </h6>
                                <div className="bm-price-row">
                                    <span>Window Price ({w} × {h} × ₹{win.price_per_sqft}/sqft)</span>
                                    <span>₹{windowPrice.toFixed(2)}</span>
                                </div>
                                <div className="bm-price-row">
                                    <span>Labour Charge</span>
                                    <span>₹{labour.toFixed(2)}</span>
                                </div>
                                <div className="bm-price-row">
                                    <span>Rubber Feeding Charge</span>
                                    <span>₹{rubber.toFixed(2)}</span>
                                </div>
                                <div className="bm-price-row">
                                    <span>Service Charge</span>
                                    <span>₹{service.toFixed(2)}</span>
                                </div>
                                <div className="bm-price-total">
                                    <span>Total Price</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bm-footer mt-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>
                                    {submitting ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                                    ) : (
                                        <><i className="bi bi-check2-circle me-2"></i>Confirm Booking</>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
