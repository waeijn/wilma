import React, { useState, useEffect } from "react";
import StatsCard from "./StatsCard";
import FilterButtons from "./FilterButtons";
import ProductTable from "../Products/ProductTable";
import Header from "../Layout/Header";
import apiService from "../../services/api";
import inventoryModel from "../../utils/tensorflowModel";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(
        "Failed to fetch products. Please check if the backend is running."
      );
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainModel = async () => {
    if (products.length === 0) {
      alert("No products available to train the model");
      return;
    }

    try {
      setTraining(true);
      setError(null);

      console.log("Starting model training...");
      const predictionResults = await inventoryModel.trainAndPredict(products);

      setPredictions(predictionResults);
      console.log("Training completed successfully!");
    } catch (err) {
      setError("Failed to train model. Please try again.");
      console.error("Training error:", err);
    } finally {
      setTraining(false);
    }
  };

  const getFilteredProducts = () => {
    if (filter === "all") return products;

    return products.filter((product) => {
      const prediction = predictions[product.id];
      if (!prediction) return false;

      if (filter === "reorder") {
        return prediction.recommendation === "Reorder";
      }
      if (filter === "no-reorder") {
        return prediction.recommendation === "No Reorder";
      }

      return true;
    });
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
        Object.keys(predictions).length > 0 ? "Trained ✓" : "Not Trained",
    };
  };

  const stats = getStats();
  const filteredProducts = getFilteredProducts();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <Header />

        {error && (
          <div className="error-message">
            <p className="error-title">Error</p>
            <p>{error}</p>
          </div>
        )}

        <div className="stats-grid">
          <StatsCard title="Total Products" value={stats.total} color="gray" />
          <StatsCard title="Need Reorder" value={stats.reorder} color="red" />
          <StatsCard
            title="No Reorder Needed"
            value={stats.noReorder}
            color="green"
          />
          <StatsCard
            title="Model Status"
            value={stats.modelStatus}
            color="blue"
          />
        </div>

        <div className="actions-container">
          <div className="action-buttons">
            <button
              onClick={handleTrainModel}
              disabled={training || products.length === 0}
              className="btn btn-primary"
            >
              {training ? (
                <>
                  <span className="btn-spinner"></span>
                  Training Model...
                </>
              ) : (
                "Train Model & Predict"
              )}
            </button>
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="btn btn-success"
            >
              Refresh Data
            </button>
          </div>

          <FilterButtons activeFilter={filter} onFilterChange={setFilter} />
        </div>

        {training && (
          <div className="training-message">
            <p>
              Training AI model with {products.length} products... This may take
              10-30 seconds.
            </p>
          </div>
        )}

        <ProductTable products={filteredProducts} predictions={predictions} />

        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="no-results">
            <p>No products match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
