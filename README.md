# Wilma
**AI-Powered Sari-Sari Store Inventory Predictor**

Wilma is a full-stack web application designed to help sari-sari store owners manage their inventory, prevent stockouts, and make data-driven purchasing decisions. Instead of relying on static formulas, Wilma features a **Deep Neural Network** that trains on historical sales data to accurately predict future stock velocity.

---

## Key Features

*   **Machine Learning Predictions:** Uses TensorFlow.js to run a time-series regression model on past sales data, predicting exact required stock levels during supplier lead times.
*   **Intelligent Urgency:** Automatically categorizes restock priorities into `Critical` (Red), `High` (Orange), `Medium` (Yellow), and `Low` (Green) based on predicted stockouts.
*   **Dynamic Visualizations:** Interactive charts built with Recharts to visualize historical sales trends vs. predictive boundaries.
*   **Data Portability:** Seamless CSV Bulk Import and Export capabilities to easily migrate or back up store data.
*   **Modern UI/UX:** Clean, flat-design interface with full Dark Mode and Light Mode support.

## Tech Stack

*   **Frontend:** React.js, TensorFlow.js (`@tensorflow/tfjs`), Recharts
*   **Backend:** Laravel (PHP), MySQL
*   **Infrastructure:** Docker & Docker Compose

## Setup & Installation (Docker)

This project is fully containerized. You do not need PHP or Node installed on your host machine to run it, just Docker.

### 1. Start the Containers
Navigate to the root directory and start the Docker environment:
```bash
docker-compose up -d --build
```

### 2. Setup the Backend Database
Run Laravel's migrations and seed the database with 6 months of noisy, realistic historical sales data (required for the ML model to train):
```bash
docker-compose exec wilma-api php artisan migrate:fresh --seed
```

### 3. Install Frontend Dependencies
*Note: Because the frontend uses an anonymous volume for `node_modules` to prevent host OS conflicts, you must install NPM packages directly inside the container:*
```bash
docker-compose exec wilma-frontend npm install
```
Restart the frontend container after installing packages to ensure Webpack picks up the new modules (like Recharts and TensorFlow):
```bash
docker-compose restart wilma-frontend
```

### 4. Access the Application
*   **Frontend (UI):** [http://localhost:3000](http://localhost:3000)
*   **Backend (API):** [http://localhost:8000](http://localhost:8000)

---

## How the Machine Learning Works

Wilma does not use hardcoded "if/else" logic to guess inventory needs. 
1. **Data Aggregation:** The Laravel API (`MLController`) aggregates thousands of historical sales records into sliding 30-day windows.
2. **Feature Engineering:** The data is normalized (Min-Max scaling) and categorized. The features ($X$) include `Past 30-Day Sales`, `Lead Time (Days)`, and `Encoded Category`. 
3. **Training Pipeline:** The React frontend downloads this dataset and uses the Adam optimizer to train a Multi-Layer Perceptron (Dense layers with `ReLU` activations) over 50 epochs, optimizing for Mean Squared Error (MSE).
4. **Inference:** The trained weights are saved to the browser's IndexedDB. Live inventory data is run through the neural network to output continuous predictions for restock requirements, applying an intelligent safety factor to account for statistical noise.

---
