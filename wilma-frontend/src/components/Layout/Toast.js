import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from "react-icons/fi";

const iconMap = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const Toast = ({ message, type = "success", onClose }) => {
  const [visible, setVisible] = useState(true);
  const Icon = iconMap[type] || FiInfo;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type} ${visible ? "toast-enter" : "toast-exit"}`}>
      <Icon className="toast-icon" />
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => { setVisible(false); setTimeout(onClose, 300); }}>
        <FiX />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;
