import React from "react";

const StatsCard = ({ title, value, color = "gray", icon: Icon }) => {
  return (
    <div className={`stats-card stats-card-${color}`}>
      <div className="stats-header">
        {Icon && <Icon className="stats-icon" />}
        <div className="stats-title">{title}</div>
      </div>
      <div className="stats-value">{value}</div>
    </div>
  );
};

export default StatsCard;
