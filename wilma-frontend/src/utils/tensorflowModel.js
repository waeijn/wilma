import * as tf from "@tensorflow/tfjs";

class InventoryModel {
  constructor() {
    this.model = null;
    this.inputMin = null;
    this.inputMax = null;
    this.outputMin = null;
    this.outputMax = null;
    this.categoryMap = {};
  }

  encodeCategory(category) {
    if (!category) return 0;
    if (this.categoryMap[category] !== undefined) return this.categoryMap[category];
    const newId = Object.keys(this.categoryMap).length + 1;
    this.categoryMap[category] = newId;
    return newId;
  }

  async ensureBackend() {
    try {
      await tf.ready();
      // If webgl failed and it didn't gracefully fallback, force cpu
      if (!tf.getBackend()) {
        await tf.setBackend('cpu');
      }
    } catch (e) {
      console.warn("WebGL failed, forcing CPU backend", e);
      await tf.setBackend('cpu');
      await tf.ready();
    }
  }

  async saveModel() {
    if (this.model) {
      await this.model.save("indexeddb://wilma-inventory-model");
      
      const meta = {
        inputMin: this.inputMin ? this.inputMin.arraySync() : null,
        inputMax: this.inputMax ? this.inputMax.arraySync() : null,
        outputMin: this.outputMin ? this.outputMin.arraySync() : null,
        outputMax: this.outputMax ? this.outputMax.arraySync() : null,
        categoryMap: this.categoryMap
      };
      localStorage.setItem("wilma_tf_meta", JSON.stringify(meta));
    }
  }

  async loadModel() {
    try {
      await this.ensureBackend();
      const models = await tf.io.listModels();
      if (models["indexeddb://wilma-inventory-model"]) {
        const loadedModel = await tf.loadLayersModel("indexeddb://wilma-inventory-model");
        
        // Ensure this is the new 3-feature True ML model, not the old 4-feature one
        if (loadedModel.inputs[0].shape[1] !== 3) {
          console.warn("Outdated model version detected. Ignoring cache.");
          return false;
        }

        this.model = loadedModel;
        
        const metaStr = localStorage.getItem("wilma_tf_meta");
        if (metaStr) {
          const meta = JSON.parse(metaStr);
          this.inputMin = meta.inputMin ? tf.tensor1d(meta.inputMin) : null;
          this.inputMax = meta.inputMax ? tf.tensor1d(meta.inputMax) : null;
          this.outputMin = meta.outputMin ? tf.tensor1d(meta.outputMin) : null;
          this.outputMax = meta.outputMax ? tf.tensor1d(meta.outputMax) : null;
          this.categoryMap = meta.categoryMap || {};
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Could not load cached model", e);
      return false;
    }
  }

  async trainAndPredict(products) {
    try {
      await this.ensureBackend();
      // 1. Fetch True Historical Dataset from Backend
      const { default: apiService } = await import("../services/api");
      const dataset = await apiService.getMLDataset();
      
      if (!dataset || dataset.length === 0) {
        throw new Error("No historical data available to train the model.");
      }

      // Expanded Input: [sales_past_30_days, lead_time_days, category_encoded]
      const trainingInputs = dataset.map((row) => [
        parseFloat(row.sales_past_30_days) || 0,
        parseFloat(row.lead_time_days) || 0,
        this.encodeCategory(row.category),
      ]);

      // Output: [Actual Sales during Lead Time]
      const trainingLabels = dataset.map((row) => [
        parseFloat(row.target_sales_next_lead_time) || 0,
      ]);

      const inputTensor = tf.tensor2d(trainingInputs);
      const outputTensor = tf.tensor2d(trainingLabels);

      // Free previous min/max tensors if they exist
      if (this.inputMin) this.inputMin.dispose();
      if (this.inputMax) this.inputMax.dispose();
      if (this.outputMin) this.outputMin.dispose();
      if (this.outputMax) this.outputMax.dispose();

      // Normalize inputs and outputs
      this.inputMax = inputTensor.max(0);
      this.inputMin = inputTensor.min(0);
      this.outputMax = outputTensor.max(0);
      this.outputMin = outputTensor.min(0);

      const normalizedInputs = inputTensor
        .sub(this.inputMin)
        .div(this.inputMax.sub(this.inputMin).add(1e-7));
      const normalizedOutputs = outputTensor
        .sub(this.outputMin)
        .div(this.outputMax.sub(this.outputMin).add(1e-7));

      // 2. Build the Neural Network Architecture
      if (this.model) {
        this.model.dispose(); // clear old model if retraining
      }
      this.model = tf.sequential();

      this.model.add(
        tf.layers.dense({
          inputShape: [3], // 3 True Features
          units: 32,
          activation: "relu",
        })
      );

      this.model.add(
        tf.layers.dense({
          units: 16,
          activation: "relu",
        })
      );

      this.model.add(
        tf.layers.dense({
          units: 1,
          activation: "linear",
        })
      );

      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: "meanSquaredError",
      });

      // 3. Train the model
      await this.model.fit(normalizedInputs, normalizedOutputs, {
        epochs: 50,
        batchSize: 64,
        shuffle: true,
        validationSplit: 0.2,
      });

      // Cleanup training tensors
      inputTensor.dispose();
      outputTensor.dispose();
      normalizedInputs.dispose();
      normalizedOutputs.dispose();

      // Save the newly trained model for future instant loads
      await this.saveModel();

      // 4. Run predictions
      return this.predictAll(products);
    } catch (error) {
      console.error("Error training model:", error);
      throw error;
    }
  }

