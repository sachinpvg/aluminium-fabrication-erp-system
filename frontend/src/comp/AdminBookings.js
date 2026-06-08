import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

export default function AdminBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: '', msg: '' });
    const [viewBooking, setViewBooking] = useState(null);
    const [filter, setFilter] = useState('all');
    const [editingPrice, setEditingPrice] = useState(null);
    const [priceForm, setPriceForm] = useState({
        pricePerSqft: 0,
        labourCharge: 0,
        rubberCharge: 0,
        serviceCharge: 0
    });
    const [updatingPrice, setUpdatingPrice] = useState(false);

    // Assign worker modal state
    const [assignBooking, setAssignBooking] = useState(null);
    const [availableWorkers, setAvailableWorkers] = useState([]);
    const [workersLoading, setWorkersLoading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/bookings'));
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            showAlert('danger', 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert({ type: '', msg: '' }), 3500);
    };

    const openEditPriceModal = (booking) => {
        setEditingPrice(booking._id);
        setPriceForm({
            pricePerSqft: booking.pricePerSqft || 0,
            labourCharge: booking.labourCharge || 0,
            rubberCharge: booking.rubberCharge || 0,
            serviceCharge: booking.serviceCharge || 0
        });
    };

    const handlePriceChange = (e) => {
        setPriceForm({
            ...priceForm,
            [e.target.name]: parseFloat(e.target.value) || 0
        });
    };

    const handleUpdatePrice = async (bookingId) => {
        if (!window.confirm('Update booking price? Customers will see the new total.')) return;
        
        setUpdatingPrice(true);
        try {
            const res = await fetch(apiUrl(`/api/bookings/${bookingId}/update-price`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(priceForm)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', 'Price updated successfully!');
            setEditingPrice(null);
            fetchBookings();
        } catch (err) {
            showAlert('danger', err.message || 'Failed to update price.');
        } finally {
            setUpdatingPrice(false);
        }
    };

    const handleApprove = async (booking) => {
        if (!window.confirm(`Approve booking for "${booking.windowName}"?`)) return;
        try {
            const res = await fetch(apiUrl(`/api/bookings/${booking._id}/approve`), { method: 'PUT' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', 'Booking approved — status set to Booked.');
            fetchBookings();
        } catch (err) {
            showAlert('danger', err.message || 'Approval failed.');
        }
    };

    const handleReject = async (booking) => {
        if (!window.confirm(`Reject booking for "${booking.windowName}"?`)) return;
        try {
            const res = await fetch(apiUrl(`/api/bookings/${booking._id}/reject`), { method: 'PUT' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('warning', 'Booking rejected.');
            fetchBookings();
        } catch (err) {
            showAlert('danger', err.message || 'Rejection failed.');
        }
    };

    // Open assign worker modal and fetch available workers
    const openAssignModal = async (booking) => {
        setAssignBooking(booking);
        setWorkersLoading(true);
        try {
            const res = await fetch(apiUrl('/api/workers/available'));
            const data = await res.json();
            setAvailableWorkers(Array.isArray(data) ? data : []);
        } catch {
            setAvailableWorkers([]);
        } finally {
            setWorkersLoading(false);
        }
    };

    const handleAssignWorker = async (worker) => {
        if (!assignBooking) return;
        setAssigning(true);
        try {
            const res = await fetch(apiUrl(`/api/bookings/${assignBooking._id}/assign-worker`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    worker_id: worker.worker_id,
                    worker_name: worker.name,
                    worker_phone: worker.phone,
                    worker_image: worker.profile_image,
                    worker_experience: worker.experience_details,
                    years_of_experience: worker.years_of_experience
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', `Worker "${worker.name}" assigned successfully!`);
            setAssignBooking(null);
            fetchBookings();
        } catch (err) {
            showAlert('danger', err.message || 'Assignment failed.');
        } finally {
            setAssigning(false);
        }
    };

    const statusBadge = (status) => {
        const map = { pending: 'bg-warning text-dark', booked: 'bg-success', rejected: 'bg-danger' };
        return <span className={`badge ${map[status] || 'bg-secondary'} text-capitalize`}>{status}</span>;
    };

    const paymentBadge = (ps) =>
        ps === 'paid'
            ? <span className="badge bg-success">Paid</span>
            : <span className="badge bg-secondary">Pending</span>;

    const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0"><i className="bi bi-calendar2-check me-2" />Window Bookings</h5>
                <div className="d-flex gap-2 align-items-center">
                    <select className="form-select form-select-sm" value={filter} onChange={e => setFilter(e.target.value)} style={{ width: 160 }}>
                        <option value="all">All Bookings</option>
                        <option value="pending">Pending</option>
                        <option value="booked">Booked</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button className="btn btn-outline-primary btn-sm" onClick={fetchBookings}>
                        <i className="bi bi-arrow-clockwise" />
                    </button>
                </div>
            </div>

            {alert.msg && <div className={`alert alert-${alert.type} py-2`}>{alert.msg}</div>}

            {/* Summary Cards */}
            <div className="row g-2 mb-4">
                {[
                    { label: 'Total', val: bookings.length, cls: 'bg-primary' },
                    { label: 'Pending', val: bookings.filter(b => b.status === 'pending').length, cls: 'bg-warning text-dark' },
                    { label: 'Booked', val: bookings.filter(b => b.status === 'booked').length, cls: 'bg-success' },
                    { label: 'Paid', val: bookings.filter(b => b.paymentStatus === 'paid').length, cls: 'bg-info text-dark' }
                ].map(s => (
                    <div className="col-6 col-md-3" key={s.label}>
                        <div className={`${s.cls} text-white rounded p-3 text-center`} style={{ minHeight: 72 }}>
                            <div className="fs-4 fw-bold">{s.val}</div>
                            <div className="small">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-calendar-x fs-1 d-block mb-2" /><p>No bookings found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Customer</th>
                                <th>Window</th>
                                <th>Size</th>
                                <th>Fixing Date</th>
                                <th>Total (₹)</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Worker</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((b, idx) => (
                                <tr key={b._id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        <div className="fw-semibold">{b.username || '—'}</div>
                                        <div className="text-muted small">{b.phone}</div>
                                    </td>
                                    <td>{b.windowName || '—'}</td>
                                    <td className="small">{b.width} × {b.height} ft</td>
                                    <td className="small">{b.fixingDate ? new Date(b.fixingDate).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="fw-semibold">₹{parseFloat(b.totalPrice || 0).toFixed(2)}</td>
                                    <td>{statusBadge(b.status)}</td>
                                    <td>{paymentBadge(b.paymentStatus)}</td>
                                    {/* Worker assignment column */}
                                    <td>
                                        {b.assigned_worker ? (
                                            <div className="d-flex align-items-center gap-2">
                                                {b.assigned_worker.worker_image ? (
                                                    <img src={b.assigned_worker.worker_image} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                ) : (
                                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0f3460', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <i className="bi bi-person-fill text-white" style={{ fontSize: '0.75rem' }} />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-semibold small">{b.assigned_worker.worker_name}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>{b.assigned_worker.worker_id}</div>
                                                </div>
                                            </div>
                                        ) : b.paymentStatus === 'paid' ? (
                                            <button
                                                className="btn btn-sm text-white fw-semibold"
                                                style={{ background: 'linear-gradient(135deg,#6f42c1,#5a32a3)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                                                onClick={() => openAssignModal(b)}
                                            >
                                                <i className="bi bi-person-plus me-1" />Assign Worker
                                            </button>
                                        ) : (
                                            <span className="text-muted small">—</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="d-flex gap-1 flex-wrap">
                                            <button className="btn btn-sm btn-outline-info" title="View Details" onClick={() => setViewBooking(b)}>
                                                <i className="bi bi-eye" />
                                            </button>
                                            {b.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-sm btn-success" onClick={() => handleApprove(b)} title="Approve">
                                                        <i className="bi bi-check-lg" />
                                                    </button>
                                                    <button className="btn btn-sm btn-danger" onClick={() => handleReject(b)} title="Reject">
                                                        <i className="bi bi-x-lg" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Detail Modal ── */}
            {viewBooking && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setViewBooking(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header bg-dark text-white">
                                <h6 className="modal-title">Booking Details</h6>
                                <button className="btn-close btn-close-white" onClick={() => setViewBooking(null)} />
                            </div>
                            <div className="modal-body">
                                <table className="table table-sm">
                                    <tbody>
                                        <tr><th>Customer</th><td>{viewBooking.username}</td></tr>
                                        <tr><th>Email</th><td>{viewBooking.userEmail}</td></tr>
                                        <tr><th>Phone</th><td>{viewBooking.phone}</td></tr>
                                        <tr><th>Address</th><td>{viewBooking.address}</td></tr>
                                        <tr><th>Window</th><td>{viewBooking.windowName}</td></tr>
                                        <tr><th>Size</th><td>{viewBooking.width} × {viewBooking.height} ft ({viewBooking.sqft} sq.ft)</td></tr>
                                        <tr><th>Fixing Date</th><td>{viewBooking.fixingDate ? new Date(viewBooking.fixingDate).toLocaleDateString('en-IN') : '—'}</td></tr>
                                        <tr><th>Status</th><td>{statusBadge(viewBooking.status)}</td></tr>
                                        <tr><th>Payment</th><td>{paymentBadge(viewBooking.paymentStatus)}</td></tr>
                                        {viewBooking.assigned_worker && (
                                            <tr>
                                                <th>Assigned Worker</th>
                                                <td>
                                                    <strong>{viewBooking.assigned_worker.worker_name}</strong>
                                                    <div className="text-muted small">{viewBooking.assigned_worker.worker_id} · {viewBooking.assigned_worker.worker_phone}</div>
                                                </td>
                                            </tr>
                                        )}
                                        {viewBooking.notes && <tr><th>Notes</th><td>{viewBooking.notes}</td></tr>}
                                    </tbody>
                                </table>

                                <hr />

                                {/* ── Admin Price Editing Section ── */}
                                <div>
                                    <h6 className="fw-bold mb-3">
                                        <i className="bi bi-calculator me-2" />Price Breakdown (Admin Only)
                                    </h6>

                                    {editingPrice === viewBooking._id ? (
                                        // Edit Mode
                                        <div className="row g-3 p-3 bg-light rounded">
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Price per Sq.ft (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="pricePerSqft"
                                                    value={priceForm.pricePerSqft}
                                                    onChange={handlePriceChange}
                                                    step="0.1"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Labour Charge (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="labourCharge"
                                                    value={priceForm.labourCharge}
                                                    onChange={handlePriceChange}
                                                    step="0.1"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="col-md-6">
                                                <label className="form-label fw-semibold">Rubber Charge (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="rubberCharge"
                                                    value={priceForm.rubberCharge}
                                                    onChange={handlePriceChange}
                                                    step="0.1"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="form-label fw-semibold">Service Charge (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="serviceCharge"
                                                    value={priceForm.serviceCharge}
                                                    onChange={handlePriceChange}
                                                    step="0.1"
                                                    min="0"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <div className="p-2 bg-white rounded border-2 border-primary">
                                                    <div className="fw-bold text-primary">
                                                        Calculated Total: ₹{(
                                                            (priceForm.pricePerSqft * viewBooking.sqft) +
                                                            priceForm.labourCharge +
                                                            priceForm.rubberCharge +
                                                            priceForm.serviceCharge
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-12 d-flex gap-2">
                                                <button
                                                    className="btn btn-success btn-sm flex-grow-1"
                                                    onClick={() => handleUpdatePrice(viewBooking._id)}
                                                    disabled={updatingPrice}
                                                >
                                                    {updatingPrice ? 'Updating...' : 'Save Price'}
                                                </button>
                                                <button
                                                    className="btn btn-secondary btn-sm flex-grow-1"
                                                    onClick={() => setEditingPrice(null)}
                                                    disabled={updatingPrice}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="table-responsive">
                                            <table className="table table-sm border">
                                                <tbody>
                                                    <tr>
                                                        <th>Price per Sq.ft</th>
                                                        <td className="fw-semibold">₹{(viewBooking.pricePerSqft || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Window Price ({viewBooking.sqft} sq.ft)</th>
                                                        <td className="fw-semibold">₹{(viewBooking.windowPrice || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Labour Charge</th>
                                                        <td className="fw-semibold">₹{(viewBooking.labourCharge || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Rubber Charge</th>
                                                        <td className="fw-semibold">₹{(viewBooking.rubberCharge || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr>
                                                        <th>Service Charge</th>
                                                        <td className="fw-semibold">₹{(viewBooking.serviceCharge || 0).toFixed(2)}</td>
                                                    </tr>
                                                    <tr className="table-dark">
                                                        <th className="text-white">TOTAL PRICE</th>
                                                        <td className="fw-bold text-warning">₹{(viewBooking.totalPrice || 0).toFixed(2)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <button
                                                className="btn btn-sm btn-outline-primary mt-2"
                                                onClick={() => openEditPriceModal(viewBooking)}
                                            >
                                                <i className="bi bi-pencil me-1" />Edit Prices
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                {viewBooking.status === 'pending' && (
                                    <>
                                        <button className="btn btn-success btn-sm" onClick={() => { handleApprove(viewBooking); setViewBooking(null); }}>
                                            <i className="bi bi-check-circle me-1" />Approve
                                        </button>
                                        <button className="btn btn-danger btn-sm" onClick={() => { handleReject(viewBooking); setViewBooking(null); }}>
                                            <i className="bi bi-x-circle me-1" />Reject
                                        </button>
                                    </>
                                )}
                                <button className="btn btn-secondary btn-sm" onClick={() => setViewBooking(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Assign Worker Modal ── */}
            {assignBooking && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => !assigning && setAssignBooking(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 18 }}>
                            <div className="modal-header border-0 text-white" style={{ background: 'linear-gradient(135deg,#6f42c1,#5a32a3)', borderRadius: '18px 18px 0 0' }}>
                                <div>
                                    <h6 className="modal-title mb-1"><i className="bi bi-person-plus me-2" />Assign Worker</h6>
                                    <small className="opacity-75">Booking: {assignBooking.windowName} · {assignBooking.username}</small>
                                </div>
                                <button className="btn-close btn-close-white" onClick={() => setAssignBooking(null)} disabled={assigning} />
                            </div>
                            <div className="modal-body p-4">
                                {workersLoading ? (
                                    <div className="text-center py-4"><div className="spinner-border text-primary" /></div>
                                ) : availableWorkers.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="bi bi-people fs-1 d-block mb-2" />
                                        <p>No available workers at the moment.</p>
                                        <small>Go to the Workers tab and set a worker as Available.</small>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-muted small mb-3">Select an available worker to assign to this booking:</p>
                                        <div className="row g-3">
                                            {availableWorkers.map(w => (
                                                <div className="col-12 col-sm-6" key={w._id}>
                                                    <div className="card border-0 shadow-sm" style={{ borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                                                        onClick={() => !assigning && handleAssignWorker(w)}
                                                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(111,66,193,0.2)'; }}
                                                        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                                                        <div className="card-body p-3 d-flex align-items-center gap-3">
                                                            {w.profile_image ? (
                                                                <img src={w.profile_image} alt={w.name} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #dee2e6', flexShrink: 0 }}
                                                                    onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/52?text=W'; }} />
                                                            ) : (
                                                                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6f42c1,#5a32a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <i className="bi bi-person-fill text-white fs-5" />
                                                                </div>
                                                            )}
                                                            <div className="flex-grow-1 min-w-0">
                                                                <div className="fw-bold text-truncate">{w.name}</div>
                                                                <div className="small text-muted">{w.worker_id} · <i className="bi bi-telephone me-1" />{w.phone}</div>
                                                                <div className="small text-muted"><i className="bi bi-briefcase me-1" />{w.years_of_experience || 0} yrs exp</div>
                                                            </div>
                                                            <span className="badge bg-success flex-shrink-0">Available</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-secondary btn-sm" onClick={() => setAssignBooking(null)} disabled={assigning}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
