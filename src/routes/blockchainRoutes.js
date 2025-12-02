import express from "express";
import blockchainClient from "../blockchainClient.js";
import crypto from "crypto";

const router = express.Router();

// Hash a claim and store on blockchain
router.post("/store", async (req, res) => {
  try {
    const { content, metadata } = req.body;

    const hash = crypto.createHash("sha256").update(content).digest("hex");

    const txHash = await blockchainClient.storeClaim(hash, metadata);

    res.json({
      success: true,
      hash,
      txHash,
      contract: process.env.CONTRACT_ADDRESS,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Blockchain storage failed" });
  }
});

// Retrieve claim
router.get("/get/:hash", async (req, res) => {
  try {
    const data = await blockchainClient.getClaim(req.params.hash);

    res.json({
      hash: req.params.hash,
      metadata: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Unable to retrieve claim" });
  }
});

export default router;
