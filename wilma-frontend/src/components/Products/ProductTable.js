import React from "react";
import ProductRow from "./ProductRow";

const ProductTable = ({ products, predictions, sortConfig, onSort, onEdit, onDelete, onLogSale, onChart }) => {
  if (products.length === 0) {
    return (
      <div className="no-products">
        <p className="no-products-title">No items yet</p>
        <p>Tap "Add Item" above to start tracking your inventory!</p>
      </div>
    );
  }

  const SortIcon = ({ columnKey }) => {
    if (sortConfig?.key !== columnKey) return <span className="sort-icon invisible">↕</span>;
    return <span className="sort-icon">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  const renderHeader = (label, key, alignClass = "") => (
    <th 
      className={`sortable-header ${alignClass}`}
      onClick={() => onSort && onSort(key)}
    >
      <div className="header-content">
        {label} <SortIcon columnKey={key} />
      </div>
    </th>
  );

  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr>
            {renderHeader("Item", "product_name")}
            {renderHeader("Category", "category")}
            {renderHeader("In Stock", "current_inventory", "text-center")}
            {renderHeader("Sells / Week", "average_sales_per_week", "text-center")}
            {renderHeader("Restock Time", "lead_time_days", "text-center")}
            {renderHeader("Stock Left", "daysOfStock", "text-center")}
            {renderHeader("Status", "status", "text-center")}
            {renderHeader("Priority", "urgency", "text-center")}
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              prediction={predictions[product.id]}
              onEdit={() => onEdit(product)}
              onDelete={() => onDelete(product.id)}
              onLogSale={() => onLogSale(product)}
              onChart={() => onChart(product)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
