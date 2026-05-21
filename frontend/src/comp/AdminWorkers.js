import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

export default function AdminWorkers() {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: '', msg: '' });
    const [viewWorker, setViewWorker] = useState(null);

    useEffect(() => { fetchWorkers(); }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/workers'));
            const data = await res.json();
            setWorkers(Array.isArray(data) ? data : []);
        } catch (err) {
            showAlert('danger', 'Failed to load workers.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert({ type: '', msg: '' }), 3500);
    };

    const handleToggleStatus = async (worker) => {
        const newStatus = worker.status === 'Available' ? 'Busy' : 'Available';
        try {
            const res = await fetch(apiUrl(`/api/workers/${worker._id}/status`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', `${worker.name} is now ${newStatus}.`);
            fetchWorkers();
        } catch (err) {
            showAlert('danger', err.message || 'Status update failed.');
        }
    };

    const handleDelete = async (worker) => {
        if (!window.confirm(`Delete worker "${worker.name}" (${worker.worker_id})? This cannot be undone.`)) return;
        try {
            const res = await fetch(apiUrl(`/api/workers/${worker._id}`), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', 'Worker deleted successfully.');
            fetchWorkers();
        } catch (err) {
            showAlert('danger', err.message || 'Delete failed.');
        }
    };

    const available = workers.filter(w => w.status === 'Available').length;
    const busy = workers.filter(w => w.status === 'Busy').length;

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">
                    <i className="bi bi-people me-2" />Workers Management
                </h5>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchWorkers}>
                    <i className="bi bi-arrow-clockwise" />
                </button>
            </div>

            {alert.msg && <div className={`alert alert-${alert.type} py-2`}>{alert.msg}</div>}

            {/* Summary Stats */}
            <div className="row g-2 mb-4">
                {[
                    { label: 'Total Workers', val: workers.length, cls: 'bg-primary' },
                    { label: 'Available', val: available, cls: 'bg-success' },
                    { label: 'Busy', val: busy, cls: 'bg-warning text-dark' },
                ].map(s => (
                    <div className="col-4" key={s.label}>
                        <div className={`${s.cls} text-white rounded-3 p-3 text-center`} style={{ minHeight: 72 }}>
                            <div className="fs-4 fw-bold">{s.val}</div>
                            <div className="small">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : workers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-3" />
                    <h5>No workers registered yet.</h5>
                    <p>Workers apply from the Contact page.</p>
                </div>
            ) : (
                <div className="row g-3">
                    {workers.map(w => (
                        <div className="col-12 col-sm-6 col-xl-4" key={w._id}>
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16, transition: 'box-shadow 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>

                                {/* Card top bar */}
                                <div style={{ height: 6, borderRadius: '16px 16px 0 0', background: w.status === 'Available' ? 'linear-gradient(90deg,#28a745,#20c997)' : 'linear-gradient(90deg,#ffc107,#fd7e14)' }} />

                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start gap-3 mb-3">
                                        {/* Profile pic */}
                                        {w.profile_image ? (
                                            <img
                                                src={w.profile_image}
                                                alt={w.name}
                                                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e9ecef', flexShrink: 0 }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=W'; }}
                                            />
                                        ) : (
                                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#0f3460,#1a4b8c)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="bi bi-person-fill text-white fs-4" />
                                            </div>
                                        )}
                                        <div className="flex-grow-1 min-w-0">
                                            <h6 className="fw-bold mb-1 text-truncate">{w.name}</h6>
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border small">{w.worker_id}</span>
                                        </div>
                                        {/* Status badge */}
                                        <span className={`badge ${w.status === 'Available' ? 'bg-success' : 'bg-warning text-dark'}`} style={{ flexShrink: 0 }}>
                                            {w.status}
                                        </span>
                                    </div>

                                    {/* Info rows */}
                                    <div className="small text-muted">
                                        <div className="d-flex align-items-start gap-2 mb-1">
                                            <i className="bi bi-telephone mt-1" />
                                            <span>{w.phone || '—'}</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 mb-1">
                                            <i className="bi bi-geo-alt mt-1" />
                                            <span className="text-truncate">{w.address || '—'}</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 mb-1">
                                            <i className="bi bi-briefcase mt-1" />
                                            <span>{w.years_of_experience || 0} yrs experience</span>
                                        </div>
                                        {w.experience_details && (
                                            <div className="d-flex align-items-start gap-2">
                                                <i className="bi bi-chat-left-text mt-1" />
                                                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {w.experience_details}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="card-footer bg-transparent border-top-0 px-4 pb-4 pt-0 d-flex gap-2">
                                    <button
                                        className={`btn btn-sm flex-grow-1 ${w.status === 'Available' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                        onClick={() => handleToggleStatus(w)}
                                    >
                                        <i className={`bi bi-${w.status === 'Available' ? 'pause-circle' : 'play-circle'} me-1`} />
                                        {w.status === 'Available' ? 'Set Busy' : 'Set Available'}
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-info"
                                        title="View Full Details"
                                        onClick={() => setViewWorker(w)}
                                    >
                                        <i className="bi bi-eye" />
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Delete Worker"
                                        onClick={() => handleDelete(w)}
                                    >
                                        <i className="bi bi-trash" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Details Modal */}
            {viewWorker && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setViewWorker(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 18 }}>
                            <div className="modal-header text-white border-0" style={{ background: 'linear-gradient(135deg,#0f3460,#1a4b8c)', borderRadius: '18px 18px 0 0' }}>
                                <h6 className="modal-title"><i className="bi bi-person-badge me-2" />Worker Details</h6>
                                <button className="btn-close btn-close-white" onClick={() => setViewWorker(null)} />
                            </div>
                            <div className="modal-body p-4">
                                <div className="text-center mb-4">
                                    {viewWorker.profile_image ? (
                                        <img
                                            src={viewWorker.profile_image}
                                            alt={viewWorker.name}
                                            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '4px solid #e9ecef' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/90?text=W'; }}
                                        />
                                    ) : (
                                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#0f3460,#1a4b8c)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                            <i className="bi bi-person-fill text-white" style={{ fontSize: '2.5rem' }} />
                                        </div>
                                    )}
                                    <h5 className="fw-bold mt-3 mb-0">{viewWorker.name}</h5>
                                    <span className="badge bg-secondary mt-1">{viewWorker.worker_id}</span>
                                </div>
                                <table className="table table-sm">
                                    <tbody>
                                        <tr><th>Phone</th><td>{viewWorker.phone}</td></tr>
                                        <tr><th>Address</th><td>{viewWorker.address || '—'}</td></tr>
                                        <tr><th>Experience</th><td>{viewWorker.years_of_experience || 0} years</td></tr>
                                        <tr><th>Status</th><td><span className={`badge ${viewWorker.status === 'Available' ? 'bg-success' : 'bg-warning text-dark'}`}>{viewWorker.status}</span></td></tr>
                                        <tr><th>Details</th><td>{viewWorker.experience_details || '—'}</td></tr>
                                        <tr><th>Applied On</th><td>{viewWorker.createdAt ? new Date(viewWorker.createdAt).toLocaleDateString('en-IN') : '—'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-secondary btn-sm" onClick={() => setViewWorker(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
