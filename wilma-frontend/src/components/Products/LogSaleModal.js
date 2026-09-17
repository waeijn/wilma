import React, { useState, useEffect } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

const LogSaleModal = ({ show, product, onClose, onSave }) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setQuantity(1);
      setLoading(false);
    }
  }, [show]);

  const increaseQuantity = () => {
    if (quantity < product.current_inventory) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setQuantity(val);
    } else if (e.target.value === "") {
      setQuantity("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalQuantity = parseInt(quantity, 10) || 0;
    if (finalQuantity < 1) return;
    if (finalQuantity > product.current_inventory) {
      alert(`Not enough stock. Current inventory: ${product.current_inventory}`);
      return;
    }

    setLoading(true);
    try {
      await onSave(product.id, finalQuantity);
    } catch {
      setLoading(false);
    }
  };

  if (!show || !product) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Log Sale</h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="sale-product-info">
          <p className="sale-product-name">{product.product_name}</p>
          <p className="sale-product-stock">
            Current Stock: <strong>{product.current_inventory}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Quantity Sold</label>
            <div className="quantity-selector">
              <button 
                type="button" 
                className="qty-btn" 
                onClick={decreaseQuantity} 
                disabled={quantity <= 1}
              >
                <FiMinus />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                max={product.current_inventory}
                required
                className="form-control qty-input"
                autoFocus
              />
              <button 
                type="button" 
                className="qty-btn" 
                onClick={increaseQuantity} 
                disabled={quantity >= product.current_inventory}
              >
                <FiPlus />
              </button>
            </div>
          </div>

          <div className="sale-summary">
            <p>
              Remaining Stock:{" "}
              <strong>{product.current_inventory - (quantity || 0)}</strong>
            </p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sale"
              disabled={loading || quantity < 1 || quantity > product.current_inventory}
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Logging...
                </>
              ) : (
                "🛒 Confirm Sale"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogSaleModal;
