import axios from "axios";
import crypto from "crypto";

const BASE_URL = "http://localhost:4000/blockchain";

const ETH_TO_USD = 3200;
const USD_TO_INR = 83;

let stats = {
  hashApi: [],
  storeApi: [],
  readApi: [],
  gasUsed: [],
  txCostEth: [],
  txCostUsd: [],
  txCostInr: [],
  success: 0,
  failure: 0
};

function now() {
  return Date.now();
}

async function testHash(content) {
  const start = now();
  const res = await axios.post(`${BASE_URL}/hash`, { content });
  const end = now();

  stats.hashApi.push(end - start);
  return res.data.hash;
}

async function testStore(content, ipfsCid) {
  const start = now();
  const res = await axios.post(`${BASE_URL}/store`, { content, ipfsCid });
  const end = now();

  stats.storeApi.push(end - start);

  const gas = parseInt(res.data.gasUsed, 10);
  const ethCost = parseFloat(res.data.txCostEth);

  const usdCost = ethCost * ETH_TO_USD;
  const inrCost = usdCost * USD_TO_INR;

  stats.gasUsed.push(gas);
  stats.txCostEth.push(ethCost);
  stats.txCostUsd.push(usdCost);
  stats.txCostInr.push(inrCost);

  stats.success++;

  return res.data.hash;
}

async function testRead(hash) {
  const start = now();
  await axios.get(`${BASE_URL}/claim/${hash}`);
  const end = now();

  stats.readApi.push(end - start);
}

async function runPerformanceTest(iterations = 5) {
  console.log("\n🚀 Starting FULL Blockchain Performance Test...\n");

  for (let i = 1; i <= iterations; i++) {
    try {
      const content = `Performance test message ${i} at ${new Date().toISOString()}`;
      const ipfsCid = crypto.randomBytes(10).toString("hex");

      console.log(`⏱️ Test ${i} running...`);

      const hash = await testHash(content);
      await testStore(content, ipfsCid);
      await testRead(hash);

      console.log(`✅ Test ${i} completed\n`);
    } catch (err) {
      console.error("❌ Test failed:", err.message);
      stats.failure++;
    }
  }

  generateReport();
}


function generateReport() {
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);

  console.log("\n================ FULL PERFORMANCE REPORT ================\n");

  console.log("✅ Total Success:", stats.success);
  console.log("❌ Total Failure:", stats.failure);

  console.log("\n📌 API LATENCY (ms):");
  console.log("• Hash API Avg:", avg(stats.hashApi).toFixed(2));
  console.log("• Store API Avg (Mining Included):", avg(stats.storeApi).toFixed(2));
  console.log("• Read API Avg:", avg(stats.readApi).toFixed(2));

  console.log("\n⛽ GAS USAGE:");
  console.log("• Avg Gas Used:", avg(stats.gasUsed).toFixed(0));
  console.log("• Total Gas Used:", sum(stats.gasUsed).toFixed(0));

  console.log("\n💰 TRANSACTION COST:");
  console.log("• Avg Cost (ETH):", avg(stats.txCostEth).toFixed(8));
  console.log("• Total Cost (ETH):", sum(stats.txCostEth).toFixed(8));

  console.log("• Avg Cost (USD):", avg(stats.txCostUsd).toFixed(4));
  console.log("• Total Cost (USD):", sum(stats.txCostUsd).toFixed(4));

  console.log("• Avg Cost (INR): ₹", avg(stats.txCostInr).toFixed(2));
  console.log("• Total Cost (INR): ₹", sum(stats.txCostInr).toFixed(2));

  console.log("\n✅ SYSTEM STABILITY:");
  console.log("• Failure Rate:", ((stats.failure / (stats.success + stats.failure)) * 100 || 0).toFixed(2), "%");

  console.log("\n=========================================================\n");
}

runPerformanceTest(5);
