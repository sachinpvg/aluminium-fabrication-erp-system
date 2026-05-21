import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

export default function AdminWorkerApprovals() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: '', msg: '' });
    const [viewApplication, setViewApplication] = useState(null);

    useEffect(() => { fetchApplications(); }, []);

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/workers/applications/pending'));
            const data = await res.json();
            setApplications(Array.isArray(data) ? data : []);
        } catch (err) {
            showAlert('danger', 'Failed to load pending applications.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert({ type: '', msg: '' }), 3500);
    };

    const handleApprove = async (app) => {
        if (!window.confirm(`Approve application from "${app.name}"? This will move them to active workers.`)) return;
        try {
            const res = await fetch(apiUrl(`/api/workers/applications/${app._id}/approve`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', `Application approved! Assigned Worker ID parameter: ${data.worker_id}.`);
            fetchApplications();
        } catch (err) {
            showAlert('danger', err.message || 'Approval failed.');
        }
    };

    const handleReject = async (app) => {
        if (!window.confirm(`Reject application from "${app.name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(apiUrl(`/api/workers/applications/${app._id}`), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', 'Application rejected successfully.');
            fetchApplications();
        } catch (err) {
            showAlert('danger', err.message || 'Rejection failed.');
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">
                    <i className="bi bi-person-check me-2" />Worker Approvals
                </h5>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchApplications}>
                    <i className="bi bi-arrow-clockwise" />
                </button>
            </div>

            {alert.msg && <div className={`alert alert-${alert.type} py-2`}>{alert.msg}</div>}

            {/* Summary Stats */}
            <div className="row g-2 mb-4">
                <div className="col-4">
                    <div className="bg-info text-white rounded-3 p-3 text-center" style={{ minHeight: 72 }}>
                        <div className="fs-4 fw-bold">{applications.length}</div>
                        <div className="small">Pending Approvals</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : applications.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3" />
                    <h5>No pending applications.</h5>
                    <p>New worker applications will appear here.</p>
                </div>
            ) : (
                <div className="row g-3">
                    {applications.map(app => (
                        <div className="col-12 col-sm-6 col-xl-4" key={app._id}>
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16, transition: 'box-shadow 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
                                onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>

                                {/* Card top bar */}
                                <div style={{ height: 6, borderRadius: '16px 16px 0 0', background: 'linear-gradient(90deg,#0dcaf0,#0dcaf0)' }} />

                                <div className="card-body p-4">
                                    <div className="d-flex align-items-start gap-3 mb-3">
                                        {/* Profile pic */}
                                        {app.profile_image ? (
                                            <img
                                                src={app.profile_image}
                                                alt={app.name}
                                                style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid #e9ecef', flexShrink: 0 }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/60?text=W'; }}
                                            />
                                        ) : (
                                            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg,#17a2b8,#17a2b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <i className="bi bi-person-fill text-white fs-4" />
                                            </div>
                                        )}
                                        <div className="flex-grow-1 min-w-0">
                                            <h6 className="fw-bold mb-1 text-truncate">{app.name}</h6>
                                            <span className="badge bg-secondary bg-opacity-10 text-secondary border small">Status: Pending</span>
                                        </div>
                                    </div>

                                    {/* Info rows */}
                                    <div className="small text-muted">
                                        <div className="d-flex align-items-start gap-2 mb-1">
                                            <i className="bi bi-telephone mt-1" />
                                            <span>{app.phone || '—'}</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 mb-1">
                                            <i className="bi bi-geo-alt mt-1" />
                                            <span className="text-truncate">{app.address || '—'}</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 mb-1">
                                            <i className="bi bi-briefcase mt-1" />
                                            <span>{app.years_of_experience || 0} yrs experience</span>
                                        </div>
                                        {app.experience_details && (
                                            <div className="d-flex align-items-start gap-2">
                                                <i className="bi bi-chat-left-text mt-1" />
                                                <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    {app.experience_details}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="card-footer bg-transparent border-top-0 px-4 pb-4 pt-0 d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-success flex-grow-1"
                                        onClick={() => handleApprove(app)}
                                    >
                                        <i className="bi bi-check-circle me-1" />
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger flex-grow-1"
                                        onClick={() => handleReject(app)}
                                    >
                                        <i className="bi bi-x-circle me-1" />
                                        Reject
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-info"
                                        title="View Full Details"
                                        onClick={() => setViewApplication(app)}
                                    >
                                        <i className="bi bi-eye" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Full Details Modal */}
            {viewApplication && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setViewApplication(null)}>
                    <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 18 }}>
                            <div className="modal-header text-white border-0" style={{ background: 'linear-gradient(135deg,#17a2b8,#17a2b8)', borderRadius: '18px 18px 0 0' }}>
                                <h6 className="modal-title"><i className="bi bi-person-badge me-2" />Application Details</h6>
                                <button className="btn-close btn-close-white" onClick={() => setViewApplication(null)} />
                            </div>
                            <div className="modal-body p-4">
                                <div className="text-center mb-4">
                                    {viewApplication.profile_image ? (
                                        <img
                                            src={viewApplication.profile_image}
                                            alt={viewApplication.name}
                                            style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '4px solid #e9ecef' }}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/90?text=W'; }}
                                        />
                                    ) : (
                                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'linear-gradient(135deg,#17a2b8,#17a2b8)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                            <i className="bi bi-person-fill text-white" style={{ fontSize: '2.5rem' }} />
                                        </div>
                                    )}
                                    <h5 className="fw-bold mt-3 mb-0">{viewApplication.name}</h5>
                                </div>
                                <table className="table table-sm">
                                    <tbody>
                                        <tr><th>Phone</th><td>{viewApplication.phone}</td></tr>
                                        <tr><th>Address</th><td>{viewApplication.address || '—'}</td></tr>
                                        <tr><th>Experience</th><td>{viewApplication.years_of_experience || 0} years</td></tr>
                                        <tr><th>Status</th><td><span className="badge bg-info">Pending</span></td></tr>
                                        <tr><th>Details</th><td>{viewApplication.experience_details || '—'}</td></tr>
                                        <tr><th>Applied On</th><td>{viewApplication.createdAt ? new Date(viewApplication.createdAt).toLocaleDateString('en-IN') : '—'}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-secondary btn-sm" onClick={() => setViewApplication(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
