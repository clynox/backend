import express from "express";
import dataRouter from "./src/routes/data.routes";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Enable subdomain handling
app.set("trust proxy", true);
app.set("subdomain offset", 1); // Adjust based on your domain structure

// Public API routes
app.use("/data", dataRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
