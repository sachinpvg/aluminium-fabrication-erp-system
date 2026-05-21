import React, { useEffect, useState } from 'react';
import './UserDashboard.css';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Nav from './comp/nav';
import Footer from './comp/footer';
import { apiUrl } from './api';

export default function UserDashboard() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quotationView, setQuotationView] = useState(null);

    // Bookings state
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [bookingsError, setBookingsError] = useState('');
    const [payingId, setPayingId] = useState(null);
    const [paySuccess, setPaySuccess] = useState('');
    const [paymentModalBooking, setPaymentModalBooking] = useState(null); // new state for modal

    // Fetch requirements
    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        const fetchMyRequirements = async () => {
            try {
                const res = await axios.get(apiUrl('/api/requirements/my'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRequirements(res.data);
            } catch (err) {
                setError('Failed to load your requirements. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyRequirements();
    }, [token, navigate]);

    // Fetch bookings
    useEffect(() => {
        if (!token) return;
        const fetchBookings = async () => {
            try {
                const res = await axios.get(apiUrl('/api/bookings/my'), {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                setBookingsError('Failed to load your bookings.');
            } finally {
                setBookingsLoading(false);
            }
        };
        fetchBookings();
    }, [token]);

    // Handle hash scrolling
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [location, requirements]);

    const statusClass = (status) => {
        const map = { approved: 'ud-status-approved', pending: 'ud-status-pending', rejected: 'ud-status-rejected' };
        return map[status] || 'ud-status-pending';
    };

    const bookingStatusBadge = (status) => {
        const map = {
            pending: { cls: 'bg-warning text-dark', label: 'Pending' },
            booked: { cls: 'bg-success', label: 'Booked' },
            rejected: { cls: 'bg-danger', label: 'Rejected' }
        };
        const s = map[status] || map.pending;
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    const handlePayNowClick = (booking) => {
        setPaymentModalBooking(booking);
    };

    const confirmPayment = async () => {
        if (!paymentModalBooking) return;
        const booking = paymentModalBooking;
        setPayingId(booking._id);
        setPaySuccess('');
        try {
            const res = await axios.put(
                apiUrl(`/api/bookings/${booking._id}/payment`),
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh bookings
            const updated = await axios.get(apiUrl('/api/bookings/my'), {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookings(updated.data);
            setPaySuccess(booking._id);
            setPaymentModalBooking(null); // Close modal
            setTimeout(() => setPaySuccess(''), 4000);
        } catch (err) {
            alert('Payment failed. Please try again.');
        } finally {
            setPayingId(null);
        }
    };

    return (
        <div className="simple-page-wrapper">
            <Nav />

            <main className="container my-5">
                <div className="text-center mb-5">
                    <h2 className="greeting-text">Welcome back, <span>{user?.username}</span> 👋</h2>
                    <p className="text-muted">Manage your requirements, bookings, and view quotations below</p>
                </div>

                {/* USER DETAILS SECTION */}
                <section id="details" className="card shadow-sm border-0 mb-5 overflow-hidden">
                    <div className="card-header bg-primary text-white p-3">
                        <h4 className="mb-0"><i className="bi bi-person-badge me-2"></i>User Details</h4>
                    </div>
                    <div className="card-body p-4">
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="text-muted small text-uppercase fw-bold">Username</label>
                                <p className="fs-5 fw-semibold mb-0">{user?.username}</p>
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="text-muted small text-uppercase fw-bold">Email Address</label>
                                <p className="fs-5 fw-semibold mb-0">{user?.email}</p>
                            </div>
                            <div className="col-md-6">
                                <label className="text-muted small text-uppercase fw-bold">User ID</label>
                                <p className="fs-5 fw-semibold text-primary mb-0"><code>{user?.userId}</code></p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* REQUIREMENT STATUS SECTION */}
                <section id="status" className="card shadow-sm border-0 mb-5">
                    <div className="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center">
                        <h4 className="mb-0"><i className="bi bi-hourglass-split me-2"></i>Requirement Status</h4>
                        <a href="/requirement" className="btn btn-sm btn-outline-light">New Request</a>
                    </div>
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="p-5 text-center">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Loading...</p>
                            </div>
                        ) : error ? (
                            <div className="alert alert-danger m-3">{error}</div>
                        ) : requirements.length === 0 ? (
                            <div className="p-5 text-center text-muted">
                                <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                                <h5>No requirements yet</h5>
                                <a href="/requirement" className="btn btn-primary mt-3">Submit One Now</a>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light">
                                        <tr>
                                            <th className="ps-4">#</th>
                                            <th>Site Type / Location</th>
                                            <th>Items</th>
                                            <th>Status</th>
                                            <th className="pe-4">Submitted On</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requirements.map((req, idx) => (
                                            <tr key={req._id}>
                                                <td className="ps-4">{idx + 1}</td>
                                                <td>
                                                    <div className="fw-semibold">{req.siteType || '—'}</div>
                                                    <div className="small text-muted">{req.location || '—'}</div>
                                                </td>
                                                <td><span className="badge bg-light text-primary border">{req.items?.length || 0} item(s)</span></td>
                                                <td><span className={`ud-status-badge ${statusClass(req.status)}`}>{req.status || 'Pending'}</span></td>
                                                <td className="pe-4">
                                                    <div>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '—'}</div>
                                                    {req.items?.[0] && <div className="small text-muted">{req.items[0].width}x{req.items[0].height} ft</div>}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>

                {/* QUOTATIONS SECTION */}
                <section id="quotations" className="card shadow-sm border-0 mb-5">
                    <div className="card-header bg-success text-white p-3">
                        <h4 className="mb-0"><i className="bi bi-receipt me-2"></i>My Quotations</h4>
                    </div>
                    <div className="card-body p-4">
                        {requirements.filter(r => r.status === 'approved' && r.quotation).length === 0 ? (
                            <div className="text-center py-4 text-muted">
                                <p className="mb-0">Your quotations will appear here once approved by the admin.</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {requirements.filter(r => r.status === 'approved' && r.quotation).map((req) => (
                                    <div className="col-md-6 col-lg-4" key={req._id}>
                                        <div className="quotation-card p-3 border rounded text-center">
                                            <div className="fs-1 text-success mb-2"><i className="bi bi-file-earmark-check"></i></div>
                                            <h5 className="mb-1">₹{req.quotation.totalAmount}</h5>
                                            <p className="small text-muted mb-3">{req.siteType} - {req.location}</p>
                                            <button className="btn btn-success w-100" onClick={() => setQuotationView(req)}>
                                                View & Print
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* MY BOOKINGS SECTION */}
                <section id="bookings" className="card shadow-sm border-0 mb-5">
                    <div className="card-header p-3 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg,#0f3460,#16213e)' }}>
                        <h4 className="mb-0 text-white"><i className="bi bi-calendar2-check me-2"></i>My Window Bookings</h4>
                        <a href="/windows" className="btn btn-sm btn-outline-light">Browse Windows</a>
                    </div>
                    <div className="card-body p-0">
                        {bookingsLoading ? (
                            <div className="p-5 text-center">
                                <div className="spinner-border text-primary" role="status"></div>
                                <p className="mt-2 text-muted">Loading bookings...</p>
                            </div>
                        ) : bookingsError ? (
                            <div className="alert alert-danger m-3">{bookingsError}</div>
                        ) : bookings.length === 0 ? (
                            <div className="p-5 text-center text-muted">
                                <i className="bi bi-calendar-x fs-1 d-block mb-3"></i>
                                <h5>No bookings yet</h5>
                                <a href="/windows" className="btn btn-primary mt-3">Book a Window</a>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0 align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="ps-4">#</th>
                                                <th>Window</th>
                                                <th>Size</th>
                                                <th>Fixing Date</th>
                                                <th>Total Price</th>
                                                <th>Status</th>
                                                <th className="pe-4">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map((b, idx) => (
                                                <tr key={b._id}>
                                                    <td className="ps-4">{idx + 1}</td>
                                                    <td className="fw-semibold">{b.windowName || '—'}</td>
                                                    <td>{b.width} × {b.height} ft</td>
                                                    <td>{b.fixingDate ? new Date(b.fixingDate).toLocaleDateString('en-IN') : '—'}</td>
                                                    <td className="fw-semibold text-primary">₹{parseFloat(b.totalPrice || 0).toFixed(2)}</td>
                                                    <td>{bookingStatusBadge(b.status)}</td>
                                                    <td className="pe-4">
                                                        {b.status === 'booked' && b.paymentStatus !== 'paid' && (
                                                            <button
                                                                className="btn btn-sm btn-success"
                                                                onClick={() => handlePayNowClick(b)}
                                                                disabled={payingId === b._id}
                                                            >
                                                                {payingId === b._id
                                                                    ? <><span className="spinner-border spinner-border-sm me-1"></span>Processing...</>
                                                                    : <><i className="bi bi-credit-card me-1"></i>Pay Now</>
                                                                }
                                                            </button>
                                                        )}
                                                        {b.paymentStatus === 'paid' && !b.assigned_worker && (
                                                            <span className="badge bg-success fs-6">
                                                                <i className="bi bi-check-circle me-1" />
                                                                {paySuccess === b._id ? 'Payment Successful!' : 'Paid'}
                                                            </span>
                                                        )}
                                                        {b.paymentStatus === 'paid' && b.assigned_worker && (
                                                            <span className="badge bg-success">
                                                                <i className="bi bi-person-check me-1" />Worker Assigned ✓
                                                            </span>
                                                        )}
                                                        {b.status === 'pending' && (
                                                            <span className="text-muted small">Awaiting approval</span>
                                                        )}
                                                        {b.status === 'rejected' && (
                                                            <span className="text-danger small">Booking rejected</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ── Assigned Worker Cards ── */}
                                {bookings.some(b => b.assigned_worker) && (
                                    <div className="p-4">
                                        <h6 className="fw-bold mb-3 text-dark">
                                            <i className="bi bi-person-badge me-2 text-primary" />Your Assigned Installation Workers
                                        </h6>
                                        <div className="row g-3">
                                            {bookings.filter(b => b.assigned_worker).map(b => (
                                                <div className="col-12 col-md-6 col-lg-4" key={b._id + '-worker'}>
                                                    <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
                                                        {/* Top colour bar */}
                                                        <div style={{ height: 5, background: 'linear-gradient(90deg,#28a745,#20c997)' }} />
                                                        <div className="card-body p-4">
                                                            {/* Booking context */}
                                                            <div className="mb-3 pb-2 border-bottom">
                                                                <span className="badge bg-primary bg-opacity-10 text-primary border">
                                                                    <i className="bi bi-window me-1" />{b.windowName}
                                                                </span>
                                                            </div>
                                                            {/* Worker info */}
                                                            <div className="d-flex align-items-center gap-3 mb-3">
                                                                {b.assigned_worker.worker_image ? (
                                                                    <img
                                                                        src={b.assigned_worker.worker_image}
                                                                        alt={b.assigned_worker.worker_name}
                                                                        style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e9ecef', flexShrink: 0 }}
                                                                        onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                                                                    />
                                                                ) : (
                                                                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#0f3460,#1a4b8c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                        <i className="bi bi-person-fill text-white" style={{ fontSize: '1.8rem' }} />
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <h6 className="fw-bold mb-0">{b.assigned_worker.worker_name}</h6>
                                                                    <span className="badge bg-secondary bg-opacity-10 text-secondary border small">{b.assigned_worker.worker_id}</span>
                                                                </div>
                                                            </div>
                                                            <div className="small text-muted mb-1">
                                                                <i className="bi bi-telephone me-1" />{b.assigned_worker.worker_phone || '—'}
                                                            </div>
                                                            {b.assigned_worker.years_of_experience > 0 && (
                                                                <div className="small text-muted mb-1">
                                                                    <i className="bi bi-briefcase me-1" />{b.assigned_worker.years_of_experience} yrs experience
                                                                </div>
                                                            )}
                                                            <div className="d-flex align-items-center gap-2 mt-1 mb-3">
                                                                <span className="badge bg-success">Available</span>
                                                                <span className="text-muted small">Installation Specialist</span>
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="d-flex gap-2 mt-2">
                                                                <a
                                                                    href={(() => {
                                                                        let p = (b.assigned_worker.worker_phone || '').replace(/[^0-9]/g, '');
                                                                        if (p.length === 10) p = '91' + p;
                                                                        return `https://wa.me/${p}`;
                                                                    })()}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn text-white btn-sm flex-grow-1 fw-semibold"
                                                                    style={{ background: '#25D366' }}
                                                                >
                                                                    <i className="bi bi-whatsapp me-1" />Call Worker
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

            </main>

            {/* Quotation Modal */}
            {quotationView && (
                <div className="ud-modal-overlay" onClick={() => setQuotationView(null)}>
                    <div className="ud-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="ud-modal-header">
                            <h5>💰 Your Quotation</h5>
                            <button className="ud-modal-close" onClick={() => setQuotationView(null)}>×</button>
                        </div>
                        <div className="ud-modal-body">
                            <div className="ud-quot-meta">
                                <p><strong>Name:</strong> {quotationView.name}</p>
                                <p><strong>Site:</strong> {quotationView.siteType} – {quotationView.location}</p>
                                <p><strong>Approved On:</strong> {quotationView.approvedAt ? new Date(quotationView.approvedAt).toLocaleDateString('en-IN') : '—'}</p>
                            </div>

                            {quotationView.quotation?.itemPrices?.length > 0 && (
                                <div className="mt-3">
                                    <h6 className="fw-semibold mb-2">Item Pricing Breakdown</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>#</th><th>Type</th><th>Size (ft)</th><th>Qty</th><th>Sq.ft</th><th>Rate (₹/sqft)</th><th>Total (₹)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quotationView.quotation.itemPrices.map((ip, i) => (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>{ip.type}</td>
                                                        <td>{ip.width} × {ip.height} ft</td>
                                                        <td>{ip.qty}</td>
                                                        <td>{ip.areaSqft || ((parseFloat(ip.width) * parseFloat(ip.height)) || 0).toFixed(2)}</td>
                                                        <td>₹{ip.unitPrice || '—'}</td>
                                                        <td>₹{ip.totalPrice || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="ud-quot-total">
                                <span>Grand Total</span>
                                <span className="ud-quot-amount">₹{quotationView.quotation?.totalAmount}</span>
                            </div>

                            {quotationView.quotation?.notes && (
                                <div className="ud-quot-notes">
                                    <strong>Notes / Terms:</strong>
                                    <p>{quotationView.quotation.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="ud-modal-footer d-flex gap-2">
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <i className="bi bi-printer"></i> Print / Download PDF
                            </button>
                            <button className="btn btn-secondary" onClick={() => setQuotationView(null)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Method Modal */}
            {paymentModalBooking && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setPaymentModalBooking(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
                            <div className="modal-header bg-dark text-white" style={{ borderRadius: '16px 16px 0 0' }}>
                                <h5 className="modal-title mb-0"><i className="bi bi-qr-code-scan me-2"></i>Complete Payment</h5>
                                <button className="btn-close btn-close-white" onClick={() => setPaymentModalBooking(null)}></button>
                            </div>
                            <div className="modal-body p-4 text-center">
                                <h6 className="fw-bold fs-4 mb-2">₹{parseFloat(paymentModalBooking.totalPrice || 0).toFixed(2)}</h6>
                                <p className="text-muted small mb-4">Please scan the QR code using any UPI App (GPay, PhonePe, Paytm)</p>

                                <div className="qr-code-container mb-4 mx-auto p-3 bg-white" style={{ maxWidth: 220, border: '2px dashed #000', borderRadius: 12 }}>
                                    {/* Placeholder QR image; in a real app, integrate Razorpay QR or Dynamic UPI QR */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=vectorindustries@upi&pn=Vector+Industries&am=${paymentModalBooking.totalPrice}&cu=INR`}
                                        alt="UPI QR Code"
                                        className="img-fluid"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/200?text=Scan+to+Pay";
                                        }}
                                    />
                                </div>

                                <div className="d-flex justify-content-center gap-3 mb-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" height="24" />
                                </div>
                                <hr />
                                <div className="alert alert-info py-2 small mb-0 text-start">
                                    <i className="bi bi-info-circle-fill me-2"></i>
                                    After completing your payment, click the button below to confirm your order. An admin will assign a worker shortly.
                                </div>
                            </div>
                            <div className="modal-footer d-flex gap-2 border-0 bg-light" style={{ borderRadius: '0 0 16px 16px' }}>
                                <button className="btn btn-secondary w-100" onClick={() => setPaymentModalBooking(null)} disabled={payingId === paymentModalBooking._id}>
                                    Cancel
                                </button>
                                <button className="btn w-100 text-white" style={{ background: 'linear-gradient(90deg, #28a745, #20c997)' }} onClick={confirmPayment} disabled={payingId === paymentModalBooking._id}>
                                    {payingId === paymentModalBooking._id ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span>Confirming...</>
                                    ) : (
                                        <><i className="bi bi-check2-circle me-1"></i>I Have Paid Successfully</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
