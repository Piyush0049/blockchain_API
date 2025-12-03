import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import blockchainRoutes from "./src/routes/blockchainRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "Blockchain service running", network: "Sepolia" });
});

app.use("/blockchain", blockchainRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Connected to Sepolia + Contract: ${process.env.CONTRACT_ADDRESS}`);
});
