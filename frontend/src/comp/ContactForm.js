import React, { useState } from "react";
import { apiUrl } from '../api';
import "./ContactForm.css"; 


export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let formattedPhone = form.phone.trim();
    if (formattedPhone) {
      if (formattedPhone.startsWith('0')) formattedPhone = formattedPhone.substring(1);
      let digits = formattedPhone.replace(/[^0-9]/g, '');
      if (digits.length === 10) formattedPhone = '+91' + digits;
      else if (digits.length === 12 && digits.startsWith('91')) formattedPhone = '+' + digits;
      else if (!formattedPhone.startsWith('+')) formattedPhone = '+' + digits;
    }

    try {
      const res = await fetch(apiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: formattedPhone })
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err) {
      console.error('Failed to submit message');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <div className="glass-wrapper">
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="glass-card p-4 p-md-5">

          <h3 className="text-center mb-4 text-white fw-bold">
            Get In Touch
          </h3>

          {submitted && (
            <div className="alert alert-success text-center">
              Message sent successfully ✅
            </div>
          )}

          <form onSubmit={handleSubmit}>

            <div className="mb-4">
              <input type="text" name="name" value={form.name} onChange={handleChange} className="glass-input" placeholder="Full Name" required />
            </div>

            <div className="mb-4">
              <input type="email" name="email" value={form.email} onChange={handleChange} className="glass-input" placeholder="Email Address" required />
            </div>

            <div className="mb-4">
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="glass-input" placeholder="Phone Number" />
            </div>

            <div className="mb-4">
              <textarea name="message" value={form.message} onChange={handleChange} className="glass-input" rows="4" placeholder="Your Message" required></textarea>
            </div>

            <button type="submit" className="glass-btn w-100" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Message'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}