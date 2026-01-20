const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth_routes");

const app = express();

app.use(cors());
app.use(express.json());

// health check (VERY IMPORTANT)
app.get("/", (req, res) => {
  res.send("SERVER WORKING");
});

// routes
app.use("/api/auth", authRoutes);

module.exports = app;
