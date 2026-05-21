import React, { useState } from "react";
import { apiUrl } from './api';

export default function QuotationForm() {
  const [items, setItems] = useState([]);

  const [form, setForm] = useState({
    material: "Aluminium",
    windowType: "Casement",
    description: "",
    width: "",
    height: "",
    rate: "",
    gst: 18,
  });

  // 🔹 Handle input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🔹 Calculate Sq.ft
  const calculateSqft = (w, h) => {
    if (!w || !h) return 0;
    return (parseFloat(w) * parseFloat(h)).toFixed(2);
  };

  // 🔹 Add Item
    const addItem = async () => {
    const sqft = calculateSqft(form.width, form.height);
    const amount = sqft * form.rate;
    const gstAmount = (amount * form.gst) / 100;
    const total = amount + gstAmount;

    const newItem = {
      ...form,
      sqft,
      amount,
      gstAmount,
      total,
    };

    try {
      const res = await fetch(apiUrl('/api/quotation/add'), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const data = await res.json();
      console.log("Saved:", data);
    } catch (err) {
      console.log("Error saving:", err);
    }

    setItems([...items, newItem]);

    setForm({
      material: "Aluminium",
      windowType: "Casement",
      description: "",
      width: "",
      height: "",
      rate: "",
      gst: 18,
    });
  };

  // 🔹 Grand Total
  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">Quotation Form – Windows</h3>

      {/* 🔹 Form */}
      <div className="row border p-3 rounded bg-light">

        {/* Material */}
        <div className="col-md-2">
          <label>Material</label>
          <select
            className="form-control"
            name="material"
            value={form.material}
            onChange={handleChange}
          >
            <option>Aluminium</option>
            <option>Steel</option>
          </select>
        </div>

        {/* Window Type */}
        <div className="col-md-2">
          <label>Window Type</label>
          <select
            className="form-control"
            name="windowType"
            value={form.windowType}
            onChange={handleChange}
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

        {/* Description */}
        <div className="col-md-2">
          <label>Description</label>
          <input
            type="text"
            className="form-control"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Window Details"
          />
        </div>

        {/* Width */}
        <div className="col-md-1">
          <label>Width (ft)</label>
          <input
            type="number"
            className="form-control"
            name="width"
            value={form.width}
            onChange={handleChange}
          />
        </div>

        {/* Height */}
        <div className="col-md-1">
          <label>Height (ft)</label>
          <input
            type="number"
            className="form-control"
            name="height"
            value={form.height}
            onChange={handleChange}
          />
        </div>

        {/* Sqft */}
        <div className="col-md-1">
          <label>Sq.ft</label>
          <input
            type="text"
            className="form-control"
            value={calculateSqft(form.width, form.height)}
            readOnly
          />
        </div>

        {/* Rate */}
        <div className="col-md-1">
          <label>Rate</label>
          <input
            type="number"
            className="form-control"
            name="rate"
            value={form.rate}
            onChange={handleChange}
          />
        </div>

        {/* GST */}
        <div className="col-md-1">
          <label>GST %</label>
          <input
            type="number"
            className="form-control"
            name="gst"
            value={form.gst}
            onChange={handleChange}
          />
        </div>

        {/* Add Button */}
        <div className="col-md-1 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={addItem}>
            Add
          </button>
        </div>
      </div>

      {/* 🔹 Table */}
      <table className="table table-bordered mt-4">
        <thead className="table-dark">
          <tr>
            <th>Material</th>
            <th>Window Type</th>
            <th>Description</th>
            <th>Size</th>
            <th>Sq.ft</th>
            <th>Rate</th>
            <th>Amount</th>
            <th>GST</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.material}</td>
              <td>{item.windowType}</td>
              <td>{item.description}</td>
              <td>{item.width} × {item.height}</td>
              <td>{item.sqft}</td>
              <td>{item.rate}</td>
              <td>₹ {item.amount.toFixed(2)}</td>
              <td>₹ {item.gstAmount.toFixed(2)}</td>
              <td>₹ {item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Grand Total */}
      <div className="text-end">
        <h4>Grand Total: ₹ {grandTotal.toFixed(2)}</h4>
      </div>

      {/* Print */}
      <div className="text-center mt-3">
        <button className="btn btn-success" onClick={() => window.print()}>
          Print Quotation
        </button>
      </div>
    </div>
  );
}