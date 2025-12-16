import * as tf from "@tensorflow/tfjs";

class InventoryModel {
  constructor() {
    this.model = null;
    this.inputMin = null;
    this.inputMax = null;
  }

  async trainAndPredict(products) {
    try {
      const trainingInputs = products.map((p) => [
        p.current_inventory,
        parseFloat(p.average_sales_per_week),
        p.lead_time_days,
      ]);

      const trainingLabels = products.map((p) => {
        const weeklyDemand = parseFloat(p.average_sales_per_week);
        const leadTimeWeeks = p.lead_time_days / 7;
        const requiredStock = weeklyDemand * leadTimeWeeks * 1.5;
        const shouldReorder = p.current_inventory < requiredStock ? 1 : 0;
        return [shouldReorder];
      });

      const inputTensor = tf.tensor2d(trainingInputs);
      const outputTensor = tf.tensor2d(trainingLabels);

      this.inputMax = inputTensor.max();
      this.inputMin = inputTensor.min();
      const normalizedInputs = inputTensor
        .sub(this.inputMin)
        .div(this.inputMax.sub(this.inputMin));

      this.model = tf.sequential();

      this.model.add(
        tf.layers.dense({
          inputShape: [3],
          units: 16,
          activation: "relu",
        })
      );

      this.model.add(
        tf.layers.dense({
          units: 8,
          activation: "relu",
        })
      );

      this.model.add(
        tf.layers.dense({
          units: 1,
          activation: "sigmoid",
        })
      );

      this.model.compile({
        optimizer: tf.train.adam(0.01),
        loss: "binaryCrossentropy",
        metrics: ["accuracy"],
      });

      await this.model.fit(normalizedInputs, outputTensor, {
        epochs: 100,
        batchSize: 32,
        shuffle: true,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 20 === 0) {
              console.log(
                `Epoch ${epoch}: loss = ${logs.loss.toFixed(
                  4
                )}, accuracy = ${logs.acc.toFixed(4)}`
              );
            }
          },
        },
      });

      const predictions = await this.predictAll(products);

      inputTensor.dispose();
      outputTensor.dispose();
      normalizedInputs.dispose();

      return predictions;
    } catch (error) {
      console.error("Error training model:", error);
      throw error;
    }
  }

  async predictAll(products) {
    if (!this.model) {
      throw new Error("Model not trained yet");
    }

    const predictions = {};

    for (const product of products) {
      const input = tf.tensor2d([
        [
          product.current_inventory,
          parseFloat(product.average_sales_per_week),
          product.lead_time_days,
        ],
      ]);

      const normalized = input
        .sub(this.inputMin)
        .div(this.inputMax.sub(this.inputMin));

      const prediction = this.model.predict(normalized);
      const probability = (await prediction.data())[0];

      const dailySales = parseFloat(product.average_sales_per_week) / 7;
      const daysOfStock =
        dailySales > 0
          ? (product.current_inventory / dailySales).toFixed(1)
          : "N/A";

      predictions[product.id] = {
        probability,
        recommendation: probability > 0.5 ? "Reorder" : "No Reorder",
        daysOfStock,
        urgency: this.calculateUrgency(
          probability,
          daysOfStock,
          product.lead_time_days
        ),
      };

      input.dispose();
      normalized.dispose();
      prediction.dispose();
    }

    return predictions;
  }

  calculateUrgency(probability, daysOfStock, leadTimeDays) {
    if (probability < 0.5) return "Low";

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
    if (this.inputMin) this.inputMin.dispose();
    if (this.inputMax) this.inputMax.dispose();
  }
}

export default new InventoryModel();
