import React from "react";

const FilterButtons = ({ activeFilter, onFilterChange }) => {
  const buttons = [
    { id: "all", label: "All" },
    { id: "reorder", label: "Reorder" },
    { id: "no-reorder", label: "No Reorder" },
  ];

  return (
    <div className="filter-buttons">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => onFilterChange(btn.id)}
          className={`filter-btn ${
            activeFilter === btn.id ? "active" : ""
          } filter-btn-${btn.id}`}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
