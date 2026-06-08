import React, { useState } from 'react';
import './BookingModal.css';
import { useAuth } from './AuthContext';
import { apiUrl } from './api';
import { BUSINESS_PHONE } from './config';

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
    
    const [customPrice, setCustomPrice] = useState(win.price_per_sqft || 0);
    const [showSummary, setShowSummary] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // ✅ Dynamic Calculations
    const w = parseFloat(form.width) || 0;
    const h = parseFloat(form.height) || 0;
    const sqft = (w * h).toFixed(2);
    const windowPrice = (customPrice || 0) * sqft;
    const labour = win.labour_charge || 0;
    const rubber = win.rubber_charge || 0;
    const service = win.service_charge || 0;
    const totalPrice = windowPrice + labour + rubber + service;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePriceChange = (e) => {
        setCustomPrice(parseFloat(e.target.value) || 0);
    };

    // ✅ Input Validation
    const validateForm = () => {
        if (!form.username.trim()) {
            setErrorMsg('Please enter your name.');
            return false;
        }
        if (!form.phone.trim() || form.phone.length < 10) {
            setErrorMsg('Please enter a valid 10-digit phone number.');
            return false;
        }
        if (!form.address.trim()) {
            setErrorMsg('Please enter your address.');
            return false;
        }
        if (!form.width || !form.height) {
            setErrorMsg('Please enter width and height.');
            return false;
        }
        if (w <= 0 || h <= 0) {
            setErrorMsg('Width and Height must be positive numbers.');
            return false;
        }
        if (!form.fixingDate) {
            setErrorMsg('Please select a fixing date.');
            return false;
        }
        if (customPrice <= 0) {
            setErrorMsg('Price per sq.ft must be greater than 0.');
            return false;
        }
        return true;
    };

    // ✅ Show Summary Before Submitting
    const handleReview = (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (validateForm()) {
            setShowSummary(true);
        }
    };

    // ✅ WhatsApp Message Generation
    const generateWhatsAppMessage = () => {
        const message = `Hi! 📦\n\nI would like to place an order:\n\n*Product:* ${win.name}\n*Dimensions:* ${w} ft × ${h} ft\n*Area:* ${sqft} sq.ft\n\n*Pricing Breakdown:*\n• Window (₹${customPrice}/sqft): ₹${windowPrice.toFixed(2)}\n• Labour Charge: ₹${labour.toFixed(2)}\n• Rubber Feeding: ₹${rubber.toFixed(2)}\n• Service Charge: ₹${service.toFixed(2)}\n\n*Total: ₹${totalPrice.toFixed(2)}*\n\n*Installation Date:* ${form.fixingDate}\n*Installation Address:* ${form.address}\n\n*Customer Details:*\nName: ${form.username}\nPhone: ${form.phone}\n\n${form.notes ? `Notes: ${form.notes}\n` : ''}Please confirm order availability. Thank you!`;
        return encodeURIComponent(message);
    };

    const handleWhatsApp = () => {
        const message = generateWhatsAppMessage();
        window.open(`https://wa.me/${BUSINESS_PHONE}?text=${message}`, '_blank');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
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
                sqft: parseFloat(sqft),
                fixingDate: form.fixingDate,
                notes: form.notes,
                pricePerSqft: customPrice,
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
                            {showSummary ? 'Order Summary' : 'Book Window'}
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
                    ) : showSummary ? (
                        // ✅ SUMMARY VIEW
                        <div>
                            <div className="bm-summary-section">
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-person-check me-2"></i>Customer Details
                                </h6>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Name:</span>
                                    <span className="fw-semibold">{form.username}</span>
                                </div>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Phone:</span>
                                    <span className="fw-semibold">{form.phone}</span>
                                </div>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Address:</span>
                                    <span className="fw-semibold">{form.address}</span>
                                </div>
                            </div>

                            <div className="bm-summary-section">
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-window me-2"></i>Product Details
                                </h6>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Product:</span>
                                    <span className="fw-semibold">{win.name}</span>
                                </div>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Dimensions:</span>
                                    <span className="fw-semibold">{w} ft × {h} ft = {sqft} sq.ft</span>
                                </div>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Price per sq.ft:</span>
                                    <span className="fw-semibold">₹{customPrice}</span>
                                </div>
                                <div className="bm-summary-row">
                                    <span className="text-muted">Installation Date:</span>
                                    <span className="fw-semibold">{form.fixingDate}</span>
                                </div>
                                {form.notes && (
                                    <div className="bm-summary-row">
                                        <span className="text-muted">Notes:</span>
                                        <span className="fw-semibold">{form.notes}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bm-price-box">
                                <h6 className="fw-bold mb-3">
                                    <i className="bi bi-calculator me-2"></i>Price Breakdown
                                </h6>
                                <div className="bm-price-row">
                                    <span>Window Price ({sqft} sq.ft × ₹{customPrice}/sqft)</span>
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
                                    <span>Total Amount</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bm-footer mt-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowSummary(false)}>
                                    <i className="bi bi-arrow-left me-2"></i>Back to Edit
                                </button>
                                <button type="button" className="btn btn-success" onClick={handleWhatsApp}>
                                    <i className="bi bi-whatsapp me-2"></i>Share on WhatsApp
                                </button>
                                <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                                    {submitting ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Booking...</>
                                    ) : (
                                        <><i className="bi bi-check2-circle me-2"></i>Confirm Booking</>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        // ✅ FORM VIEW
                        <form onSubmit={handleReview}>
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
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. 9876543210"
                                        pattern="[0-9]{10}"
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

                                {/* Width & Height with Live Calculation */}
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

                                {/* Total Sq.ft Display */}
                                <div className="col-12">
                                    <div className="bm-sqft-box">
                                        <span>Total Area:</span>
                                        <span className="fw-bold text-primary">{sqft} sq.ft</span>
                                    </div>
                                </div>

                                {/* Instant Estimate Card */}
                                <div className="col-12">
                                    <div className="bm-estimate-card">
                                        <div>
                                            <div className="text-uppercase small text-secondary mb-1">Instant estimate</div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <div className="fw-semibold">{w > 0 && h > 0 ? `${sqft} sq.ft × ₹${customPrice.toFixed(2)} / sq.ft` : 'Enter dimensions to calculate cost'}</div>
                                                    <div className="text-muted small">Price updates instantly as you change width, height, or price per sq.ft.</div>
                                                </div>
                                                <div className="fw-bold fs-5 text-primary">₹{(w > 0 && h > 0 ? totalPrice.toFixed(2) : '0.00')}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Price per Sq.ft (Editable) */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Price per Sq.ft <span className="text-danger">*</span></label>
                                    <div className="input-group">
                                        <span className="input-group-text">₹</span>
                                        <input
                                            className="form-control"
                                            type="number"
                                            value={customPrice}
                                            onChange={handlePriceChange}
                                            min="1"
                                            step="1"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Window Price Display */}
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Window Price</label>
                                    <div className="bm-price-display">
                                        ₹{windowPrice.toFixed(2)}
                                    </div>
                                </div>

                                {/* Additional Charges Display */}
                                <div className="col-12">
                                    <div className="bm-charges-box">
                                        <div className="bm-charge-item">
                                            <span>Labour Charge:</span>
                                            <span className="fw-semibold">₹{labour.toFixed(2)}</span>
                                        </div>
                                        <div className="bm-charge-item">
                                            <span>Rubber Feeding:</span>
                                            <span className="fw-semibold">₹{rubber.toFixed(2)}</span>
                                        </div>
                                        <div className="bm-charge-item">
                                            <span>Service Charge:</span>
                                            <span className="fw-semibold">₹{service.toFixed(2)}</span>
                                        </div>
                                        <div className="bm-charge-item bm-charge-total">
                                            <span>Total Price:</span>
                                            <span className="fw-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                                        </div>
                                    </div>
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

                            <div className="bm-footer mt-4">
                                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    <i className="bi bi-arrow-right me-2"></i>Review Order
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
