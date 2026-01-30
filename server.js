const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./config/logger");
const indexRouter = require("./routes/index.js");
const connectDB = require("./config/db");
const path = require("path");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", indexRouter);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;


connectDB().then(() => {

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
});
