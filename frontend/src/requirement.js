import React, { useState, useEffect } from "react";
import axios from "axios";
import "./requirement.css";
import Nav from "./comp/nav";
import Footer from "./comp/footer";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { apiUrl } from './api';

export default function Requirement() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: user?.email || "",
    siteType: "",
    buildingStatus: "",
    location: ""
  });

  // Update email when user loads
  useEffect(() => {
    if (user?.email) setFormData(prev => ({ ...prev, email: user.email }));
  }, [user]);

  const [rows, setRows] = useState([
    { width: "", height: "", material: "Aluminium", type: "Casement", qty: 1, info: "" }
  ]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

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

  // Note: UPVC rates could be similarly defined if needed, 
  // but for now, we'll follow the user's specific request for "current aluminium rate".
  const UPVC_BASE = 280;

  const calculateEstimate = (currentRows) => {
    let total = 0;
    currentRows.forEach(row => {
      const w = parseFloat(row.width) || 0;
      const h = parseFloat(row.height) || 0;
      const qty = parseInt(row.qty) || 0;
      const area = w * h; // area in sq. ft.

      let rate = row.material === "Aluminium"
        ? (WINDOW_RATES[row.type] || 220)
        : UPVC_BASE;

      const itemPrice = area * rate * qty;
      total += itemPrice;
    });
    setEstimatedTotal(total.toFixed(2));
  };

  useEffect(() => {
    calculateEstimate(rows);
  }, [rows]);
  const [submitting, setSubmitting] = useState(false);

  const handleTopChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const addRow = () => {
    const newRows = [...rows, { width: "", height: "", material: "Aluminium", type: "Casement", qty: 1, info: "" }];
    setRows(newRows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { navigate('/login'); return; }
    setSubmitting(true);
    const payload = { ...formData, items: rows, estimatedTotal };
    try {
      await axios.post(apiUrl('/api/requirements'), payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Requirement submitted successfully ✅\nThe admin will review and generate your quotation.");
      navigate('/userdashboard');
    } catch (err) {
      console.log(err);
      if (err.response?.status === 401) {
        alert("Please log in to submit a requirement.");
        navigate('/login');
      } else {
        alert("Error saving requirement ❌");
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <>
      <Nav />

      <div className="container my-5">
        <form className="card p-4 shadow-sm" onSubmit={handleSubmit}>

          {/* TOP FIELDS */}
          <div className="row g-4">

            <div className="col-md-6">
              <label>Name *</label>
              <input name="name" value={formData.name} onChange={handleTopChange} className="form-control" required />
            </div>

            <div className="col-md-6">
              <label>Mobile *</label>
              <input name="mobile" value={formData.mobile} onChange={handleTopChange} className="form-control" required />
            </div>

            <div className="col-md-6">
              <label>Email *</label>
              <input name="email" value={formData.email} onChange={handleTopChange} className="form-control" required />
            </div>

            <div className="col-md-6">
              <label>Site Type *</label>
              <select
                name="siteType"
                value={formData.siteType}
                onChange={handleTopChange}
                className="form-select"
              >
                <option value="">Select destination</option>
                <option>Office</option>
                <option>Home</option>
                <option>Commercial</option>
                <option>school / college</option>
                <option>individual house</option>
                <option>Apartment</option>
                <option>Kitchen</option>
                <option>Factory</option>
                <option>others</option>
              </select>
            </div>

            <div className="col-md-6">
              <label>Building Status *</label>
              <select
                name="buildingStatus"
                value={formData.buildingStatus}
                onChange={handleTopChange}
                className="form-select"
              >
                <option value="">Select Stage</option>
                <option value="planning">Planning</option>
                <option value="foundation">Foundation</option>
                <option value="roof_concrete">Roof Concrete</option>
                <option value="brick_work">Brick Work</option>
                <option value="plastering">Plastering</option>
                <option value="ready_windows_doors">Ready for Windows/Doors</option>
                <option value="not_applicable">Not Applicable</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="col-md-6">
              <label>Site Location *</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleTopChange}
                className="form-control"
              />
            </div>

          </div>

          {/* WINDOW / DOOR DETAILS */}
          <h5 className="mt-4">Window/Door Details</h5>

          {rows.map((row, index) => (
            <div className="row g-3 align-items-end mb-2" key={index}>

              <div className="col">
                <label>Width (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={row.width}
                  onChange={(e) => handleChange(index, "width", e.target.value)}
                />
              </div>

              <div className="col">
                <label>Height (ft) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  value={row.height}
                  onChange={(e) => handleChange(index, "height", e.target.value)}
                />
              </div>

              <div className="col">
                <label>Material *</label>
                <select
                  className="form-select"
                  value={row.material}
                  onChange={(e) => handleChange(index, "material", e.target.value)}
                >
                  <option>Aluminium</option>
                  <option>UPVC</option>
                </select>
              </div>

              <div className="col">
                <label>Type *</label>
                <select
                  className="form-select"
                  value={row.type}
                  onChange={(e) => handleChange(index, "type", e.target.value)}
                >
                  <option>Casement</option>
                  <option>Infinity Slider</option>
                  <option>Bi-Fold</option>
                  <option>Combination</option>
                  <option>Georgian Bars</option>
                  <option>Fixed</option>
                  <option>French Doors</option>
                  <option>Customize</option>
                </select>
              </div>

              <div className="col">
                <label>Qty *</label>
                <input
                  type="number"
                  className="form-control"
                  value={row.qty}
                  onChange={(e) => handleChange(index, "qty", e.target.value)}
                />
              </div>

              <div className="col">
                <label>Addl. Info</label>
                <textarea
                  className="form-control"
                  rows="1"
                  value={row.info}
                  onChange={(e) => handleChange(index, "info", e.target.value)}
                />
              </div>

            </div>
          ))}

          {/* ADD ROW */}
          <button type="button" className="btn btn-primary add-btn mb-2" onClick={addRow}>
            +
          </button>

          {/* ESTIMATED TOTAL DISPLAY */}
          <div className="mt-4 p-3 bg-light border rounded d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Estimated Total:</h5>
            <h4 className="mb-0 text-primary">₹{estimatedTotal}</h4>
          </div>

          <p className="text-muted small mt-2">
            * This is an automated estimate for your reference. Final quotation will be provided by the admin after review.
          </p>

          {/* SUBMIT */}
          <button className="btn btn-primary w-100 mt-3" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Requirement'}
          </button>

        </form>
      </div>

      <Footer />
    </>
  );
}