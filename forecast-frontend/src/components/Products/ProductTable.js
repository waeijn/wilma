import React from "react";
import ProductRow from "./ProductRow";

const ProductTable = ({ products, predictions }) => {
  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="products-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>Current Stock</th>
            <th>Avg Sales/Week</th>
            <th>Lead Time (Days)</th>
            <th>Days of Stock</th>
            <th>Prediction</th>
            <th>Urgency</th>
            <th>Confidence</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              prediction={predictions[product.id]}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
