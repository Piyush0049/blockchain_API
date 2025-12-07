import express from "express";
import blockchainClient from "../blockchainClient.js";
import crypto from "crypto";

const router = express.Router();

router.post("/store", async (req, res) => {
  try {
    const { content, ipfsCid } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "content is required"
      });
    }

    const normalized = content.trim().toLowerCase();
    const hash = crypto.createHash("sha256").update(normalized).digest("hex");

    const result = await blockchainClient.addOrUpdateClaim(hash, ipfsCid || "");

    res.json({
      success: true,
      hash,
      txHash: result.txHash,
      blockNumber: result.blockNumber,
      gasUsed: result.gasUsed,
      gasPrice: result.gasPrice,
      txCostEth: result.txCostEth,
      contract: process.env.CONTRACT_ADDRESS
    });
  } catch (err) {
    console.error("❌ Error storing claim:", String(err.message));

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});


router.get("/claim/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const claim = await blockchainClient.getClaim(hash);

    res.json({
      success: true,
      claim
    });
  } catch (err) {
    console.error("❌ Error reading claim:", err.message);

    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});


router.get("/exists/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const exists = await blockchainClient.claimExists(hash);

    res.json({
      success: true,
      exists
    });
  } catch (err) {
    console.error("❌ Exists check error:", err.message);

    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});


router.post("/hash", (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "content is required"
      });
    }

    const normalized = content.trim().toLowerCase();

    const hash = crypto.createHash("sha256").update(normalized).digest("hex");

    res.json({
      success: true,
      hash
    });
  } catch (err) {
    console.error("❌ Hash generation failed:", err.message);

    res.status(500).json({
      success: false,
      error: "Hash generation failed"
    });
  }
});

export default router;
