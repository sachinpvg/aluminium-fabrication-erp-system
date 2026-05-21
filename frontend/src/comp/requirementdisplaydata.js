import React, { useEffect, useState } from "react";
import axios from "axios";
import "./requirementdisplaydata.css";
import { apiUrl } from '../api';

export default function AdminPage() {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approve modal state
  const [approveTarget, setApproveTarget] = useState(null); // the requirement being approved
  const [quotationData, setQuotationData] = useState({ itemPrices: [], totalAmount: '', notes: '' });

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // View detail state
  const [viewTarget, setViewTarget] = useState(null);

  const fetchRequirements = () => {
    setLoading(true);
    axios.get(apiUrl('/api/requirements'))
      .then(res => { setRequirements(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  };

  useEffect(() => { fetchRequirements(); }, []);

  // Pricing Logic (Shared with frontend)
  // Pricing Logic (Rate per Sq. Ft. for Aluminium)
  const WINDOW_RATES = {
    Casement: 220,
    "Infinity Slider": 242,   // 220 * 1.1
    "Bi-Fold": 286,           // 220 * 1.3
    Combination: 264,         // 220 * 1.2
    "Georgian Bars": 253,      // 220 * 1.15
    Fixed: 198,               // 220 * 0.9
    "French Doors": 275,      // 220 * 1.25
    Customize: 264            // 220 * 1.2
  };
  const UPVC_BASE = 280;

  // Open approve modal — initialise per-item price fields
  const openApprove = (req) => {
    setApproveTarget(req);
    const itemPrices = (req.items || []).map((item, i) => {
      const w = parseFloat(item.width) || 0;
      const h = parseFloat(item.height) || 0;
      const qty = parseInt(item.qty) || 1;
      const area = w * h; // area in sq. ft.

      const rate = item.material === "Aluminium"
        ? (WINDOW_RATES[item.type] || 220)
        : UPVC_BASE;

      const unit = rate.toFixed(2); // Rate per sqft
      const itemTotal = (area * rate * qty).toFixed(2);

      return {
        index: i,
        type: item.type || `Item ${i + 1}`,
        width: item.width, height: item.height, qty: item.qty,
        unitPrice: unit,
        totalPrice: itemTotal,
        ratePerSqft: unit,
        areaSqft: area.toFixed(2)
      };
    });

    const grand = itemPrices.reduce((acc, ip) => acc + (parseFloat(ip.totalPrice) || 0), 0);
    setQuotationData({ itemPrices, totalAmount: grand.toFixed(2), notes: '' });
  };

  const handleItemPriceChange = (i, field, val) => {
    const updated = [...quotationData.itemPrices];
    updated[i][field] = val;
    // Auto-calc totalPrice if unitPrice and qty both present
    if (field === 'unitPrice') {
      const qty = parseFloat(updated[i].qty) || 1;
      const unit = parseFloat(val) || 0;
      updated[i].totalPrice = (unit * qty).toFixed(2);
    }
    // Recalculate grand total
    const grand = updated.reduce((acc, ip) => acc + (parseFloat(ip.totalPrice) || 0), 0);
    setQuotationData(prev => ({ ...prev, itemPrices: updated, totalAmount: grand.toFixed(2) }));
  };

  const submitApprove = async () => {
    if (!quotationData.totalAmount) { alert('Please enter at least a total amount.'); return; }
    try {
      await axios.patch(apiUrl(`/api/requirements/${approveTarget._id}/approve`), {
        quotation: quotationData
      });
      setApproveTarget(null);
      fetchRequirements();
    } catch (err) {
      console.error(err);
      alert('Approval failed. Please try again.');
    }
  };

  const submitReject = async () => {
    try {
      await axios.patch(apiUrl(`/api/requirements/${rejectTarget._id}/reject`), {
        rejectionReason
      });
      setRejectTarget(null);
      setRejectionReason('');
      fetchRequirements();
    } catch (err) {
      console.error(err);
      alert('Rejection failed. Please try again.');
    }
  };

  const statusBadge = (status) => {
    const map = { pending: 'warning', approved: 'success', rejected: 'danger' };
    return (
      <span className={`badge bg-${map[status] || 'secondary'} text-uppercase`}>
        {status || 'pending'}
      </span>
    );
  };

  return (
    <div>
      <h2 className="mb-3">Requirements Panel</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2">Loading requirements...</p>
        </div>
      ) : requirements.length === 0 ? (
        <div className="alert alert-info">No requirements submitted yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Site Type</th>
                <th>Location</th>
                <th>Items</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((req, idx) => (
                <tr key={req._id}>
                  <td>{idx + 1}</td>
                  <td><code className="text-primary fw-bold">{req.userId || '—'}</code></td>
                  <td>{req.name}</td>
                  <td>{req.email || req.userEmail}</td>
                  <td>{req.mobile}</td>
                  <td>{req.siteType}</td>
                  <td>{req.location}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setViewTarget(req)}>
                      {req.items?.length || 0} item(s)
                    </button>
                  </td>
                  <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td>{statusBadge(req.status)}</td>
                  <td>
                    {(!req.status || req.status === 'pending') && (
                      <div className="d-flex gap-1">
                        <button className="btn btn-sm btn-success" onClick={() => openApprove(req)}>
                          ✓ Approve
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setRejectTarget(req); setRejectionReason(''); }}>
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {req.status === 'approved' && (
                      <button className="btn btn-sm btn-outline-success" onClick={() => setViewTarget(req)}>
                        View Quotation
                      </button>
                    )}
                    {req.status === 'rejected' && (
                      <span className="text-muted small">{req.rejectionReason || 'Rejected'}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── APPROVE MODAL ─── */}
      {approveTarget && (
        <div className="modal-overlay" onClick={() => setApproveTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3">📋 Generate Quotation</h5>
            <p className="text-muted mb-1">
              <strong>Customer:</strong> {approveTarget.name} &nbsp;|&nbsp;
              <strong>User ID:</strong> <code className="text-primary">{approveTarget.userId || '—'}</code>
            </p>
            <hr />
            {/* Per-item prices */}
            {quotationData.itemPrices.length > 0 && (
              <div className="mb-3">
                <h6>Item-wise Pricing</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>#</th><th>Type</th><th>W×H (ft)</th><th>Qty</th><th>Sq.ft</th><th>Rate (₹/sqft)</th><th>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotationData.itemPrices.map((ip, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{ip.type}</td>
                          <td>{ip.width} × {ip.height}</td>
                          <td>{ip.qty}</td>
                          <td>{ip.areaSqft}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="0"
                              value={ip.unitPrice}
                              onChange={e => handleItemPriceChange(i, 'unitPrice', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={ip.totalPrice}
                              onChange={e => handleItemPriceChange(i, 'totalPrice', e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="mb-3">
              <label className="form-label fw-semibold">Grand Total Amount (₹) *</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter total quotation amount"
                value={quotationData.totalAmount}
                onChange={e => setQuotationData(prev => ({ ...prev, totalAmount: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold">Notes / Terms (optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Delivery in 15 working days, 50% advance..."
                value={quotationData.notes}
                onChange={e => setQuotationData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-secondary" onClick={() => setApproveTarget(null)}>Cancel</button>
              <button className="btn btn-success" onClick={submitApprove}>✓ Approve & Send Quotation</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REJECT MODAL ─── */}
      {rejectTarget && (
        <div className="modal-overlay" onClick={() => setRejectTarget(null)}>
          <div className="modal-box modal-box-sm" onClick={e => e.stopPropagation()}>
            <h5 className="mb-3 text-danger">✗ Reject Requirement</h5>
            <p className="text-muted">Customer: <strong>{rejectTarget.name}</strong></p>
            <div className="mb-3">
              <label className="form-label">Reason for rejection (optional)</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="e.g. Incomplete details, out of service area..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="d-flex gap-2 justify-content-end">
              <button className="btn btn-secondary" onClick={() => setRejectTarget(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={submitReject}>✗ Confirm Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── VIEW DETAIL / QUOTATION MODAL ─── */}
      {viewTarget && (
        <div className="modal-overlay" onClick={() => setViewTarget(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h5 className="mb-2">Requirement Details</h5>
            <div className="mb-2">
              <span className="badge bg-primary me-2">{viewTarget.userId || 'No ID'}</span>
              {statusBadge(viewTarget.status)}
            </div>
            <table className="table table-sm table-bordered mb-3">
              <tbody>
                <tr><td><strong>Name</strong></td><td>{viewTarget.name}</td></tr>
                <tr><td><strong>Email</strong></td><td>{viewTarget.email || viewTarget.userEmail}</td></tr>
                <tr><td><strong>Mobile</strong></td><td>{viewTarget.mobile}</td></tr>
                <tr><td><strong>Site Type</strong></td><td>{viewTarget.siteType}</td></tr>
                <tr><td><strong>Building Status</strong></td><td>{viewTarget.buildingStatus}</td></tr>
                <tr><td><strong>Location</strong></td><td>{viewTarget.location}</td></tr>
              </tbody>
            </table>
            {viewTarget.items?.length > 0 && (
              <>
                <h6>Items</h6>
                <div className="table-responsive mb-3">
                  <table className="table table-sm table-bordered">
                    <thead className="table-light">
                      <tr><th>#</th><th>Type</th><th>W×H (ft)</th><th>Material</th><th>Qty</th><th>Info</th></tr>
                    </thead>
                    <tbody>
                      {viewTarget.items.map((item, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>{item.type}</td>
                          <td>{item.width} × {item.height}</td>
                          <td>{item.material}</td>
                          <td>{item.qty}</td>
                          <td>{item.info}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {viewTarget.quotation && (
              <div className="alert alert-success">
                <h6 className="fw-bold">💰 Quotation</h6>
                <p className="mb-1"><strong>Total Amount:</strong> ₹{viewTarget.quotation.totalAmount}</p>
                {viewTarget.quotation.notes && <p className="mb-1"><strong>Notes:</strong> {viewTarget.quotation.notes}</p>}
                {viewTarget.approvedAt && (
                  <p className="mb-0 text-muted small">
                    Approved on: {new Date(viewTarget.approvedAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </div>
            )}
            {viewTarget.status === 'rejected' && viewTarget.rejectionReason && (
              <div className="alert alert-danger">
                <strong>Rejection Reason:</strong> {viewTarget.rejectionReason}
              </div>
            )}
            <div className="text-end">
              <button className="btn btn-secondary" onClick={() => setViewTarget(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}