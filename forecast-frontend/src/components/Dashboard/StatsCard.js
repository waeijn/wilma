import React from "react";

const StatsCard = ({ title, value, color = "gray" }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-title">{title}</div>
      <div className="stats-value">{value}</div>
    </div>
  );
};

export default StatsCard;