  async predictAll(products) {
    await this.ensureBackend();
    
    if (!this.model) {
      throw new Error("Model not trained yet");
    }

    if (!products || products.length === 0) return {};

    const predictions = {};

    // For predicting the future, we pass the *current* state
    // Current past 30 days sales = average_sales_per_week * (30/7)
    const inputs = products.map((p) => {
      const salesPast30Days = (parseFloat(p.average_sales_per_week) || 0) * (30 / 7);
      return [
        salesPast30Days,
        parseFloat(p.lead_time_days) || 0,
        this.encodeCategory(p.category),
      ];
    });

    // tf.tidy ensures we don't leak WebGL memory during predictions
    const predictedLeadTimeDemand = tf.tidy(() => {
      const inputTensor = tf.tensor2d(inputs);

      const normalized = inputTensor
        .sub(this.inputMin)
        .div(this.inputMax.sub(this.inputMin).add(1e-7));

      const normalizedPrediction = this.model.predict(normalized);

      const unNormalizedPrediction = normalizedPrediction
        .mul(this.outputMax.sub(this.outputMin).add(1e-7))
        .add(this.outputMin);

      return unNormalizedPrediction.arraySync();
    });

    // Process output values
    products.forEach((product, i) => {
      // The model predicts exactly how many units will sell during the lead time.
      const predictedDemand = Math.max(0, predictedLeadTimeDemand[i][0]);
      
      // Safety Factor to cover variances not caught by the model
      const safetyFactor = 1.3;
      const predictedRequiredStock = predictedDemand * safetyFactor;
      
      const currentInv = parseFloat(product.current_inventory) || 0;
      const shouldReorder = currentInv < predictedRequiredStock;
      
      const ratio = currentInv / (predictedRequiredStock || 1);
      let probability = shouldReorder 
          ? Math.min(0.99, 1 - ratio * 0.5) 
          : Math.max(0.01, 0.5 - (ratio - 1) * 0.5);

      const dailySales = (parseFloat(product.average_sales_per_week) || 0) / 7;
      const daysOfStock = dailySales > 0 ? (currentInv / dailySales).toFixed(1) : "N/A";

      predictions[product.id] = {
        probability,
        predictedRequiredStock: predictedRequiredStock.toFixed(1),
        recommendation: shouldReorder ? "Reorder" : "No Reorder",
        daysOfStock,
        urgency: this.calculateUrgency(shouldReorder, daysOfStock, product.lead_time_days),
      };
    });

    return predictions;
  }

  calculateUrgency(shouldReorder, daysOfStock, leadTimeDays) {
    if (!shouldReorder) return "Low";

    const days = parseFloat(daysOfStock);
    if (isNaN(days)) return "Medium";

    if (days < leadTimeDays * 0.5) return "Critical";
    if (days < leadTimeDays) return "High";
    return "Medium";
  }

  dispose() {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    if (this.inputMin) { this.inputMin.dispose(); this.inputMin = null; }
    if (this.inputMax) { this.inputMax.dispose(); this.inputMax = null; }
    if (this.outputMin) { this.outputMin.dispose(); this.outputMin = null; }
    if (this.outputMax) { this.outputMax.dispose(); this.outputMax = null; }
  }
}

export default new InventoryModel();
