import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

export default function AdminWindows() {
    const [windows, setWindows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingWin, setEditingWin] = useState(null);
    const [saving, setSaving] = useState(false);
    const [alert, setAlert] = useState({ type: '', msg: '' });

    const emptyForm = {
        name: '', description: '', image: '',
        windowType: 'Aluminium',
        price_per_sqft: '', labour_charge: '', rubber_charge: '', service_charge: ''
    };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { fetchWindows(); }, []);

    const fetchWindows = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/windows'));
            const data = await res.json();
            setWindows(Array.isArray(data) ? data : []);
        } catch (err) {
            showAlert('danger', 'Failed to load windows.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert({ type: '', msg: '' }), 3500);
    };

    const openAdd = () => {
        setEditingWin(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (win) => {
        setEditingWin(win);
        setForm({
            name: win.name || '',
            description: win.description || '',
            image: win.image || '',
            windowType: win.windowType || 'Aluminium',
            price_per_sqft: win.price_per_sqft || '',
            labour_charge: win.labour_charge || '',
            rubber_charge: win.rubber_charge || '',
            service_charge: win.service_charge || ''
        });
        setShowForm(true);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price_per_sqft) {
            showAlert('danger', 'Name and Price per Sq.ft are required.');
            return;
        }
        setSaving(true);
        try {
            const url = editingWin
                ? apiUrl(`/api/windows/${editingWin._id}`)
                : apiUrl('/api/windows');
            const method = editingWin ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', editingWin ? 'Window updated!' : 'Window added!');
            setShowForm(false);
            fetchWindows();
        } catch (err) {
            showAlert('danger', err.message || 'Save failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (win) => {
        if (!window.confirm(`Delete "${win.name}"? This cannot be undone.`)) return;
        try {
            const res = await fetch(apiUrl(`/api/windows/${win._id}`), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            showAlert('success', 'Window deleted.');
            fetchWindows();
        } catch (err) {
            showAlert('danger', err.message || 'Delete failed.');
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0"><i className="bi bi-window me-2"></i>Windows Management</h5>
                <button className="btn btn-primary btn-sm" onClick={openAdd}>
                    <i className="bi bi-plus-lg me-1"></i>Add Window
                </button>
            </div>

            {alert.msg && (
                <div className={`alert alert-${alert.type} py-2`}>{alert.msg}</div>
            )}

            {/* Add/Edit Form */}
            {showForm && (
                <div className="card border-primary mb-4">
                    <div className="card-header bg-primary text-white fw-semibold">
                        {editingWin ? '✏️ Edit Window' : '➕ Add New Window'}
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSave}>
                            <div className="row g-3">
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Window Name *</label>
                                    <input className="form-control" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Casement Window" />
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Window Type *</label>
                                    <select className="form-select" name="windowType" value={form.windowType} onChange={handleChange} required>
                                        <option value="Aluminium">Aluminium</option>
                                        <option value="UPVC">UPVC</option>
                                        <option value="Aluminium & UPVC">Aluminium &amp; UPVC</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-6">
                                    <label className="form-label fw-semibold">Image URL</label>
                                    <input className="form-control" name="image" value={form.image} onChange={handleChange} placeholder="https://example.com/window.jpg" />
                                </div>
                                <div className="col-12">
                                    <label className="form-label fw-semibold">Description</label>
                                    <textarea className="form-control" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Brief description..." />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label fw-semibold">Price/Sq.ft (₹) *</label>
                                    <input className="form-control" type="number" name="price_per_sqft" value={form.price_per_sqft} onChange={handleChange} required min="0" step="0.01" />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label fw-semibold">Labour Charge (₹)</label>
                                    <input className="form-control" type="number" name="labour_charge" value={form.labour_charge} onChange={handleChange} min="0" step="0.01" />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label fw-semibold">Rubber Feeding (₹)</label>
                                    <input className="form-control" type="number" name="rubber_charge" value={form.rubber_charge} onChange={handleChange} min="0" step="0.01" />
                                </div>
                                <div className="col-6 col-md-3">
                                    <label className="form-label fw-semibold">Service Charge (₹)</label>
                                    <input className="form-control" type="number" name="service_charge" value={form.service_charge} onChange={handleChange} min="0" step="0.01" />
                                </div>
                            </div>
                            {form.image && (
                                <div className="mt-3">
                                    <label className="form-label fw-semibold small">Image Preview:</label>
                                    <img src={form.image} alt="preview" style={{ height: 90, borderRadius: 8, objectFit: 'cover', border: '1px solid #dee2e6' }}
                                        onError={(e) => { e.target.style.display = 'none'; }} />
                                </div>
                            )}
                            <div className="d-flex gap-2 mt-4">
                                <button type="submit" className="btn btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : editingWin ? 'Update Window' : 'Add Window'}
                                </button>
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Windows Table */}
            {loading ? (
                <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
            ) : windows.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-window fs-1 d-block mb-3"></i>
                    <p>No windows yet. Click "Add Window" to get started.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="table-dark">
                            <tr>
                                <th>#</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>₹/Sq.ft</th>
                                <th>Labour</th>
                                <th>Rubber</th>
                                <th>Service</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {windows.map((win, idx) => (
                                <tr key={win._id}>
                                    <td>{idx + 1}</td>
                                    <td>
                                        {win.image
                                            ? <img src={win.image} alt={win.name} style={{ width: 60, height: 45, objectFit: 'cover', borderRadius: 6 }} onError={(e) => { e.target.style.display = 'none'; }} />
                                            : <span className="text-muted small">No image</span>
                                        }
                                    </td>
                                    <td>
                                        <div className="fw-semibold">{win.name}</div>
                                        <div className="text-muted small" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{win.description}</div>
                                    </td>
                                    <td>
                                        <span className={`badge ${win.windowType === 'UPVC' ? 'bg-success' : win.windowType === 'Aluminium & UPVC' ? 'bg-info text-dark' : 'bg-primary'}`}>
                                            {win.windowType || 'Aluminium'}
                                        </span>
                                    </td>
                                    <td>₹{win.price_per_sqft || 0}</td>
                                    <td>₹{win.labour_charge || 0}</td>
                                    <td>₹{win.rubber_charge || 0}</td>
                                    <td>₹{win.service_charge || 0}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(win)}>
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(win)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
