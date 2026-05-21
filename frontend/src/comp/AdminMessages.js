import React, { useState, useEffect } from 'react';
import { apiUrl } from '../api';

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: '', msg: '' });

    useEffect(() => { fetchMessages(); }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/contact'));
            const data = await res.json();
            setMessages(Array.isArray(data) ? data : []);
        } catch (err) {
            showAlert('danger', 'Failed to load messages.');
        } finally {
            setLoading(false);
        }
    };

    const showAlert = (type, msg) => {
        setAlert({ type, msg });
        setTimeout(() => setAlert({ type: '', msg: '' }), 3500);
    };

    const handleReply = async (msg) => {
        // 1. Mark as responded in DB
        try {
            await fetch(apiUrl(`/api/contact/${msg._id}/respond`), { method: 'PUT' });
            fetchMessages(); // refresh background
        } catch (err) {
            console.error('Failed to update status', err);
        }

        // 2. Open WhatsApp link
        let phone = msg.phone || '';
        if (phone && !phone.startsWith('+')) {
            let digits = phone.replace(/[^0-9]/g, '');
            if (digits.length === 10) phone = '91' + digits;
        } else if (phone.startsWith('+')) {
            phone = phone.substring(1); // wa.me needs no +
        }

        const text = `Hello ${msg.name}, regarding your enquiry: ${msg.message}`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <h5 className="fw-bold mb-0">
                    <i className="bi bi-chat-left-dots me-2" />Contact Messages
                </h5>
                <button className="btn btn-outline-primary btn-sm" onClick={fetchMessages}>
                    <i className="bi bi-arrow-clockwise" />
                </button>
            </div>

            {alert.msg && <div className={`alert alert-${alert.type} py-2`}>{alert.msg}</div>}

            <div className="row g-2 mb-4">
                <div className="col-4">
                    <div className="bg-primary text-white rounded-3 p-3 text-center" style={{ minHeight: 72 }}>
                        <div className="fs-4 fw-bold">{messages.length}</div>
                        <div className="small">Total Messages</div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="bg-warning text-dark rounded-3 p-3 text-center" style={{ minHeight: 72 }}>
                        <div className="fs-4 fw-bold">{messages.filter(m => m.status === 'new').length}</div>
                        <div className="small">New</div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" />
                </div>
            ) : messages.length === 0 ? (
                <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-3" />
                    <h5>No messages yet.</h5>
                </div>
            ) : (
                <div className="row g-3">
                    {messages.map(msg => (
                        <div className="col-12 col-md-6 col-lg-4" key={msg._id}>
                            <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 16 }}>
                                <div style={{ height: 6, borderRadius: '16px 16px 0 0', background: msg.status === 'new' ? '#ffc107' : '#28a745' }} />

                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between mb-2">
                                        <h6 className="fw-bold mb-0">{msg.name}</h6>
                                        <span className={`badge ${msg.status === 'new' ? 'bg-warning text-dark' : 'bg-success'}`}>
                                            {msg.status === 'new' ? 'New' : 'Responded'}
                                        </span>
                                    </div>
                                    
                                    <div className="small text-muted mb-3">
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <i className="bi bi-telephone" /> {msg.phone || '—'}
                                        </div>
                                        <div className="d-flex align-items-center gap-2 mb-1">
                                            <i className="bi bi-envelope" /> {msg.email || '—'}
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <i className="bi bi-calendar" /> {new Date(msg.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="bg-light p-3 rounded text-dark small" style={{ minHeight: 80, fontStyle: 'italic' }}>
                                        "{msg.message}"
                                    </div>
                                </div>

                                <div className="card-footer bg-transparent border-top-0 px-4 pb-4 pt-0">
                                    <button
                                        className="btn btn-sm btn-success w-100 fw-semibold"
                                        onClick={() => handleReply(msg)}
                                        disabled={!msg.phone}
                                    >
                                        <i className="bi bi-whatsapp me-2" />
                                        Reply via WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
