import React, { useState } from 'react';
import { apiUrl } from '../api';

export default function WorkerApplyForm() {
    const emptyForm = {
        name: '', profile_image: '', phone: '',
        address: '', experience_details: '', years_of_experience: ''
    };
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ type: '', msg: '' });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) {
            setAlert({ type: 'danger', msg: 'Full Name and Phone Number are required.' });
            return;
        }
        setSubmitting(true);
        setAlert({ type: '', msg: '' });
        try {
            const res = await fetch(apiUrl('/api/workers'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Submission failed');
            setAlert({
                type: 'success',
                msg: `✅ Application submitted successfully! Our team will review your application and contact you soon.`
            });
            setForm(emptyForm);
        } catch (err) {
            setAlert({ type: 'danger', msg: err.message || 'Something went wrong. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="container my-5">
            {/* Section Header */}
            <div className="text-center mb-4">
                <span className="badge bg-warning text-dark px-3 py-2 mb-2" style={{ borderRadius: 50, fontSize: '0.75rem', letterSpacing: 1 }}>
                    NOW HIRING
                </span>
                <h3 className="fw-bold">Become a Worker</h3>
                <p className="text-muted">
                    Join Vector Industries as an installation specialist. Apply below and our team will reach out.
                </p>
            </div>

            <div className="row justify-content-center">
                <div className="col-12 col-md-8 col-lg-7">
                    <div className="card border-0 shadow-lg" style={{ borderRadius: 18 }}>
                        <div className="card-header text-white fw-semibold py-3 px-4"
                            style={{ background: 'linear-gradient(135deg,#0f3460,#1a4b8c)', borderRadius: '18px 18px 0 0' }}>
                            <i className="bi bi-person-badge me-2" />
                            Worker Application Form
                        </div>
                        <div className="card-body p-4 p-md-5">
                            {alert.msg && (
                                <div className={`alert alert-${alert.type} py-3`} role="alert">
                                    {alert.msg}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="row g-3">
                                    {/* Full Name */}
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Full Name *</label>
                                        <input
                                            className="form-control rounded-3"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Rajan Kumar"
                                            required
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div className="col-12 col-sm-6">
                                        <label className="form-label fw-semibold small">Phone Number *</label>
                                        <input
                                            className="form-control rounded-3"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 9876543210"
                                            required
                                        />
                                    </div>

                                    {/* Profile Image URL */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small">Profile Picture URL</label>
                                        <input
                                            className="form-control rounded-3"
                                            name="profile_image"
                                            value={form.profile_image}
                                            onChange={handleChange}
                                            placeholder="https://example.com/your-photo.jpg"
                                        />
                                        {form.profile_image && (
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <img
                                                    src={form.profile_image}
                                                    alt="preview"
                                                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #dee2e6' }}
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                                <span className="text-muted small">Preview</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Address */}
                                    <div className="col-12">
                                        <label className="form-label fw-semibold small">Address</label>
                                        <input
                                            className="form-control rounded-3"
                                            name="address"
                                            value={form.address}
                                            onChange={handleChange}
                                            placeholder="City, District, State"
                                        />
                                    </div>

                                    {/* Years of Experience */}
                                    <div className="col-12 col-sm-4">
                                        <label className="form-label fw-semibold small">Years of Experience</label>
                                        <input
                                            className="form-control rounded-3"
                                            type="number"
                                            name="years_of_experience"
                                            value={form.years_of_experience}
                                            onChange={handleChange}
                                            placeholder="e.g. 5"
                                            min="0"
                                            max="50"
                                        />
                                    </div>

                                    {/* Experience Details */}
                                    <div className="col-12 col-sm-8">
                                        <label className="form-label fw-semibold small">Experience Details</label>
                                        <textarea
                                            className="form-control rounded-3"
                                            name="experience_details"
                                            value={form.experience_details}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Describe your experience in window/door installation, tools used, past projects..."
                                        />
                                    </div>

                                    {/* Submit */}
                                    <div className="col-12 mt-2">
                                        <button
                                            type="submit"
                                            className="btn w-100 text-white fw-bold py-2 rounded-3"
                                            style={{ background: 'linear-gradient(135deg,#0f3460,#1a4b8c)', letterSpacing: 0.4 }}
                                            disabled={submitting}
                                        >
                                            {submitting
                                                ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</>
                                                : <><i className="bi bi-send me-2" />Submit Application</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
