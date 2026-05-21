import React, { useState, useEffect } from 'react';
import './WindowsCatalog.css';
import Nav from './comp/nav';
import Footer from './comp/footer';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import BookingModal from './BookingModal';
import { apiUrl } from './api';

export default function WindowsCatalog() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [windows, setWindows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedWindow, setSelectedWindow] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { fetchWindows(); }, []);

    const fetchWindows = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('/api/windows'));
            const data = await res.json();
            setWindows(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load windows. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleBookNow = (win) => {
        if (!user) {
            navigate('/login', { state: { from: '/windows' } });
            return;
        }
        setSelectedWindow(win);
        setShowModal(true);
    };

    const handleModalClose = () => {
        setShowModal(false);
        setSelectedWindow(null);
    };

    // Estimated total for a standard 4×4 ft window
    const getTotalPrice = (win) => {
        const area = 4 * 4;
        const windowPrice = (win.price_per_sqft || 0) * area;
        return (windowPrice + (win.labour_charge || 0) + (win.rubber_charge || 0) + (win.service_charge || 0)).toFixed(0);
    };

    return (
        <div className="wc-page">
            <Nav />

            {/* ── Hero ── */}
            <div className="wc-hero">
                <div className="wc-hero-overlay" />
                <div className="wc-hero-content">
                    <span className="wc-hero-badge">Premium Collection</span>
                    <h1 className="wc-hero-title">Aluminium &amp; UPVC Windows</h1>
                    <p className="wc-hero-sub">
                        Crafted for durability &nbsp;·&nbsp; Designed for beauty &nbsp;·&nbsp; Built to last
                    </p>
                    <div className="wc-hero-divider" />
                    <p className="wc-hero-hint">
                        <i className="bi bi-hand-index me-2" />
                        Hover over a card to explore pricing &amp; book
                    </p>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="wc-section">
                <div className="container">

                    {loading ? (
                        <div className="wc-state-center">
                            <div className="wc-spinner">
                                <div className="wc-spinner-ring" />
                            </div>
                            <p className="wc-state-text">Loading our window collection…</p>
                        </div>
                    ) : error ? (
                        <div className="wc-state-center">
                            <i className="bi bi-exclamation-triangle-fill wc-state-icon text-danger" />
                            <p className="wc-state-text text-danger">{error}</p>
                            <button className="btn btn-outline-danger mt-2" onClick={fetchWindows}>Retry</button>
                        </div>
                    ) : windows.length === 0 ? (
                        <div className="wc-state-center">
                            <i className="bi bi-window wc-state-icon" />
                            <h5 className="wc-state-text">No windows available yet.</h5>
                            <p className="text-muted">Please check back later or contact us.</p>
                        </div>
                    ) : (
                        <>
                            {/* Section header */}
                            <div className="wc-section-header">
                                <h2 className="wc-section-title">Our Window Collection</h2>
                                <p className="wc-section-sub">Select a window and book your installation today</p>
                            </div>

                            {/* Card grid */}
                            <div className="row g-4 justify-content-center">
                                {windows.map((win) => (
                                    <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={win._id}>
                                        <div className="wc-flip-card">
                                            <div className="wc-flip-inner">

                                                {/* ── FRONT ── */}
                                                <div className="wc-flip-front">
                                                    {win.image ? (
                                                        <img
                                                            src={win.image}
                                                            alt={win.name}
                                                            className="wc-front-img"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'https://via.placeholder.com/400x500?text=Window';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="wc-front-no-img">
                                                            <i className="bi bi-window" />
                                                        </div>
                                                    )}
                                                    <div className="wc-front-overlay">
                                                        {win.windowType && (
                                                            <span className="wc-type-badge">{win.windowType}</span>
                                                        )}
                                                        <h3 className="wc-front-title">{win.name}</h3>
                                                        <span className="wc-hover-hint">
                                                            <i className="bi bi-arrow-repeat me-1" />Hover to explore
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* ── BACK ── */}
                                                <div className="wc-flip-back">
                                                    <div className="wc-back-header">
                                                        <div className="wc-back-icon">
                                                            <i className="bi bi-window-fullscreen" />
                                                        </div>
                                                        <h4 className="wc-back-title">{win.name}</h4>
                                                        {win.windowType && (
                                                            <span className="wc-back-badge">{win.windowType}</span>
                                                        )}
                                                    </div>

                                                    <p className="wc-back-desc">
                                                        {win.description
                                                            ? win.description.length > 110
                                                                ? win.description.slice(0, 110) + '…'
                                                                : win.description
                                                            : 'Premium window designed for durability, style, and perfect insulation.'}
                                                    </p>

                                                    <div className="wc-back-price-box">
                                                        <div className="wc-back-price-row">
                                                            <span>Price / Sq.ft</span>
                                                            <span className="wc-back-price-val">₹{win.price_per_sqft || 0}</span>
                                                        </div>
                                                        {win.labour_charge > 0 && (
                                                            <div className="wc-back-price-row">
                                                                <span>Labour Charge</span>
                                                                <span>₹{win.labour_charge}</span>
                                                            </div>
                                                        )}
                                                        {win.rubber_charge > 0 && (
                                                            <div className="wc-back-price-row">
                                                                <span>Rubber Feeding</span>
                                                                <span>₹{win.rubber_charge}</span>
                                                            </div>
                                                        )}
                                                        {win.service_charge > 0 && (
                                                            <div className="wc-back-price-row">
                                                                <span>Service Charge</span>
                                                                <span>₹{win.service_charge}</span>
                                                            </div>
                                                        )}
                                                        <div className="wc-back-price-row wc-back-total-row">
                                                            <span>Est. Total (4×4 ft)</span>
                                                            <span className="wc-back-total-val">₹{getTotalPrice(win)}</span>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="wc-book-btn"
                                                        onClick={() => handleBookNow(win)}
                                                    >
                                                        <i className="bi bi-calendar2-check me-2" />
                                                        Book Now
                                                    </button>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Booking Modal ── */}
            {showModal && selectedWindow && (
                <BookingModal win={selectedWindow} onClose={handleModalClose} />
            )}

            <Footer />
        </div>
    );
}
