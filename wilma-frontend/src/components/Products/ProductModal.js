import React, { useState, useEffect } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

const ProductModal = ({ show, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    current_inventory: 0,
    average_sales_per_week: 0,
    lead_time_days: 1,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        product_name: product.product_name || "",
        category: product.category || "",
        current_inventory: product.current_inventory || 0,
        average_sales_per_week: product.average_sales_per_week || 0,
        lead_time_days: product.lead_time_days || 1,
      });
    } else {
      setFormData({
        product_name: "",
        category: "",
        current_inventory: 0,
        average_sales_per_week: 0,
        lead_time_days: 1,
      });
    }
  }, [product, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }
    const val = name === "average_sales_per_week" ? parseFloat(value) : parseInt(value, 10);
    if (!isNaN(val)) {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleIncrement = (field) => {
    setFormData((prev) => {
      const current = parseFloat(prev[field]) || 0;
      // For average sales, fix to 1 decimal if it has decimals, otherwise just add 1
      const next = field === "average_sales_per_week" 
        ? Math.round((current + 1) * 10) / 10 
        : current + 1;
      return { ...prev, [field]: next };
    });
  };

  const handleDecrement = (field, min) => {
    setFormData((prev) => {
      const current = parseFloat(prev[field]) || 0;
      const next = field === "average_sales_per_week" 
        ? Math.round((current - 1) * 10) / 10 
        : current - 1;
      return { ...prev, [field]: next < min ? min : next };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      current_inventory: parseInt(formData.current_inventory, 10) || 0,
      average_sales_per_week: parseFloat(formData.average_sales_per_week) || 0,
      lead_time_days: parseInt(formData.lead_time_days, 10) || 1,
    });
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{product ? "Edit Item" : "Add New Item"}</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. Coca-Cola 1.5L"
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. Beverages, Snacks, Canned Goods..."
            />
          </div>
          <div className="form-row">
            <div className="form-group half">
              <label>How many in stock?</label>
              <div className="quantity-selector">
                <button type="button" className="qty-btn" onClick={() => handleDecrement('current_inventory', 0)} disabled={formData.current_inventory <= 0}><FiMinus /></button>
                <input
                  type="number"
                  name="current_inventory"
                  value={formData.current_inventory}
                  onChange={handleNumberChange}
                  required
                  min="0"
                  className="form-control qty-input"
                />
                <button type="button" className="qty-btn" onClick={() => handleIncrement('current_inventory')}><FiPlus /></button>
              </div>
            </div>
            <div className="form-group half">
              <label>How many sell per week?</label>
              <div className="quantity-selector">
                <button type="button" className="qty-btn" onClick={() => handleDecrement('average_sales_per_week', 0)} disabled={formData.average_sales_per_week <= 0}><FiMinus /></button>
                <input
                  type="number"
                  step="0.1"
                  name="average_sales_per_week"
                  value={formData.average_sales_per_week}
                  onChange={handleNumberChange}
                  required
                  min="0"
                  className="form-control qty-input"
                />
                <button type="button" className="qty-btn" onClick={() => handleIncrement('average_sales_per_week')}><FiPlus /></button>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>How many days to get new stock?</label>
            <div className="quantity-selector">
              <button type="button" className="qty-btn" onClick={() => handleDecrement('lead_time_days', 1)} disabled={formData.lead_time_days <= 1}><FiMinus /></button>
              <input
                type="number"
                name="lead_time_days"
                value={formData.lead_time_days}
                onChange={handleNumberChange}
                required
                min="1"
                className="form-control qty-input"
              />
              <button type="button" className="qty-btn" onClick={() => handleIncrement('lead_time_days')}><FiPlus /></button>
            </div>
            <span className="form-hint">How long it takes when you order from your supplier</span>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {product ? "Save Changes" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
