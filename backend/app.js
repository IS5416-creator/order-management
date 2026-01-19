const express = require("express");
const cors = require("cors");

const productRoutes = require("./routes/products.routes");
const orderRoutes = require("./routes/orders.routes");
const notificationRoutes = require("./routes/notifications.routes");
const customerRoutes = require("./routes/customers.routes");

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
