import React from "react";
import { FiShoppingCart, FiEdit2, FiTrash2, FiTrendingUp } from "react-icons/fi";

const getStockLevel = (count) => {
  if (count < 5) return "critical";
  if (count <= 20) return "low";
  return "healthy";
};

const ProductRow = ({ product, prediction, onEdit, onDelete, onLogSale, onChart }) => {
  const stockLevel = getStockLevel(product.current_inventory);

  return (
    <tr className="product-row">
      <td className="td-product-name">{product.product_name}</td>
      <td><span className="badge badge-category">{product.category || 'General'}</span></td>
      <td className="text-center">
        <div className="stock-cell">
          <span className={`stock-dot stock-dot-${stockLevel}`}></span>
          {product.current_inventory}
        </div>
      </td>
      <td className="text-center">{parseFloat(product.average_sales_per_week).toFixed(1)}</td>
      <td className="text-center">{product.lead_time_days}d</td>
      <td className="text-center">{prediction ? prediction.daysOfStock : "-"}</td>
      <td className="text-center">
        {prediction ? (
          <span
            className={`badge badge-${
              prediction.recommendation === "Reorder" ? "reorder" : "no-reorder"
            }`}
          >
            {prediction.recommendation === "Reorder" ? "Restock" : "Good"}
          </span>
        ) : (
          <span className="badge-empty">—</span>
        )}
      </td>
      <td className="text-center">
        {prediction ? (
          <span
            className={`urgency urgency-${prediction.urgency.toLowerCase()}`}
          >
            {prediction.urgency}
          </span>
        ) : (
          <span className="badge-empty">—</span>
        )}
      </td>
      <td className="text-center">
        <div className="row-actions justify-center">
          <button className="btn-icon sale" onClick={onLogSale} title="Log Sale">
            <FiShoppingCart />
          </button>
          <button className="btn-icon" style={{ color: 'var(--accent-main)' }} onClick={onChart} title="View Chart">
            <FiTrendingUp />
          </button>
          <button className="btn-icon edit" onClick={onEdit} title="Edit">
            <FiEdit2 />
          </button>
          <button className="btn-icon delete" onClick={onDelete} title="Delete">
            <FiTrash2 />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
