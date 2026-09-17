import React from "react";
import { FiSearch } from "react-icons/fi";

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <FiSearch className="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="Search items..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
