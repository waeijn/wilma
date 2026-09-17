import React, { useState, useEffect } from "react";
import { FiPackage, FiSun, FiMoon } from "react-icons/fi";

const Header = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div className="header-title">
          <FiPackage className="header-icon" />
          <h1>Wilma</h1>
        </div>
        <p>Your smart store assistant — track sales, manage stock, and know when to restock</p>
      </div>
      <button 
        onClick={toggleTheme} 
        className="btn-icon" 
        style={{ fontSize: '1.5rem', color: 'var(--text-main)', background: 'var(--bg-surface-hover)', padding: '0.75rem', borderRadius: '50%' }}
        title="Toggle Theme"
      >
        {theme === "light" ? <FiMoon /> : <FiSun />}
      </button>
    </div>
  );
};

export default Header;
