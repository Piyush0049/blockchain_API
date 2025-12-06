import express from "express";
import blockchainClient from "../blockchainClient.js";
import crypto from "crypto";

const router = express.Router();

router.post("/store", async (req, res) => {
  try {
    const { content, ipfsCid } = req.body;

    // SHA-256 → hex string
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    const txHash = await blockchainClient.addOrUpdateClaim(hash, ipfsCid || "");

    res.json({
      success: true,
      hash,
      txHash,
      contract: process.env.CONTRACT_ADDRESS,
    });
  } catch (err) {
    console.error("❌ Error storing claim:", err);
    res.status(500).json({ success: false, error: "Blockchain error" });
  }
});

// Get claim
router.get("/claim/:hash", async (req, res) => {
  try {
    const claim = await blockchainClient.getClaim(req.params.hash);

    res.json({ claim });
  } catch (err) {
    console.error("❌ Error reading claim:", err);
    res.status(500).json({ success: false, error: "Unable to fetch claim" });
  }
});

export default router;
