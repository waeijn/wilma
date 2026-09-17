import React, { useState, useEffect, useCallback } from "react";
import { FiPackage, FiAlertTriangle, FiCheckCircle, FiCpu, FiPlus, FiRefreshCw } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi";
import StatsCard from "./StatsCard";
import ProductTable from "../Products/ProductTable";
import ProductModal from "../Products/ProductModal";
import LogSaleModal from "../Products/LogSaleModal";
import ProductChartModal from "../Products/ProductChartModal";
import Header from "../Layout/Header";
import SearchBar from "../Layout/SearchBar";
import CustomSelect from "../Layout/CustomSelect";
import ToastContainer from "../Layout/Toast";
import apiService from "../../services/api";
import inventoryModel from "../../utils/tensorflowModel";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: 'product_name', direction: 'asc' });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [saleProduct, setSaleProduct] = useState(null);
  const [showChartModal, setShowChartModal] = useState(false);
  const [chartProduct, setChartProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const initialized = React.useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initialize = async () => {
      const isLoaded = await inventoryModel.loadModel();
      if (isLoaded) {
        addToast("AI Model loaded from cache", "info");
      }
      await fetchProducts();
    };
    initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getProducts();
      setProducts(data);
      
      // If model is already loaded (from cache or previous train), instantly predict
      if (inventoryModel.model) {
         try {
           const preds = await inventoryModel.predictAll(data);
           setPredictions(preds);
         } catch (e) {
           console.error("Predict error", e);
         }
      }
    } catch (err) {
      setError("Can't load items. Please check if the server is running.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    if (products.length === 0) {
      addToast("Add some items first before checking stock levels.", "info");
      return;
    }

    try {
      setTraining(true);
      setError(null);

      const predictionResults = await inventoryModel.trainAndPredict(products);
      setPredictions(predictionResults);

      const reorderCount = Object.values(predictionResults).filter(
        (p) => p.recommendation === "Reorder"
      ).length;

      if (reorderCount > 0) {
        addToast(`Done! ${reorderCount} item${reorderCount > 1 ? "s" : ""} need restocking.`, "info");
      } else {
        addToast("All items are well stocked!", "success");
      }
    } catch (err) {
      addToast("Something went wrong. Please try again.", "error");
      console.error("Training error:", err);
    } finally {
      setTraining(false);
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
        addToast(`Updated "${productData.product_name}" successfully!`, "success");
      } else {
        await apiService.createProduct(productData);
        addToast(`Added "${productData.product_name}" to inventory!`, "success");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      addToast("Failed to save item. Please try again.", "error");
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    const product = products.find((p) => p.id === id);
    if (window.confirm(`Remove "${product?.product_name}" from inventory?`)) {
      try {
        await apiService.deleteProduct(id);
        addToast(`Removed "${product?.product_name}" from inventory.`, "success");
        fetchProducts();
      } catch (err) {
        addToast("Failed to remove item.", "error");
        console.error(err);
      }
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const openChartModal = (product) => {
    setChartProduct(product);
    setShowChartModal(true);
  };

  const handleExportCSV = () => {
    if (products.length === 0) return;
    
    // Create CSV content
    const headers = ["Item", "Category", "In Stock", "Sells/Week", "Restock Time", "Stock Left", "Recommendation"];
    const rows = filteredProducts.map(p => {
      const pred = predictions[p.id] || {};
      return [
        `"${p.product_name}"`,
        `"${p.category || ''}"`,
        p.current_inventory,
        p.average_sales_per_week,
        p.lead_time_days,
        pred.daysOfStock || "-",
        pred.recommendation || "-"
      ].join(",");
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wilma_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Exported inventory report successfully", "success");
  };

  const fileInputRef = React.useRef(null);

  const triggerImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split("\n");
      const productsToImport = [];

      // Start from 1 to skip headers
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue;
        
        // Match columns even with quotes
        const match = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!match) continue;
        
        const cols = match.map(col => col.replace(/^"|"$/g, '').trim());
        
        if (cols.length >= 5) {
          productsToImport.push({
            product_name: cols[0],
            category: cols[1],
            current_inventory: parseInt(cols[2], 10) || 0,
            average_sales_per_week: parseFloat(cols[3]) || 0,
            lead_time_days: parseInt(cols[4], 10) || 1,
          });
        }
      }

      if (productsToImport.length > 0) {
        try {
          await apiService.bulkCreateProducts({ products: productsToImport });
          addToast(`Imported ${productsToImport.length} items successfully!`, "success");
          fetchProducts();
        } catch (err) {
          addToast("Failed to import CSV.", "error");
        }
      } else {
        addToast("No valid data found in CSV.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const openSaleModal = (product) => {
    setSaleProduct(product);
    setShowSaleModal(true);
  };

  const handleLogSale = async (productId, quantity) => {
    try {
      const product = products.find((p) => p.id === productId);
      await apiService.logSale(productId, quantity);
      setShowSaleModal(false);
      setSaleProduct(null);
      addToast(`Sold ${quantity}x ${product?.product_name} — stock updated!`, "success");
      fetchProducts();
    } catch (err) {
      addToast(err.message || "Failed to log sale.", "error");
      console.error(err);
    }
  };

  const getFilteredProducts = () => {
    let filtered = products;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.product_name.toLowerCase().includes(query) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    // AI filter
    if (aiFilter !== "all") {
      filtered = filtered.filter((product) => {
        const prediction = predictions[product.id];
        if (!prediction) return false;
        if (aiFilter === "reorder") return prediction.recommendation === "Reorder";
        if (aiFilter === "ok") return prediction.recommendation === "No Reorder";
        return true;
      });
    }

    // Stock Level filter
    if (stockFilter !== "all") {
      filtered = filtered.filter((product) => {
        const stock = product.current_inventory;
        if (stockFilter === "critical") return stock < 5;
        if (stockFilter === "low") return stock >= 5 && stock <= 20;
        if (stockFilter === "healthy") return stock > 20;
        return true;
      });
    }

    // Sort logic
    filtered.sort((a, b) => {
      let aValue, bValue;

      // Handle nested or derived values
      switch (sortConfig.key) {
        case 'daysOfStock':
          aValue = predictions[a.id] ? predictions[a.id].daysOfStock : Infinity;
          bValue = predictions[b.id] ? predictions[b.id].daysOfStock : Infinity;
          break;
        case 'status':
          aValue = predictions[a.id]?.recommendation === 'Reorder' ? 0 : 1;
          bValue = predictions[b.id]?.recommendation === 'Reorder' ? 0 : 1;
          break;
        case 'urgency':
          const urgencyOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
          aValue = predictions[a.id] ? urgencyOrder[predictions[a.id].urgency] ?? 4 : 4;
          bValue = predictions[b.id] ? urgencyOrder[predictions[b.id].urgency] ?? 4 : 4;
          break;
        default:
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
      }

      // Handle string comparison (case-insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // Handle numeric comparison for explicit number fields
      if (['current_inventory', 'average_sales_per_week', 'lead_time_days'].includes(sortConfig.key)) {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStats = () => {
    const totalProducts = products.length;
    const reorderCount = Object.values(predictions).filter(
      (p) => p.recommendation === "Reorder"
    ).length;
    const noReorderCount = Object.values(predictions).filter(
      (p) => p.recommendation === "No Reorder"
    ).length;

    return {
      total: totalProducts,
      reorder: reorderCount,
      noReorder: noReorderCount,
      modelStatus:
        Object.keys(predictions).length > 0 ? "Ready ✓" : "Not yet run",
    };
  };

  const stats = getStats();
  const filteredProducts = getFilteredProducts();
  const uniqueCategories = [...new Set(products.map((p) => p.category).filter(Boolean))].sort();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your inventory...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <Header />

        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {error && (
          <div className="error-message">
            <p className="error-title">Something went wrong</p>
            <p>{error}</p>
          </div>
        )}

        <div className="stats-grid">
          <StatsCard title="Total Items" value={stats.total} color="gray" icon={FiPackage} />
          <StatsCard title="Need to Restock" value={stats.reorder} color="red" icon={FiAlertTriangle} />
          <StatsCard title="Well Stocked" value={stats.noReorder} color="green" icon={FiCheckCircle} />
          <StatsCard title="AI Status" value={stats.modelStatus} color="blue" icon={FiCpu} />
        </div>

        <div className="actions-container">
          <div className="controls-left">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <CustomSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "all", label: "All Categories" },
                ...uniqueCategories.map(cat => ({ value: cat, label: cat }))
              ]}
            />
            <CustomSelect
              value={aiFilter}
              onChange={setAiFilter}
              options={[
                { value: "all", label: "AI Status: All" },
                { value: "reorder", label: "Needs Restock (AI)" },
                { value: "ok", label: "Well Stocked (AI)" }
              ]}
            />
            <CustomSelect
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                { value: "all", label: "Stock Level: All" },
                { value: "critical", label: "Critical (< 5)" },
                { value: "low", label: "Low (5-20)" },
                { value: "healthy", label: "Healthy (> 20)" }
              ]}
            />
          </div>

          <div className="controls-right">
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              onChange={handleImportCSV} 
            />
            
            <details className="dropdown-details">
              <summary className="btn" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                Data <span style={{ fontSize: '0.8em', marginLeft: '4px' }}>▾</span>
              </summary>
              <div className="dropdown-menu">
                <button onClick={triggerImportCSV}>Import CSV</button>
                <button onClick={handleExportCSV} disabled={products.length === 0}>Export CSV</button>
              </div>
            </details>
            <button
              onClick={handleTrainModel}
              disabled={training || products.length === 0}
              className="btn btn-primary"
            >
              {training ? (
                <>
                  <span className="btn-spinner"></span>
                  Checking...
                </>
              ) : (
                <>
                  <HiOutlineSparkles /> {inventoryModel.model ? "Retrain AI" : "Check Restock Needs"}
                </>
              )}
            </button>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="btn btn-primary icon-btn"
              title="Refresh Data"
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        {training && (
          <div className="training-message">
            <FiCpu className="training-icon" />
            <p>
              Wilma is learning from your recent data... This takes about 5-15 seconds.
            </p>
          </div>
        )}

        <ProductTable
          products={filteredProducts}
          predictions={predictions}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={openEditModal}
          onDelete={handleDeleteProduct}
          onLogSale={openSaleModal}
          onChart={openChartModal}
        />

        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="no-results">
            <p>No items match your search or filter.</p>
          </div>
        )}

        <ProductModal
          show={showModal}
          product={editingProduct}
          onClose={() => setShowModal(false)}
          onSave={handleSaveProduct}
        />

        {showChartModal && chartProduct && (
          <ProductChartModal
            product={chartProduct}
            onClose={() => setShowChartModal(false)}
          />
        )}

        <LogSaleModal
          show={showSaleModal}
          product={saleProduct}
          onClose={() => {
            setShowSaleModal(false);
            setSaleProduct(null);
          }}
          onSave={handleLogSale}
        />

        {/* Floating Add Item Button */}
        <button
          onClick={openAddModal}
          className="floating-add-btn"
          title="Add New Item"
        >
          <FiPlus /> <span>Add Item</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
