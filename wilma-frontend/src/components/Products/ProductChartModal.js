import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FiX, FiTrendingUp } from "react-icons/fi";
import apiService from "../../services/api";

const ProductChartModal = ({ product, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const salesData = await apiService.getProductSales(product.id);
        setData(salesData);
      } catch (err) {
        setError("Failed to load historical data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [product.id]);

  return (
    <div className="modal-overlay">
      <div className="modal-content chart-modal" style={{ maxWidth: '700px', width: '90%' }}>
        <div className="modal-header">
          <h2>
            <FiTrendingUp style={{ marginRight: '8px' }} /> {product.product_name} - Sales Trend
          </h2>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="modal-body" style={{ height: '350px' }}>
          {loading ? (
            <div className="loading-spinner-container" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <span className="btn-spinner" style={{ width: '30px', height: '30px', borderTopColor: 'var(--accent-main)' }}></span>
            </div>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : data.length === 0 ? (
            <p className="text-muted" style={{ textAlign: 'center', marginTop: '50px' }}>No sales data logged yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                  minTickGap={20}
                />
                <YAxis 
                  stroke="var(--text-muted)" 
                  tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-surface)', 
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-main)',
                    borderRadius: '8px'
                  }}
                  itemStyle={{ color: 'var(--accent-main)' }}
                />
                <Line
                  type="monotone"
                  dataKey="quantity"
                  name="Units Sold"
                  stroke="var(--accent-main)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: 'var(--bg-surface)', stroke: 'var(--accent-main)', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: 'var(--accent-main)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductChartModal;
