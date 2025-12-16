import React from "react";

const ProductRow = ({ product, prediction }) => {
  return (
    <tr className="product-row">
      <td>{product.product_name}</td>
      <td>{product.current_inventory}</td>
      <td>{parseFloat(product.average_sales_per_week).toFixed(1)}</td>
      <td>{product.lead_time_days}</td>
      <td>{prediction ? prediction.daysOfStock : "-"}</td>
      <td>
        {prediction ? (
          <span
            className={`badge badge-${
              prediction.recommendation === "Reorder" ? "reorder" : "no-reorder"
            }`}
          >
            {prediction.recommendation}
          </span>
        ) : (
          <span className="badge-empty">-</span>
        )}
      </td>
      <td>
        {prediction ? (
          <span
            className={`urgency urgency-${prediction.urgency.toLowerCase()}`}
          >
            {prediction.urgency}
          </span>
        ) : (
          <span className="badge-empty">-</span>
        )}
      </td>
      <td>
        {prediction ? `${(prediction.probability * 100).toFixed(1)}%` : "-"}
      </td>
    </tr>
  );
};

export default ProductRow;
